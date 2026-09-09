import { Button } from '@mui/material'
import { useState } from 'react'
import CharlieBottomSheet from '../../CharlieBottomSheet'
import CharlieGeographyList from '../../CharlieGeographyList'
import { useCharlieFipsCode } from '../../CharlieTopBar'
import CharlieTopicToggle from '../../CharlieTopicToggle'
import CustomAltTableOconus from '../../reports/CustomAltTableOconus'
import CustomBreakdownSummaryOconus from '../../reports/CustomBreakdownSummaryOconus'
import CustomChoroplethMapOconus from '../../reports/CustomChoroplethMapOconus'
import CustomRateBarChartOconus from '../../reports/CustomRateBarChartOconus'
import CustomRateTrendsLineChartOconus from '../../reports/CustomRateTrendsLineChartOconus'
import CustomShareTrendsLineChartOconus from '../../reports/CustomShareTrendsLineChartOconus'
import CustomStackedSharesBarChartOconus from '../../reports/CustomStackedSharesBarChartOconus'
import CustomUnknownMapOconus from '../../reports/CustomUnknownMapOconus'
import {
  OCONUS_FIPS_CODES,
  OCONUS_GEOGRAPHIES,
  type OconusFipsCode,
} from '../../reports/oconusGeographies'
import { useCharlieGeographyStatuses } from './charlieCardAvailability'
import {
  CHARLIE_TOPIC_LABELS,
  CHARLIE_TOPICS,
  type CharlieTopicId,
  useCharlieTopic,
} from './oconusTopics'
import { useCharlieCompareFipsCode } from './useCharlieCompareFips'

const SECTIONS = [
  {
    id: 'rate-map',
    label: 'Choropleth map',
    Component: CustomChoroplethMapOconus,
  },
  {
    id: 'rates-over-time',
    label: 'Rate trends line chart',
    Component: CustomRateTrendsLineChartOconus,
  },
  {
    id: 'rate-chart',
    label: 'Rate bar chart',
    Component: CustomRateBarChartOconus,
  },
  {
    id: 'unknown-demographic-map',
    label: 'Unknowns map',
    Component: CustomUnknownMapOconus,
  },
  {
    id: 'inequities-over-time',
    label: 'Share trends line chart',
    Component: CustomShareTrendsLineChartOconus,
  },
  {
    id: 'population-vs-distribution',
    label: 'Stacked shares bar chart',
    Component: CustomStackedSharesBarChartOconus,
  },
  {
    id: 'rates-over-time-table',
    label: 'Alt table',
    Component: CustomAltTableOconus,
  },
  {
    id: 'data-table',
    label: 'Breakdown summary',
    Component: CustomBreakdownSummaryOconus,
  },
] as const

// "Compare" tab inside CharlieShellLayout. Renders each of the same 8
// Report-tab card components twice — once for the primary geography (the
// top bar's fips), once for the comparison geography (its own `compare`
// URL param) — stacked full-width rather than the two bespoke 2-column
// CustomRateBarChartCompareOconus/CustomStackedSharesBarChartCompareOconus
// components this replaces. Those two are deleted: once Compare needs
// every single-geography card rendered twice with a different fips, the
// plain components already do exactly that with no modification, and
// cover all 8 card types instead of just the 2 that got bespoke variants.
export default function CharlieCompareTab() {
  const [primaryCode] = useCharlieFipsCode()
  const [compareCode, setCompareCode] = useCharlieCompareFipsCode()
  const [topicId, setTopicId] = useCharlieTopic()
  const [sheetOpen, setSheetOpen] = useState(false)

  const primaryFips = OCONUS_GEOGRAPHIES[primaryCode]
  const compareFips = OCONUS_GEOGRAPHIES[compareCode]
  const dataTypeConfig = CHARLIE_TOPICS[topicId]
  const topicLabel = CHARLIE_TOPIC_LABELS[topicId]

  const otherCodes = OCONUS_FIPS_CODES.filter((code) => code !== primaryCode)
  const statuses = useCharlieGeographyStatuses(otherCodes, dataTypeConfig)

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full flex-col content-center'>
          <div className='m-2 rounded-2xl bg-alt-white p-4 text-left shadow-raised'>
            <div className='font-semibold text-alt-green text-smallest uppercase tracking-wide'>
              Comparing · {topicLabel}
            </div>
            <div className='mt-1 flex flex-wrap items-baseline gap-x-2 text-lg'>
              <span className='font-bold text-alt-green'>
                {primaryFips.getDisplayName()}
              </span>
              <span className='font-normal text-alt-dark text-small'>vs</span>
              <span className='font-bold text-alt-green'>
                {compareFips.getDisplayName()}
              </span>
            </div>
            <Button
              size='small'
              variant='outlined'
              className='!rounded-full mt-3 px-4 py-1.5 normal-case'
              onClick={() => setSheetOpen(true)}
            >
              Change comparison
            </Button>
          </div>

          {SECTIONS.map(({ id, label, Component }) => (
            <div className='w-full [&_article]:rounded-2xl' key={id}>
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                {label} — {primaryFips.getDisplayName()}
              </h2>
              <Component fips={primaryFips} dataTypeConfig={dataTypeConfig} />
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                {label} — {compareFips.getDisplayName()}
              </h2>
              <Component fips={compareFips} dataTypeConfig={dataTypeConfig} />
            </div>
          ))}
        </div>
      </div>

      <CharlieBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title='Change comparison'
        subtitle={`Comparing against ${primaryFips.getDisplayName()}`}
        ariaLabel='Change comparison'
      >
        <div className='text-left'>
          <h3 className='mt-2 mb-1 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
            Topic
          </h3>
          <CharlieTopicToggle
            topicId={topicId}
            onChange={(id: CharlieTopicId) => setTopicId(id)}
          />

          <h3 className='mt-4 mb-1 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
            Compare with
          </h3>
          <CharlieGeographyList
            codes={otherCodes}
            selectedCode={compareCode}
            onSelect={(code: OconusFipsCode) => {
              setCompareCode(code)
              setSheetOpen(false)
            }}
            getStatus={(code) => {
              const level = statuses?.[code]
              const geoName = OCONUS_GEOGRAPHIES[code].getDisplayName()
              if (!level) return { level: 'partial', label: 'Checking…' }
              if (level === 'full')
                return { level, label: 'Full data available' }
              if (level === 'partial') {
                return { level, label: 'Some breakdowns unavailable' }
              }
              return {
                level,
                label: `No ${topicLabel} data for ${geoName} yet`,
              }
            }}
          />
        </div>
      </CharlieBottomSheet>
    </div>
  )
}
