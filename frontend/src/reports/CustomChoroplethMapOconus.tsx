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
  updateFipsCallback?: (fips: Fips) => void
}

// Oconus counterpart of CustomChoroplethMap.tsx. `fips` is restricted in
// practice to the six OCONUS geographies (see oconusGeographies.ts) so a
// future selector can swap between them without needing a file per
// geography. Note that MapCard renders props.fips's CHILD geographies (i.e.
// counties for a state/territory), and incarceration has no county-level
// data for any of these six today — see scripts/coverage output — so the map
// will legitimately show "no data" until county-level reporting exists.
//
// `updateFipsCallback` defaults to a no-op (matching the original demo
// pattern) but is exposed as a prop so a caller with shared geography state
// (e.g. CharlieShellLayout's URL-param-backed selector) can wire map
// drill-downs back into that same state instead of them going nowhere.
const CustomChoroplethMapOconus: React.FC<CustomChoroplethMapOconusProps> = ({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} in ${fips.getFullDisplayName()}`,
  className,
  updateFipsCallback = (_fips: Fips) => {},
}) => {
  return (
    <MapCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      updateFipsCallback={updateFipsCallback}
      trackerMode={'disparity'}
      className={className}
    />
  )
}

export default CustomChoroplethMapOconus
