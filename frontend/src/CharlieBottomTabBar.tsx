import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SummarizeIcon from '@mui/icons-material/Summarize'
import { BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useLocation, useNavigate } from 'react-router'

const TABS = [
  { value: '', label: 'Report', icon: <SummarizeIcon /> },
  { value: 'compare', label: 'Compare', icon: <CompareArrowsIcon /> },
  { value: 'about', label: 'About', icon: <InfoOutlinedIcon /> },
] as const

const BASE_PATH = '/oconus-preview'

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
      showLabels
      value={currentValue}
      onChange={(_event, newValue: string) => {
        navigate(newValue ? `${BASE_PATH}/${newValue}` : BASE_PATH)
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
