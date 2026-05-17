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

  const addReview = useCallback((input: Omit<Review, 'id' | 'createdAtIso'>) => {
    let createdId = ''
    setReviews((prev) => {
      if (input.orderId && prev.some((r) => r.orderId === input.orderId)) {
        return prev
      }
      const review: Review = {
        ...input,
        id: uid('review'),
        createdAtIso: new Date().toISOString(),
      }
      createdId = review.id
      return [review, ...prev]
    })
    return createdId
  }, [])

  const replyToReview = useCallback((reviewId: string, body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, cookReply: { body: trimmed, createdAtIso: new Date().toISOString() } }
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
    for (const [id, arr] of m) {
      m.set(
        id,
        [...arr].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
      )
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
    for (const [id, arr] of m) {
      m.set(
        id,
        [...arr].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
      )
    }
    return m
  }, [reviews])

  const byUserId = useMemo(() => {
    const m = new Map<string, Review[]>()
    for (const r of reviews) {
      const arr = m.get(r.userId) ?? []
      arr.push(r)
      m.set(r.userId, arr)
    }
    for (const [id, arr] of m) {
      m.set(
        id,
        [...arr].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
      )
    }
    return m
  }, [reviews])

  return { reviews, byPlateId, byCookId, byUserId, addReview, replyToReview, removeReview }
}
