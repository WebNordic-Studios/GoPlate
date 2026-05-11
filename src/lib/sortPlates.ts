export type SortMode =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'distance'
  | 'rating'
  | 'newest'
  | 'almost-sold-out'

export const SORT_LABEL: Record<SortMode, string> = {
  recommended: 'Recommended',
  'price-asc': 'Price (low → high)',
  'price-desc': 'Price (high → low)',
  distance: 'Closest first',
  rating: 'Highest rated',
  newest: 'Just listed',
  'almost-sold-out': 'Almost sold out',
}

type SortablePlate = {
  priceCents: number
  distanceMiles: number
  rating: number
  ratingCount: number
  portionsAvailable: number
  createdAtIso?: string
}

export function sortPlates<T extends SortablePlate>(list: T[], sort: SortMode): T[] {
  const copy = [...list]
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.priceCents - b.priceCents)
    case 'price-desc':
      return copy.sort((a, b) => b.priceCents - a.priceCents)
    case 'distance':
      return copy.sort((a, b) => a.distanceMiles - b.distanceMiles)
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
    case 'newest':
      return copy.sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''))
    case 'almost-sold-out':
      return copy
        .filter((p) => p.portionsAvailable > 0 && p.portionsAvailable <= 3)
        .sort((a, b) => a.portionsAvailable - b.portionsAvailable)
        .concat(copy.filter((p) => p.portionsAvailable > 3 || p.portionsAvailable <= 0))
    case 'recommended':
    default:
      return copy.sort((a, b) => recommendScore(b) - recommendScore(a))
  }
}

function recommendScore(p: SortablePlate) {
  const ratingScore = p.rating * 2
  const distanceScore = Math.max(0, 5 - p.distanceMiles)
  const availability = p.portionsAvailable > 0 ? 1 : -3
  return ratingScore + distanceScore + availability
}
