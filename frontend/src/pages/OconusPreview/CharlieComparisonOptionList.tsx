import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Link } from 'react-router'
import {
  type AxisAvailability,
  CHARLIE_DEMOGRAPHIC_LABELS,
} from './charlieDemographic'

// About tab doesn't support deep-linking to a specific card yet (no ids or
// hash routing on its three tiers) — confirmed by reading CharlieAboutTab.tsx
// before wiring this, rather than assumed. Routes to the tab generally per
// the explicit instruction not to build new deep-link infrastructure as
// part of this task; the Acknowledged Gap tier's "Incarceration / COVID-19
// suppression thresholds" card (charlieAboutResources.ts) is the directly
// relevant one once deep-linking exists.
const ABOUT_TAB_PATH = '/oconus-preview/about'

export interface ComparisonOption {
  id: string
  label: string
  axes: AxisAvailability[]
}

interface CharlieComparisonOptionListProps {
  options: ComparisonOption[]
  selectedId: string
  onSelect: (id: string) => void
}

// Shared by Compare's Places and Topics modes — same axis-tag + note
// mechanism either way, just fed geography options (Places) or topic
// options (Topics). A row shows every axis as a pill (muted when
// unavailable) and, only when at least one axis is unavailable, a note
// naming which one plus an info icon linking to more context. Checkmark on
// the selected row is a deliberate accessibility fix: color+border alone
// isn't a sufficient signal.
//
// The selectable row is a <button>; the info-icon link is rendered as a
// sibling <li>, not nested inside the button — a button can't validly
// contain another interactive element (breaks keyboard/screen-reader
// navigation), so nesting the link there would trade one accessibility
// problem for another.
export default function CharlieComparisonOptionList({
  options,
  selectedId,
  onSelect,
}: CharlieComparisonOptionListProps) {
  return (
    <ul className='m-0 list-none p-0'>
      {options.map((option) => {
        const isSelected = option.id === selectedId
        const unavailable = option.axes.filter((axis) => !axis.available)
        const unavailableLabels = unavailable
          .map((axis) => CHARLIE_DEMOGRAPHIC_LABELS[axis.type])
          .join(', ')

        return (
          <li key={option.id} className='mb-2'>
            <button
              type='button'
              onClick={() => onSelect(option.id)}
              className={`flex min-h-11 w-full items-start justify-between gap-2 rounded-md border py-3 pr-3 pl-4 text-left ${
                isSelected
                  ? 'border-alt-green bg-hover-alt-green'
                  : 'border-transparent bg-transparent'
              }`}
            >
              <span className='min-w-0 flex-1'>
                <span className='block font-medium text-alt-black'>
                  {option.label}
                </span>
                <span className='mt-1 flex flex-wrap gap-1.5'>
                  {option.axes.map((axis) => (
                    <span
                      key={axis.type}
                      className={`rounded-full border px-2 py-0.5 text-smallest ${
                        axis.available
                          ? 'border-alt-gray text-alt-black'
                          : 'border-alt-gray bg-bg-color text-alt-dark'
                      }`}
                    >
                      {CHARLIE_DEMOGRAPHIC_LABELS[axis.type]}
                    </span>
                  ))}
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
            {unavailable.length > 0 && (
              <div className='mt-1 flex items-start gap-1 pr-3 pl-4 text-alt-dark text-smallest'>
                <span>
                  {unavailableLabels} breakdown unavailable for {option.label}.
                </span>
                <Link
                  to={ABOUT_TAB_PATH}
                  aria-label={`Learn more about missing ${unavailableLabels} data for ${option.label}`}
                  className='inline-flex shrink-0 items-center justify-center text-alt-dark'
                >
                  <InfoOutlinedIcon fontSize='inherit' />
                </Link>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
