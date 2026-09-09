import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import {
  CHARLIE_TOPIC_IDS,
  CHARLIE_TOPIC_LABELS,
  type CharlieTopicId,
} from './pages/OconusPreview/oconusTopics'

interface CharlieTopicToggleProps {
  topicId: CharlieTopicId
  onChange: (topicId: CharlieTopicId) => void
}

// The Incarceration/COVID-19 pill switcher, shared by the Report tab and
// Compare's "Change comparison" sheet rather than duplicated in both.
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
    >
      {CHARLIE_TOPIC_IDS.map((id) => (
        <ToggleButton key={id} value={id} className='normal-case'>
          {CHARLIE_TOPIC_LABELS[id]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
