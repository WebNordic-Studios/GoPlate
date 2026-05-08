import { createContext, useContext } from 'react'
import type { Order, Plate } from '../types'

export type MarketplaceApi = {
  plates: Plate[]
  orders: Order[]
  byId: Map<string, Plate>
  addPlate: (input: Omit<Plate, 'id'>) => string
  reservePlate: (plateId: string) => string | null
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

