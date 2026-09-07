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

// SCRATCH PREVIEW page for the Charlie Oconus card set — the "Report" tab
// inside CharlieShellLayout. This is an ongoing working page (not a one-off
// to delete), so keep it up to date as the Oconus card set evolves.
//
// Geography comes from useCharlieFipsCode(), which reads/writes the same
// URL-param-backed jotai state as CharlieTopBar's geography chip/picker —
// no local state, no separate context, so switching geography in the top
// bar re-renders every card here automatically.
//
// The outer wrapper below mirrors Report.tsx's card-column structure
// (`flex w-full flex-col content-center`, each card in its own `w-full`
// slot) so spacing here matches a real report instead of looking ad hoc.
// Card-to-card spacing itself comes from each card's own CardWrapper
// (`m-2 ... shadow-raised`), same as on a real report.
export default function OconusPreviewPage() {
  const [fipsCode, setFipsCode] = useCharlieFipsCode()
  const fips = OCONUS_GEOGRAPHIES[fipsCode]

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
          updateFipsCallback={updateFipsCallback}
        />
      ),
    },
    {
      id: 'rates-over-time',
      label: 'Rate trends line chart',
      render: () => <CustomRateTrendsLineChartOconus fips={fips} />,
    },
    {
      id: 'rate-chart',
      label: 'Rate bar chart',
      render: () => <CustomRateBarChartOconus fips={fips} />,
    },
    {
      id: 'unknown-demographic-map',
      label: 'Unknowns map',
      render: () => (
        <CustomUnknownMapOconus
          fips={fips}
          updateFipsCallback={updateFipsCallback}
        />
      ),
    },
    {
      id: 'inequities-over-time',
      label: 'Share trends line chart',
      render: () => <CustomShareTrendsLineChartOconus fips={fips} />,
    },
    {
      id: 'population-vs-distribution',
      label: 'Stacked shares bar chart',
      render: () => <CustomStackedSharesBarChartOconus fips={fips} />,
    },
    {
      id: 'rates-over-time-table',
      label: 'Alt table',
      render: () => <CustomAltTableOconus fips={fips} />,
    },
    {
      id: 'data-table',
      label: 'Breakdown summary',
      render: () => <CustomBreakdownSummaryOconus fips={fips} />,
    },
  ]

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full items-center justify-center'>
          <div className='flex w-full flex-col content-center'>
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
