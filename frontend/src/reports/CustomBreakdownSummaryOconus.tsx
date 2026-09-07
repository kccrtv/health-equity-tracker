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
      className={`max-w-4/5 ${className}`}
    />
  )
}

export default CustomBreakdownSummaryOconus
