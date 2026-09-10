#!/usr/bin/env vite-node
/**
 * Geographic coverage report for every dataset (topic + data type) featured
 * on the Health Equity Tracker.
 *
 * This reuses the app's real, unmodified data path rather than
 * re-implementing data access:
 *
 *   METRIC_CONFIG (topic -> DataTypeConfig[])
 *     -> Breakdowns.forFips() / Breakdowns.byState() / Breakdowns.forChildrenFips()
 *       -> MetricQuery
 *         -> DataManager.loadMetrics() (src/data/loading/DataManager.ts)
 *           -> VariableProviderMap -> the topic's real VariableProvider
 *             -> resolveDatasetId()/appendFipsIfNeeded() (or a DatasetMetadata
 *                lookup) picks the concrete GCS dataset id
 *               -> ApiDataFetcher.loadDataset() (src/data/loading/DataFetcher.ts)
 *                 -> GET {baseApiUrl}/api/dataset?name=<id>.json
 *                   -> Go server datasetHandler (server/handlers.go)
 *                     -> GCS bucket (server/gcs.go), NDJSON -> JSON array
 *
 * No BigQuery is involved at request time: the server only proxies
 * pre-exported JSON already sitting in GCS, so a sweep costs GCS egress +
 * Cloud Run time, not query cost.
 *
 * Scale: 61 data types across 35 topics.
 *   - National and state/territory data each live in ONE file per data type
 *     (the state-level file contains all 56 states/DC/territories in one
 *     response), so the default pass costs ~120 requests total.
 *   - County-level data is split into one file PER STATE/TERRITORY (see
 *     appendFipsIfNeeded in src/data/utils/datasetutils.ts), and only 39 of
 *     the 61 data types support county breakdowns at all (checked
 *     structurally via provider.allowsBreakdowns() before any request is
 *     made, so unsupported data types cost zero requests). A full county
 *     sweep is therefore up to 39 x 56 ~= 2,184 requests — cheap for GCS, but
 *     slow and impolite to a shared dev Cloud Run instance without a
 *     concurrency cap, hence --county being opt-in.
 *
 * Must run via vite-node, not plain tsx (see vite-node.config.ts for why).
 *
 * Usage (from frontend/):
 *   VITE_DEPLOY_CONTEXT=dev VITE_BASE_API_URL=https://dev.healthequitytracker.org \
 *     npm run coverage:geo
 *   npm run coverage:geo -- --county            # also sweep county-level files (slow)
 *   npm run coverage:geo -- --topics hiv,covid   # only these DropdownVarIds
 *   npm run coverage:geo -- --out report.md      # write markdown to a file
 *   npm run coverage:geo -- --concurrency 4      # cap in-flight requests (default 6)
 */

import { writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { METRIC_CONFIG } from '../../src/data/config/MetricConfig'
import type {
  DataTypeConfig,
  DropdownVarId,
  MetricId,
} from '../../src/data/config/MetricConfigTypes'
import { Breakdowns } from '../../src/data/query/Breakdowns'
import { MetricQuery } from '../../src/data/query/MetricQuery'
import type { HetRow } from '../../src/data/utils/DatasetTypes'
import { Fips } from '../../src/data/utils/Fips'
import { STATE_FIPS_MAP } from '../../src/data/utils/FipsData'
import { autoInitGlobals, getDataManager } from '../../src/utils/globals'

type Status = 'has_data' | 'no_data' | 'suppressed' | 'unsupported' | 'error'

const HAWAII_FIPS = '15'
const TERRITORY_FIPS_CODES = ['60', '66', '69', '72', '78'] as const
const CALLOUT_FIPS_CODES = [HAWAII_FIPS, ...TERRITORY_FIPS_CODES]

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    county: { type: 'boolean', default: false },
    topics: { type: 'string' },
    out: { type: 'string' },
    concurrency: { type: 'string', default: '6' },
  },
  strict: false,
})

const CONCURRENCY = Math.max(
  1,
  Number.parseInt(args.concurrency ?? '6', 10) || 6,
)

interface DataTypeEntry {
  dropdownVarId: DropdownVarId
  dtConfig: DataTypeConfig
  valueMetricIds: MetricId[]
  suppressionFlagIds: MetricId[]
  queryMetricIds: MetricId[]
}

interface CoverageResult {
  entry: DataTypeEntry
  national: Status
  stateByFips: Record<string, Status>
  countyByStateFips?: Record<string, Status[]>
  error?: string
}

