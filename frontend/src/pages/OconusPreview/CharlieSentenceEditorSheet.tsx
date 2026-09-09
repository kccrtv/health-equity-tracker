import CharlieBottomSheet from '../../CharlieBottomSheet'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import {
  CHARLIE_DEMOGRAPHIC_LABELS,
  type CharlieDemographicCascade,
} from './charlieDemographic'
import type { CharlieTopicId } from './oconusTopics'
import { CHARLIE_TOPIC_LABELS } from './oconusTopics'

interface CharlieSentenceEditorSheetProps {
  open: boolean
  onClose: () => void
  topicId: CharlieTopicId
  dataTypeConfig: DataTypeConfig
  subItems: DataTypeConfig[]
  fips: Fips
  demographicType: DemographicType
  cascade: CharlieDemographicCascade
  onOpenTopicSheet: () => void
  onOpenSubItemSheet: () => void
  onOpenPlaceSheet: () => void
  onSelectDemographic: (type: DemographicType) => void
}

// Shared focus-visible fix — see CharlieReportHeader.tsx for the same
// finding (confirmed live via a real keyboard Tab, not a programmatic
// .focus() call: zero visible indicator on Charlie's plain buttons).
const FOCUS_VISIBLE_CLASSES =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2'

// A tappable word/phrase inside the sentence — same visual language as the
// real MadLib's pill-style TopicSelector/LocationSelector buttons (green
// pill background, chevron-free here since the segment itself communicates
// tappability via color+underline rather than an icon, keeping the sentence
// readable as a sentence rather than a row of buttons).
//
// Deliberately NOT resized to the 44×44px touch-target minimum: WCAG 2.5.8
// explicitly exempts inline targets "in a sentence or [whose] size is
// otherwise constrained by the line-height of non-target text" — enlarging
// these would break the running sentence they're part of. Still gets a
// visible focus ring since that's a separate (unexempted) requirement.
function SentenceSegment({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`mx-1 cursor-pointer rounded-md border-0 bg-hover-alt-green px-1.5 py-0.5 font-semibold text-alt-green ${FOCUS_VISIBLE_CLASSES}`}
    >
      {label}
    </button>
  )
}

export default function CharlieSentenceEditorSheet({
  open,
  onClose,
  topicId,
  dataTypeConfig,
  subItems,
  fips,
  demographicType,
  cascade,
  onOpenTopicSheet,
  onOpenSubItemSheet,
  onOpenPlaceSheet,
  onSelectDemographic,
}: CharlieSentenceEditorSheetProps) {
  const subItemLabel =
    dataTypeConfig.dataTypeShortLabel ?? dataTypeConfig.dataTypeId
  const demographicLabel = CHARLIE_DEMOGRAPHIC_LABELS[demographicType]

  return (
    <CharlieBottomSheet
      open={open}
      onClose={onClose}
      title={
        <button
          type='button'
          onClick={onClose}
          // min-h-11: measured live at 28px tall — under the 44px minimum.
          className={`flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 font-semibold text-alt-green ${FOCUS_VISIBLE_CLASSES}`}
        >
          Save →
        </button>
      }
      ariaLabel='Edit report'
    >
      <div className='text-left'>
        <p className='m-0 text-lg leading-loose'>
          Investigate rates of{' '}
          <SentenceSegment
            label={CHARLIE_TOPIC_LABELS[topicId]}
            onClick={onOpenTopicSheet}
          />
          {subItems.length > 1 && (
            <>
              {' ('}
              <SentenceSegment
                label={subItemLabel}
                onClick={onOpenSubItemSheet}
              />
              {')'}
            </>
          )}{' '}
          in{' '}
          <SentenceSegment
            label={fips.getDisplayName()}
            onClick={onOpenPlaceSheet}
          />{' '}
          by{' '}
          <span className='font-semibold text-alt-green'>
            {demographicLabel}
          </span>
        </p>

        <p className='mt-4 mb-2 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
          {cascade.enabled.length} breakdown
          {cascade.enabled.length === 1 ? '' : 's'} available for {subItemLabel}
        </p>
        <div className='flex flex-wrap gap-2'>
          {cascade.enabled.map((type) => {
            const selected = type === demographicType
            return (
              <button
                key={type}
                type='button'
                onClick={() => onSelectDemographic(type)}
                aria-current={selected}
                // min-h-11: measured live at 31px tall — under the 44px
                // minimum. Not inline text (a standalone row of choices
                // below the sentence), so the WCAG inline exception that
                // covers SentenceSegment above doesn't apply here.
                className={`flex min-h-11 cursor-pointer items-center rounded-full border px-3 py-1 text-small ${FOCUS_VISIBLE_CLASSES}`}
                style={
                  selected
                    ? {
                        backgroundColor: colors.hoverAltGreen,
                        borderColor: colors.altGreen,
                        color: colors.altGreen,
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: colors.altGray,
                        color: colors.altBlack,
                      }
                }
              >
                {CHARLIE_DEMOGRAPHIC_LABELS[type]}
              </button>
            )
          })}
        </div>
      </div>
    </CharlieBottomSheet>
  )
}
