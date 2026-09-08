import { useEffect, useState } from 'react'
import { getRateBarA11ySummary } from '../../charts/rateBarChart/a11yUtils'
import { formatValue } from '../../charts/sharedBarChartPieces/helpers'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { Breakdowns } from '../../data/query/Breakdowns'
import { MetricQuery } from '../../data/query/MetricQuery'
import { ALL } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { getDataManager } from '../../utils/globals'

export type CharlieHeadlineStatus =
  | 'loading'
  | 'has_data'
  | 'suppressed'
  | 'no_data'

export interface CharlieHeadlineStat {
  status: CharlieHeadlineStatus
  allValueText: string | null
  comparisonSentence: string
}

const LOADING: CharlieHeadlineStat = {
  status: 'loading',
  allValueText: null,
  comparisonSentence: '',
}

// Headless — no chart, no CardWrapper. Runs the exact same MetricQuery +
// DataManager pipeline every real Oconus card already uses (Breakdowns.forFips
// + race_and_ethnicity + the topic's per100k metric, 'current' timeView), so
// it shares DataManager's cache with the Report tab's own cards rather than
// standing up a separate data path. The comparison sentence itself comes
// from getRateBarA11ySummary, the same deterministic (non-AI) utility
// RateBarChartCard already uses for its screen-reader summary — not
// generated here.
export function useCharlieHeadlineStat(
  fips: Fips,
  dataTypeConfig: DataTypeConfig,
): CharlieHeadlineStat {
  const [stat, setStat] = useState<CharlieHeadlineStat>(LOADING)

  useEffect(() => {
    const metricConfig = dataTypeConfig.metrics.per100k
    if (!metricConfig) {
      setStat({ status: 'no_data', allValueText: null, comparisonSentence: '' })
      return
    }

    let cancelled = false
    setStat(LOADING)

    const suppressionFlagId = metricConfig.suppressionFlagMetricId
    const metricIds = suppressionFlagId
      ? [metricConfig.metricId, suppressionFlagId]
      : [metricConfig.metricId]

    const breakdowns =
      Breakdowns.forFips(fips).addBreakdown('race_and_ethnicity')
    const query = new MetricQuery(
      metricIds,
      breakdowns,
      dataTypeConfig.dataTypeId,
      'current',
    )

    void getDataManager()
      .loadMetrics(query)
      .then((resp) => {
        if (cancelled) return
        const rows = resp.data
        const allRow = rows.find((row) => row.race_and_ethnicity === ALL)
        const allValue = allRow?.[metricConfig.metricId]
        const hasValue = typeof allValue === 'number' && !Number.isNaN(allValue)

        if (hasValue) {
          setStat({
            status: 'has_data',
            allValueText: formatValue(allValue, metricConfig, true),
            comparisonSentence: getRateBarA11ySummary(
              rows,
              metricConfig,
              'race_and_ethnicity',
            ),
          })
          return
        }

        const suppressed = suppressionFlagId
          ? rows.some((row) => row[suppressionFlagId] === true)
          : false
        setStat({
          status: suppressed ? 'suppressed' : 'no_data',
          allValueText: null,
          comparisonSentence: '',
        })
      })

    return () => {
      cancelled = true
    }
  }, [fips.code, dataTypeConfig])

  return stat
}
