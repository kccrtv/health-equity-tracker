import { ToggleButton, ToggleButtonGroup } from '@mui/material'
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
import { OCONUS_GEOGRAPHIES } from '../../reports/oconusGeographies'
import {
  CHARLIE_TOPIC_IDS,
  CHARLIE_TOPIC_LABELS,
  CHARLIE_TOPICS,
  useCharlieTopic,
} from './oconusTopics'

// SCRATCH PREVIEW page for the Charlie Oconus card set — the "Report" tab
// inside CharlieShellLayout. This is an ongoing working page (not a one-off
// to delete), so keep it up to date as the Oconus card set evolves.
//
// Geography comes from useCharlieFipsCode() (shared with CharlieTopBar's
// chip/picker — global across all three tabs). Topic comes from
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
  const fips = OCONUS_GEOGRAPHIES[fipsCode]
  const [topicId, setTopicId] = useCharlieTopic()
  const dataTypeConfig = CHARLIE_TOPICS[topicId]

  const updateFipsCallback = (nextFips: Fips) => {
    setFipsCode(nextFips.code)
  }

  const sections: Array<{
    id: string
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
        />
      ),
    },
    {
      id: 'rate-chart',
      label: 'Rate bar chart',
      render: () => (
        <CustomRateBarChartOconus fips={fips} dataTypeConfig={dataTypeConfig} />
      ),
    },
    {
      id: 'unknown-demographic-map',
      label: 'Unknowns map',
      render: () => (
        <CustomUnknownMapOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
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
        />
      ),
    },
    {
      id: 'rates-over-time-table',
      label: 'Alt table',
      render: () => (
        <CustomAltTableOconus fips={fips} dataTypeConfig={dataTypeConfig} />
      ),
    },
    {
      id: 'data-table',
      label: 'Breakdown summary',
      render: () => (
        <CustomBreakdownSummaryOconus
          fips={fips}
          dataTypeConfig={dataTypeConfig}
        />
      ),
    },
  ]

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full items-center justify-center'>
          <div className='flex w-full flex-col content-center'>
            <div className='m-2 text-left'>
              <ToggleButtonGroup
                value={topicId}
                exclusive
                size='small'
                onChange={(_event, newTopicId: string | null) => {
                  if (newTopicId)
                    setTopicId(newTopicId as (typeof CHARLIE_TOPIC_IDS)[number])
                }}
                aria-label='Topic'
              >
                {CHARLIE_TOPIC_IDS.map((id) => (
                  <ToggleButton key={id} value={id} className='normal-case'>
                    {CHARLIE_TOPIC_LABELS[id]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            {sections.map(({ id, label, render }) => (
              <div className='w-full' id={id} key={id}>
                <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                  {label}
                </h2>
                {render()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
