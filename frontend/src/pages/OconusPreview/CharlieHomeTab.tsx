import { Card, CardActionArea, CardContent } from '@mui/material'
import { useNavigate } from 'react-router'
import { useCharlieFipsCode } from '../../CharlieTopBar'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import {
  OCONUS_FIPS_CODES,
  OCONUS_GEOGRAPHIES,
} from '../../reports/oconusGeographies'
import {
  CHARLIE_TOPIC_FRAMING,
  CHARLIE_TOPIC_LABELS,
  CHARLIE_TOPICS,
  type CharlieTopicId,
  useCharlieTopic,
} from './oconusTopics'
import { useCharlieHeadlineStat } from './useCharlieHeadlineStat'

// "Home" tab inside CharlieShellLayout. One headline stat card per OCONUS
// geography, for whichever topic is currently selected (the same
// useCharlieTopic() URL param the Report tab reads — no separate topic
// control here). Tapping a card jumps into the Report tab pre-filtered to
// that card's geography.
//
// IMPORTANT: the geography write and the tab navigation are two separate
// calls, in this order, on purpose. useCharlieFipsCode()'s setter goes
// through jotai-location (locationAtom), which does NOT get notified of
// react-router's own history.pushState calls (it only resyncs on a native
// popstate event) — so baking `?fips=...` straight into a react-router
// navigate() string leaves the jotai-tracked fips stale even though the
// URL bar is correct, and every card silently keeps rendering the old
// geography. Setting fips first (while still on this tab, the same
// working pattern the geography chip picker already uses) then doing a
// bare-path navigate (the same pattern CharlieBottomTabBar already uses
// for tab switching) avoids that desync.
//
// Copy provenance, since none of this comes from HET's real AI report
// summary panel (InsightReportCard.tsx / generateReportInsight — see the
// research notes in oconusTopics.ts): the number and the high/low
// comparison sentence are both real, non-authored output — the number
// straight from the same query every report card uses, and the comparison
// sentence from getRateBarA11ySummary, the deterministic (not AI) utility
// RateBarChartCard already uses for its own screen-reader summary. Only the
// one-clause framing per topic (CHARLIE_TOPIC_FRAMING) and the "no data"/
// "suppressed" wording below are hand-written by us, matching that panel's
// plain, non-alarmist tone.
export default function CharlieHomeTab() {
  const [topicId] = useCharlieTopic()
  const dataTypeConfig = CHARLIE_TOPICS[topicId]
  const topicLabel = CHARLIE_TOPIC_LABELS[topicId]

  return (
    <div className='flex'>
      <div className='w-full md:w-10/12'>
        <div className='flex w-full flex-col content-center px-4 py-2'>
          {/* p-0: index.css's global h1 rule adds 2rem/1rem top/bottom
              padding sized for full-page titles, not this compact heading. */}
          <h1 className='mt-2 mb-4 p-0 text-left font-semibold text-lg'>
            {topicLabel} across Oconus
          </h1>
          {OCONUS_FIPS_CODES.map((code) => (
            <HomeCard
              key={code}
              code={code}
              dataTypeConfig={dataTypeConfig}
              topicLabel={topicLabel}
              topicId={topicId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeCard({
  code,
  dataTypeConfig,
  topicLabel,
  topicId,
}: {
  code: (typeof OCONUS_FIPS_CODES)[number]
  dataTypeConfig: DataTypeConfig
  topicLabel: string
  topicId: CharlieTopicId
}) {
  const navigate = useNavigate()
  const [, setFipsCode] = useCharlieFipsCode()
  const fips = OCONUS_GEOGRAPHIES[code]
  const stat = useCharlieHeadlineStat(fips, dataTypeConfig)

  const goToReport = () => {
    setFipsCode(code)
    // window.location.search, not a hand-built string: setFipsCode's write
    // already lands there synchronously, and this is the one place both
    // jotai-location's and react-router's writes are guaranteed to show up
    // (see the note above and CharlieBottomTabBar's matching fix).
    navigate({ pathname: '/oconus-preview', search: window.location.search })
  }

  let body: string
  if (stat.status === 'loading') {
    body = 'Loading…'
  } else if (stat.status === 'has_data') {
    body = `About ${stat.allValueText} ${CHARLIE_TOPIC_FRAMING[topicId]}. ${stat.comparisonSentence}`
  } else if (stat.status === 'suppressed') {
    body = `${fips.getDisplayName()}'s ${topicLabel} rate is suppressed here to protect privacy.`
  } else {
    body = `No ${topicLabel} data is published for ${fips.getDisplayName()} — every card on the Report tab for this geography will read the same way.`
  }

  // Home cards intentionally use a smaller radius than the site-wide
  // rounded-2xl (--radius-2xl, 40px) standard applied to Report/Compare
  // cards and the bottom sheets — the original Claude Design Home mockup
  // uses a distinctly tighter corner for this list, not the same value.
  // Referencing the custom property directly (rather than the bare
  // `rounded-lg` utility) is deliberate: this project's Terrazzo-generated
  // tokens (src/styles/tokens/dimensions.css) remap Tailwind's built-in
  // radius scale to non-default pixel values (`--radius-lg` is 16px here,
  // `--radius-2xl` is 40px, neither matching Tailwind's own defaults), so
  // naming the property explicitly avoids relying on a scale-name/value
  // coincidence that doesn't actually hold in this codebase.
  return (
    <Card
      className='!rounded-[var(--radius-lg)] my-3 shadow-raised'
      elevation={0}
    >
      <CardActionArea onClick={goToReport} className='text-left'>
        <CardContent>
          <div className='font-semibold text-alt-green'>
            {fips.getDisplayName()}
          </div>
          <p className='m-0 mt-1 text-alt-dark'>{body}</p>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
