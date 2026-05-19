import { ArrowDownNarrowWide, Clock, MapPin, Sparkles, X } from 'lucide-react'
import type { DiscoveryFilter } from '../../lib/plateFilters'
import { DISCOVERY_FILTER_LABEL } from '../../lib/plateFilters'
import { useEffect, useRef, useState } from 'react'
import type { Cuisine, DietaryTag } from '../../types'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'
import { CUISINES, DIETARY_TAGS } from '../../lib/taxonomy'
import { SORT_LABEL, type SortMode } from '../../lib/sortPlates'

export type { SortMode } from '../../lib/sortPlates'

export function FilterBar({
  sort,
  onChangeSort,
  dietary,
  onToggleDietary,
  cuisines,
  onToggleCuisine,
  onClearAll,
  onUseMyLocation,
  locating,
  discoveryFilter = 'all',
  onChangeDiscoveryFilter,
}: {
  sort: SortMode
  onChangeSort: (m: SortMode) => void
  dietary: Set<DietaryTag>
  onToggleDietary: (t: DietaryTag) => void
  cuisines: Set<Cuisine>
  onToggleCuisine: (c: Cuisine) => void
  onClearAll: () => void
  onUseMyLocation?: () => void
  locating?: boolean
  discoveryFilter?: DiscoveryFilter
  onChangeDiscoveryFilter?: (f: DiscoveryFilter) => void
}) {
  const [openSort, setOpenSort] = useState(false)
  const dietaryScrollRef = useRef<HTMLDivElement>(null)
  const cuisineScrollRef = useRef<HTMLDivElement>(null)
  const activeCount = dietary.size + cuisines.size + (discoveryFilter !== 'all' ? 1 : 0)

  useEffect(() => {
    const cleanups: (() => void)[] = []
    if (dietaryScrollRef.current) cleanups.push(attachHorizontalWheelScroll(dietaryScrollRef.current))
    if (cuisineScrollRef.current) cleanups.push(attachHorizontalWheelScroll(cuisineScrollRef.current))
    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenSort((v) => !v)}
            className="gp-focus inline-flex items-center gap-2 rounded-2xl bg-gp-surface px-3.5 py-2 text-sm font-semibold text-gp-charcoal shadow-natural ring-1 ring-black/5"
          >
            <ArrowDownNarrowWide size={16} className="text-gp-charcoal/65" />
            Sort: <span className="text-gp-charcoal/80">{SORT_LABEL[sort]}</span>
          </button>
          {openSort ? (
            <>
              <button
                aria-label="Close sort"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setOpenSort(false)}
              />
              <div className="absolute left-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl bg-gp-surface shadow-lift ring-1 ring-black/10">
                {(Object.keys(SORT_LABEL) as SortMode[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      onChangeSort(k)
                      setOpenSort(false)
                    }}
                    className={`gp-focus block w-full px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-black/5 ${
                      sort === k ? 'text-gp-primary' : 'text-gp-charcoal/80'
                    }`}
                  >
                    {SORT_LABEL[k]}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {onUseMyLocation ? (
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={locating}
            className="gp-focus inline-flex items-center gap-2 rounded-2xl bg-gp-secondary/10 px-3.5 py-2 text-sm font-semibold text-gp-secondary ring-1 ring-gp-secondary/20 transition hover:bg-gp-secondary/15 disabled:opacity-60"
          >
            <MapPin size={16} />
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        ) : null}

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="gp-focus inline-flex items-center gap-1.5 rounded-2xl bg-black/5 px-3 py-2 text-xs font-semibold text-gp-charcoal/75 hover:bg-black/10"
          >
            <X size={14} />
            Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
          </button>
        ) : null}
      </div>

      {onChangeDiscoveryFilter ? (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">Discovery</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(['all', 'just-listed', 'pickup-soon'] as DiscoveryFilter[]).map((f) => {
              const active = discoveryFilter === f
              const Icon = f === 'just-listed' ? Sparkles : f === 'pickup-soon' ? Clock : null
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChangeDiscoveryFilter(f)}
                  className={`gp-focus inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                    active
                      ? 'bg-gp-primary text-white ring-gp-primary/60'
                      : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                  }`}
                >
                  {Icon ? <Icon size={12} aria-hidden /> : null}
                  {DISCOVERY_FILTER_LABEL[f]}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">Dietary</div>
        <div
          ref={dietaryScrollRef}
          className="-mx-1 mt-1.5 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-2 touch-pan-x [-webkit-overflow-scrolling:touch] items-center"
        >
          {DIETARY_TAGS.map((t) => {
            const active = dietary.has(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleDietary(t.id)}
                className={`gp-focus shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  active
                    ? 'bg-gp-secondary text-white ring-gp-secondary/60'
                    : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">Cuisine</div>
        <div
          ref={cuisineScrollRef}
          className="-mx-1 mt-1.5 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-2 touch-pan-x [-webkit-overflow-scrolling:touch] items-center"
        >
          {CUISINES.map((c) => {
            const active = cuisines.has(c)
            return (
              <button
                key={c}
                type="button"
                onClick={() => onToggleCuisine(c)}
                className={`gp-focus shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  active
                    ? 'bg-gp-primary text-white ring-gp-primary/60'
                    : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