function collectDataTypeEntries(): DataTypeEntry[] {
  const entries: DataTypeEntry[] = []
  const topicFilter = args.topics
    ? new Set(args.topics.split(',').map((t) => t.trim()))
    : undefined

  for (const [dropdownVarId, dtConfigs] of Object.entries(
    METRIC_CONFIG,
  ) as Array<[DropdownVarId, DataTypeConfig[]]>) {
    if (topicFilter && !topicFilter.has(dropdownVarId)) continue
    for (const dtConfig of dtConfigs) {
      const metricConfigs = Object.values(dtConfig.metrics).filter(Boolean)
      const valueMetricIds = metricConfigs.map((m) => m!.metricId)
      const suppressionFlagIds = metricConfigs
        .map((m) => m!.suppressionFlagMetricId)
        .filter((id): id is MetricId => Boolean(id))
      const queryMetricIds = Array.from(
        new Set([...valueMetricIds, ...suppressionFlagIds]),
      )
      if (queryMetricIds.length === 0) continue
      entries.push({
        dropdownVarId,
        dtConfig,
        valueMetricIds,
        suppressionFlagIds,
        queryMetricIds,
      })
    }
  }
  return entries
}

function classifyRows(
  rows: readonly HetRow[],
  valueMetricIds: MetricId[],
  suppressionFlagIds: MetricId[],
): Status {
  if (rows.length === 0) return 'no_data'
  const hasData = rows.some((row) =>
    valueMetricIds.some(
      (id) => typeof row[id] === 'number' && !Number.isNaN(row[id]),
    ),
  )
  if (hasData) return 'has_data'
  const suppressed = suppressionFlagIds.some((id) =>
    rows.some((row) => row[id] === true),
  )
  return suppressed ? 'suppressed' : 'no_data'
}

function groupByFips(rows: readonly HetRow[]): Map<string, HetRow[]> {
  const map = new Map<string, HetRow[]>()
  for (const row of rows) {
    const fips = row.fips as string | undefined
    if (!fips) continue
    const bucket = map.get(fips)
    if (bucket) bucket.push(row)
    else map.set(fips, [row])
  }
  return map
}

async function runQuery(
  entry: DataTypeEntry,
  breakdowns: Breakdowns,
): Promise<{ unsupported: boolean; rows: HetRow[]; error?: string }> {
  try {
    const query = new MetricQuery(
      entry.queryMetricIds,
      breakdowns,
      entry.dtConfig.dataTypeId,
      'current',
    )
    const resp = await getDataManager().loadMetrics(query)
    if (resp.missingDataMessage?.startsWith('Breakdowns not supported')) {
      return { unsupported: true, rows: [] }
    }
    return { unsupported: false, rows: resp.data as HetRow[] }
  } catch (e) {
    return { unsupported: false, rows: [], error: (e as Error).message }
  }
}

const STATE_TERRITORY_FIPS_CODES = Object.keys(STATE_FIPS_MAP).filter(
  (code) => code !== '00',
)

async function checkNationalAndState(
  entry: DataTypeEntry,
): Promise<CoverageResult> {
  const usFips = new Fips('00')
  const nationalBreakdowns =
    Breakdowns.forFips(usFips).addBreakdown('race_and_ethnicity')
  const national = await runQuery(entry, nationalBreakdowns)
  if (national.error) {
    return { entry, national: 'error', stateByFips: {}, error: national.error }
  }
  const nationalStatus: Status = national.unsupported
    ? 'unsupported'
    : classifyRows(
        national.rows,
        entry.valueMetricIds,
        entry.suppressionFlagIds,
      )

  const stateBreakdowns =
    Breakdowns.byState().addBreakdown('race_and_ethnicity')
  const state = await runQuery(entry, stateBreakdowns)
  if (state.error) {
    return {
      entry,
      national: nationalStatus,
      stateByFips: {},
      error: state.error,
    }
  }

  const stateByFips: Record<string, Status> = {}
  if (state.unsupported) {
    for (const code of STATE_TERRITORY_FIPS_CODES)
      stateByFips[code] = 'unsupported'
  } else {
    const grouped = groupByFips(state.rows)
    for (const code of STATE_TERRITORY_FIPS_CODES) {
      stateByFips[code] = classifyRows(
        grouped.get(code) ?? [],
        entry.valueMetricIds,
        entry.suppressionFlagIds,
      )
    }
  }

  return { entry, national: nationalStatus, stateByFips }
}

