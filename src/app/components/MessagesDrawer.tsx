import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, Edit3, MessageCircle, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Message, Order, Plate, User } from '../../types'
import { formatMoney } from '../../lib/format'
import { buildSortedMessageThreads } from '../lib/messageThreads'
import { messagePeerLabel, messageRoleForOrder } from '../lib/orderRoles'
import { OrderConversation } from './OrderConversation'
import { useSettings } from '../../state/settings'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  orders: Order[]
  messagesByOrderId: Map<string, Message[]>
  platesById: Map<string, Plate>
  onSendMessage: (orderId: string, body: string) => void
  /** App-level reduced motion overrides animation duration */
  forcedReduceMotion?: boolean
}

function shortRelative(iso: string) {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const diff = Math.max(0, Date.now() - t)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Single conversation thread for an order (buyer + cook messages chronologically). */
function ActiveThreadPane({
  order,
  plate,
  thread,
  userId,
  onBack,
  onSend,
}: {
  order: Order
  plate: Plate | undefined
  thread: Message[]
  userId: string
  onBack: () => void
  onSend: (body: string) => void
}) {
  const { settings } = useSettings()
  const viewerRole = messageRoleForOrder(order, userId, plate)
  const peerLabel = messagePeerLabel(viewerRole, plate)
  const headerTitle = viewerRole === 'buyer' ? peerLabel : order.plateName
  const headerSubtitle = viewerRole === 'buyer' ? order.plateName : peerLabel

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-gp-bg/95 px-2 py-2 dark:border-white/10 dark:bg-gp-bg/98">
        <button
          type="button"
          onClick={onBack}
          className="gp-focus grid h-10 w-10 shrink-0 place-items-center rounded-full text-gp-charcoal transition hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Back to inbox"
        >
          <ChevronLeft size={22} strokeWidth={1.75} aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center px-1 text-center">
          <span className="truncate text-[15px] font-bold text-gp-charcoal">{headerTitle}</span>
          <span className="truncate text-[12px] text-gp-charcoal/55">{headerSubtitle}</span>
        </div>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <OrderConversation
        thread={thread}
        viewerRole={viewerRole}
        peerLabel={peerLabel}
        onSend={onSend}
        compact
        draftInputId={`dm-draft-${order.id}`}
        footer={
          <p className="text-center text-[10px] text-gp-charcoal/45">
            Order · {formatMoney(order.priceCents, settings.currency, settings.locale)} ·{' '}
            <span className="font-semibold text-gp-charcoal/60">{order.status}</span>
          </p>
        }
      />
    </div>
  )
}

