import { Fips } from '../data/utils/Fips'

// The six OCONUS (outside the contiguous US) geographies the "Charlie Oconus"
// report offshoot focuses on: Hawaiʻi plus the five inhabited US territories.
export const OCONUS_FIPS_CODES = ['15', '60', '66', '69', '72', '78'] as const

export type OconusFipsCode = (typeof OCONUS_FIPS_CODES)[number]

export const OCONUS_GEOGRAPHIES: Record<OconusFipsCode, Fips> =
  Object.fromEntries(
    OCONUS_FIPS_CODES.map((code) => [code, new Fips(code)]),
  ) as Record<OconusFipsCode, Fips>

// The top bar's own picker (CharlieTopBar.tsx) is the one place United
// States is offered as a 7th option, alongside the 6 OCONUS geographies —
// scoped there deliberately: Home's per-geography cards and Compare's
// geography list both stay OCONUS_FIPS_CODES-only. A primary fips read back
// from useCharlieFipsCode() can therefore be '00', which OCONUS_GEOGRAPHIES
// has no entry for — this resolves either one, falling back to constructing
// a fresh Fips for any code not in the map (safe for any valid fips string,
// not just '00', so callers don't need their own special case).
export function getCharlieGeography(code: string): Fips {
  return OCONUS_GEOGRAPHIES[code as OconusFipsCode] ?? new Fips(code)
}

// Hawaiʻi has the strongest coverage of any OCONUS geography across the
// topics checked so far (see scripts/coverage/geo-coverage-report.ts output),
// so it's the sensible shared default until a selector lets a caller pick.
export const DEFAULT_OCONUS_FIPS = OCONUS_GEOGRAPHIES['15']

// Second default for the two-geography "Compare" cards. Puerto Rico is the
// only other OCONUS geography with incarceration data at every granularity
// the general report checked.
export const DEFAULT_OCONUS_COMPARE_FIPS = OCONUS_GEOGRAPHIES['72']
