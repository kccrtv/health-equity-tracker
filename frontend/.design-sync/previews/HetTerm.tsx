import HetTerm from '../../src/styles/HetComponents/HetTerm'

export const Default = () => (
  <p className="m-0">
    Rates are shown <HetTerm>age-adjusted</HetTerm> per 100,000 people to allow
    fair comparison across states.
  </p>
)

export const InDefinition = () => (
  <p className="m-0">
    <HetTerm>Social vulnerability index</HetTerm> combines 16 U.S. Census
    variables to identify communities that may need more support during
    public health emergencies.
  </p>
)

export const ShortLabel = () => (
  <p className="m-0">
    Values marked with <HetTerm>N/A</HetTerm> indicate suppressed data due to
    small sample size.
  </p>
)
