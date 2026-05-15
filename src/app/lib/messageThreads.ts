import type { Message, Order, Plate } from '../../types'

export function lastMessageInThread(messages: Message[]) {
  if (!messages.length) return null as Message | null
  return messages.reduce((latest, m) => (m.createdAtIso >= latest.createdAtIso ? m : latest), messages[0])
}

export type MessageThreadPreview = {
  order: Order
  plate: Plate | undefined
  msgs: Message[]
  last: Message | null
}

export function buildSortedMessageThreads(
  orders: Order[],
  messagesByOrderId: Map<string, Message[]>,
  platesById: Map<string, Plate>,
): MessageThreadPreview[] {
  return [...orders]
    .map((order) => {
      const msgs = messagesByOrderId.get(order.id) ?? []
      return {
        order,
        plate: platesById.get(order.plateId),
        msgs,
        last: lastMessageInThread(msgs),
      }
    })
    .sort((a, b) => {
      const ta = a.last?.createdAtIso ?? a.order.createdAtIso
      const tb = b.last?.createdAtIso ?? b.order.createdAtIso
      return tb.localeCompare(ta)
    })
}
