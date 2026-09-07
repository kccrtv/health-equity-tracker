import type React from 'react'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomShareTrendsLineChartOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  isCompareCard?: boolean
  className?: string
}

// Oconus counterpart of CustomShareTrendsLineChart.tsx. Incarceration
// declares a pct_share metric (prison_pct_share / jail_pct_share), so the
// default DataTypeConfig works here without swapping topics.
const CustomShareTrendsLineChartOconus: React.FC<
  CustomShareTrendsLineChartOconusProps
> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `Share of ${dataTypeConfig.fullDisplayNameInline ?? dataTypeConfig.fullDisplayName} over time in ${fips.getFullDisplayName()}`,
  isCompareCard = false,
  className,
}) => {
  return (
    <ShareTrendsChartCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      isCompareCard={isCompareCard}
      className={className}
    />
  )
}

export default CustomShareTrendsLineChartOconus
