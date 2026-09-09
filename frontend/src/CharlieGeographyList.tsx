import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { getCharlieGeography } from './reports/oconusGeographies'

interface CharlieGeographyListProps {
  codes: readonly string[]
  selectedCode?: string
  onSelect: (code: string) => void
}

// Simple selectable list of geography rows — the top bar's plain picker
// (CharlieTopBar.tsx), its only remaining caller. (Compare's own annotated
// list moved to CharlieComparisonOptionList.tsx, which replaced the
// getStatus-driven muted-row variant this component used to also support —
// removed here since nothing passes it anymore.) `codes` takes plain
// strings rather than OconusFipsCode so the top bar can offer United States
// ('00') as a 7th option alongside the 6 OCONUS geographies, without this
// component needing to know that's a special case — getCharlieGeography
// resolves any valid fips code, in or out of the OCONUS set.
//
// Selection is shown as a filled/outlined row PLUS a checkmark icon — a
// prior polish pass removed the checkmark in favor of color+outline alone,
// but that's since been superseded by an accessibility finding (color
// alone isn't a sufficient signal), so the checkmark is back.
export default function CharlieGeographyList({
  codes,
  selectedCode,
  onSelect,
}: CharlieGeographyListProps) {
  return (
    <ul className='m-0 list-none p-0'>
      {codes.map((code) => {
        const geo = getCharlieGeography(code)
        const isSelected = code === selectedCode
        // National for the USA option, State/Territory for the 6 OCONUS
        // geographies — derived from Fips's own real classification
        // (isUsa/isState/isTerritory), not a hardcoded per-code table.
        const typeLabel = geo.isUsa()
          ? 'National'
          : geo.isState()
            ? 'State'
            : 'Territory'

        return (
          <li key={code} className='mb-2'>
            <button
              type='button'
              onClick={() => onSelect(code)}
              aria-current={isSelected}
              className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-md border py-3 pr-3 pl-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2 ${
                isSelected
                  ? 'border-alt-green bg-hover-alt-green'
                  : 'border-transparent bg-transparent'
              }`}
            >
              <span className='flex items-center gap-2'>
                <span className='font-medium text-alt-black'>
                  {geo.getDisplayName()}
                </span>
                <span className='rounded-full border border-alt-gray px-2 py-0.5 text-alt-dark text-smallest'>
                  {typeLabel}
                </span>
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
