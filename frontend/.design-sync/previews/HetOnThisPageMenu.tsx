import HetOnThisPageMenu from '../../src/styles/HetComponents/HetOnThisPageMenu'

const links = [
  { label: 'Overview', path: '#overview' },
  { label: 'Our findings', path: '#our-findings' },
  { label: 'How to use the data', path: '#how-to-use-the-data' },
  { label: 'Current efforts', path: '#current-efforts' },
]

export const Default = () => <HetOnThisPageMenu links={links} />
