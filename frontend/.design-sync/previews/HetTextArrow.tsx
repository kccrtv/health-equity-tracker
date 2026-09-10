import HetTextArrow from '../../src/styles/HetComponents/HetTextArrow'

export const Default = () => <HetTextArrow linkText="See methodology" />

export const LongerLabel = () => (
  <HetTextArrow linkText="Explore diabetes data by race and ethnicity" />
)

export const CustomTextClass = () => (
  <HetTextArrow linkText="Download the report" textClassName="text-small" />
)
