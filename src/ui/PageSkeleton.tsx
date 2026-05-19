export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="gp-container animate-pulse pb-28 pt-6 md:pb-10" aria-hidden>
      <div className="h-8 w-48 rounded-2xl bg-black/10" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-xl bg-black/[0.06]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[2rem] bg-gp-surface/60 ring-1 ring-black/5">
            <div className="aspect-[4/3] bg-black/[0.06]" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded-lg bg-black/[0.06]" />
              <div className="h-3 w-1/2 rounded-lg bg-black/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
