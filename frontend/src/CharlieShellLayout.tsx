import { CircularProgress } from '@mui/material'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

// Placeholder shell for Charlie's own routes (e.g. /oconus-preview).
// Deliberately no nav, header, or footer — Charlie's own branding/nav lands
// here later. Keeps only the `#main` skip-link landmark (see SkipLink.tsx)
// and a Suspense boundary for lazy-loaded child routes.
export default function CharlieShellLayout() {
  return (
    <Suspense fallback={<CircularProgress aria-label='loading' />}>
      <main id='main'>
        <Outlet />
      </main>
    </Suspense>
  )
}
