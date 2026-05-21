import type { DietaryTag } from '../../types'

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'nut-free', label: 'Nut-free' },
  { id: 'halal', label: 'Halal' },
]

export function SearchFiltersBar({
  maxPrice,
  maxDistance,
  dietary,
  onMaxPriceChange,
  onMaxDistanceChange,
  onToggleDietary,
  onClear,
}: {
  maxPrice: string
  maxDistance: string
  dietary: Set<DietaryTag>
  onMaxPriceChange: (v: string) => void
  onMaxDistanceChange: (v: string) => void
  onToggleDietary: (tag: DietaryTag) => void
  onClear: () => void
}) {
  const hasFilters = Boolean(maxPrice || maxDistance || dietary.size > 0)

  return (
    <div className="mt-4 rounded-[2rem] bg-white/70 p-4 shadow-natural ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gp-charcoal">Filters</div>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="gp-focus rounded-xl px-2 py-1 text-xs font-semibold text-gp-secondary underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-xs font-semibold text-gp-charcoal/60">Max price ($)</div>
          <input
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Any"
            inputMode="decimal"
            className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
        </label>
        <label className="block">
          <div className="text-xs font-semibold text-gp-charcoal/60">Max distance (mi)</div>
          <input
            value={maxDistance}
            onChange={(e) => onMaxDistanceChange(e.target.value)}
            placeholder="Any"
            inputMode="decimal"
            className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
        </label>
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-gp-charcoal/60">Dietary</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const on = dietary.has(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggleDietary(opt.id)}
                className={`gp-focus rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  on
                    ? 'bg-gp-primary text-white ring-gp-primary'
                    : 'bg-gp-bg text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
