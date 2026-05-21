import { Check, CheckCircle2, History, MessageCircle, Package, RefreshCw, Star, X, XCircle } from 'lucide-react'
import type { Message, Order, Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { Button } from '../../ui/Button'

type OrderTab = 'placed' | 'incoming'

export function PastOrdersSection({
  finished,
  tab,
  plates,
  messagesByOrderId,
  onOpenMessages,
  onLeaveReview,
  onReorder,
}: {
  finished: Order[]
  tab: OrderTab
  plates: Map<string, Plate>
  messagesByOrderId: Map<string, Message[]>
  onOpenMessages: (orderId: string) => void
  onLeaveReview: (orderId: string) => void
  onReorder?: (plateId: string) => void
}) {
  const completed = finished.filter((o) => o.status === 'Picked up')
  const cancelled = finished.filter((o) => o.status === 'Cancelled')

  return (
    <section aria-labelledby="orders-past-heading" className="border-t border-black/10 pt-8">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="orders-past-heading"
          className="flex items-center gap-2 font-display text-lg font-semibold text-gp-charcoal"
        >
          <History size={18} className="text-gp-charcoal/45" aria-hidden />
          Past orders
        </h2>
        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold tabular-nums text-gp-charcoal/55">
          {finished.length}
        </span>
      </div>

      {completed.length > 0 ? (
        <PastOrderGroup
          label="Completed"
          orders={completed}
          tab={tab}
          plates={plates}
          messagesByOrderId={messagesByOrderId}
          onOpenMessages={onOpenMessages}
          onLeaveReview={onLeaveReview}
          onReorder={onReorder}
        />
      ) : null}

      {cancelled.length > 0 ? (
        <PastOrderGroup
          label="Cancelled"
          orders={cancelled}
          tab={tab}
          plates={plates}
          messagesByOrderId={messagesByOrderId}
          onOpenMessages={onOpenMessages}
          onLeaveReview={onLeaveReview}
          onReorder={onReorder}
          className={completed.length > 0 ? 'mt-6' : 'mt-5'}
        />
      ) : null}
    </section>
  )
}

function PastOrderGroup({
  label,
  orders,
  tab,
  plates,
  messagesByOrderId,
  onOpenMessages,
  onLeaveReview,
  onReorder,
  className = 'mt-5',
}: {
  label: string
  orders: Order[]
  tab: OrderTab
  plates: Map<string, Plate>
  messagesByOrderId: Map<string, Message[]>
  onOpenMessages: (orderId: string) => void
  onLeaveReview: (orderId: string) => void
  onReorder?: (plateId: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/45">{label}</h3>
      <ul className="mt-2 space-y-2">
        {orders.map((o) => (
          <li key={o.id}>
            <FinishedOrderCard
              order={o}
              plate={plates.get(o.plateId)}
              variant={tab}
              messagesByOrderId={messagesByOrderId}
              onOpenMessages={() => onOpenMessages(o.id)}
              onLeaveReview={onLeaveReview}
              onReorder={onReorder}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FinishedOrderCard({
  order: o,
  plate,
  variant,
  messagesByOrderId,
  onOpenMessages,
  onLeaveReview,
  onReorder,
}: {
  order: Order
  plate: Plate | undefined
  variant: OrderTab
  messagesByOrderId: Map<string, Message[]>
  onOpenMessages: () => void
  onLeaveReview: (orderId: string) => void
  onReorder?: (plateId: string) => void
}) {
  const { settings } = useSettings()
  const cancelled = o.status === 'Cancelled'
  const isIncoming = variant === 'incoming'
  const cookName = plate?.cook.name
  const closedAt = (o.timeline?.[o.status] ?? o.createdAtIso) as string
  const msgCount = messagesByOrderId.get(o.id)?.length ?? 0
  const totalCents = o.priceCents + (o.deliveryFeeCents ?? 0) + (o.tipCents ?? 0)
  const pickedUpAt = o.timeline?.['Picked up']

  return (
    <article
      className={`overflow-hidden rounded-2xl ring-1 ${
        cancelled
          ? 'bg-rose-50/75 ring-rose-200/55'
          : 'bg-gp-secondary/[0.07] ring-gp-secondary/20'
      }`}
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="relative shrink-0">
          {plate ? (
            <img
              src={plate.images[0]}
              alt=""
              className={`h-14 w-14 rounded-xl object-cover ring-1 ring-black/10 ${cancelled ? 'opacity-75' : ''}`}
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-gp-bg ring-1 ring-black/10">
              <Package size={20} className="text-gp-charcoal/30" aria-hidden />
            </div>
          )}
          <span
            className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full ring-2 ring-white ${
              cancelled ? 'bg-rose-200/90 text-rose-800' : 'bg-gp-secondary text-white'
            }`}
            aria-hidden
          >
            {cancelled ? <X size={12} strokeWidth={2.5} /> : <Check size={12} strokeWidth={2.5} />}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gp-charcoal">{o.plateName}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <OutcomeChip cancelled={cancelled} />
                <span className="text-xs text-gp-charcoal/50">·</span>
                <span className="text-xs text-gp-charcoal/55">{formatClosedDate(closedAt)}</span>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-gp-charcoal/70">
              {formatMoney(totalCents, settings.currency, settings.locale)}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-1 text-xs text-gp-charcoal/55">
            {isIncoming ? 'Sold on your listing' : cookName ? `From ${cookName}` : 'Placed order'}
            {o.pickupWindow ? ` · ${o.pickupWindow}` : ''}
          </p>

          {!cancelled && pickedUpAt ? (
            <p className="mt-1 text-[11px] text-gp-charcoal/45">Picked up {formatClosedDateTime(pickedUpAt)}</p>
          ) : null}
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 border-t px-3 py-2 sm:px-4 ${
          cancelled ? 'border-rose-200/50 bg-rose-100/35' : 'border-gp-secondary/15 bg-gp-secondary/[0.05]'
        }`}
      >
        <Button
          variant="ghost"
          onClick={onOpenMessages}
          leftIcon={<MessageCircle size={14} />}
          className="!py-1.5 !text-xs"
        >
          Messages
          {msgCount > 0 ? (
            <span className="ml-1 rounded-full bg-gp-primary/10 px-1.5 text-[10px] font-semibold text-gp-primary">
              {msgCount}
            </span>
          ) : null}
        </Button>

        {!isIncoming && !cancelled && !o.reviewed ? (
          <Button
            variant="secondary"
            onClick={() => onLeaveReview(o.id)}
            leftIcon={<Star size={14} />}
            className="!py-1.5 !text-xs"
          >
            Rate plate
          </Button>
        ) : null}
        {!isIncoming && !cancelled && o.reviewed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gp-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-gp-secondary">
            <CheckCircle2 size={12} aria-hidden />
            Reviewed
          </span>
        ) : null}
        {!isIncoming && !cancelled && onReorder ? (
          <Button
            variant="ghost"
            onClick={() => onReorder(o.plateId)}
            leftIcon={<RefreshCw size={14} />}
            className="!py-1.5 !text-xs"
          >
            Order again
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function OutcomeChip({ cancelled }: { cancelled: boolean }) {
  if (cancelled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/90 px-2 py-0.5 text-[10px] font-semibold text-rose-800 ring-1 ring-rose-200/60">
        <XCircle size={11} aria-hidden />
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gp-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-gp-secondary ring-1 ring-gp-secondary/15">
      <CheckCircle2 size={11} aria-hidden />
      Picked up
    </span>
  )
}

function formatClosedDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatClosedDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
