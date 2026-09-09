import {
  OCONUS_FIPS_CODES,
  type OconusFipsCode,
} from '../../reports/oconusGeographies'
import { useParamState } from '../../utils/hooks/useParamState'

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
