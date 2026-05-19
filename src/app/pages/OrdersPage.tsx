import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, Inbox, KeyRound, LogIn, MessageCircle, Package, ShoppingBag, Timer, X } from 'lucide-react'
import { RUNNING_LATE_TEMPLATE } from '../../lib/orderMessages'
import type { Message, Order, OrderStatus, Plate, User } from '../../types'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { EmptyState } from '../../ui/EmptyState'
import { useSettings } from '../../state/settings'
import { formatMoney } from '../../lib/format'
import { PastOrdersSection } from '../components/PastOrderCards'
import {
  isIncomingOrder,
  isOrderFinished,
  isPlacedOrder,
  messagePeerLabel,
  messageRoleForOrder,
} from '../lib/orderRoles'
import { OrderConversation } from '../components/OrderConversation'

const STATUS_FLOW: OrderStatus[] = ['Reserved', 'Cooking', 'Ready', 'Picked up']

type OrderTab = 'placed' | 'incoming'

function partitionOrders(list: Order[]) {
  const inProgress: Order[] = []
  const finished: Order[] = []
  for (const o of list) {
    if (isOrderFinished(o.status)) finished.push(o)
    else inProgress.push(o)
  }
  const byNewest = (a: Order, b: Order) => b.createdAtIso.localeCompare(a.createdAtIso)
  inProgress.sort(byNewest)
  finished.sort(byNewest)
  return { inProgress, finished }
}

