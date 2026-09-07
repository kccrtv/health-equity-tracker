import type React from 'react'
import StackedSharesBarChartCard from '../cards/StackedSharesBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import {
  DEFAULT_OCONUS_COMPARE_FIPS,
  DEFAULT_OCONUS_FIPS,
} from './oconusGeographies'

interface CustomStackedSharesBarChartCompareOconusProps {
  fips1?: Fips
  fips2?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  className?: string
}

// Oconus counterpart of CustomStackedSharesBarChartCompare.tsx, comparing two
// OCONUS geographies for the same topic instead of two states for the same
// topic. fips1/fips2 are restricted in practice to the six OCONUS
// geographies (see oconusGeographies.ts).
const CustomStackedSharesBarChartCompareOconus: React.FC<
  CustomStackedSharesBarChartCompareOconusProps
> = ({
  fips1 = DEFAULT_OCONUS_FIPS,
  fips2 = DEFAULT_OCONUS_COMPARE_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  className,
}) => {
  const demoLabel = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
  return (
    <div className={`flex justify-around ${className ?? ''}`}>
      <div className='mx-2 flex-1'>
        <StackedSharesBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          fips={fips1}
          reportTitle={`${dataTypeConfig.fullDisplayName} in ${fips1.getFullDisplayName()} by ${demoLabel}`}
        />
      </div>
      <div className='mx-2 flex-1'>
        <StackedSharesBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          fips={fips2}
          reportTitle={`${dataTypeConfig.fullDisplayName} in ${fips1.getFullDisplayName()} & ${fips2.getFullDisplayName()} by ${demoLabel}`}
        />
      </div>
    </div>
  )
}

export default CustomStackedSharesBarChartCompareOconus
