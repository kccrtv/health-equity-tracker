import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useEffect, useState } from 'react'
import { CHARLIE_BOTTOM_TAB_BAR_ID } from '../../CharlieBottomTabBar'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'

// Clearance above the bottom tab bar's own rendered height, so the FAB
// doesn't sit flush against it.
const FAB_GAP_PX = 16

// Measures the real bottom tab bar height live (ResizeObserver, not a
// hardcoded px guess) so the FAB stays correctly clear of it even if the
// tab bar's own height ever changes (label wrap, safe-area inset, etc.).
// Same document.getElementById-based approach as useCharlieActiveSection —
// the tab bar is a fixed, always-mounted sibling outside this component's
// own tree (rendered by CharlieShellLayout), not something reachable via a
// normal prop/ref.
function useCharlieBottomTabBarHeight(): number {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = document.getElementById(CHARLIE_BOTTOM_TAB_BAR_ID)
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return height
}

const FOCUS_VISIBLE_CLASSES =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2'

interface CharlieJumpToFabProps {
  onClick: () => void
}

// Replaces the Report header's old inline "Jump to" button entirely (not a
// second entry point) — a fixed floating action button that persists
// through scroll instead of scrolling away with the compact header, so
// Jump To stays reachable from anywhere on a long report.
export default function CharlieJumpToFab({ onClick }: CharlieJumpToFabProps) {
  const tabBarHeight = useCharlieBottomTabBarHeight()
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <button
      type='button'
      onClick={onClick}
      aria-label='Jump to a section'
      style={{ bottom: tabBarHeight + FAB_GAP_PX }}
      // h-14 w-14 (56x56px): standard FAB sizing, well over the 44x44
      // touch-target minimum. z-top (99, from dimensions tokens): keeps
      // this above ordinary page content; the bottom tab bar is the only
      // other thing fixed to the viewport, and real clearance (the bottom
      // offset above) keeps the two from ever overlapping regardless of
      // stacking order.
      className={`fixed right-4 z-top flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-alt-green text-alt-white shadow-raised ${
        prefersReducedMotion ? '' : 'transition-transform active:scale-95'
      } ${FOCUS_VISIBLE_CLASSES}`}
    >
      <KeyboardArrowDownIcon aria-hidden='true' />
    </button>
  )
}
