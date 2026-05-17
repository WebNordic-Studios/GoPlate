import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  /** Full-height sheet on small screens (keeps inputs above the tab bar). */
  sheetOnMobile?: boolean
}

export function Modal({ open, title, children, onClose, sheetOnMobile = false }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-[100] flex sm:justify-center sm:p-6 ${
            sheetOnMobile ? 'items-end p-0 sm:items-center' : 'items-center justify-center p-4'
          }`}
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
            className={`relative flex w-full flex-col overflow-hidden bg-gp-bg shadow-lift ring-1 ring-black/5 ${
              sheetOnMobile
                ? 'max-h-[100dvh] rounded-t-[2rem] sm:max-h-[78vh] sm:max-w-[980px] sm:rounded-2xl'
                : 'max-w-[980px] rounded-2xl'
            }`}
            initial={{ y: sheetOnMobile ? '100%' : 18, scale: sheetOnMobile ? 1 : 0.98, opacity: sheetOnMobile ? 1 : 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: sheetOnMobile ? '100%' : 18, scale: sheetOnMobile ? 1 : 0.98, opacity: sheetOnMobile ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {title ? (
              <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
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
            <div
              className={
                sheetOnMobile ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'max-h-[78vh] overflow-auto'
              }
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
