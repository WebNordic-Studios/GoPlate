import type { Plate, Review } from '../types'

export function reviewsForPlate(reviews: Review[], plateId: string) {
  return reviews.filter((r) => r.plateId === plateId)
}

export function reviewsForCook(reviews: Review[], cookId: string) {
  return reviews.filter((r) => r.cookId === cookId)
}

export function reviewsForUser(reviews: Review[], userId: string) {
  return reviews.filter((r) => r.userId === userId)
}

export function plateDisplayRating(
  reviews: Review[],
  plate: Pick<Plate, 'id' | 'rating' | 'ratingCount'>,
): { rating: number; count: number; fromReviews: boolean } {
  const rs = reviewsForPlate(reviews, plate.id)
  if (rs.length === 0) {
    return { rating: plate.rating, count: plate.ratingCount, fromReviews: false }
  }
  const rating = rs.reduce((sum, r) => sum + r.rating, 0) / rs.length
  return { rating, count: rs.length, fromReviews: true }
}

export function cookDisplayRating(
  reviews: Review[],
  cookId: string,
  plates: Plate[],
): { rating: number; count: number } {
  const rs = reviewsForCook(reviews, cookId)
  if (rs.length > 0) {
    return {
      rating: rs.reduce((sum, r) => sum + r.rating, 0) / rs.length,
      count: rs.length,
    }
  }
  const cookPlates = plates.filter((p) => p.cook.id === cookId)
  if (cookPlates.length === 0) return { rating: 0, count: 0 }
  const totalCount = cookPlates.reduce((s, p) => s + p.ratingCount, 0)
  const weighted = cookPlates.reduce((s, p) => s + p.rating * p.ratingCount, 0)
  return {
    rating: totalCount > 0 ? weighted / totalCount : 0,
    count: totalCount,
  }
}

export function averageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
