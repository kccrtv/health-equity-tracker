import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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

// Reusable vertical list of tappable geography rows, shared by the top
// bar's plain picker (CharlieTopBar.tsx) and Compare's annotated "Compare
// with" list (CharlieCompareTab.tsx) via the optional getStatus prop.
// Selection is shown as a filled/outlined row PLUS a checkmark icon — a
// prior polish pass removed the checkmark in favor of color+outline alone,
// but that's since been superseded by an accessibility finding (color
// alone isn't a sufficient signal), so the checkmark is back. A muted row
// (status level other than 'full') gets a tinted background — still fully
// tappable, never disabled — same honesty-over-hiding pattern used
// throughout the rest of the app. Selection styling takes precedence over
// the muted tint when a row is both (the current choice matters more than
// its own sparseness).
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
        const muted = status && status.level !== 'full'

        const rowClassName = isSelected
          ? 'border-alt-green bg-hover-alt-green'
          : muted
            ? 'border-transparent bg-bg-color'
            : 'border-transparent bg-transparent'

        return (
          <li key={code} className='mb-2'>
            <button
              type='button'
              onClick={() => onSelect(code)}
              className={`flex w-full items-start justify-between gap-2 rounded-md border py-3 pr-3 pl-4 text-left ${rowClassName} ${
                muted && !isSelected ? 'text-alt-dark' : 'text-alt-black'
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
                <CheckCircleIcon
                  fontSize='small'
                  className='shrink-0 text-alt-green'
                  aria-hidden='true'
                />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
