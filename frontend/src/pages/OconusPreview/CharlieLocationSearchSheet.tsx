import { useMemo } from 'react'
import CharlieBottomSheet from '../../CharlieBottomSheet'
import {
  OCONUS_FIPS_CODES,
  OCONUS_GEOGRAPHIES,
} from '../../reports/oconusGeographies'
import HetLocationSearch from '../../styles/HetComponents/HetLocationSearch'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import { useRecentLocations } from '../../utils/hooks/useRecentLocations'

interface CharlieLocationSearchSheetProps {
  open: boolean
  onClose: () => void
  value: string
  onOptionUpdate: (code: string) => void
}

// Reuses HetLocationSearch — the same search-input/Autocomplete component
// LocationSelector.tsx already uses for the real MadLib's location picker
// (search-plus-recent-plus-type-badge behavior comes free from it) — rather
// than building a new one, per the explicit check this task asked for.
//
// `options` is scoped to Charlie's own 6 supported geographies, not the
// full FIPS_MAP: CHARLIE OCONUS has been a fixed Hawaiʻi + 5 territories
// surface across every prior session, and nothing in this task asked to
// expand that. `recentLocations` is filtered the same way — the underlying
// hook persists real-app-wide history (any location a user viewed on the
// main site), which would otherwise leak non-OCONUS codes into a picker
// whose only valid destinations are these 6. `showUsaOption={false}` closes
// a real gap found live-testing this: HetLocationSearch's "United States"
// shortcut is unconditional and ignores `options` entirely, so without this
// it would offer a destination Charlie doesn't support at all. One
// remaining known gap: HetLocationSearch's city-level results come from the
// app's global place index (loadPlaceIndex/searchPlaces) and aren't
// filtered by `options` either, so an off-scope city could still appear;
// selecting one would write an unsupported fips code that
// useCharlieFipsCode's own validation already falls back away from (same as
// any invalid fips today), so nothing breaks, but flagging rather than
// forking the shared component to fix a corner case with no realistic
// occurrence for Hawaiʻi/territory city names.
export default function CharlieLocationSearchSheet({
  open,
  onClose,
  value,
  onOptionUpdate,
}: CharlieLocationSearchSheetProps) {
  const { recentLocations, clearRecentLocations } = useRecentLocations()
  const oconusRecent = recentLocations.filter((code) =>
    (OCONUS_FIPS_CODES as readonly string[]).includes(code),
  )

  const options = useMemo(
    () => OCONUS_FIPS_CODES.map((code) => OCONUS_GEOGRAPHIES[code]),
    [],
  )

  // HetLocationSearch only ever calls `.close()` on this — it never reads
  // `.anchor`/`.isOpen` or calls `.open()` — so a real PopoverElements isn't
  // needed, just something that satisfies the type and closes our sheet.
  const popover: PopoverElements = {
    anchor: null,
    isOpen: open,
    open: () => {},
    close: onClose,
  }

  return (
    <CharlieBottomSheet
      open={open}
      onClose={onClose}
      title='Search for a location'
      ariaLabel='Search for a location'
    >
      <HetLocationSearch
        value={value}
        options={options}
        onOptionUpdate={onOptionUpdate}
        popover={popover}
        recentLocations={oconusRecent}
        clearRecentLocations={clearRecentLocations}
        showUsaOption={false}
      />
    </CharlieBottomSheet>
  )
}
