import HetReturnToTop from '../../src/styles/HetComponents/HetReturnToTop'

export const Default = () => <HetReturnToTop />

export const InContext = () => (
  <div className='flex w-64 items-center justify-between border-alt-gray border-t p-4'>
    <span className='font-roboto text-alt-black text-small'>
      Health Equity Tracker
    </span>
    <HetReturnToTop />
  </div>
)
