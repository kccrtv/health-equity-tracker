import type React from 'react'
import MapCard from '../cards/MapCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomChoroplethMapOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

// Oconus counterpart of CustomChoroplethMap.tsx. `fips` is restricted in
// practice to the six OCONUS geographies (see oconusGeographies.ts) so a
// future selector can swap between them without needing a file per
// geography. Note that MapCard renders props.fips's CHILD geographies (i.e.
// counties for a state/territory), and incarceration has no county-level
// data for any of these six today — see scripts/coverage output — so the map
// will legitimately show "no data" until county-level reporting exists.
const CustomChoroplethMapOconus: React.FC<CustomChoroplethMapOconusProps> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} in ${fips.getFullDisplayName()}`,
  className,
}) => {
  return (
    <MapCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      updateFipsCallback={(_fips: Fips) => {}}
      trackerMode={'disparity'}
      className={className}
    />
  )
}

export default CustomChoroplethMapOconus
