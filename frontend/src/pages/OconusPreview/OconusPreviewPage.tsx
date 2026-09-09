import { useCharlieFipsCode } from '../../CharlieTopBar'
import type { Fips } from '../../data/utils/Fips'
import CustomAltTableOconus from '../../reports/CustomAltTableOconus'
import CustomBreakdownSummaryOconus from '../../reports/CustomBreakdownSummaryOconus'
import CustomChoroplethMapOconus from '../../reports/CustomChoroplethMapOconus'
import CustomRateBarChartOconus from '../../reports/CustomRateBarChartOconus'
import CustomRateTrendsLineChartOconus from '../../reports/CustomRateTrendsLineChartOconus'
import CustomShareTrendsLineChartOconus from '../../reports/CustomShareTrendsLineChartOconus'
import CustomStackedSharesBarChartOconus from '../../reports/CustomStackedSharesBarChartOconus'
import CustomUnknownMapOconus from '../../reports/CustomUnknownMapOconus'
import { getCharlieGeography } from '../../reports/oconusGeographies'
import { WHAT_IS_HEALTH_EQUITY_PAGE_LINK } from '../../utils/internalRoutes'
import { LinkWithStickyParams } from '../../utils/urlutils'
import CharlieReportHeader from './CharlieReportHeader'
import {
  CHARLIE_CARD_LABELS,
  type CharlieCardId,
  useCharlieCardAvailability,
} from './charlieCardAvailability'
import {
  getCharlieDemographicCascade,
  useCharlieDemographicType,
} from './charlieDemographic'
import {
  type CharlieTopicId,
  useCharlieDataTypeConfig,
  useCharlieTopic,
} from './oconusTopics'

// Cards that always render individually, never folded into the collapsed
// empty-state summary below — Choropleth map (always shown per spec) and
// Breakdown summary (kept per your call: it's the closest thing this
// Report tab has to a "definitions/missing-data" section).
const EXEMPT_CARD_IDS: CharlieCardId[] = ['rate-map', 'data-table']

