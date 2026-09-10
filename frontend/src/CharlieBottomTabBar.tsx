import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import HomeIcon from '@mui/icons-material/Home'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SummarizeIcon from '@mui/icons-material/Summarize'
import { BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useLocation, useNavigate } from 'react-router'

const TABS = [
  { value: 'home', label: 'Home', icon: <HomeIcon /> },
  { value: '', label: 'Report', icon: <SummarizeIcon /> },
  { value: 'compare', label: 'Compare', icon: <CompareArrowsIcon /> },
  { value: 'about', label: 'About', icon: <InfoOutlinedIcon /> },
] as const

const BASE_PATH = '/oconus-preview'

// Exported so anything fixed to the viewport above this bar (e.g.
// CharlieJumpToFab) can measure its real rendered height via
// getElementById + ResizeObserver instead of hardcoding an assumed offset.
export const CHARLIE_BOTTOM_TAB_BAR_ID = 'charlie-bottom-tab-bar'

export default function CharlieBottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeSegment = location.pathname
    .replace(BASE_PATH, '')
    .replace(/^\//, '')
  const currentValue = TABS.some((tab) => tab.value === activeSegment)
    ? activeSegment
    : ''

  return (
    <BottomNavigation
      id={CHARLIE_BOTTOM_TAB_BAR_ID}
      showLabels
      value={currentValue}
      onChange={(_event, newValue: string) => {
        // Preserve fips/topic across tab switches explicitly: react-router's
        // navigate() with a bare path drops the current query string, and
        // react-router's own location.search can't be trusted to still have
        // it either, since useCharlieFipsCode/useCharlieTopic write through
        // jotai-location, whose history.pushState calls react-router never
        // observes. window.location.search is the one place both systems'
        // writes are guaranteed to actually land.
        const path = newValue ? `${BASE_PATH}/${newValue}` : BASE_PATH
        navigate({ pathname: path, search: window.location.search })
      }}
      className='sticky bottom-0 border-divider-gray border-t'
    >
      {TABS.map((tab) => (
        <BottomNavigationAction
          key={tab.label}
          label={tab.label}
          value={tab.value}
          icon={tab.icon}
        />
      ))}
    </BottomNavigation>
  )
}
