import type { Order, Plate } from '../../types'

export function plateBelongsToUser(plate: Plate, userId: string) {
  return plate.cook.id === userId || plate.cook.id === 'cook_you'
}

export function isIncomingOrder(order: Order, plate: Plate | undefined, userId: string) {
  return order.cookId === userId || plate?.cook.id === userId || plate?.cook.id === 'cook_you'
}

export function isPlacedOrder(order: Order, plate: Plate | undefined, userId: string) {
  if (order.buyerId) return order.buyerId === userId
  return !isIncomingOrder(order, plate, userId)
}

export function isOrderFinished(status: Order['status']) {
  return status === 'Picked up' || status === 'Cancelled'
}
