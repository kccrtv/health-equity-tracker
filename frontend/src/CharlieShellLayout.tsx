import { CircularProgress } from '@mui/material'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import CharlieBottomTabBar from './CharlieBottomTabBar'
import CharlieTopBar from './CharlieTopBar'
import CharlieWaveDivider from './CharlieWaveDivider'

// The "Wayfinder" shell for Charlie's own routes (e.g. /oconus-preview and
// its Report/Compare/About tabs). Deliberately its own thing — no HET nav,
// header, or footer (see SiteLayout for that). Keeps the `#main` skip-link
// landmark and a Suspense boundary for lazy-loaded tab content.
export default function CharlieShellLayout() {
  return (
    <div className='flex min-h-screen flex-col'>
      <CharlieTopBar />
      <CharlieWaveDivider />
      <Suspense
        fallback={
          <div className='flex flex-1 items-center justify-center'>
            <CircularProgress aria-label='loading' />
          </div>
        }
      >
        <main id='main' className='flex-1'>
          <Outlet />
        </main>
      </Suspense>
      <CharlieBottomTabBar />
    </div>
  )
}
