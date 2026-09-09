import CharlieBottomSheet from '../../CharlieBottomSheet'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
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
  onOpenDemographicSheet: () => void
}

// Shared focus-visible fix — see CharlieReportHeader.tsx for the same
// finding (confirmed live via a real keyboard Tab, not a programmatic
// .focus() call: zero visible indicator on Charlie's plain buttons).
const FOCUS_VISIBLE_CLASSES =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-alt-green focus-visible:outline-offset-2'

// A tappable word/phrase inside the sentence — pill background plus a
// down-caret and an underline, both signaling "this opens a picker" the
// way the real MadLib's own selector buttons do, and a small caption below
// naming which axis it edits (per the reference concept). This is the ONE
// shared component for every blank (Topic, Topic breakdown, Place,
// Demographic) — none of them may special-case their own styling, since a
// prior version hand-rolled the Demographic blank separately and it silently
// drifted to plain text with no chip, caret, or tap target.
//
// Deliberately NOT resized to the 44×44px touch-target minimum: WCAG 2.5.8
// explicitly exempts inline targets "in a sentence or [whose] size is
// otherwise constrained by the line-height of non-target text" — enlarging
// these would break the running sentence they're part of. Still gets a
// visible focus ring since that's a separate (unexempted) requirement.
//
// inline-flex flex-col (not inline-block) so the caption sits centered
// directly under the pill rather than the pill's own line-height pushing
// it off to one side; align-bottom keeps the taller segment from shifting
// the surrounding plain-text baseline.
function SentenceSegment({
  label,
  caption,
  onClick,
}: {
  label: string
  caption: string
  onClick: () => void
}) {
  return (
    <span className='mx-1 inline-flex flex-col items-center align-bottom'>
      <button
        type='button'
        onClick={onClick}
        className={`inline-flex cursor-pointer items-center whitespace-nowrap rounded-t-md border-0 border-alt-green border-b-[1.5px] bg-alt-green-tint px-2.5 font-bold text-alt-green ${FOCUS_VISIBLE_CLASSES}`}
      >
        {label}
        <span className='ml-1.5' aria-hidden='true'>
          ▾
        </span>
      </button>
      <span className='mt-0.5 text-alt-dark text-smallest uppercase tracking-wide'>
        ({caption})
      </span>
    </span>
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
  onOpenDemographicSheet,
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
      hideCloseButton
    >
      <div className='text-left'>
        {/* leading-[2.75] (not leading-loose/2): each segment is a
            two-line-tall block (pill + caption), taller than the
            surrounding plain text, so the line box needs real headroom or
            adjacent wrapped lines crowd into the captions above/below
            them. */}
        <p className='m-0 text-lg leading-[2.75]'>
          Investigate rates of{' '}
          <SentenceSegment
            label={CHARLIE_TOPIC_LABELS[topicId]}
            caption='Topic'
            onClick={onOpenTopicSheet}
          />
          {subItems.length > 1 && (
            // whitespace-nowrap: keeps the parens glued to the pill as one
            // unit, rather than each being its own inline text node the
            // line-wrap can split away from the segment it belongs to.
            <span className='whitespace-nowrap'>
              {' ('}
              <SentenceSegment
                label={subItemLabel}
                caption='Topic breakdown'
                onClick={onOpenSubItemSheet}
              />
              {')'}
            </span>
          )}{' '}
          in{' '}
          <SentenceSegment
            label={fips.getDisplayName()}
            caption='Place'
            onClick={onOpenPlaceSheet}
          />{' '}
          by{' '}
          <SentenceSegment
            label={demographicLabel}
            caption='Demographic'
            onClick={onOpenDemographicSheet}
          />
        </p>

        {/* Informational only — this strip demonstrates that the available
            breakdowns change with topic/sub-item, but it is not itself a
            control: it has no selected/highlighted state, isn't tappable,
            and never sets the demographic value. The sentence's Demographic
            chip above is the only thing that does that, via its own sheet. */}
        <p className='mt-4 mb-2 font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
          {cascade.enabled.length} breakdown
          {cascade.enabled.length === 1 ? '' : 's'} available for {subItemLabel}
        </p>
        <div className='flex flex-wrap gap-2'>
          {cascade.enabled.map((type) => (
            <span
              key={type}
              className='flex items-center rounded-full border border-alt-gray px-3 py-1 text-alt-black text-small'
            >
              {CHARLIE_DEMOGRAPHIC_LABELS[type]}
            </span>
          ))}
        </div>
      </div>
    </CharlieBottomSheet>
  )
}
