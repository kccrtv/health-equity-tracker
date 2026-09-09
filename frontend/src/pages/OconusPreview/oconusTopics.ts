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

// Hand-written by us (not AI-generated, not pulled from HET's own
// generateReportInsight feature — see CharlieHomeTab.tsx) — one framing
// clause per topic so the Home tab's headline stat reads as a sentence
// rather than a label. Written to match the tone of HET's real AI report
// summary panel (InsightReportCard.tsx): plain, one number up front, no
// severity language.
export const CHARLIE_TOPIC_FRAMING: Record<CharlieTopicId, string> = {
  incarceration: 'are in prison here',
  covid: 'have had COVID-19 here (cumulative since 2020)',
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

// Third URL param, independent of `topic` and `fips` — the sentence
// editor's "topic breakdown" segment. Both real Charlie topics already have
// more than one entry in METRIC_CONFIG (incarceration: Prison, Jail; covid:
// Cases, Deaths, Hospitalizations) even though CHARLIE_TOPICS above has
// always locked to index 0 — this exposes the real, already-registered
// variants instead of adding a fake axis. Scoped to the Report tab only,
// same as `topic`; Compare and Home keep using CHARLIE_TOPICS's fixed
// default and are unaffected by this selection.
export const CHARLIE_DATA_TYPE_PARAM = 'dt'

export function useCharlieDataTypeConfig(
  topicId: CharlieTopicId,
): [DataTypeConfig, (dataTypeId: string) => void] {
  const variants = METRIC_CONFIG[topicId]
  const defaultDataTypeId = variants[0].dataTypeId

  const [dataTypeId, setDataTypeId] = useParamState<string>(
    CHARLIE_DATA_TYPE_PARAM,
    defaultDataTypeId,
  )
  const config =
    variants.find((c) => c.dataTypeId === dataTypeId) ?? variants[0]

  return [config, setDataTypeId]
}
