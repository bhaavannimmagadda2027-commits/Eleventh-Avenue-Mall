import { AnimatePresence, motion } from 'framer-motion'
import { X } from './icons'
import { useRef, type ReactNode } from 'react'
import { useDialog } from '../../lib/useDialog'

/** Contextual card that floats above the bottom controls. Never covers the whole screen. */
export function FloatingCard({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useDialog(open, ref, onClose, { modal: false })
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label={label}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="glass pointer-events-auto relative rounded-3xl p-4"
        >
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cream text-ink-2 active:scale-95">
            <X size={16} />
          </button>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Bottom sheet for longer lists (directory, search). Rises over the mall, which stays visible above it. */
export function Sheet({ open, onClose, title, children, footer, tall }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useDialog(open, ref, onClose)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-30 bg-[rgb(0_0_0/0.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Details'}
            tabIndex={-1}
            className={`absolute inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[600px] outline-none ${tall ? 'h-[92%]' : 'max-h-[78%]'} flex-col rounded-t-3xl bg-bg shadow-[0_-12px_40px_-16px_rgb(0_0_0/0.7)]`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
          >
            <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-[rgb(255_255_255/0.2)]" />
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-cream text-ink-2 active:scale-95">
                <X size={18} />
              </button>
            </div>
            <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 ${footer ? 'pb-4' : 'pb-[calc(20px+env(safe-area-inset-bottom))]'}`}>{children}</div>
            {footer && <div className="shrink-0 border-t border-soft bg-surface/90 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
