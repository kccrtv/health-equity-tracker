import CustomAltTableOconus from '../../reports/CustomAltTableOconus'
import CustomBreakdownSummaryOconus from '../../reports/CustomBreakdownSummaryOconus'
import CustomChoroplethMapOconus from '../../reports/CustomChoroplethMapOconus'
import CustomRateBarChartCompareOconus from '../../reports/CustomRateBarChartCompareOconus'
import CustomRateBarChartOconus from '../../reports/CustomRateBarChartOconus'
import CustomRateTrendsLineChartOconus from '../../reports/CustomRateTrendsLineChartOconus'
import CustomShareTrendsLineChartOconus from '../../reports/CustomShareTrendsLineChartOconus'
import CustomStackedSharesBarChartCompareOconus from '../../reports/CustomStackedSharesBarChartCompareOconus'
import CustomStackedSharesBarChartOconus from '../../reports/CustomStackedSharesBarChartOconus'
import CustomUnknownMapOconus from '../../reports/CustomUnknownMapOconus'

// SCRATCH PREVIEW page for the Charlie Oconus card set. Not linked from
// nav — reachable only by navigating directly to its route. This is an
// ongoing working page (not a one-off to delete), so keep it up to date as
// the Oconus card set evolves.
//
// The outer wrapper below mirrors Report.tsx's card-column structure
// (`flex w-full flex-col content-center`, each card in its own `w-full`
// slot) so spacing here matches a real report instead of looking ad hoc.
// Card-to-card spacing itself comes from each card's own CardWrapper
// (`m-2 ... shadow-raised`), same as on a real report.
const SECTIONS: Array<{
  id: string
  label: string
  render: () => React.ReactNode
}> = [
  {
    id: 'rate-map',
    label: 'Choropleth map',
    render: () => <CustomChoroplethMapOconus />,
  },
  {
    id: 'rates-over-time',
    label: 'Rate trends line chart',
    render: () => <CustomRateTrendsLineChartOconus />,
  },
  {
    id: 'rate-chart',
    label: 'Rate bar chart',
    render: () => <CustomRateBarChartOconus />,
  },
  {
    id: 'rate-chart-compare',
    label: 'Rate bar chart (compare)',
    render: () => <CustomRateBarChartCompareOconus />,
  },
  {
    id: 'unknown-demographic-map',
    label: 'Unknowns map',
    render: () => <CustomUnknownMapOconus />,
  },
  {
    id: 'inequities-over-time',
    label: 'Share trends line chart',
    render: () => <CustomShareTrendsLineChartOconus />,
  },
  {
    id: 'population-vs-distribution',
    label: 'Stacked shares bar chart',
    render: () => <CustomStackedSharesBarChartOconus />,
  },
  {
    id: 'population-vs-distribution-compare',
    label: 'Stacked shares bar chart (compare)',
    render: () => <CustomStackedSharesBarChartCompareOconus />,
  },
  {
    id: 'rates-over-time-table',
    label: 'Alt table',
    render: () => <CustomAltTableOconus />,
  },
  {
    id: 'data-table',
    label: 'Breakdown summary',
    render: () => <CustomBreakdownSummaryOconus />,
  },
]

export default function OconusPreviewPage() {
  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full items-center justify-center'>
          <div className='flex w-full flex-col content-center'>
            <h1 className='m-2 text-left font-bold text-xl'>
              Charlie Oconus — card preview (scratch, not linked from nav)
            </h1>
            {SECTIONS.map(({ id, label, render }) => (
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
