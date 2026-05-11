import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[2rem] bg-gp-surface/70 p-8 text-center shadow-natural ring-1 ring-black/5">
      {icon ? (
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gp-primary/10 text-gp-primary">
          {icon}
        </div>
      ) : null}
      <div className="mt-4 font-display text-lg font-semibold text-gp-charcoal">{title}</div>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-gp-charcoal/65">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
