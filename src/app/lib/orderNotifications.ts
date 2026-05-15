import type { Order, OrderStatus } from '../../types'

const FLOW: OrderStatus[] = ['Reserved', 'Cooking', 'Ready', 'Picked up', 'Cancelled']

const STATUS_SUMMARY: Record<OrderStatus, (plateName: string) => string> = {
  Reserved: (plate) => `${plate} · reservation confirmed`,
  Cooking: (plate) => `${plate} · your cook started preparing`,
  Ready: (plate) => `${plate} · ready for pickup`,
  'Picked up': (plate) => `${plate} · picked up — enjoy`,
  Cancelled: (plate) => `${plate} · order cancelled`,
}

export type TimelineNotification = {
  id: string
  orderId: string
  status: OrderStatus
  caption: string
  createdAtIso: string
}

export function buildTimelineNotifications(orders: Order[]): TimelineNotification[] {
  const rows: TimelineNotification[] = []
  for (const o of orders) {
    const tl = o.timeline ?? {}
    let added = 0
    for (const status of FLOW) {
      const iso = tl[status]
      if (!iso) continue
      added += 1
      rows.push({
        id: `${o.id}:${status}:${iso}`,
        orderId: o.id,
        status,
        caption: STATUS_SUMMARY[status](o.plateName),
        createdAtIso: iso,
      })
    }
    if (added === 0) {
      rows.push({
        id: `${o.id}:fallback`,
        orderId: o.id,
        status: o.status,
        caption: STATUS_SUMMARY[o.status](o.plateName),
        createdAtIso: o.createdAtIso,
      })
    }
  }
  return rows.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
}
