import { useCallback, useEffect, useMemo, useState } from 'react'
import { SEED_PLATES } from '../data/mockPlates'
import type { Order, OrderStatus, Plate } from '../types'
import { geoForZip } from '../lib/geo'
import { generateHandoffCode } from '../lib/format'
import { pickupDetailsForPlate } from '../lib/pickup'

const STORAGE_KEY = 'goplate.marketplace.v1'
const VIEWS_STORAGE_KEY = 'goplate.plateViews.v1'

type PersistedState = {
  plates: Plate[]
  orders: Order[]
}

function safeParse(json: string | null): PersistedState | null {
  if (!json) return null
  try {
    return JSON.parse(json) as PersistedState
  } catch {
    return null
  }
}

function safeParseViews(json: string | null): Record<string, number> {
  if (!json) return {}
  try {
    const obj = JSON.parse(json) as unknown
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}

    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return {}

    const firstVal = entries[0]?.[1]
    if (firstVal && typeof firstVal === 'object' && !Array.isArray(firstVal)) {
      const merged: Record<string, number> = {}
      for (const [, bucket] of entries) {
        if (bucket && typeof bucket === 'object' && !Array.isArray(bucket)) {
          for (const [plateId, count] of Object.entries(bucket as Record<string, unknown>)) {
            if (typeof count === 'number') merged[plateId] = (merged[plateId] ?? 0) + count
          }
        }
      }
      return merged
    }

    const out: Record<string, number> = {}
    for (const [plateId, count] of entries) {
      if (typeof count === 'number') out[plateId] = count
    }
    return out
  } catch {
    return {}
  }
}

function cookIdFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, 32)
  return `cook_${slug || 'unknown'}`
}

function migratePlate(p: unknown): Plate {
  if (typeof p !== 'object' || p === null) {
    throw new Error('Invalid plate in local storage')
  }
  const x = p as Partial<Plate> & { cook?: Partial<Plate['cook']> }
  const zip = typeof x.zip === 'string' ? x.zip : ''
  const geo = x.geo && typeof x.geo.lat === 'number' && typeof x.geo.lng === 'number' ? x.geo : geoForZip(zip)

  const cookName = x.cook?.name ?? 'Cook'
  const cook = {
    id: x.cook?.id ?? cookIdFromName(cookName),
    name: cookName,
    avatarUrl:
      x.cook?.avatarUrl ??
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    bio: x.cook?.bio ?? 'Neighborhood cook on GoPlate.',
    verified: x.cook?.verified ?? false,
  }

  return {
    ...x,
    zip,
    geo,
    cook,
  } as Plate
}

function loadInitial(): PersistedState {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
  if (parsed?.plates?.length) {
    return {
      plates: parsed.plates.map(migratePlate),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    }
  }
  return { plates: SEED_PLATES, orders: [] }
}

