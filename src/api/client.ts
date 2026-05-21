import type { Order, Plate, User } from '../types'
import { ApiError, simulateNetwork } from './types'

/** Local API facade — swap implementations when a real backend ships. */
export type MarketplaceApi = {
  listPlates: () => Promise<Plate[]>
  listOrders: () => Promise<Order[]>
  reservePlate: (
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
  ) => Promise<string | null>
  updatePlate: (id: string, patch: Partial<Plate>) => Promise<Plate | null>
  removePlate: (id: string) => Promise<void>
}

export type AuthApi = {
  getSession: () => Promise<User | null>
}

export type GoPlateApi = {
  marketplace: MarketplaceApi
  auth: AuthApi
}

export function createLocalApi(handlers: {
  getPlates: () => Plate[]
  getOrders: () => Order[]
  getUser: () => User | null
  reservePlate: MarketplaceApi['reservePlate']
  updatePlate: (id: string, patch: Partial<Plate>) => Plate | null
  removePlate: (id: string) => void
}): GoPlateApi {
  return {
    auth: {
      getSession: () => simulateNetwork(() => handlers.getUser(), 120),
    },
    marketplace: {
      listPlates: () => simulateNetwork(() => handlers.getPlates()),
      listOrders: () => simulateNetwork(() => handlers.getOrders(), 200),
      reservePlate: (plateId, opts) => simulateNetwork(() => handlers.reservePlate(plateId, opts), 450),
      updatePlate: (id, patch) =>
        simulateNetwork(() => handlers.updatePlate(id, patch) ?? null, 320),
      removePlate: (id) => simulateNetwork(() => handlers.removePlate(id), 280),
    },
  }
}

export function mapApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof Error) return new ApiError(err.message, { code: 'client_error' })
  return new ApiError('Something went wrong. Please try again.', { code: 'unknown' })
}
