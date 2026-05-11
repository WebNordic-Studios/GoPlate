import { useState } from 'react'
import { ChefHat, Check, MessageCircle, Package, Send, Star, Timer, X } from 'lucide-react'
import type { Message, Order, OrderStatus, Plate } from '../../types'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { EmptyState } from '../../ui/EmptyState'
import { useSettings } from '../../state/settings'
import { formatMoney, timeAgo } from '../../lib/format'

const STATUS_FLOW: OrderStatus[] = ['Reserved', 'Cooking', 'Ready', 'Picked up']

export function OrdersPage({
  orders,
  plates,
  messagesByOrderId,
  onSendMessage,
  onUpdateStatus,
  onCancel,
  onLeaveReview,
}: {
  orders: Order[]
  plates: Map<string, Plate>
  messagesByOrderId: Map<string, Message[]>
  onSendMessage: (orderId: string, from: 'buyer' | 'cook', body: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onCancel: (orderId: string) => void
  onLeaveReview: (orderId: string) => void
}) {
  const [openMessagesFor, setOpenMessagesFor] = useState<string | null>(null)
  const { settings } = useSettings()

  const activeOrder = openMessagesFor ? orders.find((o) => o.id === openMessagesFor) ?? null : null
  const thread = activeOrder ? messagesByOrderId.get(activeOrder.id) ?? [] : []

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="font-display text-2xl font-semibold">Orders</div>
      <div className="mt-1 text-sm text-gp-charcoal/65">
        Track each order through Reserved → Cooking → Ready → Picked up. Tap the code at pickup so the cook can confirm.
      </div>

      <div className="mt-6 grid gap-3">
        {orders.length ? (
          orders.map((o) => {
            const plate = plates.get(o.plateId)
            const cancelled = o.status === 'Cancelled'
            return (
              <article
                key={o.id}
                className="overflow-hidden rounded-[2rem] bg-gp-surface/80 shadow-natural ring-1 ring-black/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-3">
                    {plate ? (
                      <img
                        src={plate.images[0]}
                        alt=""
                        className="h-16 w-20 rounded-2xl object-cover ring-1 ring-black/10"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{o.plateName}</div>
                      <div className="mt-1 text-xs text-gp-charcoal/65">{o.pickupWindow}</div>
                      <div className="mt-1 text-xs text-gp-charcoal/55">
                        Ordered {new Date(o.createdAtIso).toLocaleString()}
                      </div>
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
                    <span
                      className={`rounded-2xl px-3 py-1.5 text-xs font-semibold ring-1 ${statusStyle(o.status)}`}
                    >
                      {o.status}
                    </span>
                    {o.handoffCode && !cancelled ? (
                      <div className="rounded-2xl bg-gp-bg px-3 py-1.5 ring-1 ring-black/5">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-gp-charcoal/55">
                          Pickup code
                        </div>
                        <div className="font-mono text-lg font-bold tracking-widest text-gp-charcoal">
                          {o.handoffCode}
                        </div>
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
                      {STATUS_FLOW.indexOf(o.status) < STATUS_FLOW.length - 1 ? (
                        <Button
                          variant="ghost"
                          onClick={() => onUpdateStatus(o.id, nextStatus(o.status))}
                          leftIcon={<Timer size={14} />}
                        >
                          Mark "{nextStatus(o.status)}"
                        </Button>
                      ) : null}
                      <Button variant="ghost" onClick={() => onCancel(o.id)} leftIcon={<X size={14} />}>
                        Cancel
                      </Button>
                    </>
                  ) : null}

                  <Button
                    variant="ghost"
                    onClick={() => setOpenMessagesFor(o.id)}
                    leftIcon={<MessageCircle size={14} />}
                  >
                    Messages
                    {messagesByOrderId.get(o.id)?.length ? (
                      <span className="ml-1 rounded-full bg-gp-primary/10 px-1.5 text-[10px] font-semibold text-gp-primary">
                        {messagesByOrderId.get(o.id)!.length}
                      </span>
                    ) : null}
                  </Button>

                  {o.status === 'Picked up' && !o.reviewed ? (
                    <Button
                      variant="secondary"
                      onClick={() => onLeaveReview(o.id)}
                      leftIcon={<Star size={14} />}
                    >
                      Rate your plate
                    </Button>
                  ) : null}
                  {o.reviewed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gp-secondary/10 px-3 py-1.5 text-xs font-semibold text-gp-secondary ring-1 ring-gp-secondary/20">
                      <Check size={12} /> Reviewed
                    </span>
                  ) : null}
                </div>
              </article>
            )
          })
        ) : (
          <EmptyState
            icon={<Package size={20} />}
            title="No orders yet"
            description="Reserve a plate from the marketplace and it'll show up here with a live status timeline."
          />
        )}
      </div>

      <Modal
        open={Boolean(activeOrder)}
        title={activeOrder ? `Chat about ${activeOrder.plateName}` : undefined}
        onClose={() => setOpenMessagesFor(null)}
      >
        {activeOrder ? (
          <MessagesPane
            order={activeOrder}
            thread={thread}
            onSend={(from, body) => onSendMessage(activeOrder.id, from, body)}
          />
        ) : null}
      </Modal>
    </div>
  )
}

function MessagesPane({
  order,
  thread,
  onSend,
}: {
  order: Order
  thread: Message[]
  onSend: (from: 'buyer' | 'cook', body: string) => void
}) {
  const [body, setBody] = useState('')
  const [from, setFrom] = useState<'buyer' | 'cook'>('buyer')

  function submit() {
    if (!body.trim()) return
    onSend(from, body.trim())
    setBody('')
  }

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-black/5 px-5 py-3">
        <div className="text-xs text-gp-charcoal/65">
          Status: <span className="font-semibold text-gp-charcoal">{order.status}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-gp-bg p-1 text-xs font-semibold ring-1 ring-black/5">
          {(['buyer', 'cook'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFrom(r)}
              className={`gp-focus rounded-full px-3 py-1 transition ${
                from === r ? 'bg-gp-surface text-gp-charcoal shadow-sm' : 'text-gp-charcoal/60'
              }`}
            >
              {r === 'buyer' ? 'You (buyer)' : 'Cook'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-5">
        {thread.length === 0 ? (
          <div className="grid h-full place-items-center">
            <div className="text-center text-sm text-gp-charcoal/60">
              <ChefHat className="mx-auto h-8 w-8 text-gp-charcoal/30" aria-hidden />
              <p className="mt-2">Start a thread about pickup details, allergens, or substitutions.</p>
            </div>
          </div>
        ) : (
          thread.map((m) => {
            const own = m.from === from
            return (
              <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ring-1 ${
                    own
                      ? 'bg-gp-primary text-white ring-gp-primary/30'
                      : 'bg-gp-surface text-gp-charcoal ring-black/10'
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase opacity-70">{m.from}</div>
                  <div className="whitespace-pre-wrap">{m.body}</div>
                  <div className="mt-1 text-[10px] opacity-70">{timeAgo(m.createdAtIso)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-black/5 p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Message as ${from}…`}
            className="gp-focus min-w-0 flex-1 rounded-2xl bg-gp-surface px-3 py-2.5 text-sm ring-1 ring-black/5"
          />
          <Button variant="primary" type="submit" leftIcon={<Send size={14} />}>
            Send
          </Button>
        </form>
      </div>
    </div>
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
              {timeline?.[s] ? <div className="text-[10px] text-gp-charcoal/50">{new Date(timeline[s]!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div> : null}
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
