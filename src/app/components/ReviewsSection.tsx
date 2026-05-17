import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Plate, Review } from '../../types'
import { averageRating } from '../../lib/reviewStats'
import { ReviewCard } from './ReviewCard'

const PAGE_SIZE = 5

export function ReviewsSection({
  reviews,
  plate: _plate,
  cookName,
  onOpenPlate,
  canReplyAsCook,
  onCookReply,
  currentUserId,
  onDeleteReview,
}: {
  reviews: Review[]
  plate: Plate
  cookName: string
  onOpenPlate?: () => void
  canReplyAsCook?: boolean
  onCookReply?: (reviewId: string, body: string) => void
  currentUserId?: string
  onDeleteReview?: (reviewId: string) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...reviews].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
  const visible = showAll ? sorted : sorted.slice(0, PAGE_SIZE)
  const avg = averageRating(sorted)

  if (sorted.length === 0) {
    return (
      <section className="mt-6 rounded-2xl bg-gp-bg/50 px-4 py-6 text-center ring-1 ring-black/5">
        <Star size={22} className="mx-auto text-gp-charcoal/25" aria-hidden />
        <p className="mt-2 text-sm font-semibold text-gp-charcoal/70">No reviews yet</p>
        <p className="mt-1 text-xs text-gp-charcoal/50">Be the first to rate this plate after pickup.</p>
      </section>
    )
  }

  return (
    <section className="mt-6" aria-labelledby="plate-reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="plate-reviews-heading" className="font-display text-base font-semibold">
            Reviews
          </h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-gp-charcoal/65">
            <Star size={14} className="text-gp-primary" fill="currentColor" aria-hidden />
            <span className="font-semibold text-gp-charcoal">{avg.toFixed(1)}</span>
            <span>
              · {sorted.length} {sorted.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-3">
        {visible.map((r) => (
          <li key={r.id}>
            <ReviewCard
              review={r}
              cookName={cookName}
              onOpenPlate={onOpenPlate}
              canReplyAsCook={canReplyAsCook && !r.cookReply}
              onCookReply={onCookReply}
              canDelete={currentUserId === r.userId}
              onDelete={onDeleteReview}
            />
          </li>
        ))}
      </ul>

      {sorted.length > PAGE_SIZE ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="gp-focus mt-3 w-full rounded-2xl bg-gp-bg py-2.5 text-sm font-semibold text-gp-secondary ring-1 ring-gp-secondary/15 hover:bg-gp-secondary/5"
        >
          {showAll ? 'Show fewer reviews' : `Show all ${sorted.length} reviews`}
        </button>
      ) : null}
    </section>
  )
}
