import { Search, User } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { DietaryTag, Plate } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { SearchFiltersBar } from '../components/SearchFiltersBar'
import { EmptyState } from '../../ui/EmptyState'

type CookResult = {
  id: string
  name: string
  avatarUrl: string
  bio: string
  listingCount: number
  avgRating: number
}

export function SearchPage({
  plates,
  onOpenPlate,
}: {
  plates: Plate[]
  onOpenPlate: (plateId: string) => void
}) {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const maxPrice = params.get('maxPrice') ?? ''
  const maxDistance = params.get('maxDist') ?? ''
  const dietaryParam = params.get('dietary') ?? ''
  const dietary = useMemo(() => {
    const tags = dietaryParam.split(',').filter(Boolean) as DietaryTag[]
    return new Set(tags)
  }, [dietaryParam])
  const navigate = useNavigate()

  function patchParams(patch: Record<string, string | null>) {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      for (const [key, val] of Object.entries(patch)) {
        if (val == null || val === '') p.delete(key)
        else p.set(key, val)
      }
      return p
    })
  }

  const cooks = useMemo(() => {
    const map = new Map<string, CookResult>()
    for (const p of plates) {
      const prev = map.get(p.cook.id)
      const nextCount = (prev?.listingCount ?? 0) + 1
      const nextAvg =
        prev
          ? (prev.avgRating * prev.listingCount + p.rating) / nextCount
          : p.rating

      map.set(p.cook.id, {
        id: p.cook.id,
        name: p.cook.name,
        avatarUrl: p.cook.avatarUrl,
        bio: p.cook.bio,
        listingCount: nextCount,
        avgRating: nextAvg,
      })
    }
    return Array.from(map.values())
  }, [plates])

  const filteredPlates = useMemo(() => {
    let list = plates
    if (q) {
      const s = q.toLowerCase()
      list = list.filter((p) => {
        const hay = [
          p.name,
          p.category,
          p.cook.name,
          p.cooksNote,
          p.ingredients.join(' '),
          p.geo?.areaLabel ?? '',
          ...(p.dietary ?? []),
        ]
          .join(' ')
          .toLowerCase()
        return hay.includes(s)
      })
    }
    const maxCents = maxPrice.trim() ? Math.round(Number(maxPrice) * 100) : null
    if (maxCents != null && Number.isFinite(maxCents) && maxCents > 0) {
      list = list.filter((p) => p.priceCents <= maxCents)
    }
    const maxMi = maxDistance.trim() ? Number(maxDistance) : null
    if (maxMi != null && Number.isFinite(maxMi) && maxMi > 0) {
      list = list.filter((p) => p.distanceMiles <= maxMi)
    }
    if (dietary.size > 0) {
      list = list.filter((p) => {
        const tags = p.dietary ?? []
        return [...dietary].every((d) => tags.includes(d))
      })
    }
    return list
  }, [plates, q, maxPrice, maxDistance, dietary])

  const filteredCooks = useMemo(() => {
    if (!q) return cooks
    const s = q.toLowerCase()
    return cooks.filter((c) => `${c.name} ${c.bio}`.toLowerCase().includes(s))
  }, [cooks, q])

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Search</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            Search dishes and cook profiles in one place.
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] bg-white/70 p-3 shadow-natural ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gp-primary/10 text-gp-primary">
            <Search size={20} />
          </div>
          <input
            value={q}
            onChange={(e) => {
              const next = e.target.value
              setParams((prev) => {
                const p = new URLSearchParams(prev)
                if (next.trim()) p.set('q', next)
                else p.delete('q')
                return p
              })
            }}
            placeholder="Try “sourdough”, “vegan”, “Sarah”, “cookies”…"
            className="gp-focus w-full bg-transparent px-2 py-3 text-sm font-semibold text-gp-charcoal placeholder:text-gp-charcoal/45 sm:text-base"
          />
        </div>
      </div>

      <SearchFiltersBar
        maxPrice={maxPrice}
        maxDistance={maxDistance}
        dietary={dietary}
        onMaxPriceChange={(v) => patchParams({ maxPrice: v.trim() || null })}
        onMaxDistanceChange={(v) => patchParams({ maxDist: v.trim() || null })}
        onToggleDietary={(tag) => {
          const next = new Set(dietary)
          if (next.has(tag)) next.delete(tag)
          else next.add(tag)
          patchParams({ dietary: next.size ? [...next].join(',') : null })
        }}
        onClear={() => patchParams({ maxPrice: null, maxDist: null, dietary: null })}
      />

      {!q && !maxPrice && !maxDistance && dietary.size === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Search size={20} />}
            title="Search dishes and cooks"
            description="Try a dish name, ingredient, neighborhood, cook name, or dietary note. Results update as you type."
          />
        </div>
      ) : null}

      <div
        className={`mt-6 grid gap-4 lg:grid-cols-3 ${
          !q && !maxPrice && !maxDistance && dietary.size === 0 ? 'hidden' : ''
        }`}
      >
        <div className="lg:col-span-1">
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <User size={18} className="text-gp-secondary" />
              Profiles
            </div>
            <div className="mt-1 text-sm text-gp-charcoal/65">{filteredCooks.length} cooks</div>

            <div className="mt-4 grid gap-3">
              {filteredCooks.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/cooks/${c.id}`)}
                  className="gp-focus flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left ring-1 ring-black/5 hover:bg-black/5"
                >
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="h-10 w-10 rounded-2xl object-cover ring-1 ring-black/10"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="mt-1 truncate text-xs text-gp-charcoal/60">
                      ★ {c.avgRating.toFixed(1)} • {c.listingCount} listings
                    </div>
                  </div>
                </button>
              ))}

              {filteredCooks.length === 0 ? (
                <EmptyState
                  title="No matching cooks"
                  description="Try another keyword or browse the marketplace."
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-lg font-semibold">Dishes</div>
              <div className="mt-1 text-sm text-gp-charcoal/65">{filteredPlates.length} results</div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {filteredPlates.map((p) => (
              <PlateCard
                key={p.id}
                plate={p}
                onOpen={() => onOpenPlate(p.id)}
                onReserve={() => navigate(`/checkout/${p.id}`)}
                onOpenCook={() => navigate(`/cooks/${p.cook.id}`)}
              />
            ))}
          </div>

          {filteredPlates.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No dishes found"
                description="No dishes match your search. Try a different keyword or category."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

