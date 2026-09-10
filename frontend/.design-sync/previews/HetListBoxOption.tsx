import HetListBoxOption from '../../src/styles/HetComponents/HetListBoxOption'

export const Default = () => (
  <menu className='m-0 w-64 px-0 py-2'>
    <HetListBoxOption ariaLabel='Georgia' onClick={() => {}}>
      Georgia
    </HetListBoxOption>
  </menu>
)

export const Selected = () => (
  <menu className='m-0 w-64 px-0 py-2'>
    <HetListBoxOption ariaLabel='Georgia' selected onClick={() => {}}>
      Georgia
    </HetListBoxOption>
  </menu>
)

export const OptionList = () => (
  <menu className='m-0 w-64 px-0 py-2'>
    <HetListBoxOption onClick={() => {}}>Alabama</HetListBoxOption>
    <HetListBoxOption selected onClick={() => {}}>
      Georgia
    </HetListBoxOption>
    <HetListBoxOption onClick={() => {}}>Texas</HetListBoxOption>
  </menu>
)
