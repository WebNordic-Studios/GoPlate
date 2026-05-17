import { Flag, ShieldOff, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Plate, Review } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { ReportModal } from '../components/ReportModal'
import { ReviewCard } from '../components/ReviewCard'
import { Button } from '../../ui/Button'
import { VerifiedBadge } from '../../ui/Badges'
import { useReviewsContext } from '../../state/reviewsContext'

export function CookProfilePage({
  cookId,
  plates,
  reviews,
  onOpenPlate,
  onReservePlate,
  isFollowing,
  onToggleFollow,
  onReport,
  onBlock,
  isBlocked,
  currentUserId,
  onCookReply,
}: {
  cookId: string
  plates: Plate[]
  reviews: Review[]
  onOpenPlate: (plateId: string) => void
  onReservePlate: (plateId: string) => void
  isFollowing: boolean
  onToggleFollow: () => void
  onReport?: (input: { reason: string; details?: string }) => void
  onBlock?: () => void
  isBlocked?: boolean
  currentUserId?: string
  onCookReply?: (reviewId: string, body: string) => void
}) {
  const [reportOpen, setReportOpen] = useState(false)
  const byCook = useMemo(
    () => plates.filter((p) => p.cook.id === cookId && !p.isDraft),
    [plates, cookId],
  )
  const cook = byCook[0]?.cook ?? plates.find((p) => p.cook.id === cookId)?.cook

  if (!cook) {
    return (
      <div className="gp-container pb-28 pt-6 md:pb-10">
        <div className="rounded-2xl bg-gp-surface/70 p-6 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
          Cook profile not found.
        </div>
      </div>
    )
  }

  const { cookStats } = useReviewsContext()
  const cookReviews = reviews.filter((r) => r.cookId === cookId)
  const ratingSummary = cookStats(cookId, plates)
  const canReplyAsCook = Boolean(
    currentUserId && onCookReply && (currentUserId === cookId || cookId === 'cook_you'),
  )
  const plateById = useMemo(() => new Map(plates.map((p) => [p.id, p])), [plates])

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      {isBlocked ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <ShieldOff size={16} /> You've blocked this cook. Their listings are still visible here but hidden across the rest of the app.
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img
            src={cook.avatarUrl}
            alt={cook.name}
            className="h-16 w-16 rounded-[2rem] object-cover ring-1 ring-black/10"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-2xl font-semibold">{cook.name}</div>
              {cook.verified ? <VerifiedBadge size="xs" /> : null}
            </div>
            <div className="mt-1 text-sm text-gp-charcoal/70">{cook.bio}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gp-charcoal/70">
              <div className="inline-flex items-center gap-1">
                <Star size={16} className="text-gp-primary" fill="currentColor" />
                <span className="font-semibold">{ratingSummary.rating.toFixed(1)}</span>
                <span className="text-gp-charcoal/50">avg rating</span>
              </div>
              <span className="text-gp-charcoal/35">·</span>
              <span>
                <span className="font-semibold text-gp-charcoal/80">{byCook.length}</span> listings
              </span>
              <span className="text-gp-charcoal/35">·</span>
              <span>
                <span className="font-semibold text-gp-charcoal/80">{ratingSummary.count}</span> reviews
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={isFollowing ? 'ghost' : 'secondary'} onClick={onToggleFollow}>
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          {onReport ? (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="gp-focus inline-flex items-center gap-1 rounded-2xl bg-gp-surface px-3 py-2 text-xs font-semibold text-gp-charcoal/60 ring-1 ring-black/10 hover:text-gp-primary"
              aria-label="Report cook"
              title="Report or block"
            >
              <Flag size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byCook.map((p) => (
          <PlateCard
            key={p.id}
            plate={p}
            onOpen={() => onOpenPlate(p.id)}
            onReserve={() => onReservePlate(p.id)}
          />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        {cookReviews.length > 0 ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {cookReviews
              .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
              .map((r) => (
                <li key={r.id}>
                  <ReviewCard
                    review={r}
                    cookName={cook.name}
                    plateName={plateById.get(r.plateId)?.name}
                    onOpenPlate={() => onOpenPlate(r.plateId)}
                    canReplyAsCook={canReplyAsCook}
                    onCookReply={onCookReply}
                  />
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-2xl bg-gp-bg/60 px-4 py-5 text-center text-sm text-gp-charcoal/55 ring-1 ring-black/5">
            No reviews yet — they appear here after buyers pick up and rate your plates.
          </p>
        )}
      </section>

      {onReport ? (
        <ReportModal
          open={reportOpen}
          target={{ kind: 'cook', label: cook.name }}
          onClose={() => setReportOpen(false)}
          onSubmit={(input) => {
            onReport(input)
            setReportOpen(false)
          }}
          onBlock={
            onBlock
              ? () => {
                  onBlock()
                  setReportOpen(false)
                }
              : undefined
          }
        />
      ) : null}
    </div>
  )
}
