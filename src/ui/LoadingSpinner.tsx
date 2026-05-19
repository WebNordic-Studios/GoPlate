export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-gp-primary/25 border-t-gp-primary"
        aria-hidden
      />
      <span className="text-sm font-semibold text-gp-charcoal/65">{label}</span>
    </div>
  )
}
