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

// Row/cell grid replacing a single flowing <p>, matching Claude Design's
// exact markup: every row is a flex container of cells (plain text or
// pill), and EVERY cell — text and pill alike — shares the same height and
// border-bottom. That shared border is what produces one continuous
// baseline running under the whole sentence, not just under the pills; a
// flowing paragraph with inline pills (the prior implementation) can't
// produce that, since plain text has no box to hang a border off of.
//
// Values are Design's literal arbitrary ones (#eaeaea row rule, #dbeee0
// pill fill, #383838 sentence text, 0.5625rem/#9a9a9a caption) rather than
// existing tokens — this is a pixel-for-pixel port of an exported design,
// not a from-scratch style decision, so token substitution would silently
// drift from the source.
function TextCell({ children }: { children: string }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex h-[34px] items-start justify-center border-[#eaeaea] border-b px-1 pt-[6px] pb-0'>
        <span className='whitespace-nowrap'>{children}</span>
      </div>
    </div>
  )
}

// The pill itself — shared by PillCell and the parenthesized topic-breakdown
// unit below. Deliberately NOT resized to the 44×44px touch-target minimum:
// WCAG 2.5.8 explicitly exempts inline targets "in a sentence or [whose]
// size is otherwise constrained by the line-height of non-target text" —
// enlarging it would break the row it's laid out in. Still gets a visible
// focus ring since that's a separate (unexempted) requirement.
function PillButton({
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
      className={`flex cursor-pointer items-center whitespace-nowrap rounded-t-md bg-[#dbeee0] px-2.5 font-bold text-[#0b5240] ${FOCUS_VISIBLE_CLASSES}`}
    >
      {label}
      <span className='ml-1.5' aria-hidden='true'>
        ▾
      </span>
    </button>
  )
}

// This is the ONE shared component for every ordinary blank (Topic, Place,
// Demographic) — none of them may special-case their own styling, since a
// prior version hand-rolled the Demographic blank separately and it
// silently drifted to plain text with no chip, caret, or tap target.
function PillCell({
  label,
  caption,
  onClick,
}: {
  label: string
  caption: string
  onClick: () => void
}) {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex h-[34px] items-stretch justify-center border-[#eaeaea] border-b px-1'>
        <PillButton label={label} onClick={onClick} />
      </div>
      <span className='mt-[5px] whitespace-nowrap font-semibold text-[#9a9a9a] text-[0.5625rem] uppercase tracking-[0.04em]'>
        ({caption})
      </span>
    </div>
  )
}

// The optional "(Prison)"-style topic-breakdown unit: same pill, but with
// literal parens inside the same bordered cell so the row's shared baseline
// still runs underneath them instead of stopping at the pill's edges.
function ParenPillCell({
  label,
  caption,
  onClick,
}: {
  label: string
  caption: string
  onClick: () => void
}) {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex h-[34px] items-stretch justify-center border-[#eaeaea] border-b px-1'>
        <span className='flex items-center whitespace-nowrap'>
          (<PillButton label={label} onClick={onClick} />)
        </span>
      </div>
      <span className='mt-[5px] whitespace-nowrap font-semibold text-[#9a9a9a] text-[0.5625rem] uppercase tracking-[0.04em]'>
        ({caption})
      </span>
    </div>
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
          className={`ml-auto flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 font-semibold text-alt-green ${FOCUS_VISIBLE_CLASSES}`}
        >
          Save →
        </button>
      }
      ariaLabel='Edit report'
      hideCloseButton
    >
      <div className='text-left'>
        <div className='text-center text-[#383838] text-[1.0625rem]'>
          <div className='mb-[14px] flex flex-wrap items-start justify-center gap-0'>
            <TextCell>Investigate rates of</TextCell>
            <PillCell
              label={CHARLIE_TOPIC_LABELS[topicId]}
              caption='Topic'
              onClick={onOpenTopicSheet}
            />
          </div>
          <div className='mb-[14px] flex flex-wrap items-start justify-center gap-0'>
            {subItems.length > 1 && (
              <ParenPillCell
                label={subItemLabel}
                caption='Topic breakdown'
                onClick={onOpenSubItemSheet}
              />
            )}
            <TextCell>in</TextCell>
            <PillCell
              label={fips.getDisplayName()}
              caption='Place'
              onClick={onOpenPlaceSheet}
            />
          </div>
          <div className='mb-[20px] flex flex-wrap items-start justify-center gap-0'>
            <TextCell>by</TextCell>
            <PillCell
              label={demographicLabel}
              caption='Demographic'
              onClick={onOpenDemographicSheet}
            />
          </div>
        </div>

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
