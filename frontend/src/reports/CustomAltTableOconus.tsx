import CardWrapper from '../cards/CardWrapper'
import MissingDataAlert from '../cards/ui/MissingDataAlert'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue, isPctType } from '../data/config/MetricConfigUtils'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AGE,
  ALL,
  type DemographicGroup,
  TIME_PERIOD_LABEL,
} from '../data/utils/Constants'
import { makeA11yTableData } from '../data/utils/DatasetTimeUtils'
import type { HetRow } from '../data/utils/DatasetTypes'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import HetTable from '../styles/HetComponents/HetTable'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { DEFAULT_OCONUS_FIPS } from './oconusGeographies'

const HASH_ID_RATES_OVER_TIME: ScrollableHashId = 'rates-over-time'

interface CustomAltTableOconusProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
  selectedTableGroups?: DemographicGroup[]
}

// Oconus counterpart of CustomAltTable.tsx. The original takes all props as
// required with no defaults; here fips/dataTypeConfig/demographicType/
// reportTitle are optional with OCONUS defaults, matching the pattern the
// rest of the Oconus card set uses.
export default function CustomAltTableOconus({
  fips = DEFAULT_OCONUS_FIPS,
  dataTypeConfig = METRIC_CONFIG['incarceration'][0],
  demographicType = 'race_and_ethnicity',
  reportTitle = `${dataTypeConfig.fullDisplayName} over time in ${fips.getFullDisplayName()}`,
  className,
  selectedTableGroups,
}: CustomAltTableOconusProps) {
  const metricConfigRates =
    dataTypeConfig.metrics?.per100k ??
    dataTypeConfig.metrics?.pct_rate ??
    dataTypeConfig.metrics?.index

  if (!metricConfigRates) {
    return <div>No metrics available for this configuration.</div>
  }

  const breakdowns = Breakdowns.forFips(fips).addBreakdown(demographicType)

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    dataTypeConfig.dataTypeId,
    'historical',
  )

  return (
    <CardWrapper
      downloadTitle={reportTitle}
      queries={[ratesQuery]}
      minHeight={400}
      reportTitle={reportTitle}
      scrollToHash={HASH_ID_RATES_OVER_TIME}
      className={`relative m-2 rounded-sm bg-alt-white p-3 shadow-raised ${className}`}
      fips={fips}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
    >
      {([queryResponseRates]) => {
        const ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId,
        )

        if (ratesData.length === 0) {
          return (
            <MissingDataAlert
              dataName={`historical data for ${metricConfigRates.chartTitle}`}
              demographicTypeString={
                DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
              }
              fips={fips}
            />
          )
        }

        const [knownRatesData, unknownPctShareData] =
          splitIntoKnownsAndUnknowns(ratesData, demographicType)

        const accessibleData = makeA11yTableData(
          knownRatesData as HetRow[],
          unknownPctShareData as HetRow[],
          demographicType,
          metricConfigRates,
          undefined,
          selectedTableGroups ?? [ALL],
          false,
        )

        const latestTimePeriod: string = accessibleData[0][TIME_PERIOD_LABEL]
        const earliestTimePeriod: string =
          accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL]

        const optionalAgesPrefix = demographicType === AGE ? 'Ages ' : ''
        const dataColumnLabel = metricConfigRates.shortLabel

        const hetColumns = Object.keys(accessibleData[0]).map((key) => {
          const isTimeCol = key === TIME_PERIOD_LABEL
          const isUnknownPctCol = key.includes('with unknown ')

          let header: React.ReactNode = key.replaceAll('_', ' ')
          if (!isTimeCol && !isUnknownPctCol) {
            const prefix = key !== ALL ? optionalAgesPrefix : ''
            header = `${prefix}${key.replaceAll('_', ' ')} ${dataColumnLabel}`
          } else if (isTimeCol) {
            header = `${key.replaceAll('_', ' ')} (${earliestTimePeriod} - ${latestTimePeriod})`
          }

          return { key, header }
        })

        const hetRows = accessibleData.map((row) =>
          Object.fromEntries(
            Object.keys(row).map((key) => {
              if (row[key] == null) return [key, null]
              const isTimePeriod = key === TIME_PERIOD_LABEL
              const appendPct =
                key.includes('with unknown ') ||
                isPctType(metricConfigRates.type)
              return [
                key,
                isTimePeriod
                  ? row[key]
                  : formatFieldValue(
                      metricConfigRates.type,
                      row[key],
                      !appendPct,
                    ),
              ]
            }),
          ),
        )

        return (
          <HetTable
            rows={hetRows}
            columns={hetColumns}
            variant='methodology'
            stickyHeader
            size='small'
          />
        )
      }}
    </CardWrapper>
  )
}
