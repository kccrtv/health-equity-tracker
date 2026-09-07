import type React from 'react'
import RateBarChartCard from '../cards/RateBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomRateBarChartOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

// Oconus counterpart of CustomRateBarChart.tsx, defaulted to incarceration
// (the first Charlie Oconus topic) and one of the six OCONUS geographies
// rather than a single hardcoded state.
const CustomRateBarChartOconus: React.FC<CustomRateBarChartOconusProps> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} in ${fips.getFullDisplayName()}`,
  className,
}) => {
  return (
    <RateBarChartCard
      className={className}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
    />
  )
}

export default CustomRateBarChartOconus
