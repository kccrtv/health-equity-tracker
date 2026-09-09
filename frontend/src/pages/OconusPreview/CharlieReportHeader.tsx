import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CharlieBottomSheet from '../../CharlieBottomSheet'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
import CharlieJumpToSheet from './CharlieJumpToSheet'
import CharlieLocationSearchSheet from './CharlieLocationSearchSheet'
import CharlieSentenceEditorSheet from './CharlieSentenceEditorSheet'
import type { CharlieCardId } from './charlieCardAvailability'
import { getCharlieDemographicCascade } from './charlieDemographic'
import {
  CHARLIE_TOPIC_IDS,
  CHARLIE_TOPIC_LABELS,
  type CharlieTopicId,
} from './oconusTopics'

const REPORT_BASE_PATH = '/oconus-preview'

type OpenSheet = 'none' | 'editor' | 'topic' | 'subItem' | 'place' | 'jumpTo'

interface CharlieReportHeaderProps {
  topicId: CharlieTopicId
  onTopicChange: (id: CharlieTopicId, dataTypeId: string) => void
  dataTypeConfig: DataTypeConfig
  onDataTypeChange: (dataTypeId: string) => void
  fips: Fips
  onFipsChange: (code: string) => void
  demographicType: DemographicType
  onDemographicChange: (type: DemographicType) => void
  availableCardIds: Set<CharlieCardId>
}

// Replaces the Report tab's old topic-pill row entirely (not additive): a
// one-line natural-language summary with a pencil that opens the full
// sentence editor, a Compare affordance that navigates to the Compare tab
// rather than opening anything inline, and a Jump To button that opens an
// on-page sheet. All the actual sheets (editor, its Topic/sub-item/Place
// pickers, and Jump To) are owned here as one "which sheet is open" state
// rather than each nesting its own Drawer, so opening one always closes
// whichever came before it instead of stacking backdrops.
export default function CharlieReportHeader({
  topicId,
  onTopicChange,
  dataTypeConfig,
  onDataTypeChange,
  fips,
  onFipsChange,
  demographicType,
  onDemographicChange,
  availableCardIds,
}: CharlieReportHeaderProps) {
  const [openSheet, setOpenSheet] = useState<OpenSheet>('none')
  const navigate = useNavigate()

  const subItems = METRIC_CONFIG[topicId]
  const cascade = getCharlieDemographicCascade(dataTypeConfig, fips)

  const summary = `${CHARLIE_TOPIC_LABELS[topicId]} rates in ${fips.getDisplayName()} by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]}`

  const goToCompare = () => {
    navigate({
      pathname: `${REPORT_BASE_PATH}/compare`,
      search: window.location.search,
    })
  }

  return (
    <div className='m-2 text-left'>
      <button
        type='button'
        onClick={() => setOpenSheet('editor')}
        className='flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left'
      >
        <span className='min-w-0 flex-1 truncate font-semibold text-base'>
          {summary}
        </span>
        <EditIcon fontSize='small' className='shrink-0 text-alt-dark' />
      </button>

      <div className='mt-2 flex items-center justify-end gap-4'>
        <button
          type='button'
          onClick={goToCompare}
          aria-label='Compare — leaves this page for the Compare tab'
          title='Compare'
          className='flex cursor-pointer items-center border-0 bg-transparent p-0 text-alt-green'
        >
          <ArrowOutwardIcon fontSize='small' />
        </button>
        <button
          type='button'
          onClick={() => setOpenSheet('jumpTo')}
          className='flex cursor-pointer items-center border-0 bg-transparent p-0 font-medium text-alt-green text-small'
        >
          Jump to
          <ChevronRightIcon fontSize='small' />
        </button>
      </div>

      <CharlieSentenceEditorSheet
        open={openSheet === 'editor'}
        onClose={() => setOpenSheet('none')}
        topicId={topicId}
        dataTypeConfig={dataTypeConfig}
        subItems={subItems}
        fips={fips}
        demographicType={demographicType}
        cascade={cascade}
        onOpenTopicSheet={() => setOpenSheet('topic')}
        onOpenSubItemSheet={() => setOpenSheet('subItem')}
        onOpenPlaceSheet={() => setOpenSheet('place')}
        onSelectDemographic={onDemographicChange}
      />

      <CharlieBottomSheet
        open={openSheet === 'topic'}
        onClose={() => setOpenSheet('editor')}
        title='Topic'
        ariaLabel='Choose a topic'
      >
        <ul className='m-0 list-none p-0 text-left'>
          {CHARLIE_TOPIC_IDS.map((id) => (
            <li key={id} className='mb-2'>
              <button
                type='button'
                onClick={() => {
                  onTopicChange(id, METRIC_CONFIG[id][0].dataTypeId)
                  setOpenSheet('editor')
                }}
                className={`w-full cursor-pointer rounded-md border py-3 pr-3 pl-4 text-left ${
                  id === topicId
                    ? 'border-alt-green bg-hover-alt-green'
                    : 'border-transparent bg-transparent'
                }`}
              >
                {CHARLIE_TOPIC_LABELS[id]}
              </button>
            </li>
          ))}
        </ul>
      </CharlieBottomSheet>

      <CharlieBottomSheet
        open={openSheet === 'subItem'}
        onClose={() => setOpenSheet('editor')}
        title={`${CHARLIE_TOPIC_LABELS[topicId]} breakdown`}
        ariaLabel='Choose a topic breakdown'
      >
        <ul className='m-0 list-none p-0 text-left'>
          {subItems.map((config) => (
            <li key={config.dataTypeId} className='mb-2'>
              <button
                type='button'
                onClick={() => {
                  onDataTypeChange(config.dataTypeId)
                  setOpenSheet('editor')
                }}
                className={`w-full cursor-pointer rounded-md border py-3 pr-3 pl-4 text-left ${
                  config.dataTypeId === dataTypeConfig.dataTypeId
                    ? 'border-alt-green bg-hover-alt-green'
                    : 'border-transparent bg-transparent'
                }`}
              >
                {config.dataTypeShortLabel ?? config.dataTypeId}
              </button>
            </li>
          ))}
        </ul>
      </CharlieBottomSheet>

      <CharlieLocationSearchSheet
        open={openSheet === 'place'}
        onClose={() => setOpenSheet('editor')}
        value={fips.code}
        onOptionUpdate={(code) => {
          onFipsChange(code)
          setOpenSheet('editor')
        }}
      />

      <CharlieJumpToSheet
        open={openSheet === 'jumpTo'}
        onClose={() => setOpenSheet('none')}
        availableIds={availableCardIds}
      />
    </div>
  )
}
