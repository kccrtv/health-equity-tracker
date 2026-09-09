import BarChartIcon from '@mui/icons-material/BarChart'
import DescriptionIcon from '@mui/icons-material/Description'
import DonutSmallIcon from '@mui/icons-material/DonutSmall'
import GridViewIcon from '@mui/icons-material/GridView'
import RoomIcon from '@mui/icons-material/Room'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart'
import TableChartIcon from '@mui/icons-material/TableChart'
import CharlieBottomSheet from '../../CharlieBottomSheet'
import type { CharlieCardId } from './charlieCardAvailability'

type IconComponent = typeof RoomIcon

interface JumpToItem {
  id: CharlieCardId
  label: string
  Icon: IconComponent
}

interface JumpToGroup {
  heading: string
  items: JumpToItem[]
}

// Grouped per the reviewed Claude Design concept (MAPS/CHARTS/TABLE/
// REFERENCE), not a flat list. Labels here are the sheet's own, distinct
// from CHARLIE_CARD_LABELS in a couple of spots (data-table reads
// "Definitions & missing data" here, matching the concept, since that's
// what the card actually functions as — see OconusPreviewPage.tsx's
// EXEMPT_CARD_IDS comment) — CHARLIE_CARD_LABELS stays the section
// heading used elsewhere on the Report tab itself.
const JUMP_TO_GROUPS: JumpToGroup[] = [
  {
    heading: 'Maps',
    items: [
      { id: 'rate-map', label: 'Rate map', Icon: RoomIcon },
      {
        id: 'unknown-demographic-map',
        label: 'Unknown demographic map',
        Icon: GridViewIcon,
      },
    ],
  },
  {
    heading: 'Charts',
    items: [
      { id: 'rates-over-time', label: 'Rates over time', Icon: ShowChartIcon },
      { id: 'rate-chart', label: 'Rate chart', Icon: BarChartIcon },
      {
        id: 'inequities-over-time',
        label: 'Inequities over time',
        Icon: DonutSmallIcon,
      },
      {
        id: 'population-vs-distribution',
        label: 'Population vs. distribution',
        Icon: StackedBarChartIcon,
      },
    ],
  },
  {
    heading: 'Table',
    items: [
      {
        id: 'rates-over-time-table',
        label: 'Data table',
        Icon: TableChartIcon,
      },
    ],
  },
  {
    heading: 'Reference',
    items: [
      {
        id: 'data-table',
        label: 'Definitions & missing data',
        Icon: DescriptionIcon,
      },
    ],
  },
]

interface CharlieJumpToSheetProps {
  open: boolean
  onClose: () => void
  // Cards folded into the collapsed empty-state summary render nothing at
  // their own id — jumping to one would land on a blank spot. Filtered out
  // rather than shown disabled, matching the Report tab's own collapse
  // behavior (the cards genuinely aren't there, not just unavailable).
  availableIds: Set<CharlieCardId>
  // Which report section is currently scrolled into view — computed by
  // useCharlieActiveSection in OconusPreviewPage.tsx (always mounted, so
  // this is already live by the time the sheet opens) rather than tracked
  // fresh here each time the sheet mounts.
  activeSectionId: CharlieCardId
}

export default function CharlieJumpToSheet({
  open,
  onClose,
  availableIds,
  activeSectionId,
}: CharlieJumpToSheetProps) {
  const handleJump = (id: CharlieCardId) => {
    onClose()
    // Deferred one frame so the sheet's closing transition doesn't fight the
    // scroll. `behavior: 'instant'`, not 'smooth' — found live-testing this:
    // a smooth scroll animates over several hundred ms, and cards below the
    // target are still resizing as their own lazy-loaded data arrives during
    // that window (HetLazyLoader placeholder -> real content), so the target
    // drifts out from under the animation before it finishes. An instant
    // jump lands before any of that resizing happens.
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
    })
  }

  return (
    <CharlieBottomSheet
      open={open}
      onClose={onClose}
      title='Jump to'
      ariaLabel='Jump to a section'
    >
      <div className='text-left'>
        {JUMP_TO_GROUPS.map((group) => {
          const items = group.items.filter((item) => availableIds.has(item.id))
          if (items.length === 0) return null
          return (
            <div key={group.heading} className='mb-4'>
              {/* Shaded rounded container behind the group heading — these
                  used to be bare small-caps text with no grouping
                  container at all. */}
              <h3 className='m-0 mb-1 rounded-md bg-bg-color px-2 py-1 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
                {group.heading}
              </h3>
              <ul className='m-0 list-none p-0'>
                {items.map(({ id, label, Icon }) => {
                  const isActive = id === activeSectionId
                  return (
                    <li key={id}>
                      <button
                        type='button'
                        onClick={() => handleJump(id)}
                        aria-current={isActive}
                        className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border-0 py-3 pr-3 pl-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2 ${
                          isActive
                            ? 'bg-hover-alt-green font-semibold text-alt-green'
                            : 'bg-transparent text-alt-black'
                        }`}
                      >
                        <Icon
                          fontSize='small'
                          className={
                            isActive ? 'text-alt-green' : 'text-alt-dark'
                          }
                          aria-hidden='true'
                        />
                        <span>{label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </CharlieBottomSheet>
  )
}