// SCRATCH PREVIEW page for the Charlie Oconus card set — the "Report" tab
// inside CharlieShellLayout. This is an ongoing working page (not a one-off
// to delete), so keep it up to date as the Oconus card set evolves.
//
// Geography comes from useCharlieFipsCode() (shared with CharlieTopBar's
// chip/picker — global across all four tabs). Topic comes from
// useCharlieTopic(), a second independent URL param scoped to this tab
// only: Compare stays fixed to incarceration regardless of this selector.
// Both are URL-param-backed jotai state, same convention, no local state
// or context — so a link can capture geography + topic together
// (?fips=66&topic=covid) and every card below re-renders from it directly.
//
// The outer wrapper below mirrors Report.tsx's card-column structure
// (`flex w-full flex-col content-center`, each card in its own `w-full`
// slot) so spacing here matches a real report instead of looking ad hoc.
// Card-to-card spacing itself comes from each card's own CardWrapper
// (`m-2 ... shadow-raised`), same as on a real report.
export default function OconusPreviewPage() {
  const [fipsCode, setFipsCode] = useCharlieFipsCode()
  const fips = getCharlieGeography(fipsCode)
  const [topicId, setTopicId] = useCharlieTopic()
  const [dataTypeConfig, setDataTypeId] = useCharlieDataTypeConfig(topicId)
  const cascade = getCharlieDemographicCascade(dataTypeConfig, fips)
  const [demographicType, setDemographicType] =
    useCharlieDemographicType(cascade)

  const updateFipsCallback = (nextFips: Fips) => {
    setFipsCode(nextFips.code)
  }

  // Mirrors the real MadLib's own invariant (setMadLibWithParam's
  // dtOverrides): changing the topic clears the sub-item choice back to
  // the new topic's default rather than carrying over a dataTypeId that
  // may not even exist in the new topic's METRIC_CONFIG array.
  const handleTopicChange = (id: CharlieTopicId, defaultDataTypeId: string) => {
    setTopicId(id)
    setDataTypeId(defaultDataTypeId)
  }

  const availability = useCharlieCardAvailability(fips, dataTypeConfig)
  const collapsibleIds = (
    Object.keys(CHARLIE_CARD_LABELS) as CharlieCardId[]
  ).filter((id) => !EXEMPT_CARD_IDS.includes(id))
  const allCollapsibleEmpty =
    availability !== null &&
    collapsibleIds.every((id) => availability[id] === false)
  const availableCardIds = new Set<CharlieCardId>(
    (Object.keys(CHARLIE_CARD_LABELS) as CharlieCardId[]).filter(
      (id) => !allCollapsibleEmpty || EXEMPT_CARD_IDS.includes(id),
    ),
  )

  const sections: Array<{
    id: CharlieCardId
    label: string
    render: () => React.ReactNode
  }> = [
    {
      id: 'rate-map',
      label: 'Choropleth map',
      render: () => (
        <CustomChoroplethMapOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          updateFipsCallback={updateFipsCallback}
        />
      ),
    },
    {
      id: 'rates-over-time',
      label: 'Rate trends line chart',
      render: () => (
        <CustomRateTrendsLineChartOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
    {
      id: 'rate-chart',
      label: 'Rate bar chart',
      render: () => (
        <CustomRateBarChartOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
    {
      id: 'unknown-demographic-map',
      label: 'Unknowns map',
      render: () => (
        <CustomUnknownMapOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          updateFipsCallback={updateFipsCallback}
        />
      ),
    },
    {
      id: 'inequities-over-time',
      label: 'Share trends line chart',
      render: () => (
        <CustomShareTrendsLineChartOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
    {
      id: 'population-vs-distribution',
      label: 'Stacked shares bar chart',
      render: () => (
        <CustomStackedSharesBarChartOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
    {
      id: 'rates-over-time-table',
      label: 'Alt table',
      render: () => (
        <CustomAltTableOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
    {
      id: 'data-table',
      label: 'Breakdown summary',
      render: () => (
        <CustomBreakdownSummaryOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
        />
      ),
    },
  ]

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full items-center justify-center'>
          <div className='flex w-full flex-col content-center'>
            <CharlieReportHeader
              topicId={topicId}
              onTopicChange={handleTopicChange}
              dataTypeConfig={dataTypeConfig}
              onDataTypeChange={setDataTypeId}
              fips={fips}
              onFipsChange={setFipsCode}
              demographicType={demographicType}
              onDemographicChange={setDemographicType}
              availableCardIds={availableCardIds}
            />
            {sections.map(({ id, label, render }) => {
              if (allCollapsibleEmpty && !EXEMPT_CARD_IDS.includes(id)) {
                return null
              }
              return (
                <div
                  className='w-full [&_article]:rounded-2xl'
                  id={id}
                  key={id}
                >
                  <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                    {label}
                  </h2>
                  {render()}
                </div>
              )
            })}
            {allCollapsibleEmpty && (
              // p-3 matches CardWrapper.tsx's own real cards
              // (`relative m-2 rounded-sm bg-alt-white p-3 shadow-raised`)
              // exactly, but that alone isn't enough: the real "Table
              // unavailable: ..." heading directly above (in the exempt
              // Breakdown summary card, when it's also empty) sits inside
              // an additional `mx-3` wrapper CardWrapper's missing-data
              // alert rendering adds on top of the card's own p-3 — an
              // extra 12px this card has no reason to know about other
              // than matching it, so it's replicated here (the same nested
              // p-3 > mx-3 structure) to land both headings at the same
              // x-position instead of 12px apart.
              <div className='m-2 rounded-2xl bg-alt-white p-3 text-left shadow-raised'>
                <div className='mx-3'>
                  <h2 className='m-0 font-semibold text-lg'>
                    No data available for these sections
                  </h2>
                  <ul className='my-2 list-disc pl-5 text-alt-dark'>
                    {collapsibleIds.map((id) => (
                      <li key={id}>{CHARLIE_CARD_LABELS[id]}</li>
                    ))}
                  </ul>
                  <p className='m-0 text-alt-dark text-small'>
                    Learn how this affects{' '}
                    <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
                      health equity
                    </LinkWithStickyParams>
                    .
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
