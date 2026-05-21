import { CheckCircle2, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order, Plate } from '../../types'
import { Button } from '../../ui/Button'
import { formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { CancellationPolicyCard } from '../components/CancellationPolicyCard'

export function OrderConfirmedPage({
  order,
  plate,
}: {
  order: Order
  plate: Plate | undefined
}) {
  const { settings } = useSettings()
  const qty = order.quantity ?? 1
  const subtotal = order.subtotalCents ?? order.priceCents * qty
  const total =
    subtotal + (order.deliveryFeeCents ?? 0) + (order.tipCents ?? 0)

  return (
    <div className="gp-container max-w-xl pb-28 pt-10 md:pb-12">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gp-secondary/15 text-gp-secondary">
          <CheckCircle2 size={36} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-gp-charcoal">Reservation confirmed</h1>
        <p className="mt-2 text-sm text-gp-charcoal/65">
          {qty > 1 ? `${qty} portions · ` : ''}
          {order.plateName} · {order.pickupWindow}
        </p>
      </div>

      <div className="mt-8 space-y-4 rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
        <div className="flex justify-between text-sm">
          <span className="text-gp-charcoal/60">Total</span>
          <span className="font-semibold">{formatMoney(total, settings.currency, settings.locale)}</span>
        </div>
        {order.handoffCode ? (
          <div className="rounded-2xl bg-gp-bg px-4 py-3 ring-1 ring-black/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gp-charcoal/50">Pickup code</div>
            <div className="font-mono text-2xl font-bold tracking-[0.35em] text-gp-charcoal">{order.handoffCode}</div>
            <p className="mt-1 text-xs text-gp-charcoal/55">Show this when status is Ready.</p>
          </div>
        ) : null}
        {order.pickupAddressLine ? (
          <div className="rounded-2xl bg-gp-primary/10 px-4 py-3 ring-1 ring-gp-primary/20">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gp-primary">
              <MapPin size={14} aria-hidden />
              {order.delivery ? 'Delivery handoff' : 'Pickup location'}
            </div>
            <p className="mt-2 text-sm font-semibold text-gp-charcoal">{order.pickupAddressLine}</p>
            {order.pickupInstructions ? (
              <p className="mt-1 text-xs text-gp-charcoal/70">{order.pickupInstructions}</p>
            ) : null}
          </div>
        ) : null}
        {plate ? (
          <p className="text-xs text-gp-charcoal/55">
            Cook: <span className="font-semibold">{plate.cook.name}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <CancellationPolicyCard compact />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link to={`/orders/${order.id}`}>
          <Button variant="primary" className="w-full sm:w-auto">
            View order details
          </Button>
        </Link>
        <Link to={`/orders?chat=${order.id}`}>
          <Button variant="ghost" className="w-full sm:w-auto" leftIcon={<MessageCircle size={16} />}>
            Message cook
          </Button>
        </Link>
      </div>
    </div>
  )
}
