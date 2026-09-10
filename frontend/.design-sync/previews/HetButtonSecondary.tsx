import HetButtonSecondary from '../../src/styles/HetComponents/HetButtonSecondary'

export const Default = () => (
  <HetButtonSecondary onClick={() => {}}>Learn more</HetButtonSecondary>
)

export const InternalLink = () => (
  <HetButtonSecondary href="/exploredata">Explore the data</HetButtonSecondary>
)

export const ExternalLink = () => (
  <HetButtonSecondary href="https://satcherinstitute.org">
    Visit Satcher Institute
  </HetButtonSecondary>
)

export const WithAriaLabel = () => (
  <HetButtonSecondary onClick={() => {}} ariaLabel="Download the full report as a PDF">
    Download report
  </HetButtonSecondary>
)