export function OrdersPage({
  user,
  orders,
  plates,
  messagesByOrderId,
  onSendMessage,
  onUpdateStatus,
  onCancel,
  onLeaveReview,
}: {
  user: User | null
  orders: Order[]
  plates: Map<string, Plate>
  messagesByOrderId: Map<string, Message[]>
  onSendMessage: (orderId: string, body: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onCancel: (orderId: string) => void
  onLeaveReview: (orderId: string) => void
}) {
  const [tab, setTab] = useState<OrderTab>('placed')
  const [openMessagesFor, setOpenMessagesFor] = useState<string | null>(null)
  const { settings } = useSettings()

  const { placed, incoming } = useMemo(() => {
    if (!user) return { placed: [] as Order[], incoming: [] as Order[] }
    const placedList: Order[] = []
    const incomingList: Order[] = []
    for (const o of orders) {
      const plate = plates.get(o.plateId)
      if (isIncomingOrder(o, plate, user.id)) incomingList.push(o)
      else if (isPlacedOrder(o, plate, user.id)) placedList.push(o)
    }
    return { placed: placedList, incoming: incomingList }
  }, [orders, plates, user])

  const placedSplit = useMemo(() => partitionOrders(placed), [placed])
  const incomingSplit = useMemo(() => partitionOrders(incoming), [incoming])
  const tabOrders = tab === 'placed' ? placed : incoming
  const { inProgress, finished } = tab === 'placed' ? placedSplit : incomingSplit
  const activeOrder = openMessagesFor ? orders.find((o) => o.id === openMessagesFor) ?? null : null
  const thread = activeOrder ? messagesByOrderId.get(activeOrder.id) ?? [] : []
  const activeOrderPlate = activeOrder ? plates.get(activeOrder.plateId) : undefined
  if (!user) {
    return (
      <div className="gp-container pb-28 pt-6 md:pb-10">
        <div className="font-display text-2xl font-semibold">Orders</div>
        <div className="mt-8">
          <EmptyState
            icon={<LogIn size={20} />}
            title="Sign in to see orders"
            description="Track placed pickups, incoming cook requests, handoff codes, and messages after you sign in."
            action={
              <Link
                to="/login"
                state={{ from: '/orders' }}
                className="gp-focus inline-flex items-center justify-center rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-natural"
              >
                Sign in
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="font-display text-2xl font-semibold">Orders</div>
      <p className="mt-1 text-sm text-gp-charcoal/65">
        Placed orders are meals you reserved. Incoming orders are requests for plates you are cooking.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.04] p-1 ring-1 ring-black/5">
        <TabButton
          active={tab === 'placed'}
          onClick={() => setTab('placed')}
          label="Placed"
          activeCount={placedSplit.inProgress.length}
          finishedCount={placedSplit.finished.length}
          icon={<ShoppingBag size={16} aria-hidden />}
        />
        <TabButton
          active={tab === 'incoming'}
          onClick={() => setTab('incoming')}
          label="Incoming"
          activeCount={incomingSplit.inProgress.length}
          finishedCount={incomingSplit.finished.length}
          icon={<Inbox size={16} aria-hidden />}
        />
      </div>

      <div className="mt-6">
        {tabOrders.length ? (
          <OrderListSections
            inProgress={inProgress}
            finished={finished}
            tab={tab}
            plates={plates}
            messagesByOrderId={messagesByOrderId}
            settings={settings}
            onOpenMessages={setOpenMessagesFor}
            onUpdateStatus={onUpdateStatus}
            onCancel={onCancel}
            onLeaveReview={onLeaveReview}
            onSendMessage={onSendMessage}
          />
        ) : (
          <EmptyState
            icon={tab === 'placed' ? <Package size={20} /> : <Inbox size={20} />}
            title={tab === 'placed' ? 'No placed orders' : 'No incoming orders'}
            description={
              tab === 'placed'
                ? 'Reserve a plate from the marketplace and it will show up here with pickup details and status updates.'
                : 'When someone reserves one of your plates, the order appears here so you can prep and update progress.'
            }
          />
        )}
      </div>

      <Modal
        open={Boolean(activeOrder)}
        title={activeOrder ? `Chat about ${activeOrder.plateName}` : undefined}
        onClose={() => setOpenMessagesFor(null)}
        sheetOnMobile
      >
        {activeOrder && user ? (
          <OrderConversation
            key={activeOrder.id}
            thread={thread}
            viewerRole={messageRoleForOrder(activeOrder, user.id, activeOrderPlate)}
            peerLabel={messagePeerLabel(
              messageRoleForOrder(activeOrder, user.id, activeOrderPlate),
              activeOrderPlate,
            )}
            onSend={(body) => onSendMessage(activeOrder.id, body)}
            draftInputId={`orders-chat-${activeOrder.id}`}
            footer={
              <p className="text-center text-xs text-gp-charcoal/60">
                Status: <span className="font-semibold text-gp-charcoal">{activeOrder.status}</span>
              </p>
            }
          />
        ) : null}
      </Modal>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  activeCount,
  finishedCount,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  activeCount: number
  finishedCount: number
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gp-focus flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition sm:flex-row sm:gap-2 ${
        active ? 'bg-white text-gp-charcoal shadow-sm ring-1 ring-black/5' : 'text-gp-charcoal/60 hover:text-gp-charcoal'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
      </span>
      <span className="flex items-center gap-1">
        {activeCount > 0 ? (
          <span
            className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums ${
              active ? 'bg-gp-primary/15 text-gp-primary' : 'bg-gp-primary/10 text-gp-primary/80'
            }`}
            title="In progress"
          >
            {activeCount}
          </span>
        ) : null}
        {finishedCount > 0 ? (
          <span
            className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums ${
              active ? 'bg-black/6 text-gp-charcoal/55' : 'bg-black/5 text-gp-charcoal/45'
            }`}
            title="Finished"
          >
            {finishedCount}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function OrderListSections({
  inProgress,
  finished,
  tab,
  plates,
  messagesByOrderId,
  settings,
  onOpenMessages,
  onUpdateStatus,
  onCancel,
  onLeaveReview,
  onSendMessage,
}: {
  inProgress: Order[]
  finished: Order[]
  tab: OrderTab
  plates: Map<string, Plate>
  messagesByOrderId: Map<string, Message[]>
  settings: ReturnType<typeof useSettings>['settings']
  onOpenMessages: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onCancel: (orderId: string) => void
  onLeaveReview: (orderId: string) => void
  onSendMessage: (orderId: string, body: string) => void
}) {
  return (
    <div className="mt-6 space-y-8">
      <section aria-labelledby="orders-in-progress-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="orders-in-progress-heading" className="font-display text-lg font-semibold text-gp-charcoal">
            In progress
          </h2>
          <span className="rounded-full bg-gp-primary/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-gp-primary">
            {inProgress.length}
          </span>
        </div>
        {inProgress.length ? (
          <div className="mt-3 grid gap-3">
            {inProgress.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                plate={plates.get(o.plateId)}
                variant={tab}
                messagesByOrderId={messagesByOrderId}
                settings={settings}
                onOpenMessages={() => onOpenMessages(o.id)}
                onUpdateStatus={onUpdateStatus}
                onCancel={onCancel}
                onSendRunningLate={(orderId) => onSendMessage(orderId, RUNNING_LATE_TEMPLATE)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-white/60 px-4 py-5 text-center text-sm text-gp-charcoal/55 ring-1 ring-black/5">
            Nothing active right now — past orders appear below.
          </p>
        )}
      </section>

      {finished.length > 0 ? (
        <PastOrdersSection
          finished={finished}
          tab={tab}
          plates={plates}
          messagesByOrderId={messagesByOrderId}
          onOpenMessages={onOpenMessages}
          onLeaveReview={onLeaveReview}
        />
      ) : null}
    </div>
  )
}

function OrderCard({
  order: o,
  plate,
  variant,
  messagesByOrderId,
  settings,
  onOpenMessages,
  onUpdateStatus,
  onCancel,
  onSendRunningLate,
}: {
  order: Order
  plate: Plate | undefined
  variant: OrderTab
  messagesByOrderId: Map<string, Message[]>
  settings: ReturnType<typeof useSettings>['settings']
  onOpenMessages: () => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onCancel: (orderId: string) => void
  onSendRunningLate?: (orderId: string) => void
}) {
  const cancelled = o.status === 'Cancelled'
  const isIncoming = variant === 'incoming'
  const cookName = plate?.cook.name
  const showHandoffBanner = !isIncoming && !cancelled && o.handoffCode && (o.status === 'Ready' || o.status === 'Cooking')
  return (
    <article className="overflow-hidden rounded-[2rem] bg-gp-surface/80 shadow-natural ring-1 ring-black/5">
      {showHandoffBanner ? (
        <div className="border-b border-gp-primary/20 bg-gradient-to-r from-gp-primary/15 to-gp-secondary/10 px-4 py-4 sm:px-5 md:hidden">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/80 ring-1 ring-gp-primary/25">
              <KeyRound size={22} className="text-gp-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gp-primary">Pickup code</div>
              <div className="font-mono text-3xl font-bold tracking-[0.35em] text-gp-charcoal">{o.handoffCode}</div>
              <p className="mt-0.5 text-xs text-gp-charcoal/65">Show this to the cook at pickup</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          {plate ? (
            <img src={plate.images[0]} alt="" className="h-16 w-20 rounded-2xl object-cover ring-1 ring-black/10" />
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{o.plateName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isIncoming
                    ? 'bg-gp-secondary/10 text-gp-secondary ring-1 ring-gp-secondary/20'
                    : 'bg-gp-primary/10 text-gp-primary ring-1 ring-gp-primary/20'
                }`}
              >
                {isIncoming ? 'Incoming' : 'Placed'}
              </span>
            </div>
            {isIncoming && cookName ? (
              <div className="mt-1 text-xs text-gp-charcoal/55">Your listing · {cookName}</div>
            ) : cookName ? (
              <div className="mt-1 text-xs text-gp-charcoal/65">Cook · {cookName}</div>
            ) : null}
            <div className="mt-1 text-xs text-gp-charcoal/65">{o.pickupWindow}</div>
            <div className="mt-1 text-xs text-gp-charcoal/55">Ordered {new Date(o.createdAtIso).toLocaleString()}</div>
            {o.delivery ? (
              <div className="mt-1 text-xs font-semibold text-gp-secondary">
                Delivery (+{formatMoney(o.deliveryFeeCents ?? 0, settings.currency, settings.locale)})
              </div>
            ) : null}
            {o.tipCents ? (
              <div className="mt-1 text-xs font-semibold text-gp-primary">
                Tip {formatMoney(o.tipCents, settings.currency, settings.locale)}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-2xl px-3 py-1.5 text-xs font-semibold ring-1 ${statusStyle(o.status)}`}>
            {o.status}
          </span>
          {!isIncoming && o.handoffCode && !cancelled ? (
            <div className="rounded-2xl bg-gp-bg px-3 py-1.5 ring-1 ring-black/5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gp-charcoal/55">Pickup code</div>
              <div className="font-mono text-lg font-bold tracking-widest text-gp-charcoal">{o.handoffCode}</div>
            </div>
          ) : null}
        </div>
      </div>

      {!cancelled ? (
        <div className="border-t border-black/5 px-4 py-3 sm:px-5">
          <Timeline status={o.status} timeline={o.timeline} />
        </div>
      ) : null}

      {o.contactlessInstructions ? (
        <div className="border-t border-black/5 bg-gp-bg/40 px-4 py-3 text-xs text-gp-charcoal/75 sm:px-5">
          <span className="font-semibold text-gp-charcoal/85">Contactless note:</span> {o.contactlessInstructions}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-black/5 p-3 sm:p-4">
        {!cancelled && o.status !== 'Picked up' ? (
          <>
            {isIncoming && STATUS_FLOW.indexOf(o.status) < STATUS_FLOW.length - 1 ? (
              <Button
                variant="ghost"
                onClick={() => onUpdateStatus(o.id, nextStatus(o.status))}
                leftIcon={<Timer size={14} />}
              >
                Mark "{nextStatus(o.status)}"
              </Button>
            ) : null}
            {!isIncoming ? (
              <Button
                variant="ghost"
                onClick={() => {
                  if (
                    window.confirm(
                      `Cancel your reservation for "${o.plateName}"? The cook will be notified in this prototype.`,
                    )
                  ) {
                    onCancel(o.id)
                  }
                }}
                leftIcon={<X size={14} />}
              >
                Cancel
              </Button>
            ) : null}
            {isIncoming && onSendRunningLate ? (
              <Button
                variant="ghost"
                onClick={() => onSendRunningLate(o.id)}
                leftIcon={<Clock size={14} />}
              >
                Send running late
              </Button>
            ) : null}
          </>
        ) : null}

        <Button variant="ghost" onClick={onOpenMessages} leftIcon={<MessageCircle size={14} />}>
          Messages
          {messagesByOrderId.get(o.id)?.length ? (
            <span className="ml-1 rounded-full bg-gp-primary/10 px-1.5 text-[10px] font-semibold text-gp-primary">
              {messagesByOrderId.get(o.id)!.length}
            </span>
          ) : null}
        </Button>

      </div>
    </article>
  )
}

function Timeline({ status, timeline }: { status: OrderStatus; timeline?: Order['timeline'] }) {
  const idx = STATUS_FLOW.indexOf(status)
  return (
    <ol className="flex items-center justify-between gap-2">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1 ${
                done
                  ? 'bg-gp-secondary text-white ring-gp-secondary/30'
                  : 'bg-gp-bg text-gp-charcoal/40 ring-black/10'
              }`}
            >
              {done ? <Check size={12} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${done ? 'text-gp-charcoal' : 'text-gp-charcoal/55'}`}>{s}</div>
              {timeline?.[s] ? (
                <div className="text-[10px] text-gp-charcoal/50">
                  {new Date(timeline[s]!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : null}
            </div>
            {i < STATUS_FLOW.length - 1 ? (
              <div className={`mx-1 h-px flex-1 ${done && i < idx ? 'bg-gp-secondary/60' : 'bg-black/10'}`} />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function nextStatus(s: OrderStatus): OrderStatus {
  const i = STATUS_FLOW.indexOf(s)
  if (i < 0 || i >= STATUS_FLOW.length - 1) return s
  return STATUS_FLOW[i + 1]
}

function statusStyle(s: OrderStatus): string {
  switch (s) {
    case 'Reserved':
      return 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
    case 'Cooking':
      return 'bg-orange-100 text-orange-700 ring-orange-200'
    case 'Ready':
      return 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
    case 'Picked up':
      return 'bg-black/5 text-gp-charcoal/70 ring-black/10'
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    default:
      return 'bg-black/5 text-gp-charcoal/70 ring-black/10'
  }
}


