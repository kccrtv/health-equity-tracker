import { colors } from '../../styles/tokens/colors'
import { LinkWithStickyParams } from '../../utils/urlutils'
import {
  ACKNOWLEDGED_GAP_RESOURCES,
  GET_INVOLVED_RESOURCES,
  type PlaceholderResource,
  SOURCED_RESOURCES,
  type SourcedResource,
} from './charlieAboutResources'

// "About" tab inside CharlieShellLayout — the Resources section for CHARLIE
// OCONUS. Three tiers, each visually distinct so a placeholder is never
// mistaken for sourced content: Sourced (solid, verbatim excerpts of real
// live HET Methodology copy, each linking to the actual page it renders on),
// Acknowledged gap (hatched/dashed — real audit findings with no source to
// excerpt yet), and Get involved (dim, no hatching — pure future scaffolding).
// Content lives in charlieAboutResources.ts so new copy is a data edit, not a
// layout change.
function SourcedCard({ resource }: { resource: SourcedResource }) {
  return (
    <div className='m-2 rounded-2xl bg-alt-white p-4 text-left shadow-raised'>
      <div className='mb-2 flex items-start justify-between gap-2'>
        <h3 className='m-0 font-semibold text-base'>{resource.heading}</h3>
        <span className='shrink-0 whitespace-nowrap rounded-full bg-hover-alt-green px-2 py-0.5 font-semibold text-alt-green text-smallest'>
          ✓ Verified
        </span>
      </div>
      <blockquote className='m-0 mb-3 border-alt-green border-l-4 pl-3 text-alt-black text-small italic'>
        {resource.quote}
      </blockquote>
      <p className='m-0 mb-2 text-alt-dark text-smallest'>
        {resource.sourceLabel}
      </p>
      <LinkWithStickyParams
        to={resource.methodologyLink}
        className='font-medium text-alt-green text-small no-underline'
      >
        Full methodology →
      </LinkWithStickyParams>
    </div>
  )
}

function AcknowledgedGapCard({ resource }: { resource: PlaceholderResource }) {
  return (
    <div
      className='m-2 rounded-2xl border-2 border-report-alert border-dashed p-4 text-left'
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${colors.standardWarning} 0px, ${colors.standardWarning} 8px, ${colors.altWhite} 8px, ${colors.altWhite} 16px)`,
      }}
    >
      <div className='mb-2 flex items-start justify-between gap-2'>
        <h3 className='m-0 font-semibold text-base'>{resource.heading}</h3>
        <span className='shrink-0 whitespace-nowrap rounded-full bg-alt-white px-2 py-0.5 font-semibold text-report-alert text-smallest'>
          ⚠ Placeholder
        </span>
      </div>
      <p className='m-0 text-alt-black text-small'>{resource.body}</p>
    </div>
  )
}

function GetInvolvedCard({ resource }: { resource: PlaceholderResource }) {
  return (
    <div className='m-2 rounded-2xl bg-bg-color p-4 text-left opacity-70'>
      <div className='mb-2 flex items-start justify-between gap-2'>
        <h3 className='m-0 font-medium text-alt-dark text-base'>
          {resource.heading}
        </h3>
        <span className='shrink-0 whitespace-nowrap rounded-full bg-alt-white px-2 py-0.5 font-medium text-alt-dark text-smallest'>
          Coming soon
        </span>
      </div>
      <p className='m-0 text-alt-dark text-small'>{resource.body}</p>
    </div>
  )
}

export default function CharlieAboutTab() {
  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full flex-col content-center px-4 py-2'>
          <h2 className='mt-2 mb-1 text-left font-semibold text-lg'>
            Resources
          </h2>
          <p className='m-0 mb-4 text-alt-dark text-small'>
            What this page's claims are built on — and what's still an open gap.
          </p>

          <h3 className='mx-2 mt-4 mb-0 text-left font-semibold text-alt-green text-smallest uppercase tracking-wide'>
            Sourced
          </h3>
          {SOURCED_RESOURCES.map((resource) => (
            <SourcedCard key={resource.id} resource={resource} />
          ))}

          <h3 className='mx-2 mt-6 mb-0 text-left font-semibold text-report-alert text-smallest uppercase tracking-wide'>
            Acknowledged gap
          </h3>
          {ACKNOWLEDGED_GAP_RESOURCES.map((resource) => (
            <AcknowledgedGapCard key={resource.id} resource={resource} />
          ))}

          <h3 className='mx-2 mt-6 mb-0 text-left font-semibold text-alt-dark text-smallest uppercase tracking-wide'>
            Get involved
          </h3>
          {GET_INVOLVED_RESOURCES.map((resource) => (
            <GetInvolvedCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </div>
  )
}
