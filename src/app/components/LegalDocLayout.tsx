import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function LegalDocLayout({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="gp-container max-w-3xl pb-28 pt-8 md:pb-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/45">GoPlate</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-gp-charcoal">{title}</h1>
      <p className="mt-2 text-sm text-gp-charcoal/55">Last updated {updated}</p>
      <div className="prose-gp mt-8 space-y-4 text-sm leading-relaxed text-gp-charcoal/80">{children}</div>
      <p className="mt-10 text-sm text-gp-charcoal/55">
        Questions? <Link to="/help" className="font-semibold text-gp-primary hover:underline">Help & contact</Link>
      </p>
    </div>
  )
}
