import CloseIcon from '@mui/icons-material/Close'
import { Drawer, IconButton } from '@mui/material'
import type { ReactNode } from 'react'

interface CharlieBottomSheetProps {
  open: boolean
  onClose: () => void
  // ReactNode (not just string) so the sentence editor can put its own
  // "Save →" action in the title slot instead of a plain heading — still a
  // plain string everywhere else.
  title: ReactNode
  subtitle?: string
  ariaLabel: string
  children: ReactNode
}

// Reusable bottom-sheet shell for the Charlie shell: drag handle, title
// (+ optional subtitle), close button, scrollable content area. Always a
// bottom drawer regardless of viewport — Charlie is its own dedicated
// mobile-style shell (see CharlieShellLayout), not the responsive
// dialog-on-desktop pattern HetResponsiveDialog uses for the main site.
// Used as-is by the top bar's plain geography picker and, with different
// children, by Compare's "Change comparison" sheet.
export default function CharlieBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  ariaLabel,
  children,
}: CharlieBottomSheetProps) {
  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          style: {
            borderRadius: '16px 16px 0 0',
            maxHeight: '85dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          'aria-label': ariaLabel,
        },
      }}
    >
      <div className='mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-alt-gray' />
      <div className='flex shrink-0 items-start justify-between gap-2 p-4 pb-2 text-left'>
        <div>
          <h2 className='m-0 font-semibold text-lg'>{title}</h2>
          {subtitle && (
            <p className='m-0 mt-1 text-alt-dark text-small'>{subtitle}</p>
          )}
        </div>
        <IconButton onClick={onClose} aria-label='close' size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='overflow-y-auto px-4 pb-4'>{children}</div>
    </Drawer>
  )
}
