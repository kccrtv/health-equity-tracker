import CustomRateBarChartCompareOconus from '../../reports/CustomRateBarChartCompareOconus'
import CustomStackedSharesBarChartCompareOconus from '../../reports/CustomStackedSharesBarChartCompareOconus'

// "Compare" tab inside CharlieShellLayout. Fixed to Hawaiʻi vs. Puerto
// Rico (each compare card's own built-in defaults) — not wired to the
// top bar's geography switcher, unlike the Report tab.
export default function CharlieCompareTab() {
  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full items-center justify-center'>
          <div className='flex w-full flex-col content-center'>
            <div className='w-full' id='rate-chart-compare'>
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                Rate bar chart (compare)
              </h2>
              <CustomRateBarChartCompareOconus />
            </div>
            <div className='w-full' id='population-vs-distribution-compare'>
              <h2 className='mx-2 mt-4 text-left font-semibold text-lg'>
                Stacked shares bar chart (compare)
              </h2>
              <CustomStackedSharesBarChartCompareOconus />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
