import { CircularProgress } from '@mui/material'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router'
import Banner from './reports/ui/Banner'
import HetAppBar from './styles/HetComponents/HetAppBar'

const Footer = React.lazy(async () => await import('./Footer'))

// Chrome shared by every route in the main site: announcement banner,
// primary nav, and footer. Layout route for <Route element={<SiteLayout/>}>
// in App.tsx — matched child routes render via <Outlet/>. Charlie's own
// routes use CharlieShellLayout instead, which has none of this.
export default function SiteLayout() {
  return (
    <>
      <Banner />
      <HetAppBar />
      <Suspense
        fallback={
          <main className='min-h-screen'>
            <CircularProgress className='mt-10' aria-label='loading' />
          </main>
        }
      >
        <main id='main' className='scroll-smooth'>
          <Outlet />
        </main>
      </Suspense>
      <footer>
        <Suspense fallback={<span></span>}>
          <Footer />
        </Suspense>
      </footer>
    </>
  )
}
