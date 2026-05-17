import { Star } from 'lucide-react'
import type { Plate, Review } from '../../types'
import { ReviewCard } from './ReviewCard'

export function MyReviewsPanel({
  reviews,
  platesById,
  onOpenPlate,
  onDeleteReview,
}: {
  reviews: Review[]
  platesById: Map<string, Plate>
  onOpenPlate: (plateId: string) => void
  onDeleteReview: (reviewId: string) => void
}) {
  if (reviews.length === 0) {
    return (
      <div className="mt-5 rounded-[2rem] bg-white/70 p-8 text-center shadow-natural ring-1 ring-black/5">
        <Star size={28} className="mx-auto text-gp-charcoal/25" aria-hidden />
        <p className="mt-3 font-display text-lg font-semibold text-gp-charcoal">No reviews yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gp-charcoal/65">
          After you pick up an order, rate the plate from your Orders tab.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-3">
      <p className="text-sm text-gp-charcoal/65">
        {reviews.length} review{reviews.length === 1 ? '' : 's'} you have shared with the neighborhood.
      </p>
      <ul className="space-y-3">
        {reviews.map((r) => {
          const plate = platesById.get(r.plateId)
          return (
            <li key={r.id}>
              <ReviewCard
                review={r}
                cookName={plate?.cook.name ?? 'Cook'}
                plateName={plate?.name ?? 'Plate'}
                onOpenPlate={() => onOpenPlate(r.plateId)}
                canDelete
                onDelete={onDeleteReview}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
