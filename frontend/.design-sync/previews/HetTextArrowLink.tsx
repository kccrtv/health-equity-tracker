import HetTextArrowLink from '../../src/styles/HetComponents/HetTextArrowLink'

export const Default = () => (
  <HetTextArrowLink link="/methodology" linkText="See methodology" />
)

export const ExternalLink = () => (
  <HetTextArrowLink
    link="https://satcherinstitute.org"
    linkText="Visit Satcher Institute"
  />
)

export const CustomClasses = () => (
  <HetTextArrowLink
    link="/exploredata?mls=1.hiv-3.00&group1=All"
    linkText="Explore HIV data"
    containerClassName="p-2"
    textClassName="text-small"
  />
)
