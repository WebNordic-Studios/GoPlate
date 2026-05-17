/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { Plate, Review } from '../types'
import { cookDisplayRating, plateDisplayRating, reviewsForUser } from '../lib/reviewStats'
import type { useReviews } from './reviews'

type ReviewsApi = ReturnType<typeof useReviews>

type ReviewsContextValue = ReviewsApi & {
  plateStats: (plate: Pick<Plate, 'id' | 'rating' | 'ratingCount'>) => ReturnType<typeof plateDisplayRating>
  cookStats: (cookId: string, plates: Plate[]) => ReturnType<typeof cookDisplayRating>
  userReviews: (userId: string) => Review[]
  getByOrderId: (orderId: string) => Review | undefined
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

export function ReviewsProvider({ api, children }: { api: ReviewsApi; children: ReactNode }) {
  const byOrderId = useMemo(() => {
    const m = new Map<string, Review>()
    for (const r of api.reviews) {
      if (r.orderId) m.set(r.orderId, r)
    }
    return m
  }, [api.reviews])

  const plateStats = useCallback(
    (plate: Pick<Plate, 'id' | 'rating' | 'ratingCount'>) => plateDisplayRating(api.reviews, plate),
    [api.reviews],
  )

  const cookStats = useCallback(
    (cookId: string, plates: Plate[]) => cookDisplayRating(api.reviews, cookId, plates),
    [api.reviews],
  )

  const userReviews = useCallback((userId: string) => reviewsForUser(api.reviews, userId), [api.reviews])

  const getByOrderId = useCallback((orderId: string) => byOrderId.get(orderId), [byOrderId])

  const value = useMemo(
    () => ({
      ...api,
      plateStats,
      cookStats,
      userReviews,
      getByOrderId,
    }),
    [api, plateStats, cookStats, userReviews, getByOrderId],
  )

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviewsContext() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('ReviewsProvider missing')
  return ctx
}
