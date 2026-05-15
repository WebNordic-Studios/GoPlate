import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Clock, Compass, Heart, MapPin, UserPlus2 } from 'lucide-react'
import type { Category, Cuisine, DietaryTag, Plate } from '../../types'
import { CategoryRibbon } from '../components/CategoryRibbon'
import { PlateCard } from '../components/PlateCard'
import { FilterBar } from '../components/FilterBar'
import { sortPlates, type SortMode } from '../../lib/sortPlates'
import { formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { EmptyState } from '../../ui/EmptyState'
import { Button } from '../../ui/Button'
import { nearestZip, requestUserLocation } from '../../lib/geo'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'
import { useToast } from '../../ui/Toast'

export function MarketplacePage({
  plates,
  zip,
  category,
  onChangeCategory,
  onChangeZip,
  onOpenPlate,
  onReservePlate,
  onOpenCook,
  followsByCookId,
  likesByPlateId,
}: {
  plates: Plate[]
  zip: string
  category: Category
  onChangeCategory: (c: Category) => void
  onChangeZip?: (zip: string) => void
  onOpenPlate: (plateId: string) => void
  onReservePlate: (plateId: string) => void
  onOpenCook?: (cookId: string) => void
  followsByCookId: Record<string, true>
  likesByPlateId: Record<string, true>
}) {
  const location = useLocation()
  const forYouRef = useRef<HTMLElement | null>(null)
  const allPlatesRef = useRef<HTMLDivElement | null>(null)
  const [sort, setSort] = useState<SortMode>('recommended')
  const [dietary, setDietary] = useState<Set<DietaryTag>>(() => new Set())
  const [cuisines, setCuisines] = useState<Set<Cuisine>>(() => new Set())
  const [locating, setLocating] = useState(false)
  const toast = useToast()

  const visible = useMemo(
    () => plates.filter((p) => !p.isDraft),
    [plates],
  )

  const filtered = useMemo(() => {
    const z = zip.trim()
    return visible.filter((p) => {
      const zipOk = z ? p.zip.startsWith(z) : true
      const catOk = category === 'All' ? true : p.category === category
      const cuisineOk =
        cuisines.size === 0 ? true : p.cuisine ? cuisines.has(p.cuisine) : false
      const dietaryOk =
        dietary.size === 0
          ? true
          : Array.from(dietary).every((tag) => (p.dietary ?? []).includes(tag))
      return zipOk && catOk && cuisineOk && dietaryOk
    })
  }, [visible, zip, category, cuisines, dietary])

  const sorted = useMemo(() => sortPlates(filtered, sort), [filtered, sort])

  const followedFeedPlates = useMemo(
    () =>
      visible
        .filter((p) => followsByCookId[p.cook.id])
        .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? '')),
    [visible, followsByCookId],
  )

  const likedPlates = useMemo(
    () => visible.filter((p) => likesByPlateId[p.id]),
    [visible, likesByPlateId],
  )

  const recommendedFromLikes = useMemo(() => {
    if (likedPlates.length === 0) return [] as Plate[]
    const likedCategories = new Set(likedPlates.map((p) => p.category))
    const likedCuisines = new Set(likedPlates.map((p) => p.cuisine).filter(Boolean))
    return visible
      .filter(
        (p) =>
          !likesByPlateId[p.id] &&
          !followsByCookId[p.cook.id] &&
          (likedCategories.has(p.category) || (p.cuisine && likedCuisines.has(p.cuisine))),
      )
      .slice(0, 9)
  }, [visible, likedPlates, likesByPlateId, followsByCookId])

  useEffect(() => {
    if (location.hash === '#for-you' && forYouRef.current) {
      forYouRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash, location.pathname])

  function toggle<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    return next
  }

  async function handleUseMyLocation() {
    if (!onChangeZip) return
    setLocating(true)
    try {
      const { lat, lng } = await requestUserLocation()
      const { zip: foundZip, geo } = nearestZip(lat, lng)
      onChangeZip(foundZip)
      toast.push({
        kind: 'success',
        title: 'Location set',
        description: `Showing dishes near ${geo.areaLabel} (${foundZip}).`,
      })
    } catch (err) {
      toast.push({
        kind: 'error',
        title: 'Could not get your location',
        description: err instanceof Error ? err.message : 'Permission denied.',
      })
    } finally {
      setLocating(false)
    }
  }

  // Curated collections drawn from the visible pool.
  const collections = useMemo(() => {
    const under10 = visible
      .filter((p) => p.priceCents <= 1000 && p.portionsAvailable > 0)
      .slice(0, 6)
    const newCooks = (() => {
      const sorted = [...visible].sort((a, b) =>
        (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''),
      )
      const seenCooks = new Set<string>()
      const out: Plate[] = []
      for (const p of sorted) {
        if (seenCooks.has(p.cook.id)) continue
        seenCooks.add(p.cook.id)
        out.push(p)
        if (out.length >= 6) break
      }
      return out
    })()
    const tonight = visible
      .filter((p) => /(?:5|6|7|8)\s?(?::|PM)/i.test(p.pickupWindow))
      .slice(0, 6)
    return { under10, newCooks, tonight }
  }, [visible])

  const hasActiveFilters = dietary.size > 0 || cuisines.size > 0 || sort !== 'recommended'

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Find food</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            {zip.trim() ? (
              <>
                Near <span className="font-semibold">{zip.trim()}</span> · browse everyone below, plus your personalized
                picks up front.
              </>
            ) : (
              'Browse neighbors’ dishes and your personalized feed in one place.'
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-gp-surface/70 px-4 py-2 text-sm font-semibold text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
          {sorted.length} plates
        </div>
      </div>

      <div className="mt-5">
        <CategoryRibbon value={category} onChange={onChangeCategory} />
      </div>

      <div className="mt-5 rounded-[2rem] bg-gp-surface/70 p-4 shadow-natural ring-1 ring-black/5 sm:p-5">
        <FilterBar
          sort={sort}
          onChangeSort={setSort}
          dietary={dietary}
          onToggleDietary={(t) => setDietary((s) => toggle(s, t))}
          cuisines={cuisines}
          onToggleCuisine={(c) => setCuisines((s) => toggle(s, c))}
          onClearAll={() => {
            setDietary(new Set())
            setCuisines(new Set())
            setSort('recommended')
          }}
          onUseMyLocation={onChangeZip ? handleUseMyLocation : undefined}
          locating={locating}
        />
      </div>

      <section
        id="for-you"
        ref={forYouRef}
        className="scroll-mt-28 mt-8 rounded-[2rem] bg-gradient-to-b from-gp-primary/[0.07] via-gp-surface/80 to-gp-surface/40 p-5 shadow-natural ring-1 ring-black/5 sm:p-6"
        aria-labelledby="for-you-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="for-you-heading" className="font-display text-xl font-semibold tracking-tight text-gp-charcoal">
              For you
            </h2>
            <p className="mt-1 text-sm text-gp-charcoal/65">
              From cooks you follow and dishes similar to what you’ve liked — not filtered by ZIP so you never miss a
              drop.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          <div aria-labelledby="following-feed">
            <h3 id="following-feed" className="flex items-center gap-2 font-display text-base font-semibold text-gp-charcoal">
              <UserPlus2 size={17} className="text-gp-secondary" aria-hidden />
              From cooks you follow
            </h3>
            {followedFeedPlates.length === 0 ? (
              <div className="mt-3 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5 sm:p-5">
                <EmptyState
                  icon={<UserPlus2 size={20} />}
                  title="Follow cooks to see them here"
                  description="Tap Follow on a cook profile or dish — new listings from them land in this row first."
                  action={
                    <Button type="button" variant="secondary" onClick={() => allPlatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                      Browse all plates
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {followedFeedPlates.map((p) => (
                  <PlateCard
                    key={p.id}
                    plate={p}
                    onOpen={() => onOpenPlate(p.id)}
                    onReserve={() => onReservePlate(p.id)}
                    onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {recommendedFromLikes.length > 0 ? (
            <div aria-labelledby="likes-recs">
              <h3 id="likes-recs" className="flex items-center gap-2 font-display text-base font-semibold text-gp-charcoal">
                <Heart size={17} className="text-gp-primary" aria-hidden />
                Based on what you’ve liked
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedFromLikes.map((p) => (
                  <PlateCard
                    key={p.id}
                    plate={p}
                    onOpen={() => onOpenPlate(p.id)}
                    onReserve={() => onReservePlate(p.id)}
                    onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!hasActiveFilters && (collections.under10.length || collections.newCooks.length || collections.tonight.length) ? (
        <div className="mt-8 space-y-8">
          <CollectionRail title="Under $10" subtitle="Wallet-friendly drops nearby" plates={collections.under10} onOpenPlate={onOpenPlate} />
          <CollectionRail
            title="New cooks this week"
            subtitle="Fresh faces just listing"
            plates={collections.newCooks}
            onOpenPlate={onOpenPlate}
          />
          <CollectionRail
            title="Tonight's pickups"
            subtitle="Evening windows still open"
            plates={collections.tonight}
            onOpenPlate={onOpenPlate}
          />
        </div>
      ) : null}

      <div className="mt-8" id="all-plates" ref={allPlatesRef}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="font-display text-xl font-semibold">All plates</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <PlateCard
              key={p.id}
              plate={p}
              onOpen={() => onOpenPlate(p.id)}
              onReserve={() => onReservePlate(p.id)}
              onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
            />
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<Compass size={20} />}
              title="No plates match your filters"
              description="Try a different ZIP, category, or remove a dietary tag to see more options."
              action={
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDietary(new Set())
                    setCuisines(new Set())
                    setSort('recommended')
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CollectionRail({
  title,
  subtitle,
  plates,
  onOpenPlate,
}: {
  title: string
  subtitle: string
  plates: Plate[]
  onOpenPlate: (plateId: string) => void
}) {
  const { settings } = useSettings()
  const railRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = railRef.current
    if (!el) return
    return attachHorizontalWheelScroll(el)
  }, [])

  if (plates.length === 0) return null

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-gp-charcoal">{title}</h2>
          <p className="mt-0.5 text-sm text-gp-charcoal/65">{subtitle}</p>
        </div>
        <span className="rounded-full bg-gp-primary/10 px-3 py-1 text-xs font-semibold text-gp-primary">
          {plates.length}
        </span>
      </div>
      <div
        ref={railRef}
        className="-mx-4 mt-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 py-2 touch-pan-x [-webkit-overflow-scrolling:touch] items-stretch"
      >
        {plates.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenPlate(p.id)}
            className="gp-focus group w-[260px] shrink-0 overflow-hidden rounded-2xl bg-gp-surface text-left shadow-natural ring-1 ring-black/5 transition hover:ring-gp-primary/20"
          >
            <div className="relative h-36 w-full">
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2 pt-6">
                <div className="text-sm font-semibold text-white">{p.name}</div>
              </div>
            </div>
            <div className="space-y-2 px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <img
                    src={p.cook.avatarUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-black/10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-gp-charcoal">{p.cook.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-gp-charcoal/55">
                      <MapPin size={12} className="shrink-0 text-gp-secondary/80" aria-hidden />
                      <span className="truncate">
                        {p.geo.areaLabel} · {p.zip}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gp-charcoal/45">From</div>
                  <div className="text-sm font-bold text-gp-charcoal">
                    {formatMoney(p.priceCents, settings.currency, settings.locale)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-gp-secondary/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-gp-secondary ring-1 ring-gp-secondary/10">
                <Clock size={12} className="shrink-0 opacity-90" aria-hidden />
                <span className="min-w-0 leading-tight">{p.pickupWindow}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
