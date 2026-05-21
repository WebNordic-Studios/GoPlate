import { CANCELLATION_POLICY } from '../../lib/cancellationPolicy'

export function CancellationPolicyCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-gp-bg/80 ring-1 ring-black/5 ${compact ? 'p-3' : 'p-4'}`}
      role="note"
    >
      <div className={`font-semibold text-gp-charcoal ${compact ? 'text-xs' : 'text-sm'}`}>
        {CANCELLATION_POLICY.title}
      </div>
      <ul className={`mt-2 list-disc space-y-1 pl-4 text-gp-charcoal/70 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {CANCELLATION_POLICY.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
