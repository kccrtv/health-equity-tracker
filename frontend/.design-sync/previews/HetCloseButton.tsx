import HetCloseButton from '../../src/styles/HetComponents/HetCloseButton'

export const Default = () => (
  <HetCloseButton onClick={() => {}} ariaLabel="Close dialog" />
)

export const InFilterPanel = () => (
  <HetCloseButton onClick={() => {}} ariaLabel="Close filter panel" className="text-alt-black" />
)
