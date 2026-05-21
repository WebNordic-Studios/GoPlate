import { Banknote, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order, User } from '../../types'
import { formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { Button } from '../../ui/Button'

export function PayoutsPage({
  user: _user,
  orders,
  plateIds,
}: {
  user: User
  orders: Order[]
  plateIds: Set<string>
}) {
  const { settings } = useSettings()
  const myOrders = orders.filter((o) => plateIds.has(o.plateId) && o.status !== 'Cancelled')
  const earningsCents = myOrders.reduce(
    (s, o) => s + (o.subtotalCents ?? o.priceCents * (o.quantity ?? 1)) + (o.tipCents ?? 0),
    0,
  )
  const pendingCents = myOrders
    .filter((o) => o.status !== 'Picked up')
    .reduce((s, o) => s + (o.subtotalCents ?? o.priceCents * (o.quantity ?? 1)), 0)

  return (
    <div className="gp-container max-w-2xl pb-28 pt-6 md:pb-10">
      <h1 className="font-display text-2xl font-semibold">Payouts</h1>
      <p className="mt-1 text-sm text-gp-charcoal/65">
        Connect a bank account to receive earnings. This page is a prototype — no real transfers occur.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat label="Available (mock)" value={formatMoney(earningsCents, settings.currency, settings.locale)} />
        <Stat label="Pending pickup" value={formatMoney(pendingCents, settings.currency, settings.locale)} />
      </div>

      <div className="mt-6 rounded-[2rem] border border-dashed border-gp-primary/30 bg-gp-primary/5 p-6">
        <div className="flex items-center gap-2 font-semibold text-gp-charcoal">
          <Banknote size={20} className="text-gp-primary" aria-hidden />
          Payout account
        </div>
        <p className="mt-2 text-sm text-gp-charcoal/70">
          Status: <span className="font-semibold">Not connected</span> — Stripe Connect (or similar) will link here.
        </p>
        <Button variant="primary" className="mt-4" disabled title="Available when payments go live">
          Connect bank (coming soon)
        </Button>
      </div>

      <div className="mt-6 rounded-[2rem] bg-gp-surface/80 p-5 ring-1 ring-black/5">
        <div className="text-sm font-semibold text-gp-charcoal">Recent earnings activity</div>
        {myOrders.length === 0 ? (
          <p className="mt-2 text-sm text-gp-charcoal/55">No completed or in-progress orders yet.</p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {myOrders.slice(0, 12).map((o) => (
              <li key={o.id} className="flex justify-between gap-2 border-b border-black/5 py-2">
                <span className="truncate font-medium">{o.plateName}</span>
                <span className="shrink-0 tabular-nums text-gp-charcoal/70">
                  {formatMoney(
                    (o.subtotalCents ?? o.priceCents) + (o.tipCents ?? 0),
                    settings.currency,
                    settings.locale,
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-sm">
        <Link to="/me?tab=analytics" className="inline-flex items-center gap-1 font-semibold text-gp-primary hover:underline">
          Profile analytics <ExternalLink size={14} aria-hidden />
        </Link>
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gp-surface/80 p-4 ring-1 ring-black/5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  )
}
