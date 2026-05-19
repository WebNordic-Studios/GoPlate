import { Flag, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Review } from '../../types'
import { timeAgo } from '../../lib/format'
import { Button } from '../../ui/Button'

export function ReviewCard({
  review,
  cookName,
  plateName,
  onOpenPlate,
  canReplyAsCook,
  onCookReply,
  canDelete,
  onDelete,
  onReport,
}: {
  review: Review
  cookName: string
  plateName?: string
  onOpenPlate?: () => void
  canReplyAsCook?: boolean
  onCookReply?: (reviewId: string, body: string) => void
  canDelete?: boolean
  onDelete?: (reviewId: string) => void
  onReport?: () => void
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')

  return (
    <article className="rounded-2xl bg-gp-surface/80 p-3 ring-1 ring-black/5 sm:p-4">
      <div className="flex items-start gap-3">
        {review.userAvatarUrl ? (
          <img
            src={review.userAvatarUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/10"
          />
        ) : (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-xs font-semibold text-gp-charcoal/70">
            {review.userName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gp-charcoal">{review.userName}</div>
              {plateName ? (
                onOpenPlate ? (
                  <button
                    type="button"
                    onClick={onOpenPlate}
                    className="gp-focus mt-0.5 truncate text-left text-xs font-medium text-gp-secondary hover:underline"
                  >
                    {plateName}
                  </button>
                ) : (
                  <div className="mt-0.5 truncate text-xs text-gp-charcoal/55">{plateName}</div>
                )
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StarRow rating={review.rating} />
              <span className="text-[11px] text-gp-charcoal/45">{timeAgo(review.createdAtIso)}</span>
              {onReport ? (
                <button
                  type="button"
                  onClick={onReport}
                  className="gp-focus rounded-lg p-1 text-gp-charcoal/40 hover:bg-amber-50 hover:text-amber-700"
                  aria-label="Report review"
                  title="Report review"
                >
                  <Flag size={14} />
                </button>
              ) : null}
              {canDelete && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(review.id)}
                  className="gp-focus rounded-lg p-1 text-gp-charcoal/40 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete your review"
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/80">{review.body}</p>

          {review.photoDataUrls && review.photoDataUrls.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {review.photoDataUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/10" />
              ))}
            </div>
          ) : null}

          {review.cookReply ? (
            <div className="mt-3 rounded-xl bg-gp-secondary/10 p-2.5 text-xs text-gp-charcoal/80 ring-1 ring-gp-secondary/15">
              <div className="font-semibold text-gp-secondary">Reply from {cookName}</div>
              <div className="mt-1">{review.cookReply.body}</div>
              <div className="mt-1 text-[10px] text-gp-charcoal/50">{timeAgo(review.cookReply.createdAtIso)}</div>
            </div>
          ) : canReplyAsCook && onCookReply ? (
            <div className="mt-3">
              {replyOpen ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!replyBody.trim()) return
                    onCookReply(review.id, replyBody.trim())
                    setReplyBody('')
                    setReplyOpen(false)
                  }}
                >
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={2}
                    maxLength={280}
                    placeholder="Thank them or clarify pickup details…"
                    className="gp-focus w-full resize-y rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-black/5"
                  />
                  <div className="flex gap-2">
                    <Button variant="secondary" type="submit" className="!py-1.5 !text-xs">
                      Post reply
                    </Button>
                    <Button variant="ghost" type="button" className="!py-1.5 !text-xs" onClick={() => setReplyOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyOpen(true)}
                  className="gp-focus text-xs font-semibold text-gp-secondary hover:underline"
                >
                  Reply as cook
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < Math.round(rating) ? 'text-gp-primary' : 'text-gp-charcoal/25'}
          fill={i < Math.round(rating) ? 'currentColor' : 'none'}
          aria-hidden
        />
      ))}
    </div>
  )
}
