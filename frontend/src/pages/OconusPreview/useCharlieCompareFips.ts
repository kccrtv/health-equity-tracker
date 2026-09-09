import {
  OCONUS_FIPS_CODES,
  type OconusFipsCode,
} from '../../reports/oconusGeographies'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHARLIE_TOPIC_IDS, type CharlieTopicId } from './oconusTopics'

// Third URL param, independent from `fips` (primary geography) and `topic`,
// same useParamState/urlParamAtom convention — so a full comparison state
// is shareable via one link (?fips=15&topic=covid&compare=72).
export const CHARLIE_COMPARE_PARAM = 'compare'

const DEFAULT_COMPARE_CODE: OconusFipsCode = '72' // Puerto Rico — see oconusGeographies.ts

export function useCharlieCompareFipsCode(): [
  OconusFipsCode,
  (code: OconusFipsCode) => void,
] {
  const [code, setCode] = useParamState<string>(
    CHARLIE_COMPARE_PARAM,
    DEFAULT_COMPARE_CODE,
  )
  const validated = (OCONUS_FIPS_CODES as readonly string[]).includes(code)
    ? (code as OconusFipsCode)
    : DEFAULT_COMPARE_CODE
  return [validated, setCode]
}

export type CharlieCompareMode = 'places' | 'topics'
const CHARLIE_COMPARE_MODE_PARAM = 'cmpmode'
const DEFAULT_COMPARE_MODE: CharlieCompareMode = 'places'

export function useCharlieCompareMode(): [
  CharlieCompareMode,
  (mode: CharlieCompareMode) => void,
] {
  const [mode, setMode] = useParamState<string>(
    CHARLIE_COMPARE_MODE_PARAM,
    DEFAULT_COMPARE_MODE,
  )
  const validated: CharlieCompareMode =
    mode === 'places' || mode === 'topics' ? mode : DEFAULT_COMPARE_MODE
  return [validated, setMode]
}

// Topics-mode counterpart of useCharlieCompareFipsCode: the second topic to
// compare against, geography held fixed. Independent param so a link can
// capture the full Topics-mode state too (?fips=15&topic=incarceration&
// cmpmode=topics&cmptopic=covid).
const CHARLIE_COMPARE_TOPIC_PARAM = 'cmptopic'

export function useCharlieCompareTopicId(
  primaryTopicId: CharlieTopicId,
): [CharlieTopicId, (id: CharlieTopicId) => void] {
  // Defaults to whichever topic isn't currently primary — with only two
  // topics today that's always the other one; the fallback below still
  // holds if a third topic is ever added and the persisted choice becomes
  // stale (e.g. it now matches the new primary).
  const defaultCompareTopicId =
    CHARLIE_TOPIC_IDS.find((id) => id !== primaryTopicId) ??
    CHARLIE_TOPIC_IDS[0]

  const [topicId, setTopicId] = useParamState<string>(
    CHARLIE_COMPARE_TOPIC_PARAM,
    defaultCompareTopicId,
  )
  const isValid =
    (CHARLIE_TOPIC_IDS as readonly string[]).includes(topicId) &&
    topicId !== primaryTopicId
  const validated = isValid
    ? (topicId as CharlieTopicId)
    : defaultCompareTopicId
  return [validated, setTopicId]
}
