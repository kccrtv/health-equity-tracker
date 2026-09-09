import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import CharlieBottomSheet from '../../CharlieBottomSheet'
import { useCharlieFipsCode } from '../../CharlieTopBar'
import CustomAltTableOconus from '../../reports/CustomAltTableOconus'
import CustomBreakdownSummaryOconus from '../../reports/CustomBreakdownSummaryOconus'
import CustomChoroplethMapOconus from '../../reports/CustomChoroplethMapOconus'
import CustomRateBarChartOconus from '../../reports/CustomRateBarChartOconus'
import CustomRateTrendsLineChartOconus from '../../reports/CustomRateTrendsLineChartOconus'
import CustomShareTrendsLineChartOconus from '../../reports/CustomShareTrendsLineChartOconus'
import CustomStackedSharesBarChartOconus from '../../reports/CustomStackedSharesBarChartOconus'
import CustomUnknownMapOconus from '../../reports/CustomUnknownMapOconus'
import {
  getCharlieGeography,
  OCONUS_FIPS_CODES,
  OCONUS_GEOGRAPHIES,
  type OconusFipsCode,
} from '../../reports/oconusGeographies'
import { colors } from '../../styles/tokens/colors'
import CharlieComparisonOptionList, {
  type ComparisonOption,
} from './CharlieComparisonOptionList'
import { getCharlieAxisAvailability } from './charlieDemographic'
import {
  CHARLIE_TOPIC_IDS,
  CHARLIE_TOPIC_LABELS,
  CHARLIE_TOPICS,
  useCharlieTopic,
} from './oconusTopics'
import {
  type CharlieCompareMode,
  useCharlieCompareFipsCode,
  useCharlieCompareMode,
  useCharlieCompareTopicId,
} from './useCharlieCompareFips'

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

// Mirrors the real MadLib's Off/Places/Topics compare-mode concept (Charlie
// has no "Off" — you're already on the dedicated Compare tab) as a pill
// toggle matching the reviewed design concept, styled like the existing
// Charlie pill pattern (CharlieTopicToggle) rather than the real app's
// SimpleSelect dropdown control, since the concept's own mockup shows pills.
function ComparePlacesTopicsToggle({
  mode,
  onChange,
}: {
  mode: CharlieCompareMode
  onChange: (mode: CharlieCompareMode) => void
}) {
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      size='small'
      onChange={(_event, newMode: CharlieCompareMode | null) => {
        if (newMode) onChange(newMode)
      }}
      aria-label='Compare mode'
      sx={{
        gap: '8px',
        '& .MuiToggleButtonGroup-grouped': {
          margin: 0,
          border: `1px solid ${colors.altGray} !important`,
          borderRadius: '9999px !important',
        },
      }}
    >
      <ToggleButton
        value='places'
        className='normal-case'
        sx={{
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: colors.hoverAltGreen,
            borderColor: `${colors.altGreen} !important`,
            color: colors.altGreen,
            fontWeight: 600,
          },
        }}
      >
        Places
      </ToggleButton>
      <ToggleButton
        value='topics'
        className='normal-case'
        sx={{
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: colors.hoverAltGreen,
            borderColor: `${colors.altGreen} !important`,
            color: colors.altGreen,
            fontWeight: 600,
          },
        }}
      >
        Topics
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

