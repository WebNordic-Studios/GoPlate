import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  RefreshCw,
  Star,
  UserRound,
} from 'lucide-react'
import type { Message, Order, Plate } from '../../types'
import { Button } from '../../ui/Button'
import { formatMoney, timeAgo } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { CancellationPolicyCard } from '../components/CancellationPolicyCard'
import { OrderConversation } from '../components/OrderConversation'
import { isIncomingOrder, isOrderFinished, messagePeerLabel, messageRoleForOrder } from '../lib/orderRoles'

export function OrderDetailPage({
  order,
  plate,
  thread,
  userId,
  onCancel,
  onDecline,
  onUpdateStatus,
  onSendMessage,
  onReorder,
  onLeaveReview,
}: {
  order: Order
  plate: Plate | undefined
  thread: Message[]
  userId: string
  onCancel: () => void
  onDecline: () => void
  onUpdateStatus: (status: Order['status']) => void
  onSendMessage: (body: string) => void
  onReorder: () => void
  onLeaveReview?: () => void
}) {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const incoming = isIncomingOrder(order, plate, userId)
  const viewerRole = messageRoleForOrder(order, userId, plate)
  const peerLabel = messagePeerLabel(viewerRole, plate)
  const qty = order.quantity ?? 1
  const subtotal = order.subtotalCents ?? order.priceCents * qty
  const total = subtotal + (order.deliveryFeeCents ?? 0) + (order.tipCents ?? 0)
  const finished = isOrderFinished(order.status)
  const canBuyerCancel = !incoming && order.status === 'Reserved'
  const canCookDecline = incoming && order.status === 'Reserved'

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="gp-focus mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gp-charcoal/70 hover:text-gp-charcoal"
      >
        <ArrowLeft size={16} aria-hidden />
        All orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{order.plateName}</h1>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            {qty > 1 ? `${qty} portions · ` : ''}
            {order.pickupWindow} · Placed {timeAgo(order.createdAtIso)}
          </p>
          <span className="mt-2 inline-block rounded-2xl bg-gp-bg px-3 py-1 text-xs font-semibold ring-1 ring-black/10">
            {order.status}
            {order.cancelledBy ? ` · ${order.cancelledBy === 'cook' ? 'Declined by cook' : 'Cancelled by you'}` : ''}
          </span>
        </div>
        <div className="text-right text-sm">
          <div className="text-gp-charcoal/55">Total</div>
          <div className="font-display text-xl font-semibold">
            {formatMoney(total, settings.currency, settings.locale)}
          </div>
        </div>
      </div>

      {order.cancelReason ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200">
          <span className="font-semibold">Note:</span> {order.cancelReason}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {!order.delivery && order.handoffCode && !finished ? (
            <div className="rounded-[2rem] bg-gp-primary/10 p-5 ring-1 ring-gp-primary/25">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gp-primary">Pickup code</div>
              <div className="font-mono text-3xl font-bold tracking-[0.35em] text-gp-charcoal">{order.handoffCode}</div>
            </div>
          ) : null}

          {order.pickupAddressLine ? (
            <div className="rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gp-charcoal">
                <MapPin size={18} className="text-gp-primary" aria-hidden />
                {order.delivery ? 'Delivery' : 'Pickup'} details
              </div>
              <p className="mt-2 text-sm font-medium text-gp-charcoal">{order.pickupAddressLine}</p>
              {order.pickupInstructions ? (
                <p className="mt-1 text-sm text-gp-charcoal/65">{order.pickupInstructions}</p>
              ) : null}
              {order.contactlessInstructions ? (
                <p className="mt-2 text-xs text-gp-charcoal/55">
                  <span className="font-semibold">Your note:</span> {order.contactlessInstructions}
                </p>
              ) : null}
            </div>
          ) : null}

          <CancellationPolicyCard compact />

          <div className="flex flex-wrap gap-2">
            {canBuyerCancel ? (
              <Button variant="ghost" onClick={onCancel}>
                Cancel reservation
              </Button>
            ) : null}
            {canCookDecline ? (
              <Button variant="ghost" onClick={onDecline}>
                Decline order
              </Button>
            ) : null}
            {incoming && order.status !== 'Picked up' && order.status !== 'Cancelled' ? (
              <Button variant="ghost" onClick={() => onUpdateStatus(nextStatus(order.status))}>
                Mark {nextStatus(order.status)}
              </Button>
            ) : null}
            {order.status === 'Picked up' && !order.reviewed && !incoming && onLeaveReview ? (
              <Button variant="secondary" onClick={onLeaveReview} leftIcon={<Star size={14} />}>
                Leave review
              </Button>
            ) : null}
            {plate && plate.portionsAvailable > 0 && !plate.isDraft ? (
              <Button variant="ghost" onClick={onReorder} leftIcon={<RefreshCw size={14} />}>
                Order again
              </Button>
            ) : null}
            {plate ? (
              <Link to={`/cooks/${plate.cook.id}`}>
                <Button variant="ghost" leftIcon={<UserRound size={14} />}>
                  Cook profile
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-[22rem] flex-col overflow-hidden rounded-[2rem] bg-gp-surface/80 shadow-natural ring-1 ring-black/5">
          <div className="border-b border-black/5 px-4 py-3 text-sm font-semibold text-gp-charcoal">
            <MessageCircle size={16} className="mr-1 inline text-gp-primary" aria-hidden />
            Conversation with {peerLabel}
          </div>
          <OrderConversation
            thread={thread}
            viewerRole={viewerRole}
            peerLabel={peerLabel}
            onSend={onSendMessage}
            draftInputId={`order-detail-${order.id}`}
          />
        </div>
      </div>
    </div>
  )
}

const FLOW: Order['status'][] = ['Reserved', 'Cooking', 'Ready', 'Picked up']

function nextStatus(current: Order['status']): Order['status'] {
  const i = FLOW.indexOf(current)
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1]! : current
}
