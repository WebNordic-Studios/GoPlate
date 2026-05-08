export type Category = 'All' | 'Hot Meals' | 'Bakery' | 'Desserts' | 'Vegan'

export type GeoPoint = {
  lat: number
  lng: number
  areaLabel: string
}

export type Plate = {
  id: string
  name: string
  category: Exclude<Category, 'All'>
  priceCents: number
  distanceMiles: number
  rating: number
  ratingCount: number
  pickupWindow: string
  zip: string
  geo: GeoPoint
  images: string[]
  ingredients: string[]
  cooksNote: string
  cook: {
    id: string
    name: string
    avatarUrl: string
    bio: string
  }
  portionsAvailable: number
}

export type Order = {
  id: string
  plateId: string
  plateName: string
  priceCents: number
  pickupWindow: string
  createdAtIso: string
  status: 'Reserved' | 'Picked up' | 'Cancelled'
}

export type User = {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
}

