import type React from 'react'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomRateTrendsLineChartOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

// Oconus counterpart of CustomRateTrendsLineChart.tsx.
const CustomRateTrendsLineChartOconus: React.FC<
  CustomRateTrendsLineChartOconusProps
> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} over time in ${fips.getFullDisplayName()}`,
  className,
}) => {
  return (
    <RateTrendsChartCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      className={className}
    />
  )
}

export default CustomRateTrendsLineChartOconus
