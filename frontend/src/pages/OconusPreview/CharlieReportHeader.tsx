import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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

  // FOCUS_VISIBLE_CLASSES restores a visible keyboard-focus ring on Charlie's
  // own plain <button> elements — confirmed live (real Tab keypress, not a
  // programmatic .focus() call, which doesn't trigger :focus-visible the
  // same way) that these had zero visible focus indicator: no outline, no
  // box-shadow, no background change.
  const FOCUS_VISIBLE_CLASSES =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2'

  return (
    <div className='m-2 text-left'>
      <button
        type='button'
        onClick={() => setOpenSheet('editor')}
        aria-label={`Edit report: ${summary}`}
        // min-h-11 (44px): the whole row measured 24px tall live — well
        // under the 44×44px touch-target minimum.
        className={`flex min-h-11 w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left ${FOCUS_VISIBLE_CLASSES}`}
      >
        {/* index.css's global h1 rule (34px, 2rem/1rem top/bottom padding —
            styled for full-page titles) isn't what this compact header
            wants; p-0 neutralizes the padding half of it since text-base
            already overrides the font-size half. */}
        <h1 className='m-0 min-w-0 flex-1 truncate p-0 font-semibold text-base'>
          {summary}
        </h1>
        {/* Bordered box around just the icon (not the whole button) — a
            bare icon read as decorative rather than as its own tappable
            affordance. */}
        <span className='flex shrink-0 items-center justify-center rounded-md border border-alt-gray p-1'>
          <EditIcon
            fontSize='small'
            className='text-alt-dark'
            aria-hidden='true'
          />
        </span>
      </button>
      {/* Announces geography/topic/demographic changes to assistive tech —
          this text already updates live with every one of those changes, so
          making it an aria-live region needs no separate change-detection
          logic. Visually hidden; the same summary is already shown above. */}
      <div aria-live='polite' className='sr-only'>
        {summary}
      </div>

      <div className='mt-2 flex items-center justify-end gap-4'>
        <button
          type='button'
          onClick={goToCompare}
          aria-label='Compare — leaves this page for the Compare tab'
          title='Compare'
          // min-h-11/min-w-11: measured live at 20×16px, the smallest
          // control found in the whole audit — icon-only controls need the
          // hit area expanded without enlarging the icon itself.
          className={`flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-alt-green ${FOCUS_VISIBLE_CLASSES}`}
        >
          <ArrowOutwardIcon fontSize='small' aria-hidden='true' />
        </button>
        <button
          type='button'
          onClick={() => setOpenSheet('jumpTo')}
          className={`flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 font-medium text-alt-green text-small ${FOCUS_VISIBLE_CLASSES}`}
        >
          Jump to
          <ChevronRightIcon fontSize='small' aria-hidden='true' />
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
          {CHARLIE_TOPIC_IDS.map((id) => {
            const isSelected = id === topicId
            return (
              <li key={id} className='mb-2'>
                <button
                  type='button'
                  onClick={() => {
                    onTopicChange(id, METRIC_CONFIG[id][0].dataTypeId)
                    setOpenSheet('editor')
                  }}
                  aria-current={isSelected}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-md border py-3 pr-3 pl-4 text-left ${
                    isSelected
                      ? 'border-alt-green bg-hover-alt-green'
                      : 'border-transparent bg-transparent'
                  } ${FOCUS_VISIBLE_CLASSES}`}
                >
                  <span>{CHARLIE_TOPIC_LABELS[id]}</span>
                  {isSelected && (
                    <CheckCircleIcon
                      fontSize='small'
                      className='shrink-0 text-alt-green'
                      aria-hidden='true'
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </CharlieBottomSheet>

      <CharlieBottomSheet
        open={openSheet === 'subItem'}
        onClose={() => setOpenSheet('editor')}
        title={`${CHARLIE_TOPIC_LABELS[topicId]} breakdown`}
        ariaLabel='Choose a topic breakdown'
      >
        <ul className='m-0 list-none p-0 text-left'>
          {subItems.map((config) => {
            const isSelected = config.dataTypeId === dataTypeConfig.dataTypeId
            return (
              <li key={config.dataTypeId} className='mb-2'>
                <button
                  type='button'
                  onClick={() => {
                    onDataTypeChange(config.dataTypeId)
                    setOpenSheet('editor')
                  }}
                  aria-current={isSelected}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-md border py-3 pr-3 pl-4 text-left ${
                    isSelected
                      ? 'border-alt-green bg-hover-alt-green'
                      : 'border-transparent bg-transparent'
                  } ${FOCUS_VISIBLE_CLASSES}`}
                >
                  <span>{config.dataTypeShortLabel ?? config.dataTypeId}</span>
                  {isSelected && (
                    <CheckCircleIcon
                      fontSize='small'
                      className='shrink-0 text-alt-green'
                      aria-hidden='true'
                    />
                  )}
                </button>
              </li>
            )
          })}
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
