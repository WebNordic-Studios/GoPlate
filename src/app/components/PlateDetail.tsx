import { Heart, Star, UserPlus2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { Button } from '../../ui/Button'

export function PlateDetail({
  plate,
  onReserve,
  isLiked,
  onToggleLike,
  isFollowingCook,
  onToggleFollowCook,
}: {
  plate: Plate
  onReserve: () => void
  isLiked: boolean
  onToggleLike: () => void
  isFollowingCook: boolean
  onToggleFollowCook: () => void
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const soldOut = plate.portionsAvailable <= 0

  const ingredients = useMemo(() => plate.ingredients.slice(0, 12), [plate.ingredients])

  return (
    <div className="grid gap-0 md:grid-cols-2">
      <div className="border-b border-black/5 md:border-b-0 md:border-r md:border-black/5">
        <div className="relative">
          <img src={plate.images[imgIdx]} alt={plate.name} className="h-72 w-full object-cover md:h-[520px]" />
          <div className="absolute left-4 top-4 rounded-2xl bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {plate.distanceMiles.toFixed(1)} miles away
          </div>
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
            <div className="mt-2 flex items-center gap-2 text-sm text-gp-charcoal/70">
              <img
                src={plate.cook.avatarUrl}
                alt={plate.cook.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
              />
              <div className="font-semibold">{plate.cook.name}</div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-gp-primary" fill="currentColor" />
                <span className="font-semibold">{plate.rating.toFixed(1)}</span>
                <span className="text-gp-charcoal/50">({plate.ratingCount})</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-semibold text-gp-charcoal/60">Price</div>
            <div className="font-display text-2xl font-semibold">{formatMoney(plate.priceCents)}</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
          <div className="text-xs font-semibold text-gp-charcoal/60">Pickup Window</div>
          <div className="mt-1 text-sm font-semibold text-gp-secondary">{plate.pickupWindow}</div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleLike}
                className={`gp-focus inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition ${
                  isLiked
                    ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
                    : 'bg-white text-gp-charcoal/70 ring-black/10 hover:bg-black/5'
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
                    ? 'bg-white text-gp-secondary ring-black/10 hover:bg-black/5'
                    : 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
                }`}
                aria-label={isFollowingCook ? 'Unfollow cook' : 'Follow cook'}
              >
                <UserPlus2 size={16} />
                {isFollowingCook ? 'Following' : 'Follow'}
              </button>
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

        <div className="mt-6">
          <div className="font-display text-base font-semibold">Pickup Area (privacy-protected)</div>
          <div className="mt-2 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
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

