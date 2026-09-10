import HetNavLink from '../../src/styles/HetComponents/HetNavLink'

export const Default = () => <HetNavLink href="/exploredata">Explore the Data</HetNavLink>

export const WithAriaLabel = () => (
  <HetNavLink href="/about" ariaLabel="About Health Equity Tracker">
    About
  </HetNavLink>
)

export const NoUnderlineOverride = () => (
  <HetNavLink href="/faqs" underline={false}>
    FAQs
  </HetNavLink>
)
