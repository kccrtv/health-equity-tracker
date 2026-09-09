import {
  LIMITATIONS_LINK,
  PDOH_LINK,
  RACES_AND_ETHNICITIES_LINK,
} from '../../utils/internalRoutes'

// Content for CHARLIE OCONUS's About-tab Resources section, split into the
// three tiers reviewed in the Claude Design concept. Kept as data (not
// inline JSX) so swapping placeholder copy for real SHLI-authored text is a
// content change here, not a layout change in CharlieAboutTab.tsx.
//
// Tier 1 quotes are verbatim excerpts from real, currently-live HET
// Methodology content — do not paraphrase or adjust wording when editing
// this file. Each `methodologyLink` was confirmed against the actual
// component that renders the quoted text (not guessed from the route name):
// - races-and-ethnicities quotes: RacesAndEthnicitiesLink.tsx, at
//   RACES_AND_ETHNICITIES_LINK (`/methodology/definitions/races-and-ethnicities`).
//   The NHPI definition anchors to `#race-eth-nhpi` (the real id
//   RacesEthnicitiesList.tsx assigns from RacesAndEthnicitiesDefinitions.ts's
//   `path: 'race-eth-nhpi'`); the Census FAQ quote anchors to `#data-gaps`,
//   the nearest real heading id above the HetNotice it lives in.
// - Island Areas (NH) and COVID caveats: both quotes come from
//   missingDataBlurbs.tsx components (MissingIslandAreaPopulationData,
//   MissingCovidData) that only render live via WhatDataAreMissing, which is
//   only instantiated on LimitationsLink.tsx (`/methodology/limitations`,
//   fips1=Fips('78') triggers the island-area blurb; the all-topics
//   METRIC_CONFIG subset there includes 'covid', triggering the covid one).
//   Covid19Link.tsx has its own, different "missing and suppressed" prose —
//   it does not render this exact quote, so it is not the right link target.
// - incarceration territory caveat: PdohLink.tsx, at PDOH_LINK
//   (`/methodology/topic-categories/pdoh`), anchored to `#jails-vs-prisons`,
//   the real heading id for the state/territory/county reports subsection
//   the quoted paragraph sits under.
export interface SourcedResource {
  id: string
  heading: string
  quote: string
  sourceLabel: string
  methodologyLink: string
}

export const SOURCED_RESOURCES: SourcedResource[] = [
  {
    id: 'nhpi-definition',
    heading: 'NHPI definition',
    quote:
      'Native Hawaiian or Other Pacific Islander: A person having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands.',
    sourceLabel: 'RacesAndEthnicitiesDefinitions.ts — raceDefinitions',
    methodologyLink: `${RACES_AND_ETHNICITIES_LINK}#race-eth-nhpi`,
  },
  {
    id: 'race-ethnicity-classification',
    heading: 'Race/ethnicity classification',
    quote:
      'The race and ethnicity categories generally reflect social definitions in the U.S. and are not an attempt to define race and ethnicity biologically, anthropologically, or genetically. We recognize that the race and ethnicity categories include racial, ethnic, and national origins and sociocultural groups.',
    sourceLabel: 'U.S. Census FAQ, via RacesAndEthnicitiesLink.tsx',
    methodologyLink: `${RACES_AND_ETHNICITIES_LINK}#data-gaps`,
  },
  {
    id: 'nh-island-areas',
    heading: '"(NH)" meaning in Island Areas data',
    quote:
      'The NH, or Non-Hispanic race groups are only provided by the Decennial report for VI but not the other Island Areas. As the overall number of Hispanic-identifying people is very low in these Island Areas, we use the ethnicity-agnostic race groups even though the condition data may use Non-Hispanic race groups (e.g. Black or African American (NH)).',
    sourceLabel: 'missingDataBlurbs.tsx — MissingIslandAreaPopulationData',
    methodologyLink: `${LIMITATIONS_LINK}#missing-data`,
  },
  {
    id: 'incarceration-territory-caveat',
    heading: "Incarceration's territory-reporting caveat",
    quote:
      "Territory reports: Covers individuals in a territory's adult prison facilities. No specific demographic breakdown.",
    sourceLabel: 'PdohLink.tsx',
    methodologyLink: `${PDOH_LINK}#jails-vs-prisons`,
  },
  {
    id: 'covid-territory-caveat',
    heading: "COVID's territory data-sourcing caveat",
    quote:
      'This tracker uses disaggregated, individual case level data reported by states, territories, and other jurisdictions to the CDC. Many of these case records are insufficiently disaggregated, report an unknown hospitalization and/or death status, or otherwise fail to provide a complete picture.',
    sourceLabel: 'missingDataBlurbs.tsx — MissingCovidData',
    methodologyLink: `${LIMITATIONS_LINK}#missing-data`,
  },
]

export interface PlaceholderResource {
  id: string
  heading: string
  body: string
}

export const ACKNOWLEDGED_GAP_RESOURCES: PlaceholderResource[] = [
  {
    id: 'non-conus-approach',
    heading: 'How CHARLIE OCONUS approaches non-CONUS geography',
    body: "Doesn't exist anywhere yet as a unified statement — needs original writing, not an excerpt. Placeholder until SHLI drafts it.",
  },
  {
    id: 'hawaii-coverage-context',
    heading: 'Hawaiʻi-specific coverage context',
    body: 'Confirmed real gap — Hawaiʻi consistently shows sparse or missing data in state-level HET comparisons, and none of the territory-specific methodology caveats found in this audit name Hawaiʻi directly. Needs original SHLI-authored copy addressing this specifically, not an excerpt.',
  },
  {
    id: 'incarceration-covid-suppression-thresholds',
    heading: 'Incarceration / COVID-19 suppression thresholds',
    body: "Unconfirmed whether these exist — PdohLink.tsx and Covid19Link.tsx state no comparable threshold as currently written, but this methodology content hasn't been re-audited in a couple of years and may simply be uncaptured rather than genuinely absent. Lower priority to verify given current team bandwidth — placeholder stands until confirmed either way.",
  },
]

export const GET_INVOLVED_RESOURCES: PlaceholderResource[] = [
  {
    id: 'crisis-overview',
    heading: 'Crisis overview',
    body: 'Placeholder — territory/state crisis lines and immediate-need resources, per geography.',
  },
  {
    id: 'reform-opportunities',
    heading: 'Reform opportunities',
    body: 'Placeholder — advocacy and policy-reform entry points, echoing the Bubble app original.',
  },
  {
    id: 'where-to-start',
    heading: 'Where to start',
    body: 'Placeholder — a first-step guide for someone new to the issue in their geography.',
  },
]
