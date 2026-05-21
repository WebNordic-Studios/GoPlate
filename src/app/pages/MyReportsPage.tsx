import { Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Report } from '../../types'
import { EmptyState } from '../../ui/EmptyState'

const STATUS_LABEL: Record<NonNullable<Report['status']>, string> = {
  open: 'Under review',
  reviewed: 'Reviewed',
  closed: 'Closed',
}

export function MyReportsPage({ reports }: { reports: Report[] }) {
  return (
    <div className="gp-container max-w-2xl pb-28 pt-6 md:pb-10">
      <h1 className="font-display text-2xl font-semibold">Your reports</h1>
      <p className="mt-1 text-sm text-gp-charcoal/65">
        Status of issues you flagged. Moderation is manual in this prototype.
      </p>

      {reports.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Flag size={20} />}
            title="No reports filed"
            description="Use Report on a plate, cook profile, or review if something violates guidelines."
            action={
              <Link to="/market" className="gp-focus inline-flex rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white">
                Marketplace
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-2xl bg-gp-surface/80 p-4 ring-1 ring-black/5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold capitalize text-gp-charcoal">
                    {r.target.type}
                    {r.targetLabel ? ` · ${r.targetLabel}` : ''}
                  </div>
                  <div className="mt-1 text-xs text-gp-charcoal/55">
                    {new Date(r.createdAtIso).toLocaleString()} · {r.reason}
                  </div>
                </div>
                <span className="rounded-full bg-gp-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gp-charcoal/60 ring-1 ring-black/10">
                  {STATUS_LABEL[r.status ?? 'open']}
                </span>
              </div>
              {r.details ? <p className="mt-2 text-sm text-gp-charcoal/70">{r.details}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
