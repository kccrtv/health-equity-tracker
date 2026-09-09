import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
import { getAllDemographicOptions } from '../../reports/reportUtils'
import { useParamState } from '../../utils/hooks/useParamState'

// Charlie's own short, lowercase-second-word presentation labels for the
// sentence/pills — matching the house style already used for the topic
// catalog (e.g. "Race/ethnicity", "Sex", "Insurance status"), not the raw
// Title Case keys getAllDemographicOptions() returns (e.g. "Sex at Birth").
export const CHARLIE_DEMOGRAPHIC_LABELS: Record<DemographicType, string> = {
  race_and_ethnicity: 'Race/ethnicity',
  age: 'Age',
  sex: 'Sex',
  insurance_status: 'Insurance status',
  education: 'Education',
  income: 'Income',
  lis: 'Low income subsidy',
  eligibility: 'Eligibility',
  fips: 'FIPS codes',
  urbanicity: 'City size',
}

const DEFAULT_DEMOGRAPHIC_TYPE: DemographicType = 'race_and_ethnicity'

export interface CharlieDemographicCascade {
  // In METRIC_CONFIG's own declared order (getAllDemographicOptions builds
  // its map by successive overwrite, not by any inherent ordering), so the
  // pill row's order matches DEMOGRAPHIC_TYPES_MAP: Age, Race/ethnicity, Sex
  // first, PHRMA/PHRMA-BRFSS's extra dimensions after.
  enabled: DemographicType[]
}

const PILL_ORDER: DemographicType[] = [
  'age',
  'race_and_ethnicity',
  'sex',
  'insurance_status',
  'education',
  'income',
  'lis',
  'eligibility',
]

// Reuses the real app's own demographic-availability logic (reportUtils.ts,
// the same function DemographicSelector/MadLibUI use) rather than
// re-deriving which topics restrict which demographic types — see
// charlieDemographicCascade verification notes for how this was checked
// against Cancer's real config shape (Incidence vs. Screening branch
// differently) even though Cancer isn't wired into any Charlie UI.
export function getCharlieDemographicCascade(
  dataTypeConfig: DataTypeConfig,
  fips: Fips,
): CharlieDemographicCascade {
  const { enabledDemographicOptionsMap } = getAllDemographicOptions(
    dataTypeConfig,
    fips,
  )
  const enabledSet = new Set(Object.values(enabledDemographicOptionsMap))
  return { enabled: PILL_ORDER.filter((type) => enabledSet.has(type)) }
}

// URL-param-backed (`demo`), scoped to the Report tab like `topic`/`dt`. If
// the persisted choice is no longer valid for the current topic/sub-item
// (e.g. switching from an all-sexes cancer type to a sex-specific one),
// falls back to the first enabled option — same invariant the real
// MadLibUI/DemographicSelector pair enforces on topic/data-type change.
export function useCharlieDemographicType(
  cascade: CharlieDemographicCascade,
): [DemographicType, (type: DemographicType) => void] {
  const [demoParam, setDemoParam] = useParamState<string>(
    'demo',
    DEFAULT_DEMOGRAPHIC_TYPE,
  )
  const isValid = (cascade.enabled as string[]).includes(demoParam)
  const validated = isValid
    ? (demoParam as DemographicType)
    : (cascade.enabled[0] ?? DEFAULT_DEMOGRAPHIC_TYPE)

  return [validated, setDemoParam]
}
