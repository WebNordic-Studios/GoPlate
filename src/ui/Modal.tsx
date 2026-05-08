import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[980px] overflow-hidden rounded-2xl bg-gp-bg shadow-lift ring-1 ring-black/5"
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {title ? (
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <div className="font-display text-lg font-semibold">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="gp-focus rounded-xl px-2 py-1 text-sm text-gp-charcoal/70 hover:bg-black/5"
                >
                  Close
                </button>
              </div>
            ) : null}
            <div className="max-h-[78vh] overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

