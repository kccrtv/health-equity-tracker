import HetLinkButton from '../../src/styles/HetComponents/HetLinkButton'

export const Default = () => (
  <HetLinkButton href="/exploredata">Explore the data</HetLinkButton>
)

export const AsAction = () => (
  <HetLinkButton onClick={() => {}} ariaLabel="Back to top of page">
    Back to top
  </HetLinkButton>
)

export const Underlined = () => (
  <HetLinkButton href="https://satcherinstitute.org" underline>
    Visit Satcher Institute
  </HetLinkButton>
)
