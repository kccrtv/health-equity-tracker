import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import {
  CHARLIE_TOPIC_IDS,
  CHARLIE_TOPIC_LABELS,
  type CharlieTopicId,
} from './pages/OconusPreview/oconusTopics'
import { colors } from './styles/tokens/colors'

interface CharlieTopicToggleProps {
  topicId: CharlieTopicId
  onChange: (topicId: CharlieTopicId) => void
}

// The Incarceration/COVID-19 pill switcher, shared by the Report tab and
// Compare's "Change comparison" sheet rather than duplicated in both.
//
// MUI's ToggleButtonGroup styles adjacent buttons as one connected segmented
// control by default (shared edges, square inner corners) — the opposite of
// the two-separate-pills look this needs, and not overridable with plain
// Tailwind classes since MUI's own `.MuiToggleButtonGroup-grouped` selectors
// win on specificity. `sx` here (rather than a muiTheme.tsx styleOverride)
// is deliberate: this component is Charlie-only, so a global theme change
// would be broader than the problem.
export default function CharlieTopicToggle({
  topicId,
  onChange,
}: CharlieTopicToggleProps) {
  return (
    <ToggleButtonGroup
      value={topicId}
      exclusive
      size='small'
      onChange={(_event, newTopicId: string | null) => {
        if (newTopicId) onChange(newTopicId as CharlieTopicId)
      }}
      aria-label='Topic'
      sx={{
        gap: '8px',
        '& .MuiToggleButtonGroup-grouped': {
          margin: 0,
          border: `1px solid ${colors.altGray} !important`,
          borderRadius: '9999px !important',
        },
      }}
    >
      {CHARLIE_TOPIC_IDS.map((id) => (
        <ToggleButton
          key={id}
          value={id}
          className='normal-case'
          sx={{
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: colors.hoverAltGreen,
              borderColor: `${colors.altGreen} !important`,
              color: colors.altGreen,
              fontWeight: 600,
            },
          }}
        >
          {CHARLIE_TOPIC_LABELS[id]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
