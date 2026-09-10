import HetLaunchLink from '../../src/styles/HetComponents/HetLaunchLink'

export const Default = () => (
  <p className="max-w-sm text-alt-black text-text">
    Read the full methodology on the{' '}
    <HetLaunchLink href="https://satcherinstitute.org" label="Satcher Institute" />{' '}
    website.
  </p>
)

export const WithoutLabel = () => (
  <p className="max-w-sm text-alt-black text-text">
    View the source data{' '}
    <HetLaunchLink href="https://healthequitytracker.org/exploredata" />
  </p>
)
