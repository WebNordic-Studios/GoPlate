import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  Share2,
  Star,
  UserPlus2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Plate, Review } from '../../types'
import { formatDistanceBadge, formatMoney, timeAgo } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { Button } from '../../ui/Button'
import { AllergenChip, DietaryBadge, SpiceMeter, VerifiedBadge } from '../../ui/Badges'

export function PlateDetail({
  plate,
  onReserve,
  isLiked,
  onToggleLike,
  isFollowingCook,
  onToggleFollowCook,
  reviews,
  onShare,
  onReport,
}: {
  plate: Plate
  onReserve: () => void
  isLiked: boolean
  onToggleLike: () => void
  isFollowingCook: boolean
  onToggleFollowCook: () => void
  reviews?: Review[]
  onShare?: () => void
  onReport?: () => void
}) {
  const { settings } = useSettings()
  const [imgIdx, setImgIdx] = useState(0)
  const soldOut = plate.portionsAvailable <= 0

  const ingredients = useMemo(() => plate.ingredients.slice(0, 12), [plate.ingredients])
  const dietary = plate.dietary ?? []
  const allergens = plate.allergens ?? []
  const sortedReviews = useMemo(
    () => (reviews ? [...reviews].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)) : []),
    [reviews],
  )

  const next = useCallback(() => {
    if (plate.images.length <= 1) return
    setImgIdx((i) => (i + 1) % plate.images.length)
  }, [plate.images.length])

  const prev = useCallback(() => {
    if (plate.images.length <= 1) return
    setImgIdx((i) => (i - 1 + plate.images.length) % plate.images.length)
  }, [plate.images.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  return (
    <div className="grid gap-0 md:grid-cols-2">
      <div className="border-b border-black/5 md:border-b-0 md:border-r md:border-black/5">
        <div className="relative">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={plate.images[imgIdx]}
              src={plate.images[imgIdx]}
              alt={plate.name}
              className="h-72 w-full object-cover md:h-[520px]"
              initial={{ opacity: 0.4, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
          <div className="absolute left-4 top-4 rounded-2xl bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {formatDistanceBadge(plate.distanceMiles, settings.distanceUnit)}
          </div>

          {plate.images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="gp-focus absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="gp-focus absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronRight size={18} />
              </button>
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {imgIdx + 1} / {plate.images.length}
              </div>
            </>
          ) : null}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-4">
          {plate.images.map((url, i) => {
            const active = i === imgIdx
            return (
              <button
                key={url}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`gp-focus overflow-hidden rounded-2xl ring-1 transition ${
                  active ? 'ring-gp-primary' : 'ring-black/10 hover:ring-black/20'
                }`}
              >
                <img src={url} alt="" className="h-16 w-24 object-cover" loading="lazy" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-display text-2xl font-semibold">{plate.name}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gp-charcoal/70">
              {settings.showCookAvatars ? (
                <img
                  src={plate.cook.avatarUrl}
                  alt={plate.cook.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                />
              ) : null}
              <div className="font-semibold">{plate.cook.name}</div>
              {plate.cook.verified ? <VerifiedBadge size="xs" /> : null}
              <div className="flex items-center gap-1">
                <Star size={14} className="text-gp-primary" fill="currentColor" />
                <span className="font-semibold">{plate.rating.toFixed(1)}</span>
                <span className="text-gp-charcoal/50">({plate.ratingCount})</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-semibold text-gp-charcoal/60">Price</div>
            <div className="font-display text-2xl font-semibold">
              {formatMoney(plate.priceCents, settings.currency, settings.locale)}
            </div>
          </div>
        </div>

        {(dietary.length > 0 || plate.spice || plate.cuisine) ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {plate.cuisine ? (
              <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-gp-charcoal/80 ring-1 ring-black/10">
                {plate.cuisine}
              </span>
            ) : null}
            {dietary.map((t) => (
              <DietaryBadge key={t} tag={t} />
            ))}
            {plate.spice ? <SpiceMeter level={plate.spice} /> : null}
          </div>
        ) : null}

        {settings.showAllergenBadges && allergens.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">
              Contains allergens
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allergens.map((a) => (
                <AllergenChip key={a} allergen={a} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl bg-gp-surface/70 p-4 ring-1 ring-black/5">
          <div className="text-xs font-semibold text-gp-charcoal/60">Pickup Window</div>
          <div className="mt-1 text-sm font-semibold text-gp-secondary">{plate.pickupWindow}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onToggleLike}
                className={`gp-focus inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition ${
                  isLiked
                    ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
                    : 'bg-gp-surface text-gp-charcoal/70 ring-black/10 hover:bg-black/5'
                }`}
                aria-label={isLiked ? 'Unlike dish' : 'Like dish'}
              >
                <Heart size={16} className={isLiked ? 'text-gp-primary' : 'text-gp-charcoal/50'} fill={isLiked ? 'currentColor' : 'none'} />
                {isLiked ? 'Liked' : 'Like'}
              </button>

              <button
                type="button"
                onClick={onToggleFollowCook}
                className={`gp-focus inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition ${
                  isFollowingCook
                    ? 'bg-gp-surface text-gp-secondary ring-black/10 hover:bg-black/5'
                    : 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
                }`}
                aria-label={isFollowingCook ? 'Unfollow cook' : 'Follow cook'}
              >
                <UserPlus2 size={16} />
                {isFollowingCook ? 'Following' : 'Follow'}
              </button>

              {onShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="gp-focus inline-flex items-center gap-2 rounded-2xl bg-gp-surface px-3 py-2 text-xs font-semibold text-gp-charcoal/70 ring-1 ring-black/10 transition hover:bg-black/5"
                  aria-label="Share plate"
                >
                  <Share2 size={16} />
                  Share
                </button>
              ) : null}

              {onReport ? (
                <button
                  type="button"
                  onClick={onReport}
                  className="gp-focus inline-flex items-center gap-2 rounded-2xl bg-gp-surface px-3 py-2 text-xs font-semibold text-gp-charcoal/55 ring-1 ring-black/10 transition hover:text-gp-primary"
                  aria-label="Report plate"
                  title="Report or block"
                >
                  <Flag size={16} />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-gp-charcoal/60">
                {soldOut ? 'Sold out' : `${plate.portionsAvailable} portions remaining`}
              </div>
              <Button variant="primary" disabled={soldOut} onClick={onReserve}>
                Reserve & Checkout
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="font-display text-base font-semibold">Ingredients</div>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-gp-charcoal/80">
            {ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <div className="font-display text-base font-semibold">Cook’s Note</div>
          <p className="mt-2 text-sm text-gp-charcoal/75">{plate.cooksNote}</p>
        </div>

        {sortedReviews.length > 0 ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="font-display text-base font-semibold">Recent reviews</div>
              <span className="text-xs font-semibold text-gp-charcoal/60">
                {sortedReviews.length} {sortedReviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <ul className="mt-3 space-y-3">
              {sortedReviews.slice(0, 3).map((r) => (
                <li key={r.id} className="rounded-2xl bg-gp-surface/80 p-3 ring-1 ring-black/5">
                  <div className="flex items-start gap-3">
                    {r.userAvatarUrl ? (
                      <img
                        src={r.userAvatarUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10"
                      />
                    ) : (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-xs font-semibold text-gp-charcoal/70">
                        {r.userName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{r.userName}</div>
                        <div className="flex items-center gap-1 text-xs text-gp-charcoal/60">
                          <Star size={12} className="text-gp-primary" fill="currentColor" />
                          {r.rating.toFixed(1)}
                          <span className="text-gp-charcoal/40">· {timeAgo(r.createdAtIso)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-gp-charcoal/80">{r.body}</p>
                      {r.photoDataUrls && r.photoDataUrls.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {r.photoDataUrls.slice(0, 4).map((u, i) => (
                            <img
                              key={i}
                              src={u}
                              alt=""
                              className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/10"
                            />
                          ))}
                        </div>
                      ) : null}
                      {r.cookReply ? (
                        <div className="mt-3 rounded-xl bg-gp-secondary/10 p-2.5 text-xs text-gp-charcoal/80 ring-1 ring-gp-secondary/15">
                          <div className="font-semibold text-gp-secondary">Reply from {plate.cook.name}</div>
                          <div className="mt-1">{r.cookReply.body}</div>
                          <div className="mt-1 text-[10px] text-gp-charcoal/50">{timeAgo(r.cookReply.createdAtIso)}</div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6">
          <div className="font-display text-base font-semibold">Pickup Area (privacy-protected)</div>
          <div className="mt-2 overflow-hidden rounded-2xl bg-gp-surface ring-1 ring-black/5">
            <div className="relative h-40 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.18),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(6,78,59,0.16),transparent_55%)]">
              <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(31,41,55,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,41,55,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gp-secondary/20 blur-[0.5px]" />
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gp-secondary/25 blur-md" />
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gp-primary/35 blur-sm" />
            </div>
            <div className="px-4 py-3 text-xs text-gp-charcoal/65">
              Exact address is shared after checkout. You’ll get a secure pickup note.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
