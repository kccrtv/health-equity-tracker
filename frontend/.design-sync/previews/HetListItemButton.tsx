import HetListItemButton from '../../src/styles/HetComponents/HetListItemButton'

// Note: `to`-based stories (which render an internal react-router `<Link>`)
// are intentionally omitted here. This preview harness's esbuild step bundles
// `react-router` fresh into this file's own chunk, a separate module instance
// from the one already compiled into the shared DS bundle that
// HetListItemButton itself resolves against — so a locally-rendered
// <MemoryRouter> never reaches the component's <Link>, and the cell renders
// blank. This mirrors the react-router/MUI dual-package-instance class of
// bug already called out in .design-sync/NOTES.md; it needs a shared-bundle
// fix (externalizing react-router like react/react-dom are), not a per-story
// workaround. The `onClick`-based action path below exercises the same
// ListItemButton row without touching routing.

export const Default = () => (
  <ul className='m-0 w-64 list-none p-0'>
    <HetListItemButton
      option='boldGreenCol'
      onClick={() => {}}
      ariaLabel='Explore the data'
    >
      Explore the data
    </HetListItemButton>
  </ul>
)

export const NormalBlackAction = () => (
  <ul className='m-0 w-64 list-none p-0'>
    <HetListItemButton
      option='normalBlack'
      onClick={() => {}}
      ariaLabel='Methodology'
    >
      Methodology
    </HetListItemButton>
  </ul>
)

export const SelectedAction = () => (
  <ul className='m-0 w-64 list-none p-0'>
    <HetListItemButton option='boldGreenCol' selected onClick={() => {}}>
      Explore the data
    </HetListItemButton>
  </ul>
)
