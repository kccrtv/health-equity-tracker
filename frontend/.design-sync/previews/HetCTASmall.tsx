import HetCTASmall from '../../src/styles/HetComponents/HetCTASmall'

export const Default = () => (
  <HetCTASmall href="/exploredata">Explore the data</HetCTASmall>
)

export const ExternalLink = () => (
  <HetCTASmall href="https://satcherinstitute.org">
    Visit Satcher Institute
  </HetCTASmall>
)

export const WithClickHandler = () => (
  <HetCTASmall href="#" onClick={() => {}}>
    Download report
  </HetCTASmall>
)
