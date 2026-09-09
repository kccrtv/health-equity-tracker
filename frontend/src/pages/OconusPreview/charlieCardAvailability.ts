import { useEffect, useState } from 'react'
import type {
  DataTypeConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { Breakdowns } from '../../data/query/Breakdowns'
import { MetricQuery } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import type { OconusFipsCode } from '../../reports/oconusGeographies'
import { OCONUS_GEOGRAPHIES } from '../../reports/oconusGeographies'
import { getDataManager } from '../../utils/globals'

// Shared by the Report tab's empty-card collapse (Part 6) and Compare's
// "Compare with" status list (Part 4) — both need the same underlying
// question ("does this card have real data for this geography+topic?"),
// answered the same way CardWrapper.tsx answers it for a real card:
// `!response.shouldShowMissingDataMessage(metricIds)` on the card's own
// MetricQuery.
//
// The 8 Report-tab card slots reduce to 5 distinct underlying query
// shapes. currentRate / historicalRate / currentShare / historicalShare
// are EXACT matches for RateBarChartCard / RateTrendsChartCard /
// StackedSharesBarChartCard / ShareTrendsChartCard's own query
// construction (same metric, same breakdowns, same timeView) — not an
// approximation. childrenRate matches MapCard's county-level breakdown.
// Breakdown summary (TableCard) and Unknowns map (UnknownsMapCard) are
// approximated by currentRate: the real cards additionally request other
// columns (population comparisons, unknowns-specific fields), but if the
// primary rate is genuinely absent for a geography those columns are
// absent too, so this doesn't produce false positives for the "is there
// anything real to show" question these statuses answer.
export type CharlieCardId =
  | 'rate-map'
  | 'rates-over-time'
  | 'rate-chart'
  | 'unknown-demographic-map'
  | 'inequities-over-time'
  | 'population-vs-distribution'
  | 'rates-over-time-table'
  | 'data-table'

export const CHARLIE_CARD_LABELS: Record<CharlieCardId, string> = {
  'rate-map': 'Choropleth map',
  'rates-over-time': 'Rate trends line chart',
  'rate-chart': 'Rate bar chart',
  'unknown-demographic-map': 'Unknowns map',
  'inequities-over-time': 'Share trends line chart',
  'population-vs-distribution': 'Stacked shares bar chart',
  'rates-over-time-table': 'Alt table',
  'data-table': 'Breakdown summary',
}

type ShapeKey =
  | 'currentRate'
  | 'historicalRate'
  | 'currentShare'
  | 'historicalShare'
  | 'childrenRate'

const CARD_TO_SHAPE: Record<CharlieCardId, ShapeKey> = {
  'rate-map': 'childrenRate',
  'rates-over-time': 'historicalRate',
  'rate-chart': 'currentRate',
  'unknown-demographic-map': 'currentRate',
  'inequities-over-time': 'historicalShare',
  'population-vs-distribution': 'currentShare',
  'rates-over-time-table': 'historicalRate',
  'data-table': 'currentRate',
}

const ALL_SHAPES: ShapeKey[] = [
  'currentRate',
  'historicalRate',
  'currentShare',
  'historicalShare',
  'childrenRate',
]

function metricForShape(
  shape: ShapeKey,
  dataTypeConfig: DataTypeConfig,
): MetricConfig | undefined {
  if (shape === 'currentShare' || shape === 'historicalShare') {
    return dataTypeConfig.metrics.pct_share
  }
  return (
    dataTypeConfig.metrics.per100k ??
    dataTypeConfig.metrics.pct_rate ??
    dataTypeConfig.metrics.index
  )
}

async function checkShape(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
  shape: ShapeKey,
): Promise<boolean> {
  const metricConfig = metricForShape(shape, dataTypeConfig)
  if (!metricConfig) return false

  const breakdowns = (
    shape === 'childrenRate'
      ? Breakdowns.forChildrenFips(fips)
      : Breakdowns.forFips(fips)
  ).addBreakdown('race_and_ethnicity')
  const timeView =
    shape === 'historicalRate' || shape === 'historicalShare'
      ? 'historical'
      : 'current'

  const query = new MetricQuery(
    [metricConfig.metricId],
    breakdowns,
    dataTypeConfig.dataTypeId,
    timeView,
  )
  try {
    const resp = await getDataManager().loadMetrics(query)
    return !resp.shouldShowMissingDataMessage([metricConfig.metricId])
  } catch {
    return false
  }
}

// Session-scoped cache, keyed by topic+geography — computed once, reused by
// whichever UI (Report tab's own collapse check, or Compare's 5-geography
// status list) asks for it first. Never invalidated: the underlying data
// doesn't change within a session, and a hard reload starts fresh anyway.
const shapeCache = new Map<string, Promise<Record<ShapeKey, boolean>>>()

function getShapeResults(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
): Promise<Record<ShapeKey, boolean>> {
  const key = `${dataTypeConfig.dataTypeId}:${fips.code}`
  const cached = shapeCache.get(key)
  if (cached) return cached

  const promise = Promise.all(
    ALL_SHAPES.map(
      async (shape) =>
        [shape, await checkShape(fips, dataTypeConfig, shape)] as const,
    ),
  ).then((entries) => Object.fromEntries(entries) as Record<ShapeKey, boolean>)

  shapeCache.set(key, promise)
  return promise
}

async function getCardAvailability(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
): Promise<Record<CharlieCardId, boolean>> {
  const shapeResults = await getShapeResults(fips, dataTypeConfig)
  const entries = (Object.keys(CARD_TO_SHAPE) as CharlieCardId[]).map(
    (cardId) => [cardId, shapeResults[CARD_TO_SHAPE[cardId]]] as const,
  )
  return Object.fromEntries(entries) as Record<CharlieCardId, boolean>
}

export type GeographyStatusLevel = 'full' | 'partial' | 'none'

async function getGeographyStatusLevel(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
): Promise<GeographyStatusLevel> {
  const availability = await getCardAvailability(fips, dataTypeConfig)
  const values = Object.values(availability)
  const hasCount = values.filter(Boolean).length
  if (hasCount === values.length) return 'full'
  if (hasCount === 0) return 'none'
  return 'partial'
}

// Part 6: per-card availability for a single geography, for the Report
// tab's own empty-card collapse.
export function useCharlieCardAvailability(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
): Record<CharlieCardId, boolean> | null {
  const [availability, setAvailability] = useState<Record<
    CharlieCardId,
    boolean
  > | null>(null)

  useEffect(() => {
    let cancelled = false
    setAvailability(null)
    void getCardAvailability(fips, dataTypeConfig).then((result) => {
      if (!cancelled) setAvailability(result)
    })
    return () => {
      cancelled = true
    }
  }, [fips.code, dataTypeConfig])

  return availability
}

// Part 4: geography-level full/partial/none status for Compare's
// "Compare with" list, across a set of geographies at once.
export function useCharlieGeographyStatuses(
  codes: readonly OconusFipsCode[],
  dataTypeConfig: DataTypeConfig,
): Record<OconusFipsCode, GeographyStatusLevel> | null {
  const [statuses, setStatuses] = useState<Record<
    OconusFipsCode,
    GeographyStatusLevel
  > | null>(null)
  const codesKey = codes.join(',')

  useEffect(() => {
    let cancelled = false
    setStatuses(null)
    void Promise.all(
      codes.map(
        async (code) =>
          [
            code,
            await getGeographyStatusLevel(
              OCONUS_GEOGRAPHIES[code],
              dataTypeConfig,
            ),
          ] as const,
      ),
    ).then((entries) => {
      if (!cancelled) {
        setStatuses(
          Object.fromEntries(entries) as Record<
            OconusFipsCode,
            GeographyStatusLevel
          >,
        )
      }
    })
    return () => {
      cancelled = true
    }
    // Deliberately depends on codesKey (a stable string), not `codes` itself
    // (a fresh array reference each render).
  }, [codesKey, dataTypeConfig])

  return statuses
}
