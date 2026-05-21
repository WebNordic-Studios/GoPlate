import { useCallback, useEffect, useState } from 'react'
import type { Message, Order, Plate } from '../types'

export type NotificationKind =
  | 'order_status'
  | 'new_message'
  | 'new_incoming_order'
  | 'waitlist_open'
  | 'review_received'
  | 'verification'
  | 'cook_new_listing'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAtIso: string
  href?: string
  read?: boolean
}

const STORAGE_KEY = 'goplate.notifications.v1'

function safeParse(json: string | null): Record<string, boolean> {
  if (!json) return {}
  try {
    return JSON.parse(json) as Record<string, boolean>
  } catch {
    return {}
  }
}

function uid() {
  return `notif_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function buildNotifications(input: {
  userId: string | null
  orders: Order[]
  messages: Message[]
  platesById: Map<string, Plate>
  waitlistOpenedPlateIds?: string[]
  verificationStatus?: string
  newListingCookNames?: { cookId: string; cookName: string; plateId: string }[]
}): AppNotification[] {
  if (!input.userId) return []
  const rows: AppNotification[] = []

  for (const o of input.orders) {
    const plate = input.platesById.get(o.plateId)
    const isBuyer = o.buyerId === input.userId
    const isCook = o.cookId === input.userId || plate?.cook.id === input.userId

    if (isBuyer && o.status === 'Ready') {
      rows.push({
        id: `${o.id}:ready`,
        kind: 'order_status',
        title: 'Ready for pickup',
        body: `${o.plateName} — show your handoff code at pickup.`,
        createdAtIso: o.timeline?.Ready ?? o.createdAtIso,
        href: `/orders/${o.id}`,
      })
    }
    if (isCook && o.status === 'Reserved' && o.buyerId) {
      rows.push({
        id: `${o.id}:incoming`,
        kind: 'new_incoming_order',
        title: 'New reservation',
        body: `${o.plateName}${o.quantity && o.quantity > 1 ? ` · ${o.quantity} portions` : ''}`,
        createdAtIso: o.createdAtIso,
        href: `/orders/${o.id}`,
      })
    }
    if (o.cancelledBy === 'cook' && isBuyer) {
      rows.push({
        id: `${o.id}:declined`,
        kind: 'order_status',
        title: 'Order declined by cook',
        body: o.cancelReason ?? `${o.plateName} could not be fulfilled.`,
        createdAtIso: o.timeline?.Cancelled ?? o.createdAtIso,
        href: `/orders/${o.id}`,
      })
    }
  }

  const byOrder = new Map<string, Message[]>()
  for (const m of input.messages) {
    const arr = byOrder.get(m.orderId) ?? []
    arr.push(m)
    byOrder.set(m.orderId, arr)
  }
  for (const [orderId, msgs] of byOrder) {
    const last = msgs.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))[0]
    if (!last) continue
    const order = input.orders.find((o) => o.id === orderId)
    if (!order) continue
    const plateName = input.platesById.get(order.plateId)?.name
    const viewerIsBuyer = order.buyerId === input.userId
    const fromOther = viewerIsBuyer ? last.from === 'cook' : last.from === 'buyer'
    if (!fromOther) continue
    rows.push({
      id: `msg:${orderId}:${last.id}`,
      kind: 'new_message',
      title: plateName ? `Message · ${plateName}` : 'New message',
      body: last.body.slice(0, 120),
      createdAtIso: last.createdAtIso,
      href: `/orders?chat=${orderId}`,
    })
  }

  for (const plateId of input.waitlistOpenedPlateIds ?? []) {
    const plate = input.platesById.get(plateId)
    if (!plate) continue
    rows.push({
      id: `waitlist:${plateId}`,
      kind: 'waitlist_open',
      title: 'Waitlist — portions available',
      body: `${plate.name} has openings again.`,
      createdAtIso: new Date().toISOString(),
      href: `/p/${plateId}`,
    })
  }

  if (input.verificationStatus === 'verified') {
    rows.push({
      id: 'verification:verified',
      kind: 'verification',
      title: 'Cook verification approved',
      body: 'Your verified badge is now visible on listings.',
      createdAtIso: new Date().toISOString(),
      href: '/me?tab=analytics',
    })
  }
  if (input.verificationStatus === 'rejected') {
    rows.push({
      id: 'verification:rejected',
      kind: 'verification',
      title: 'Verification needs attention',
      body: 'Please re-submit kitchen documentation from Settings.',
      createdAtIso: new Date().toISOString(),
      href: '/settings',
    })
  }

  for (const row of input.newListingCookNames ?? []) {
    rows.push({
      id: `listing:${row.plateId}`,
      kind: 'cook_new_listing',
      title: `${row.cookName} listed a new dish`,
      body: 'A cook you follow just published a plate.',
      createdAtIso: new Date().toISOString(),
      href: `/p/${row.plateId}`,
    })
  }

  return rows.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
}

export function useNotificationReadState() {
  const [readIds, setReadIds] = useState<Record<string, true>>(() => {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
    const out: Record<string, true> = {}
    for (const id of Object.keys(parsed)) {
      if (parsed[id]) out[id] = true
    }
    return out
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds))
  }, [readIds])

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => ({ ...prev, [id]: true }))
  }, [])

  const markAllRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = { ...prev }
      for (const id of ids) next[id] = true
      return next
    })
  }, [])

  const isRead = useCallback((id: string) => Boolean(readIds[id]), [readIds])

  return { markRead, markAllRead, isRead }
}

export function pushLocalNotification(
  title: string,
  body: string,
  kind: NotificationKind = 'order_status',
): AppNotification {
  return {
    id: uid(),
    kind,
    title,
    body,
    createdAtIso: new Date().toISOString(),
  }
}
