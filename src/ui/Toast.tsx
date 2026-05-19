/* eslint-disable react-refresh/only-export-components */
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastKind = 'success' | 'info' | 'error'

export type Toast = {
  id: string
  title: string
  description?: string
  kind: ToastKind
  durationMs?: number
}

type ToastContextValue = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const handle = timers.current.get(id)
    if (handle) {
      window.clearTimeout(handle)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = `toast_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
      setToasts((prev) => [...prev, { id, durationMs: 4200, ...t }])
      const handle = window.setTimeout(() => dismiss(id), t.durationMs ?? 4200)
      timers.current.set(id, handle)
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const captured = timers.current
    return () => {
      for (const h of captured.values()) window.clearTimeout(h)
      captured.clear()
    }
  }, [])

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-gp-surface px-4 py-3 shadow-lift ring-1 ${kindRing(
              t.kind,
            )}`}
            role={t.kind === 'error' ? 'alert' : 'status'}
          >
            <KindIcon kind={t.kind} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gp-charcoal">{t.title}</div>
              {t.description ? (
                <div className="mt-0.5 text-xs text-gp-charcoal/70">{t.description}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="gp-focus -mr-1 rounded-xl p-1 text-gp-charcoal/60 hover:bg-black/5"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function kindRing(kind: ToastKind) {
  switch (kind) {
    case 'success':
      return 'ring-gp-secondary/20'
    case 'error':
      return 'ring-gp-primary/25'
    default:
      return 'ring-black/10'
  }
}

function KindIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'success')
    return <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gp-secondary" aria-hidden />
  if (kind === 'error')
    return <AlertCircle size={18} className="mt-0.5 shrink-0 text-gp-primary" aria-hidden />
  return <Info size={18} className="mt-0.5 shrink-0 text-gp-charcoal/70" aria-hidden />
}

