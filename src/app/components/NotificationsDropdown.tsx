import { Bell } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Order, User } from '../../types'
import { buildTimelineNotifications } from '../lib/orderNotifications'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  orders: Order[]
}

export function NotificationsDropdown({ open, onOpenChange, user, orders }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onOpenChange])

  const items = buildTimelineNotifications(user ? orders : [])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Notifications"
        className={`gp-focus grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-gp-charcoal/70 transition hover:bg-black/5 dark:hover:bg-white/10 ${
          open ? 'bg-black/10 text-gp-charcoal dark:bg-white/15 dark:text-gp-charcoal' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell size={18} aria-hidden />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-[60] mt-2 w-[min(20rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white/95 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/[0.04] backdrop-blur-glass dark:border-white/12 dark:bg-gp-surface/95 dark:ring-white/10 dark:shadow-[0_20px_50px_-16px_rgb(0_0_0/0.65)]"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="border-b border-black/[0.07] px-4 py-3 dark:border-white/10">
            <p className="font-display text-[0.95rem] font-semibold tracking-tight">Notifications</p>
            <p className="mt-0.5 text-[11px] font-medium text-gp-charcoal/50">Order & pickup updates</p>
          </div>

          {!user ? (
            <div className="space-y-3 px-4 py-5 text-center">
              <p className="text-sm leading-snug text-gp-charcoal/70">Sign in to see your order updates here.</p>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/login', { state: { from: location.pathname } })
                }}
                className="gp-focus w-full rounded-2xl bg-gp-secondary py-2.5 text-sm font-semibold text-white shadow-natural transition hover:opacity-95 dark:ring-1 dark:ring-white/15"
              >
                Sign in
              </button>
            </div>
          ) : !items.length ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-gp-charcoal">You're all caught up</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gp-charcoal/55">
                Reserve a dish and we’ll post status changes here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(22rem,65vh)] divide-y divide-black/[0.06] overflow-y-auto overscroll-contain dark:divide-white/10" role="list">
              {items.slice(0, 25).map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      navigate('/orders')
                    }}
                    className="gp-focus w-full px-4 py-3 text-left transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-gp-primary/80" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight text-gp-charcoal">{row.status}</p>
                        <p className="mt-0.5 text-[12px] leading-snug text-gp-charcoal/65">{row.caption}</p>
                        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-gp-charcoal/40">
                          {new Date(row.createdAtIso).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
