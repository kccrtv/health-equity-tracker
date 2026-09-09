import CheckIcon from '@mui/icons-material/Check'
import type { OconusFipsCode } from './reports/oconusGeographies'
import { OCONUS_GEOGRAPHIES } from './reports/oconusGeographies'

interface CharlieGeographyListProps {
  codes: readonly OconusFipsCode[]
  selectedCode?: OconusFipsCode
  onSelect: (code: OconusFipsCode) => void
  // When provided, each row shows this line beneath the geography name and
  // is styled muted unless it reports 'full'. Omit for the plain list (the
  // top bar's picker) — with no annotations, every row looks the same.
  getStatus?: (code: OconusFipsCode) => {
    label: string
    level: 'full' | 'partial' | 'none'
  }
}

// Reusable vertical list of tappable geography rows with the current
// selection indicated by a checkmark, shared by the top bar's plain
// picker (CharlieTopBar.tsx) and Compare's annotated "Compare with" list
// (CharlieCompareTab.tsx) via the optional getStatus prop.
export default function CharlieGeographyList({
  codes,
  selectedCode,
  onSelect,
  getStatus,
}: CharlieGeographyListProps) {
  return (
    <ul className='m-0 list-none p-0'>
      {codes.map((code) => {
        const geo = OCONUS_GEOGRAPHIES[code]
        const isSelected = code === selectedCode
        const status = getStatus?.(code)
        // Muted, not disabled: a sparse pairing is still a real choice, same
        // honesty-over-hiding pattern used throughout the rest of the app.
        const muted = status && status.level !== 'full'

        return (
          <li key={code}>
            <button
              type='button'
              onClick={() => onSelect(code)}
              className={`flex w-full items-center justify-between gap-2 border-0 border-divider-gray border-b bg-transparent py-3 text-left ${
                muted ? 'text-alt-dark' : 'text-alt-black'
              }`}
            >
              <span>
                <span className='block font-medium'>
                  {geo.getDisplayName()}
                </span>
                {status && (
                  <span className='block text-alt-dark text-smallest'>
                    {status.label}
                  </span>
                )}
              </span>
              {isSelected && (
                <CheckIcon fontSize='small' className='text-alt-green' />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
