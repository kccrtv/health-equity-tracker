import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import { DemographicType } from '../data/query/Breakdowns';

interface CustomRateTrendsLineChartProps {
  fips?: Fips;
  dataTypeConfig?: DataTypeConfig;
  demographicType?: DemographicType;
  reportTitle?: string;
}

const CustomRateTrendsLineChart: React.FC<CustomRateTrendsLineChartProps> = ({
  fips = new Fips('00'),
  dataTypeConfig = METRIC_CONFIG['hiv'][0],  
  demographicType = 'race_and_ethnicity',
  reportTitle = 'Custom Rate Trends Line Chart',
}) => {
  return (
    <div>
      <RateTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default CustomRateTrendsLineChart