function persist(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function useMarketplace() {
  const [plates, setPlates] = useState<Plate[]>(() => loadInitial().plates)
  const [orders, setOrders] = useState<Order[]>(() => loadInitial().orders)
  const [views, setViews] = useState<Record<string, number>>(() =>
    safeParseViews(localStorage.getItem(VIEWS_STORAGE_KEY)),
  )

  useEffect(() => {
    persist({ plates, orders })
  }, [plates, orders])

  useEffect(() => {
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views))
  }, [views])

  // Auto-publish any scheduled drafts whose time has arrived. Runs once on
  // mount and then periodically; reads `plates` via the setter callback so we
  // don't depend on the latest state value (which would cause cascading
  // renders inside an effect).
  useEffect(() => {
    function flushDue() {
      setPlates((prev) => {
        const now = Date.now()
        let changed = false
        const next = prev.map((p) => {
          if (
            p.isDraft &&
            p.scheduledPublishAtIso &&
            new Date(p.scheduledPublishAtIso).getTime() <= now
          ) {
            changed = true
            return { ...p, isDraft: false, scheduledPublishAtIso: undefined }
          }
          return p
        })
        return changed ? next : prev
      })
    }
    flushDue()
    const handle = window.setInterval(flushDue, 30_000)
    return () => window.clearInterval(handle)
  }, [])

  const byId = useMemo(() => {
    const map = new Map<string, Plate>()
    for (const p of plates) map.set(p.id, p)
    return map
  }, [plates])

  const addPlate = useCallback((input: Omit<Plate, 'id'>) => {
    const plate: Plate = {
      ...input,
      id: uid('plate'),
      createdAtIso: input.createdAtIso ?? new Date().toISOString(),
    }
    setPlates((prev) => [plate, ...prev])
    return plate.id
  }, [])

  const updatePlate = useCallback((id: string, patch: Partial<Plate>) => {
    setPlates((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const removePlate = useCallback((id: string) => {
    setPlates((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const reservePlate = useCallback(
    (
      plateId: string,
      opts?: {
        buyerId?: string
        delivery?: boolean
        contactlessInstructions?: string
        tipCents?: number
        quantity?: number
        contactName?: string
        contactPhone?: string
      },
    ) => {
      const plate = byId.get(plateId)
      if (!plate) return null
      if (plate.isDraft) return null
      const qty = Math.max(1, Math.min(opts?.quantity ?? 1, plate.portionsAvailable))
      if (qty > plate.portionsAvailable) return null

      setPlates((prev) =>
        prev.map((p) =>
          p.id === plateId ? { ...p, portionsAvailable: Math.max(0, p.portionsAvailable - qty) } : p,
        ),
      )

      const nowIso = new Date().toISOString()
      const delivery = Boolean(opts?.delivery && plate.deliveryAvailable)
      const pickup = pickupDetailsForPlate(plate)
      const subtotalCents = plate.priceCents * qty
      const order: Order = {
        id: uid('order'),
        plateId,
        plateName: plate.name,
        buyerId: opts?.buyerId,
        cookId: plate.cook.id,
        priceCents: plate.priceCents,
        subtotalCents,
        quantity: qty,
        pickupWindow: plate.pickupWindow,
        createdAtIso: nowIso,
        status: 'Reserved',
        handoffCode: generateHandoffCode(),
        delivery,
        deliveryFeeCents: delivery ? plate.deliveryFeeCents ?? 0 : undefined,
        contactlessInstructions: opts?.contactlessInstructions?.trim() || undefined,
        tipCents: opts?.tipCents && opts.tipCents > 0 ? opts.tipCents : undefined,
        contactName: opts?.contactName?.trim() || undefined,
        contactPhone: opts?.contactPhone?.trim() || undefined,
        pickupAddressLine: pickup.pickupAddressLine,
        pickupInstructions: pickup.pickupInstructions,
        timeline: { Reserved: nowIso },
      }
      setOrders((prev) => [order, ...prev])
      return order.id
    },
    [byId],
  )

  const cancelOrder = useCallback((orderId: string, by: 'buyer' | 'cook', reason?: string) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId)
      if (!order || order.status === 'Picked up' || order.status === 'Cancelled') return prev
      const qty = order.quantity ?? 1
      setPlates((plates) =>
        plates.map((p) =>
          p.id === order.plateId ? { ...p, portionsAvailable: p.portionsAvailable + qty } : p,
        ),
      )
      const now = new Date().toISOString()
      return prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelled',
              cancelledBy: by,
              cancelReason: reason?.trim() || undefined,
              timeline: { ...(o.timeline ?? {}), Cancelled: now },
            }
          : o,
      )
    })
  }, [])

  const getOrder = useCallback(
    (orderId: string) => orders.find((o) => o.id === orderId) ?? null,
    [orders],
  )

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              timeline: { ...(o.timeline ?? {}), [status]: new Date().toISOString() },
            }
          : o,
      ),
    )
  }, [])

  const markOrderReviewed = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o)))
  }, [])

  const clearOrderReviewed = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, reviewed: false } : o)))
  }, [])

  const recordView = useCallback((plateId: string) => {
    setViews((prev) => ({ ...prev, [plateId]: (prev[plateId] ?? 0) + 1 }))
  }, [])

  return {
    plates,
    orders,
    byId,
    views,
    addPlate,
    updatePlate,
    removePlate,
    reservePlate,
    cancelOrder,
    getOrder,
    updateOrderStatus,
    markOrderReviewed,
    clearOrderReviewed,
    recordView,
  }
}
