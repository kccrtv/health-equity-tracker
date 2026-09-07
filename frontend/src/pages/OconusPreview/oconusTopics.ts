import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { useParamState } from '../../utils/hooks/useParamState'

// Second, independent URL param from the geography switcher's `fips`
// (CharlieTopBar.tsx), so a link can capture both together
// (e.g. /oconus-preview?fips=66&topic=covid). Scoped to the Report tab only
// — Compare stays fixed to incarceration + Hawaiʻi/Puerto Rico.
export const CHARLIE_TOPIC_PARAM = 'topic'

export const CHARLIE_TOPIC_IDS = ['incarceration', 'covid'] as const
export type CharlieTopicId = (typeof CHARLIE_TOPIC_IDS)[number]

// COVID-19 cases (index 0) chosen per the coverage check: cases/deaths/
// hospitalizations all have equivalent OCONUS coverage (5/6 — American
// Samoa has no data at any granularity, for any of the three), so cases is
// as good a default as either sibling.
export const CHARLIE_TOPICS: Record<CharlieTopicId, DataTypeConfig> = {
  incarceration: METRIC_CONFIG['incarceration'][0],
  covid: METRIC_CONFIG['covid'][0],
}

export const CHARLIE_TOPIC_LABELS: Record<CharlieTopicId, string> = {
  incarceration: 'Incarceration',
  covid: 'COVID-19',
}

const DEFAULT_TOPIC_ID: CharlieTopicId = 'incarceration'

export function useCharlieTopic(): [
  CharlieTopicId,
  (id: CharlieTopicId) => void,
] {
  const [topicId, setTopicId] = useParamState<string>(
    CHARLIE_TOPIC_PARAM,
    DEFAULT_TOPIC_ID,
  )
  const validated = (CHARLIE_TOPIC_IDS as readonly string[]).includes(topicId)
    ? (topicId as CharlieTopicId)
    : DEFAULT_TOPIC_ID
  return [validated, setTopicId]
}
