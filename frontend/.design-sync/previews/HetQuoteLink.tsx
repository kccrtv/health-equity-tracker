import HetQuoteLink from '../../src/styles/HetComponents/HetQuoteLink'

export const Default = () => (
  <p>
    SOURCE: The Rocket Foundation{' '}
    <HetQuoteLink
      href='https://www.rocketfoundation.org'
      label='The Rocket Foundation'
    />
  </p>
)

export const NoLabel = () => (
  <p>
    SOURCE: Gun Violence Archive{' '}
    <HetQuoteLink href='https://www.gunviolencearchive.org' />
  </p>
)
