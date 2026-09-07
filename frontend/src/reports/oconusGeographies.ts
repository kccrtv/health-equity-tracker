import { Fips } from '../data/utils/Fips'

// The six OCONUS (outside the contiguous US) geographies the "Charlie Oconus"
// report offshoot focuses on: Hawaiʻi plus the five inhabited US territories.
export const OCONUS_FIPS_CODES = ['15', '60', '66', '69', '72', '78'] as const

export type OconusFipsCode = (typeof OCONUS_FIPS_CODES)[number]

export const OCONUS_GEOGRAPHIES: Record<OconusFipsCode, Fips> =
  Object.fromEntries(
    OCONUS_FIPS_CODES.map((code) => [code, new Fips(code)]),
  ) as Record<OconusFipsCode, Fips>

// Hawaiʻi has the strongest coverage of any OCONUS geography across the
// topics checked so far (see scripts/coverage/geo-coverage-report.ts output),
// so it's the sensible shared default until a selector lets a caller pick.
export const DEFAULT_OCONUS_FIPS = OCONUS_GEOGRAPHIES['15']

// Second default for the two-geography "Compare" cards. Puerto Rico is the
// only other OCONUS geography with incarceration data at every granularity
// the general report checked.
export const DEFAULT_OCONUS_COMPARE_FIPS = OCONUS_GEOGRAPHIES['72']
