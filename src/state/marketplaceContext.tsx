/* Context modules pair a provider with a consumer hook; both must live together. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { Order, OrderStatus, Plate } from '../types'

export type MarketplaceApi = {
  plates: Plate[]
  orders: Order[]
  byId: Map<string, Plate>
  views: Record<string, number>
  addPlate: (input: Omit<Plate, 'id'>) => string
  updatePlate: (id: string, patch: Partial<Plate>) => void
  removePlate: (id: string) => void
  reservePlate: (
    plateId: string,
    opts?: { delivery?: boolean; contactlessInstructions?: string; tipCents?: number },
  ) => string | null
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  markOrderReviewed: (orderId: string) => void
  recordView: (plateId: string) => void
}

const Ctx = createContext<MarketplaceApi | null>(null)

export function MarketplaceProvider({ value, children }: { value: MarketplaceApi; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMarketplaceContext() {
  const v = useContext(Ctx)
  if (!v) throw new Error('MarketplaceProvider missing')
  return v
}
