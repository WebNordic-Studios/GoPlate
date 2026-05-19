import { useEffect, useMemo, useRef } from 'react'
import { ChefHat, DollarSign, Eye, PencilLine, ShoppingBag, Sparkles, Star, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Order, Plate, User } from '../../types'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { useSettings } from '../../state/settings'
import { formatMoney } from '../../lib/format'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'

export function CookDashboardPage({
  user,
  plates,
  orders,
  views,
}: {
  user: User
  plates: Plate[]
  orders: Order[]
  views: Record<string, number>
}) {
  const navigate = useNavigate()
  const { settings } = useSettings()

  const myPlates = useMemo(() => plates.filter((p) => p.cook.id === user.id), [plates, user.id])
  const myPlateIds = useMemo(() => new Set(myPlates.map((p) => p.id)), [myPlates])
  const myOrders = useMemo(() => orders.filter((o) => myPlateIds.has(o.plateId)), [orders, myPlateIds])

  const stats = useMemo(() => {
    const platesSold = myOrders.filter((o) => o.status !== 'Cancelled').length
    const earningsCents = myOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((s, o) => s + o.priceCents + (o.tipCents ?? 0), 0)
    const totalViews = Object.entries(views).reduce(
      (s, [id, v]) => (myPlateIds.has(id) ? s + v : s),
      0,
    )
    const conversion = totalViews > 0 ? (platesSold / totalViews) * 100 : 0

    const perPlate = myPlates.map((p) => {
      const sold = myOrders.filter((o) => o.plateId === p.id && o.status !== 'Cancelled').length
      return {
        plate: p,
        sold,
        revenueCents: myOrders
          .filter((o) => o.plateId === p.id && o.status !== 'Cancelled')
          .reduce((s, o) => s + o.priceCents + (o.tipCents ?? 0), 0),
        views: views[p.id] ?? 0,
      }
    })

    const topDish = [...perPlate].sort((a, b) => b.sold - a.sold || b.views - a.views)[0]

    return {
      platesSold,
      earningsCents,
      totalViews,
      conversion,
      perPlate,
      topDish,
      draftCount: myPlates.filter((p) => p.isDraft).length,
    }
  }, [myPlates, myOrders, myPlateIds, views])

  const tableScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    return attachHorizontalWheelScroll(el)
  }, [])

  if (myPlates.length === 0) {
    return (
      <div className="gp-container pb-28 pt-6 md:pb-10">
        <div className="font-display text-2xl font-semibold">Cook dashboard</div>
        <p className="mt-1 text-sm text-gp-charcoal/65">Earnings, views, and conversion in one place.</p>
        <div className="mt-8">
          <EmptyState
            icon={<ChefHat size={20} />}
            title="No listings yet"
            description="Publish your first plate to unlock the dashboard."
            action={<Button variant="primary" onClick={() => navigate('/cook')}>Create</Button>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">Cook dashboard</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Earnings, plates sold, view-to-reserve conversion, and your top dish — calculated from local data.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/cook')}>
          List another plate
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<DollarSign size={18} />}
          label="Total earnings"
          value={formatMoney(stats.earningsCents, settings.currency, settings.locale)}
          tone="green"
        />
        <StatTile
          icon={<ShoppingBag size={18} />}
          label="Plates sold"
          value={String(stats.platesSold)}
        />
        <StatTile
          icon={<Eye size={18} />}
          label="Total views"
          value={String(stats.totalViews)}
        />
        <StatTile
          icon={<TrendingUp size={18} />}
          label="View → reserve"
          value={`${stats.conversion.toFixed(1)}%`}
          tone="orange"
        />
      </div>

      {stats.topDish ? (
        <div className="mt-6 rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">
            <Sparkles size={14} className="text-gp-primary" />
            Top dish
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <img
              src={stats.topDish.plate.images[0]}
              alt=""
              className="h-20 w-28 rounded-2xl object-cover ring-1 ring-black/10"
            />
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-semibold">{stats.topDish.plate.name}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gp-charcoal/70">
                <span>
                  Sold: <span className="font-semibold">{stats.topDish.sold}</span>
                </span>
                <span>
                  Views: <span className="font-semibold">{stats.topDish.views}</span>
                </span>
                <span>
                  Revenue:{' '}
                  <span className="font-semibold">
                    {formatMoney(stats.topDish.revenueCents, settings.currency, settings.locale)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="text-gp-primary" fill="currentColor" />
                  <span className="font-semibold">{stats.topDish.plate.rating.toFixed(1)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="font-display text-lg font-semibold">All your listings</div>
        <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div ref={tableScrollRef} className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gp-surface text-xs uppercase tracking-wide text-gp-charcoal/55">
              <tr>
                <th className="px-4 py-3 text-left">Plate</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-right">Conv.</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-gp-surface/80">
              {stats.perPlate.map(({ plate, sold, views, revenueCents }) => {
                const conv = views > 0 ? ((sold / views) * 100).toFixed(1) : '—'
                return (
                  <tr key={plate.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={plate.images[0]} alt="" className="h-10 w-12 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{plate.name}</div>
                          <div className="text-xs text-gp-charcoal/60">{plate.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{views}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{sold}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{conv === '—' ? '—' : `${conv}%`}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatMoney(revenueCents, settings.currency, settings.locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {plate.isDraft ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                          {plate.scheduledPublishAtIso ? 'Scheduled' : 'Draft'}
                        </span>
                      ) : plate.portionsAvailable <= 0 ? (
                        <span className="inline-flex items-center rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-gp-charcoal/70">
                          Sold out
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gp-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-gp-secondary ring-1 ring-gp-secondary/20">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/cook/edit/${plate.id}`)}
                        className="gp-focus inline-flex items-center gap-1 rounded-xl bg-gp-bg px-2.5 py-1.5 text-xs font-semibold text-gp-charcoal ring-1 ring-black/10 hover:bg-black/5"
                      >
                        <PencilLine size={14} aria-hidden />
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'green' | 'orange'
}) {
  const accent =
    tone === 'green'
      ? 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
      : tone === 'orange'
        ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
        : 'bg-black/5 text-gp-charcoal/70 ring-black/10'
  return (
    <div className="rounded-2xl bg-gp-surface/80 p-4 shadow-natural ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-2xl ring-1 ${accent}`}>{icon}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">{label}</div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}
