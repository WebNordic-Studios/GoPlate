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

export function messageRoleForOrder(
  order: Order,
  userId: string | undefined,
  plate: Plate | undefined,
): 'buyer' | 'cook' {
  if (!userId) return 'buyer'
  if (order.buyerId === userId) return 'buyer'
  if (isIncomingOrder(order, plate, userId)) return 'cook'
  return 'buyer'
}

export function messagePeerLabel(viewerRole: 'buyer' | 'cook', plate: Plate | undefined) {
  return viewerRole === 'buyer' ? (plate?.cook.name ?? 'Cook') : 'Buyer'
}
