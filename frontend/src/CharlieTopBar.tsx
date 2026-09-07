import { AppBar, Chip, Toolbar } from '@mui/material'
import { useState } from 'react'
import {
  OCONUS_FIPS_CODES,
  OCONUS_GEOGRAPHIES,
  type OconusFipsCode,
} from './reports/oconusGeographies'
import HetListItemButton from './styles/HetComponents/HetListItemButton'
import HetResponsiveDialog from './styles/HetComponents/HetResponsiveDialog'
import { useParamState } from './utils/hooks/useParamState'

export const CHARLIE_FIPS_PARAM = 'fips'

// Reads/writes the same URL-param-backed jotai state (`useParamState` ->
// `urlParamAtom`/`locationAtom`) that the real Report.tsx's fips ultimately
// sits on, just without the MadLib phrase-string encoding — Charlie only
// ever needs one flat geography value, not a multi-segment mode string.
// Any component under CharlieShellLayout can call this and stay in sync.
export function useCharlieFipsCode(): [OconusFipsCode, (code: string) => void] {
  const [fipsCode, setFipsCode] = useParamState<string>(
    CHARLIE_FIPS_PARAM,
    OCONUS_FIPS_CODES[0],
  )
  const validated = (OCONUS_FIPS_CODES as readonly string[]).includes(fipsCode)
    ? (fipsCode as OconusFipsCode)
    : OCONUS_FIPS_CODES[0]
  return [validated, setFipsCode]
}

export default function CharlieTopBar() {
  const [fipsCode, setFipsCode] = useCharlieFipsCode()
  const [pickerOpen, setPickerOpen] = useState(false)
  const selectedFips = OCONUS_GEOGRAPHIES[fipsCode]

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
            label={selectedFips.getDisplayName()}
            onClick={() => setPickerOpen(true)}
            className='bg-alt-white text-alt-green'
            aria-label='Change geography'
          />
        </Toolbar>
      </AppBar>

      <HetResponsiveDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        ariaLabel='Choose a geography'
        maxWidth='xs'
      >
        <div className='text-left'>
          <h2 className='mt-0 mb-2 font-semibold text-lg'>Geography</h2>
          {OCONUS_FIPS_CODES.map((code) => (
            <HetListItemButton
              key={code}
              option='normalBlack'
              selected={code === fipsCode}
              onClick={() => {
                setFipsCode(code)
                setPickerOpen(false)
              }}
              ariaLabel={OCONUS_GEOGRAPHIES[code].getDisplayName()}
            >
              {OCONUS_GEOGRAPHIES[code].getDisplayName()}
            </HetListItemButton>
          ))}
        </div>
      </HetResponsiveDialog>
    </>
  )
}
