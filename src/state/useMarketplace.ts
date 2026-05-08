import { useEffect, useMemo, useState } from 'react'
import { SEED_PLATES } from '../data/mockPlates'
import type { Order, Plate } from '../types'
import { geoForZip } from '../lib/geo'

const STORAGE_KEY = 'goplate.marketplace.v1'

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

function cookIdFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, 32)
  return `cook_${slug || 'unknown'}`
}

function migratePlate(p: any): Plate {
  const zip = typeof p.zip === 'string' ? p.zip : ''
  const geo = p.geo && typeof p.geo.lat === 'number' && typeof p.geo.lng === 'number' ? p.geo : geoForZip(zip)

  const cookName = p.cook?.name ?? 'Cook'
  const cook = {
    id: p.cook?.id ?? cookIdFromName(cookName),
    name: cookName,
    avatarUrl:
      p.cook?.avatarUrl ??
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    bio: p.cook?.bio ?? 'Neighborhood cook on GoPlate.',
  }

  return {
    ...p,
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

  useEffect(() => {
    persist({ plates, orders })
  }, [plates, orders])

  const byId = useMemo(() => {
    const map = new Map<string, Plate>()
    for (const p of plates) map.set(p.id, p)
    return map
  }, [plates])

  function addPlate(input: Omit<Plate, 'id'>) {
    const plate: Plate = { ...input, id: uid('plate') }
    setPlates((prev) => [plate, ...prev])
    return plate.id
  }

  function reservePlate(plateId: string) {
    const plate = byId.get(plateId)
    if (!plate) return null
    if (plate.portionsAvailable <= 0) return null

    setPlates((prev) =>
      prev.map((p) => (p.id === plateId ? { ...p, portionsAvailable: p.portionsAvailable - 1 } : p)),
    )

    const order: Order = {
      id: uid('order'),
      plateId,
      plateName: plate.name,
      priceCents: plate.priceCents,
      pickupWindow: plate.pickupWindow,
      createdAtIso: new Date().toISOString(),
      status: 'Reserved',
    }
    setOrders((prev) => [order, ...prev])
    return order.id
  }

  return { plates, orders, byId, addPlate, reservePlate }
}