async function checkCounty(
  entry: DataTypeEntry,
  result: CoverageResult,
): Promise<void> {
  // Structural support doesn't depend on which state/territory we ask about,
  // so probe once and skip the other 55 requests if county isn't supported
  // for this data type at all (mirrors provider.allowsBreakdowns()).
  const probe = await runQuery(
    entry,
    Breakdowns.forChildrenFips(new Fips('06')).addBreakdown(
      'race_and_ethnicity',
    ),
  )
  if (probe.unsupported) {
    result.countyByStateFips = Object.fromEntries(
      STATE_TERRITORY_FIPS_CODES.map((code) => [
        code,
        ['unsupported'] as Status[],
      ]),
    )
    return
  }

  const countyByStateFips: Record<string, Status[]> = {}
  const remaining = STATE_TERRITORY_FIPS_CODES.filter((code) => code !== '06')
  countyByStateFips['06'] = [
    classifyRows(
      groupByStateEquivalent(probe.rows),
      entry.valueMetricIds,
      entry.suppressionFlagIds,
    ),
  ]

  await runWithConcurrency(remaining, CONCURRENCY, async (code) => {
    const res = await runQuery(
      entry,
      Breakdowns.forChildrenFips(new Fips(code)).addBreakdown(
        'race_and_ethnicity',
      ),
    )
    countyByStateFips[code] = res.unsupported
      ? ['unsupported']
      : [classifyRows(res.rows, entry.valueMetricIds, entry.suppressionFlagIds)]
  })

  result.countyByStateFips = countyByStateFips
}

