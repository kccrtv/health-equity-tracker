import type React from 'react'
import StackedSharesBarChartCard from '../cards/StackedSharesBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomStackedSharesBarChartOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

// Oconus counterpart of CustomStackedSharesBarChart.tsx.
const CustomStackedSharesBarChartOconus: React.FC<
  CustomStackedSharesBarChartOconusProps
> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} in ${fips.getFullDisplayName()} by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]}`,
  className,
}) => {
  return (
    <StackedSharesBarChartCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      className={className}
    />
  )
}

export default CustomStackedSharesBarChartOconus
