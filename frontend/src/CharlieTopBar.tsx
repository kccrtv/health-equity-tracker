import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AppBar, Chip, Toolbar } from '@mui/material'
import { useState } from 'react'
import CharlieBottomSheet from './CharlieBottomSheet'
import CharlieGeographyList from './CharlieGeographyList'
import { USA_FIPS } from './data/utils/ConstantsGeography'
import {
  getCharlieGeography,
  OCONUS_FIPS_CODES,
  type OconusFipsCode,
} from './reports/oconusGeographies'
import { useParamState } from './utils/hooks/useParamState'

export const CHARLIE_FIPS_PARAM = 'fips'

// The top bar's picker is the one place United States is a selectable
// primary geography, alongside the 6 OCONUS ones — Home's per-geography
// cards and Compare's geography list are unaffected and stay
// OCONUS_FIPS_CODES-only.
const TOP_BAR_FIPS_CODES = [...OCONUS_FIPS_CODES, USA_FIPS] as const
export type CharliePrimaryFipsCode = OconusFipsCode | typeof USA_FIPS

// Reads/writes the same URL-param-backed jotai state (`useParamState` ->
// `urlParamAtom`/`locationAtom`) that the real Report.tsx's fips ultimately
// sits on, just without the MadLib phrase-string encoding — Charlie only
// ever needs one flat geography value, not a multi-segment mode string.
// Any component under CharlieShellLayout can call this and stay in sync.
export function useCharlieFipsCode(): [
  CharliePrimaryFipsCode,
  (code: string) => void,
] {
  const [fipsCode, setFipsCode] = useParamState<string>(
    CHARLIE_FIPS_PARAM,
    OCONUS_FIPS_CODES[0],
  )
  const validated = (TOP_BAR_FIPS_CODES as readonly string[]).includes(fipsCode)
    ? (fipsCode as CharliePrimaryFipsCode)
    : OCONUS_FIPS_CODES[0]
  return [validated, setFipsCode]
}

export default function CharlieTopBar() {
  const [fipsCode, setFipsCode] = useCharlieFipsCode()
  const [pickerOpen, setPickerOpen] = useState(false)
  const selectedFips = getCharlieGeography(fipsCode)

  return (
    <>
      <AppBar position='static' elevation={0} className='bg-alt-green'>
        <Toolbar className='flex items-center justify-between gap-3'>
          <div className='text-left'>
            <div className='font-sans-title font-semibold text-alt-white text-lg leading-none'>
              CHARLIE
            </div>
            <div className='text-alt-white/70 text-smallest-header leading-none'>
              OCONUS
            </div>
          </div>
          <Chip
            label={
              <span className='flex items-center gap-0.5'>
                {selectedFips.getDisplayName()}
                <ArrowDropDownIcon fontSize='small' aria-hidden='true' />
              </span>
            }
            onClick={() => setPickerOpen(true)}
            // !min-h-11: measured live at 32px tall — under the 44px
            // touch-target minimum. MUI Chip's own height is normally fixed
            // via its size variant, hence the !important.
            className='!min-h-11 bg-alt-white text-alt-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2'
            aria-label='Change geography'
          />
        </Toolbar>
      </AppBar>

      <CharlieBottomSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title='Geography'
        ariaLabel='Choose a geography'
      >
        <CharlieGeographyList
          codes={TOP_BAR_FIPS_CODES}
          selectedCode={fipsCode}
          onSelect={(code) => {
            setFipsCode(code)
            setPickerOpen(false)
          }}
        />
      </CharlieBottomSheet>
    </>
  )
}