// The county-level file for a state contains rows for every county in it;
// for the coarse "does this state have any county coverage" question we can
// treat the whole file as one bucket rather than grouping per-county.
function groupByStateEquivalent(rows: readonly HetRow[]): HetRow[] {
  return [...rows]
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0
  async function worker() {
    while (index < items.length) {
      const item = items[index++]
      await fn(item)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  )
}

const STATUS_LABEL: Record<Status, string> = {
  has_data: 'Data',
  no_data: 'No data',
  suppressed: 'Suppressed',
  unsupported: 'N/A',
  error: 'Error',
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|')
}

function summarizeStateStatuses(byFips: Record<string, Status>): string {
  const statuses = Object.values(byFips)
  if (statuses.length === 0) return STATUS_LABEL.error
  if (statuses.every((s) => s === 'unsupported'))
    return STATUS_LABEL.unsupported
  const total = statuses.length
  const withData = statuses.filter((s) => s === 'has_data').length
  const suppressed = statuses.filter((s) => s === 'suppressed').length
  let text = `${withData}/${total} data`
  if (suppressed > 0) text += `, ${suppressed} suppressed`
  return text
}

function summarizeCountyStatuses(
  byStateFips?: Record<string, Status[]>,
): string {
  if (!byStateFips) return 'not run (see --county)'
  const perStateStatus = Object.values(byStateFips).map((s) => s[0])
  if (perStateStatus.every((s) => s === 'unsupported'))
    return STATUS_LABEL.unsupported
  const total = perStateStatus.length
  const withData = perStateStatus.filter((s) => s === 'has_data').length
  return `${withData}/${total} states/territories`
}

function buildMainTable(results: CoverageResult[]): string {
  const _countyHeader = args.county ? ' | County-Level Coverage' : ''
  const lines = [
    `| Topic | Data Type | National${args.county ? ' | State/Territory | County-Level Coverage' : ' | State/Territory'} |`,
    `|---|---|---|---|${args.county ? '---|' : ''}`,
  ]
  for (const r of results) {
    const topic = escapeCell(r.entry.dropdownVarId)
    const dt = escapeCell(
      r.entry.dtConfig.fullDisplayName ?? r.entry.dtConfig.dataTypeId,
    )
    if (r.error) {
      lines.push(
        `| ${topic} | ${dt} | Error: ${escapeCell(r.error)} | — |${args.county ? ' — |' : ''}`,
      )
      continue
    }
    const national = STATUS_LABEL[r.national]
    const stateSummary = summarizeStateStatuses(r.stateByFips)
    const countyCell = args.county
      ? ` | ${summarizeCountyStatuses(r.countyByStateFips)}`
      : ''
    lines.push(
      `| ${topic} | ${dt} | ${national} | ${stateSummary}${countyCell} |`,
    )
  }
  return lines.join('\n')
}

function calloutLabel(code: string): string {
  return new Fips(code).getDisplayName()
}

function buildCalloutSection(results: CoverageResult[]): string {
  const header = `| Topic | Data Type | ${CALLOUT_FIPS_CODES.map(calloutLabel).join(' | ')} |`
  const divider = `|---|---|${CALLOUT_FIPS_CODES.map(() => '---').join('|')}|`
  const stateLines = [header, divider]
  for (const r of results) {
    if (r.error) continue
    const topic = escapeCell(r.entry.dropdownVarId)
    const dt = escapeCell(
      r.entry.dtConfig.fullDisplayName ?? r.entry.dtConfig.dataTypeId,
    )
    const cells = CALLOUT_FIPS_CODES.map(
      (code) => STATUS_LABEL[r.stateByFips[code] ?? 'error'],
    )
    stateLines.push(`| ${topic} | ${dt} | ${cells.join(' | ')} |`)
  }

  const sections = [
    '## Hawaiʻi & U.S. Territories',
    '',
    'State/territory-level status for Hawaiʻi (15) and the five territories (American Samoa 60, ' +
      'Guam 66, Northern Mariana Islands 69, Puerto Rico 72, U.S. Virgin Islands 78). Derived from ' +
      'the same state-level fetch as the general report above — no extra requests.',
    '',
    stateLines.join('\n'),
  ]

  if (args.county) {
    const countyHeader = `| Topic | Data Type | ${CALLOUT_FIPS_CODES.map(calloutLabel).join(' | ')} |`
    const countyDivider = `|---|---|${CALLOUT_FIPS_CODES.map(() => '---').join('|')}|`
    const countyLines = [countyHeader, countyDivider]
    for (const r of results) {
      if (r.error || !r.countyByStateFips) continue
      const topic = escapeCell(r.entry.dropdownVarId)
      const dt = escapeCell(
        r.entry.dtConfig.fullDisplayName ?? r.entry.dtConfig.dataTypeId,
      )
      const cells = CALLOUT_FIPS_CODES.map(
        (code) => STATUS_LABEL[r.countyByStateFips?.[code]?.[0] ?? 'error'],
      )
      countyLines.push(`| ${topic} | ${dt} | ${cells.join(' | ')} |`)
    }
    sections.push(
      '',
      '### County / county-equivalent level',
      '',
      countyLines.join('\n'),
    )
  }

  return sections.join('\n')
}

async function main() {
  autoInitGlobals()
  const entries = collectDataTypeEntries()
  console.error(
    `Checking ${entries.length} data types` +
      (args.county
        ? ' (national + state/territory + county — this will take a while)'
        : ' (national + state/territory)'),
  )

  const results: CoverageResult[] = []
  await runWithConcurrency(entries, CONCURRENCY, async (entry) => {
    const result = await checkNationalAndState(entry)
    results.push(result)
  })
  // Restore METRIC_CONFIG order rather than concurrency-completion order.
  results.sort((a, b) => entries.indexOf(a.entry) - entries.indexOf(b.entry))

  if (args.county) {
    for (const result of results) {
      if (result.error) continue
      await checkCounty(result.entry, result)
      console.error(`  county-checked ${result.entry.dtConfig.dataTypeId}`)
    }
  }

  const generatedAt = new Date().toISOString()
  const markdown = [
    '# Health Equity Tracker — Geographic Coverage Report',
    '',
    `Generated ${generatedAt} against \`${process.env.VITE_BASE_API_URL || '(same-origin)'}\` ` +
      `(\`VITE_DEPLOY_CONTEXT=${process.env.VITE_DEPLOY_CONTEXT ?? 'unset'}\`).`,
    '',
    `${entries.length} data types checked across ${new Set(entries.map((e) => e.dropdownVarId)).size} topics. ` +
      (args.county
        ? 'Includes a full county-level sweep.'
        : 'County-level not swept — re-run with `--county` for that pass.'),
    '',
    '## All Datasets',
    '',
    buildMainTable(results),
    '',
    buildCalloutSection(results),
    '',
  ].join('\n')

  if (args.out) {
    writeFileSync(args.out, markdown)
    console.error(`Wrote report to ${args.out}`)
  } else {
    console.log(markdown)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
