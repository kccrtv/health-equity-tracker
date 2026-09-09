import type React from 'react'
import TableCard from '../cards/TableCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomBreakdownSummaryOconusProps {
  headerScrollMargin?: string
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

// Oconus counterpart of CustomBreakdownSummary.tsx. dataTypeConfig is exposed
// as a prop here (the original hardcodes gun violence internally) for
// consistency with the rest of the Oconus card set.
//
// The original hardcodes `max-w-4/5` on its TableCard, which makes sense
// there: it's embedded directly in Policy-page article text with no outer
// width wrapper of its own. Here it isn't — every Oconus card, including
// this one, already sits inside the shared `md:w-10/12` column
// (OconusPreviewPage.tsx / CharlieCompareTab.tsx), so an additional 4/5 cap
// on top of that just narrows this one card below its siblings and clips
// the table. Dropped for the Oconus variant only; the original file is
// unchanged.
const CustomBreakdownSummaryOconus: React.FC<
  CustomBreakdownSummaryOconusProps
> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} demographic summary for ${fips.getFullDisplayName()}`,
  className,
}) => {
  return (
    <TableCard
      fips={fips}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      reportTitle={reportTitle}
      className={className}
    />
  )
}

export default CustomBreakdownSummaryOconus
