import { useEffect, useState } from 'react'
import type { CharlieCardId } from './charlieCardAvailability'

// A small, Charlie-own version of the real app's scroll-spy technique
// (useStepObserver.ts uses the same rootMargin heuristic — roughly the
// middle 45% of the viewport counts as "in view"). Not reused directly:
// that hook writes to activeHashIdAtom, a jotai atom shared app-wide, and
// syncs window.location.hash on every scroll tick — side effects that would
// leak into the real app's own TOC state and Charlie's own query-param-only
// URL scheme, for a route tree that isn't the real app's Report page.
//
// Defaults to the first id in `cardIds` (which OconusPreviewPage.tsx always
// passes with 'rate-map' first, since the Choropleth map always renders)
// until the observer actually reports something in view, matching the
// explicit "default to Rate map on initial load" requirement.
export function useCharlieActiveSection(
  cardIds: readonly CharlieCardId[],
): CharlieCardId {
  const [activeId, setActiveId] = useState<CharlieCardId>(cardIds[0])
  const idsKey = cardIds.join(',')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id as CharlieCardId)
      },
      { rootMargin: '-20% 0% -35% 0px' },
    )

    const elements = cardIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    for (const el of elements) observer.observe(el)

    return () => observer.disconnect()
    // Deliberately depends on idsKey (a stable string), not `cardIds` itself
    // (a fresh array reference each render) — same pattern as
    // useCharlieGeographyStatuses in charlieCardAvailability.ts.
  }, [idsKey])

  return activeId
}
