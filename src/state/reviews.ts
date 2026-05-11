import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Review } from '../types'

const STORAGE_KEY = 'goplate.reviews.v1'

function safeParse(json: string | null): Review[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json) as Review[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(() => safeParse(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  }, [reviews])

  const addReview = useCallback(
    (input: Omit<Review, 'id' | 'createdAtIso'>) => {
      const review: Review = {
        ...input,
        id: uid('review'),
        createdAtIso: new Date().toISOString(),
      }
      setReviews((prev) => [review, ...prev])
      return review.id
    },
    [],
  )

  const replyToReview = useCallback((reviewId: string, body: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, cookReply: { body, createdAtIso: new Date().toISOString() } }
          : r,
      ),
    )
  }, [])

  const removeReview = useCallback((reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }, [])

  const byPlateId = useMemo(() => {
    const m = new Map<string, Review[]>()
    for (const r of reviews) {
      const arr = m.get(r.plateId) ?? []
      arr.push(r)
      m.set(r.plateId, arr)
    }
    return m
  }, [reviews])

  const byCookId = useMemo(() => {
    const m = new Map<string, Review[]>()
    for (const r of reviews) {
      const arr = m.get(r.cookId) ?? []
      arr.push(r)
      m.set(r.cookId, arr)
    }
    return m
  }, [reviews])

  return { reviews, byPlateId, byCookId, addReview, replyToReview, removeReview }
}
