import type { Message, Order } from '../../types'

/**
 * Prototype unread rule: inbound (cook) exists after your last outbound (buyer) message —
 * thread needs the buyer's attention. Cook-only threads count as unread.
 */
export function threadHasCookInboundAfterLastBuyerMessage(msgs: Message[]): boolean {
  if (!msgs.length) return false
  const sorted = [...msgs].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
  let lastBuyerIso = ''
  for (const m of sorted) {
    if (m.from === 'buyer') lastBuyerIso = m.createdAtIso
  }
  if (!lastBuyerIso) {
    return sorted.some((m) => m.from === 'cook')
  }
  return sorted.some((m) => m.from === 'cook' && m.createdAtIso > lastBuyerIso)
}

export function countMessageThreadsUnread(
  orders: Order[],
  messagesByOrderId: Map<string, Message[]>,
): number {
  let n = 0
  for (const order of orders) {
    const msgs = messagesByOrderId.get(order.id) ?? []
    if (threadHasCookInboundAfterLastBuyerMessage(msgs)) n++
  }
  return n
}

/** Bell badge: actionable pickup alerts (prototype). */
export function countPickupReadyBellBadge(orders: Order[]): number {
  return orders.filter((o) => o.status === 'Ready').length
}
