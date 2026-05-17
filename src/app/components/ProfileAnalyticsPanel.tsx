import {
  BarChart3,
  ChefHat,
  DollarSign,
  Eye,
  Inbox,
  ShoppingBag,
  Star,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order, Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { computeProfileAnalytics, hasProfileActivity } from '../lib/profileAnalytics'
import { useSettings } from '../../state/settings'
import { Button } from '../../ui/Button'

export function ProfileAnalyticsPanel({
  userId,
  orders,
  plates,
  views,
}: {
  userId: string
  orders: Order[]
  plates: Plate[]
  views: Record<string, number>
}) {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const stats = useMemo(
    () => computeProfileAnalytics(userId, orders, plates, views),
    [userId, orders, plates, views],
  )
  const fmt = (cents: number) => formatMoney(cents, settings.currency, settings.locale)
  const active = hasProfileActivity(stats)

  if (!active) {
    return (
      <div className="mt-5 rounded-[2rem] bg-white/70 p-8 text-center shadow-natural ring-1 ring-black/5">
        <BarChart3 className="mx-auto h-10 w-10 text-gp-charcoal/25" aria-hidden />
        <p className="mt-3 font-display text-lg font-semibold text-gp-charcoal">No activity yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gp-charcoal/65">
          Reserve a plate or publish a listing — your orders, revenue, and listing stats will show up here.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="primary" onClick={() => navigate('/')}>
            Browse marketplace
          </Button>
          <Button variant="ghost" onClick={() => navigate('/cook')}>
            Create a plate
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<DollarSign size={18} />}
          label="Cook revenue"
          value={fmt(stats.cook.revenueCents)}
          tone="green"
          hint={`${stats.cook.tipsReceivedCents > 0 ? `${fmt(stats.cook.tipsReceivedCents)} in tips` : 'From incoming orders'}`}
        />
        <StatTile
          icon={<ShoppingBag size={18} />}
          label="Total spent"
          value={fmt(stats.buyer.spentCents)}
          tone="primary"
          hint={`${stats.buyer.placed} order${stats.buyer.placed === 1 ? '' : 's'} placed`}
        />
        <StatTile
          icon={<Inbox size={18} />}
          label="Orders received"
          value={String(stats.cook.received)}
          hint={`${stats.cook.completed} completed · ${stats.cook.inProgress} active`}
        />
        <StatTile
          icon={<UtensilsCrossed size={18} />}
          label="Dishes posted"
          value={String(stats.listings.total)}
          hint={`${stats.listings.live} live · ${stats.listings.draft} draft`}
        />
      </div>

      <section aria-labelledby="analytics-buyer-heading">
        <SectionHeading id="analytics-buyer-heading" icon={<ShoppingBag size={18} />} title="As a buyer" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Orders placed" value={String(stats.buyer.placed)} />
          <MiniStat label="In progress" value={String(stats.buyer.inProgress)} />
          <MiniStat label="Completed" value={String(stats.buyer.completed)} />
          <MiniStat label="Cancelled" value={String(stats.buyer.cancelled)} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Food & delivery spend" value={fmt(stats.buyer.spentCents)} />
          <DetailRow
            label="Tips left for cooks"
            value={stats.buyer.tipsGivenCents > 0 ? fmt(stats.buyer.tipsGivenCents) : '—'}
          />
          <DetailRow label="Reviews written" value={String(stats.buyer.reviewsLeft)} />
        </div>
      </section>

      <section aria-labelledby="analytics-cook-heading">
        <SectionHeading id="analytics-cook-heading" icon={<ChefHat size={18} />} title="As a cook" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Orders received" value={String(stats.cook.received)} />
          <MiniStat label="Plates sold" value={String(stats.cook.platesSold)} />
          <MiniStat label="In progress" value={String(stats.cook.inProgress)} />
          <MiniStat label="Completed pickups" value={String(stats.cook.completed)} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Gross revenue" value={fmt(stats.cook.revenueCents)} emphasize />
          <DetailRow
            label="Tips received"
            value={stats.cook.tipsReceivedCents > 0 ? fmt(stats.cook.tipsReceivedCents) : '—'}
          />
        </div>
        {stats.listings.total > 0 ? (
          <div className="mt-4">
            <Button variant="ghost" onClick={() => navigate('/cook/dashboard')}>
              Open cook dashboard
            </Button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="analytics-listings-heading">
        <SectionHeading id="analytics-listings-heading" icon={<Eye size={18} />} title="Your listings" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Live" value={String(stats.listings.live)} />
          <MiniStat label="Drafts" value={String(stats.listings.draft)} />
          <MiniStat label="Sold out" value={String(stats.listings.soldOut)} />
          <MiniStat label="Listing views" value={String(stats.listings.totalViews)} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <StatTile
            icon={<TrendingUp size={18} />}
            label="View → reserve"
            value={`${stats.listings.conversionPct.toFixed(1)}%`}
            tone="orange"
          />
          <StatTile
            icon={<Star size={18} />}
            label="Avg. dish rating"
            value={stats.listings.ratedListingCount > 0 ? stats.listings.avgRating.toFixed(1) : '—'}
            hint={
              stats.listings.ratedListingCount > 0
                ? `Across ${stats.listings.ratedListingCount} rated listing${stats.listings.ratedListingCount === 1 ? '' : 's'}`
                : 'No ratings yet'
            }
          />
        </div>
      </section>

      <p className="text-xs text-gp-charcoal/50">
        Stats are calculated from orders and listings stored on this device. Revenue excludes cancelled orders.
      </p>
    </div>
  )
}

function SectionHeading({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h3 id={id} className="flex items-center gap-2 font-display text-lg font-semibold text-gp-charcoal">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gp-primary/10 text-gp-primary">{icon}</span>
      {title}
    </h3>
  )
}

function StatTile({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  tone?: 'green' | 'orange' | 'primary'
}) {
  const accent =
    tone === 'green'
      ? 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
      : tone === 'orange'
        ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
        : tone === 'primary'
          ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
          : 'bg-black/5 text-gp-charcoal/70 ring-black/10'
  return (
    <div className="rounded-2xl bg-gp-surface/80 p-4 shadow-natural ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-2xl ring-1 ${accent}`}>{icon}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">{label}</div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <p className="mt-1 text-xs text-gp-charcoal/55">{hint}</p> : null}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-black/5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gp-charcoal/50">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function DetailRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-black/5">
      <span className="text-sm text-gp-charcoal/65">{label}</span>
      <span className={`tabular-nums ${emphasize ? 'font-display text-lg font-semibold text-gp-secondary' : 'text-sm font-semibold'}`}>
        {value}
      </span>
    </div>
  )
}
