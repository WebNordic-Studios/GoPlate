import type { Order, Plate } from '../types'

/** Mock exact address from plate geo — production would come from cook settings post-checkout. */
export function pickupDetailsForPlate(plate: Plate) {
  const line =
    plate.pickupAddressLine ??
    `${plate.geo.areaLabel} · near ZIP ${plate.zip} (exact door shared after reserve)`
  const instructions =
    plate.pickupInstructions ??
    'Ring the bell once on arrival. Reply in order messages if you are running late.'
  return { pickupAddressLine: line, pickupInstructions: instructions }
}

export function enrichOrderWithPickup(order: Order, plate: Plate | undefined): Order {
  if (!plate) return order
  const { pickupAddressLine, pickupInstructions } = pickupDetailsForPlate(plate)
  return {
    ...order,
    pickupAddressLine: order.pickupAddressLine ?? pickupAddressLine,
    pickupInstructions: order.pickupInstructions ?? pickupInstructions,
  }
}
