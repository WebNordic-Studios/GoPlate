import type { Order, Plate } from '../../types'
import { isIncomingOrder, isPlacedOrder, plateBelongsToUser } from './orderRoles'

export type ProfileAnalytics = {
  buyer: {
    placed: number
    inProgress: number
    completed: number
    cancelled: number
    spentCents: number
    tipsGivenCents: number
    reviewsLeft: number
  }
  cook: {
    received: number
    inProgress: number
    completed: number
    cancelled: number
    revenueCents: number
    tipsReceivedCents: number
    platesSold: number
  }
  listings: {
    total: number
    live: number
    draft: number
    soldOut: number
    totalViews: number
    conversionPct: number
    avgRating: number
    ratedListingCount: number
  }
}

function cookRevenueCents(o: Order) {
  return o.priceCents + (o.tipCents ?? 0)
}

function buyerSpendCents(o: Order) {
  return o.priceCents + (o.deliveryFeeCents ?? 0) + (o.tipCents ?? 0)
}

export function computeProfileAnalytics(
  userId: string,
  orders: Order[],
  plates: Plate[],
  views: Record<string, number>,
): ProfileAnalytics {
  const plateById = new Map(plates.map((p) => [p.id, p]))
  const myPlates = plates.filter((p) => plateBelongsToUser(p, userId))
  const myPlateIds = new Set(myPlates.map((p) => p.id))

  const buyer = {
    placed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    spentCents: 0,
    tipsGivenCents: 0,
    reviewsLeft: 0,
  }
  const cook = {
    received: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    revenueCents: 0,
    tipsReceivedCents: 0,
    platesSold: 0,
  }

  for (const o of orders) {
    const plate = plateById.get(o.plateId)

    if (isPlacedOrder(o, plate, userId)) {
      buyer.placed++
      if (o.status === 'Cancelled') buyer.cancelled++
      else if (o.status === 'Picked up') buyer.completed++
      else buyer.inProgress++
      if (o.status !== 'Cancelled') {
        buyer.spentCents += buyerSpendCents(o)
        buyer.tipsGivenCents += o.tipCents ?? 0
      }
      if (o.reviewed) buyer.reviewsLeft++
    }

    if (isIncomingOrder(o, plate, userId)) {
      cook.received++
      if (o.status === 'Cancelled') cook.cancelled++
      else if (o.status === 'Picked up') cook.completed++
      else cook.inProgress++
      if (o.status !== 'Cancelled') {
        cook.revenueCents += cookRevenueCents(o)
        cook.tipsReceivedCents += o.tipCents ?? 0
        if (myPlateIds.has(o.plateId)) cook.platesSold++
      }
    }
  }

  const live = myPlates.filter((p) => !p.isDraft && p.portionsAvailable > 0).length
  const draft = myPlates.filter((p) => p.isDraft).length
  const soldOut = myPlates.filter((p) => !p.isDraft && p.portionsAvailable <= 0).length

  const totalViews = Object.entries(views).reduce(
    (sum, [id, count]) => (myPlateIds.has(id) ? sum + count : sum),
    0,
  )
  const soldCount = orders.filter((o) => myPlateIds.has(o.plateId) && o.status !== 'Cancelled').length
  const conversionPct = totalViews > 0 ? (soldCount / totalViews) * 100 : 0

  const rated = myPlates.filter((p) => p.ratingCount > 0)
  const avgRating = rated.length ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length : 0

  return {
    buyer,
    cook,
    listings: {
      total: myPlates.length,
      live,
      draft,
      soldOut,
      totalViews,
      conversionPct,
      avgRating,
      ratedListingCount: rated.length,
    },
  }
}

export function hasProfileActivity(stats: ProfileAnalytics) {
  return (
    stats.buyer.placed > 0 ||
    stats.cook.received > 0 ||
    stats.listings.total > 0 ||
    stats.listings.totalViews > 0
  )
}
