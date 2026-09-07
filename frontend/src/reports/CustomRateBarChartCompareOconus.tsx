import type React from 'react'
import RateBarChartCard from '../cards/RateBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import {
  DEFAULT_OCONUS_COMPARE_FIPS,
  DEFAULT_OCONUS_FIPS,
} from './oconusGeographies'

interface CustomRateBarChartCompareOconusProps {
  fips1?: Fips
  fips2?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  className?: string
}

// Oconus counterpart of CustomRateBarChartCompare.tsx. The original compares
// two different topics side by side at one fixed geography; this offshoot is
// single-topic (incarceration) so the interesting axis to compare is
// geography instead — fips1/fips2 are restricted in practice to the six
// OCONUS geographies (see oconusGeographies.ts).
const CustomRateBarChartCompareOconus: React.FC<
  CustomRateBarChartCompareOconusProps
> = ({
  fips1 = DEFAULT_OCONUS_FIPS,
  fips2 = DEFAULT_OCONUS_COMPARE_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  className,
}) => {
  return (
    <div className={className}>
      <div className='grid grid-cols-2'>
        <RateBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          fips={fips1}
          reportTitle={`${dataTypeConfig.fullDisplayName} in ${fips1.getFullDisplayName()}`}
        />
        <RateBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType={demographicType}
          fips={fips2}
          reportTitle={`${dataTypeConfig.fullDisplayName} in ${fips2.getFullDisplayName()}`}
        />
      </div>
    </div>
  )
}

export default CustomRateBarChartCompareOconus
