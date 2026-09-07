import type React from 'react'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { UNKNOWN_RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import HetLazyLoader from '../styles/HetComponents/HetLazyLoader'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

interface CustomUnknownMapOconusProps {
  headerScrollMargin?: string
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  updateFipsCallback?: (fips: Fips) => void
  demographicType?: string
  shareMetricConfig?: boolean
  reportTitle?: string
}

// Oconus counterpart of CustomUnknownMap.tsx. Unlike the original (which
// hardcodes covid internally), dataTypeConfig is exposed as a prop here for
// consistency with the rest of the Oconus card set — defaulted to
// incarceration, the first Charlie Oconus topic.
const CustomUnknownMapOconus: React.FC<CustomUnknownMapOconusProps> = ({
  headerScrollMargin = '50px',
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  updateFipsCallback = (_fips: Fips) => {},
  demographicType = UNKNOWN_RACE,
  shareMetricConfig = true,
  reportTitle = `Unknown demographics for ${dataTypeConfig.fullDisplayNameInline ?? dataTypeConfig.fullDisplayName} in ${fips.getFullDisplayName()}`,
}) => {
  return (
    <div
      className='w-full'
      id='unknown-demographic-map-oconus'
      style={{
        scrollMarginTop: headerScrollMargin,
      }}
    >
      <HetLazyLoader offset={800} height={750} once>
        {shareMetricConfig && (
          <UnknownsMapCard
            overrideAndWithOr={demographicType === 'race_and_ethnicity'}
            dataTypeConfig={dataTypeConfig}
            fips={fips}
            updateFipsCallback={updateFipsCallback}
            demographicType={'race_and_ethnicity'}
            reportTitle={reportTitle}
          />
        )}
      </HetLazyLoader>
    </div>
  )
}

export default CustomUnknownMapOconus
