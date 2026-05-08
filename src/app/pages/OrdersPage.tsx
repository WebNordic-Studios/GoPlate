import type { Order } from '../../types'

export function OrdersPage({ orders }: { orders: Order[] }) {
  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="font-display text-2xl font-semibold">Orders</div>
      <div className="mt-1 text-sm text-gp-charcoal/65">Your recent reservations (mock checkout flow).</div>

      <div className="mt-6 grid gap-3">
        {orders.length ? (
          orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 shadow-natural ring-1 ring-black/5"
            >
              <div>
                <div className="text-sm font-semibold">{o.plateName}</div>
                <div className="mt-1 text-xs text-gp-charcoal/65">{o.pickupWindow}</div>
                <div className="mt-1 text-xs text-gp-charcoal/55">
                  {new Date(o.createdAtIso).toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-gp-secondary/10 px-3 py-2 text-xs font-semibold text-gp-secondary">
                {o.status}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white/70 p-6 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
            No orders yet. Reserve a plate from the marketplace to see it appear here.
          </div>
        )}
      </div>
    </div>
  )
}