export function MessagesDrawer({
  open,
  onOpenChange,
  user,
  orders,
  messagesByOrderId,
  platesById,
  onSendMessage,
  forcedReduceMotion,
}: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const systemReduce = useReducedMotion()
  const reduceMotion = Boolean(forcedReduceMotion || systemReduce)
  const transition = reduceMotion ? { duration: 0 } : { type: 'tween' as const, ease: [0.32, 0.72, 0, 1] as const, duration: 0.32 }

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [searchRaw, setSearchRaw] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const threadsBase = user ? buildSortedMessageThreads(orders, messagesByOrderId, platesById) : []

  const q = searchRaw.trim().toLowerCase()
  const threadsFiltered = useMemo(() => {
    if (!q) return threadsBase
    return threadsBase.filter(({ order, plate, msgs }) => {
      const cookName = plate?.cook.name?.toLowerCase() ?? ''
      const plateTitle = order.plateName.toLowerCase()
      const inBodies = msgs.some((m) => m.body.toLowerCase().includes(q))
      return plateTitle.includes(q) || cookName.includes(q) || inBodies
    })
  }, [threadsBase, q])

  const activeOrder = activeOrderId ? orders.find((o) => o.id === activeOrderId) ?? null : null
  const activePlate = activeOrder ? platesById.get(activeOrder.plateId) : undefined

  useEffect(() => {
    if (!open) {
      setActiveOrderId(null)
      setSearchRaw('')
      return
    }
    if (activeOrderId && !orders.some((o) => o.id === activeOrderId)) {
      setActiveOrderId(null)
    }
  }, [open, orders, activeOrderId])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (activeOrderId) setActiveOrderId(null)
        else onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange, activeOrderId])

  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!open) return
    function onPointerDownCapture(e: PointerEvent) {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('#messages-drawer-panel')) return
      if (t.closest('[data-gp-messages-drawer-trigger]')) return
      onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [open, onOpenChange])

  const drawer = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="messages-backdrop"
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            aria-hidden
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            id="messages-drawer-panel"
            key="messages-panel"
            className="fixed inset-y-0 right-0 z-[110] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-[26.5rem] flex-col overflow-hidden bg-gp-bg shadow-[0_0_0_1px_rgb(0_0_0/0.07),-16px_0_52px_-10px_rgb(0_0_0/0.35)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),-18px_0_56px_-10px_rgb(0_0_0/0.55)]"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={transition}
            aria-modal="true"
            aria-label="Direct messages"
            role="dialog"
          >
            {!user ? (
              <>
                <header className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-gp-bg px-3 py-3 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="gp-focus grid h-11 w-11 shrink-0 place-items-center rounded-full text-gp-charcoal transition hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Close messages"
                  >
                    <X size={22} strokeWidth={1.75} aria-hidden />
                  </button>
                  <div className="flex-1 text-center font-display text-base font-bold text-gp-charcoal">Messages</div>
                  <div className="w-11" />
                </header>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
                  <MessageCircle size={52} strokeWidth={1.25} className="text-gp-charcoal/25" aria-hidden />
                  <div>
                    <p className="text-base font-semibold text-gp-charcoal">Your messages live here</p>
                    <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/55">
                      Chat with cooks about orders — same inbox on web and mobile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      navigate('/login', { state: { from: location.pathname } })
                    }}
                    className="gp-focus rounded-full bg-gp-charcoal px-8 py-2.5 text-sm font-semibold text-gp-bg dark:bg-white dark:text-neutral-950"
                  >
                    Log in
                  </button>
                </div>
              </>
            ) : activeOrder ? (
              <ActiveThreadPane
                order={activeOrder}
                plate={activePlate}
                thread={messagesByOrderId.get(activeOrder.id) ?? []}
                userId={user.id}
                onBack={() => setActiveOrderId(null)}
                onSend={(body) => onSendMessage(activeOrder.id, body)}
              />
            ) : (
              <>
                <header className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-gp-bg px-3 py-3 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="gp-focus grid h-11 w-11 shrink-0 place-items-center rounded-full text-gp-charcoal transition hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Close messages"
                  >
                    <X size={22} strokeWidth={1.75} aria-hidden />
                  </button>
                  <div className="flex-1 text-center font-display text-base font-bold text-gp-charcoal">Messages</div>
                  <button
                    type="button"
                    title="Compose — search chats"
                    onClick={() => {
                      setActiveOrderId(null)
                      window.setTimeout(() => searchRef.current?.focus(), 0)
                    }}
                    className="gp-focus grid h-11 w-11 shrink-0 place-items-center rounded-full text-gp-charcoal transition hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Focus search"
                  >
                    <Edit3 size={19} strokeWidth={1.75} aria-hidden />
                  </button>
                </header>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="shrink-0 border-b border-black/10 bg-gp-bg px-3 pb-3 pt-2 dark:border-white/10">
                    <div className="flex items-center gap-2 rounded-full bg-gp-surface/85 px-3 py-2 ring-1 ring-black/[0.07] dark:bg-gp-surface/60 dark:ring-white/10">
                      <Search size={17} className="shrink-0 text-gp-charcoal/40" aria-hidden />
                      <label className="sr-only" htmlFor="messages-drawer-search">
                        Search chats
                      </label>
                      <input
                        ref={searchRef}
                        id="messages-drawer-search"
                        value={searchRaw}
                        onChange={(e) => setSearchRaw(e.target.value)}
                        placeholder="Search"
                        autoComplete="off"
                        className="gp-focus min-w-0 flex-1 bg-transparent text-[14px] text-gp-charcoal placeholder:text-gp-charcoal/40"
                      />
                    </div>
                  </div>

                  {!threadsBase.length ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-10 py-10 text-center">
                      <MessageCircle size={46} strokeWidth={1.25} className="text-gp-charcoal/20" aria-hidden />
                      <p className="text-[15px] font-semibold text-gp-charcoal">No chats yet</p>
                      <p className="text-sm leading-relaxed text-gp-charcoal/55">
                        Reserve a dish to open a thread with the cook — or open{' '}
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false)
                            navigate('/market')
                          }}
                          className="font-semibold text-gp-primary underline underline-offset-2 hover:opacity-90"
                        >
                          Find food
                        </button>
                        .
                      </p>
                    </div>
                  ) : !threadsFiltered.length ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-10 py-10 text-center">
                      <Search size={40} className="text-gp-charcoal/20" aria-hidden />
                      <p className="mt-4 text-[15px] font-semibold text-gp-charcoal">No matches</p>
                      <p className="mt-2 text-sm text-gp-charcoal/55">Try a cook or dish name.</p>
                    </div>
                  ) : (
                    <ul
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2"
                      role="list"
                    >
                      {threadsFiltered.map(({ order, plate, msgs }) => {
                        const thumb = plate?.cook.avatarUrl ?? plate?.images?.[0]
                        const viewerRole = messageRoleForOrder(order, user!.id, plate)
                        const peerLabel = messagePeerLabel(viewerRole, plate)
                        const primary = viewerRole === 'buyer' ? peerLabel : order.plateName
                        const subtitle = viewerRole === 'buyer' ? order.plateName : peerLabel
                        const sortedMsgs = [...msgs].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
                        const lastMsg = sortedMsgs[sortedMsgs.length - 1] ?? null

                        return (
                          <li key={order.id}>
                            <button
                              type="button"
                              onClick={() => setActiveOrderId(order.id)}
                              className="gp-focus flex w-full items-start gap-3 border-b border-black/[0.06] bg-gp-bg px-3 py-3.5 text-left transition hover:bg-black/[0.03] dark:border-white/[0.07] dark:hover:bg-white/[0.04]"
                            >
                              <span className="relative shrink-0 pt-0.5">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt=""
                                    loading="lazy"
                                    className="h-[3.375rem] w-[3.375rem] rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                                  />
                                ) : (
                                  <span className="grid h-[3.375rem] w-[3.375rem] place-items-center rounded-full bg-gp-surface/80 text-gp-charcoal/40 ring-1 ring-black/10 dark:ring-white/10">
                                    <MessageCircle size={22} aria-hidden />
                                  </span>
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="truncate text-[15px] font-semibold text-gp-charcoal">{primary}</span>
                                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-gp-charcoal/45">
                                    {lastMsg ? shortRelative(lastMsg.createdAtIso) : shortRelative(order.createdAtIso)}
                                  </span>
                                </div>
                                {subtitle && subtitle !== primary ? (
                                  <p className="truncate text-[13px] text-gp-charcoal/50">{subtitle}</p>
                                ) : null}

                                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-gp-charcoal/55">
                                  {!lastMsg ? (
                                    <span className="text-gp-charcoal/40">Tap to start the conversation</span>
                                  ) : lastMsg.from === viewerRole ? (
                                    <>
                                      <span className="font-semibold text-gp-charcoal/75">You: </span>
                                      <span>{lastMsg.body}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-semibold text-gp-secondary">{peerLabel}: </span>
                                      <span>{lastMsg.body}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  <div className="mt-auto shrink-0 border-t border-black/10 bg-gp-bg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false)
                        navigate('/orders')
                      }}
                      className="gp-focus w-full rounded-2xl py-2.5 text-center text-[13px] font-semibold text-gp-primary ring-1 ring-gp-primary/35 transition hover:bg-gp-primary/10"
                    >
                      Open full orders
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )

  if (!portalReady) return null
  return createPortal(drawer, document.body)
}

