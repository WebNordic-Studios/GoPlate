import { useCallback, useEffect, useMemo, useState } from 'react'
import { SEED_PLATES } from '../data/mockPlates'
import type { Order, OrderStatus, Plate } from '../types'
import { geoForZip } from '../lib/geo'
import { generateHandoffCode } from '../lib/format'

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
    if (obj && typeof obj === 'object') return obj as Record<string, number>
    return {}
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
      },
    ) => {
      const plate = byId.get(plateId)
      if (!plate) return null
      if (plate.portionsAvailable <= 0) return null
      if (plate.isDraft) return null

      setPlates((prev) =>
        prev.map((p) => (p.id === plateId ? { ...p, portionsAvailable: p.portionsAvailable - 1 } : p)),
      )

      const nowIso = new Date().toISOString()
      const delivery = Boolean(opts?.delivery && plate.deliveryAvailable)
      const order: Order = {
        id: uid('order'),
        plateId,
        plateName: plate.name,
        buyerId: opts?.buyerId,
        cookId: plate.cook.id,
        priceCents: plate.priceCents,
        pickupWindow: plate.pickupWindow,
        createdAtIso: nowIso,
        status: 'Reserved',
        handoffCode: generateHandoffCode(),
        delivery,
        deliveryFeeCents: delivery ? plate.deliveryFeeCents ?? 0 : undefined,
        contactlessInstructions: opts?.contactlessInstructions?.trim() || undefined,
        tipCents: opts?.tipCents && opts.tipCents > 0 ? opts.tipCents : undefined,
        timeline: { Reserved: nowIso },
      }
      setOrders((prev) => [order, ...prev])
      return order.id
    },
    [byId],
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
    updateOrderStatus,
    markOrderReviewed,
    clearOrderReviewed,
    recordView,
  }
}