// "Compare" tab inside CharlieShellLayout. Renders each of the same 8
// Report-tab card components twice — once for the primary geography (the
// top bar's fips), once for the comparison side — stacked full-width. Two
// modes: Places (topic fixed, second geography varies — the original
// behavior) and Topics (geography fixed, second topic varies — new). Both
// modes reuse the exact same axis-tag + availability-note mechanism
// (CharlieComparisonOptionList), fed geography options in Places mode and
// topic options in Topics mode.
export default function CharlieCompareTab() {
  const [primaryCode] = useCharlieFipsCode()
  const [compareCode, setCompareCode] = useCharlieCompareFipsCode()
  const [topicId] = useCharlieTopic()
  const [compareMode, setCompareMode] = useCharlieCompareMode()
  const [compareTopicId, setCompareTopicId] = useCharlieCompareTopicId(topicId)
  const [sheetOpen, setSheetOpen] = useState(false)

  // primaryCode can be '00' (United States) — the top bar's own picker
  // added that as a 7th option, primary-geography-only per scope; Compare's
  // OWN geography list (below) intentionally stays OCONUS-only.
  const primaryFips = getCharlieGeography(primaryCode)
  const compareFips = OCONUS_GEOGRAPHIES[compareCode]
  const dataTypeConfig = CHARLIE_TOPICS[topicId]
  const topicLabel = CHARLIE_TOPIC_LABELS[topicId]

  const isPlaces = compareMode === 'places'

  // What each of the two rendered card sets actually shows: in Places mode
  // the topic is fixed and the geography varies; in Topics mode the
  // geography is fixed and the topic varies. Card labels below follow
  // whichever axis is actually varying, since labeling both cards by
  // geography name in Topics mode would show the same name twice.
  const secondaryFips = isPlaces ? compareFips : primaryFips
  const secondaryDataTypeConfig = isPlaces
    ? dataTypeConfig
    : CHARLIE_TOPICS[compareTopicId]
  const primaryLabel = isPlaces ? primaryFips.getDisplayName() : topicLabel
  const secondaryLabel = isPlaces
    ? compareFips.getDisplayName()
    : CHARLIE_TOPIC_LABELS[compareTopicId]

  const otherCodes = OCONUS_FIPS_CODES.filter((code) => code !== primaryCode)
  const otherTopicIds = CHARLIE_TOPIC_IDS.filter((id) => id !== topicId)

  const geographyOptions: ComparisonOption[] = otherCodes.map((code) => ({
    id: code,
    label: OCONUS_GEOGRAPHIES[code].getDisplayName(),
    axes: getCharlieAxisAvailability(dataTypeConfig, OCONUS_GEOGRAPHIES[code]),
  }))

  const topicOptions: ComparisonOption[] = otherTopicIds.map((id) => ({
    id,
    label: CHARLIE_TOPIC_LABELS[id],
    axes: getCharlieAxisAvailability(CHARLIE_TOPICS[id], primaryFips),
  }))

  // "INCARCERATION, Hawaiʻi vs Puerto Rico" (Places — topic fixed, shown in
  // caps) / "HAWAIʻI, Incarceration vs COVID-19" (Topics — place fixed,
  // shown in caps): the fixed axis leads in caps, the varying pair follows.
  const fixedAxisCaps = (
    isPlaces ? topicLabel : primaryFips.getDisplayName()
  ).toUpperCase()

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full flex-col content-center'>
          <div className='m-2 rounded-2xl bg-alt-white p-4 text-left shadow-raised'>
            <p className='m-0 font-semibold text-alt-green text-smallest uppercase tracking-wide'>
              Comparing
            </p>
            {/* p-0: index.css's global h1 rule adds 2rem/1rem top/bottom
                padding sized for full-page titles, not this compact card. */}
            <h1 className='m-0 mt-1 flex flex-wrap items-baseline gap-x-2 p-0 text-lg'>
              <span className='font-bold text-alt-green'>{fixedAxisCaps},</span>
              <span className='font-bold text-alt-green'>{primaryLabel}</span>
              <span className='font-normal text-alt-dark text-small'>vs</span>
              <span className='font-bold text-alt-green'>{secondaryLabel}</span>
            </h1>
            {/* Announces mode/geography/topic switches to assistive tech —
                this text already updates with every one of those changes. */}
            <div aria-live='polite' className='sr-only'>
              {fixedAxisCaps}, {primaryLabel} vs {secondaryLabel}
            </div>
            <Button
              size='small'
              variant='outlined'
              className='!min-h-11 !rounded-full mt-3 px-4 py-1.5 normal-case'
              onClick={() => setSheetOpen(true)}
            >
              Change comparison
            </Button>
          </div>

          {SECTIONS.map(({ id, label, Component }) => (
            <div className='w-full [&_article]:rounded-2xl' key={id}>
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                {label} — {primaryLabel}
              </h2>
              <Component fips={primaryFips} dataTypeConfig={dataTypeConfig} />
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                {label} — {secondaryLabel}
              </h2>
              <Component
                fips={secondaryFips}
                dataTypeConfig={secondaryDataTypeConfig}
              />
            </div>
          ))}
        </div>
      </div>

      <CharlieBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title='Change comparison'
        ariaLabel='Change comparison'
      >
        <div className='text-left'>
          <div className='mb-4'>
            <ComparePlacesTopicsToggle
              mode={compareMode}
              onChange={setCompareMode}
            />
          </div>

          {isPlaces ? (
            <>
              <h3 className='mt-2 mb-1 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
                Places · Fixed topic ({topicLabel})
              </h3>
              <CharlieComparisonOptionList
                options={geographyOptions}
                selectedId={compareCode}
                onSelect={(id) => {
                  setCompareCode(id as OconusFipsCode)
                  setSheetOpen(false)
                }}
              />
            </>
          ) : (
            <>
              <h3 className='mt-2 mb-1 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
                Topics · Fixed place ({primaryFips.getDisplayName()})
              </h3>
              <CharlieComparisonOptionList
                options={topicOptions}
                selectedId={compareTopicId}
                onSelect={(id) => {
                  setCompareTopicId(id as (typeof CHARLIE_TOPIC_IDS)[number])
                  setSheetOpen(false)
                }}
              />
              {otherTopicIds.length > 0 &&
                topicOptions.every((option) =>
                  option.axes.every((axis) => axis.available),
                ) && (
                  <p className='mt-3 text-alt-dark text-small'>
                    Both live CHARLIE OCONUS topics share the same three axes at{' '}
                    {primaryFips.getDisplayName()}, so every topic pair
                    currently reads fully available. The same axis-tag and note
                    mechanism from Places mode is reused here — it would flag a
                    gap automatically the moment a future topic supports fewer
                    breakdowns at this place.
                  </p>
                )}
            </>
          )}
        </div>
      </CharlieBottomSheet>
    </div>
  )
}
