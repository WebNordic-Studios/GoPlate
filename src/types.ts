export type Category = 'All' | 'Hot Meals' | 'Bakery' | 'Desserts' | 'Vegan'

export type GeoPoint = {
  lat: number
  lng: number
  areaLabel: string
}

export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'low-carb'
  | 'organic'

export type Allergen =
  | 'gluten'
  | 'dairy'
  | 'eggs'
  | 'peanuts'
  | 'tree-nuts'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame'

export type Cuisine =
  | 'American'
  | 'Italian'
  | 'Mexican'
  | 'Chinese'
  | 'Japanese'
  | 'Korean'
  | 'Thai'
  | 'Indian'
  | 'Mediterranean'
  | 'Middle Eastern'
  | 'Ethiopian'
  | 'French'
  | 'Latin American'
  | 'Caribbean'
  | 'Vietnamese'
  | 'Other'

/** 0 = none, 5 = very spicy. */
export type SpiceLevel = 0 | 1 | 2 | 3 | 4 | 5

export type Plate = {
  id: string
  name: string
  category: Exclude<Category, 'All'>
  cuisine?: Cuisine
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
    /** Mock food-handler / kitchen verification. */
    verified?: boolean
  }
  portionsAvailable: number
  /** Dietary qualities the cook attests to. */
  dietary?: DietaryTag[]
  /** Allergens present in this dish (required disclosure on new listings). */
  allergens?: Allergen[]
  /** 0–5 spice level. */
  spice?: SpiceLevel
  /** ISO timestamp the listing was created. Used to surface "Just listed". */
  createdAtIso?: string
  /** When true, plate is hidden from the public marketplace. */
  isDraft?: boolean
  /** ISO timestamp at which a draft should be auto-published. */
  scheduledPublishAtIso?: string
  /** Optional: cook offers delivery for an extra fee (in cents). */
  deliveryAvailable?: boolean
  deliveryFeeCents?: number
}

export type OrderStatus = 'Reserved' | 'Cooking' | 'Ready' | 'Picked up' | 'Cancelled'

export type Order = {
  id: string
  plateId: string
  plateName: string
  /** Account that placed the order. */
  buyerId?: string
  cookId?: string
  priceCents: number
  pickupWindow: string
  createdAtIso: string
  status: OrderStatus
  /** 4-digit handoff code for confirming pickup. */
  handoffCode?: string
  /** Whether the buyer chose delivery. */
  delivery?: boolean
  deliveryFeeCents?: number
  /** Free-form contactless pickup / delivery instructions. */
  contactlessInstructions?: string
  /** Tip in cents added at checkout. */
  tipCents?: number
  /** Tracks status transitions in ISO timestamps. */
  timeline?: Partial<Record<OrderStatus, string>>
  /** True once the buyer has left a review. */
  reviewed?: boolean
}

export type Review = {
  id: string
  /** Order this review is tied to (one review per completed order). */
  orderId?: string
  plateId: string
  cookId: string
  userId: string
  userName: string
  userAvatarUrl?: string
  rating: number
  body: string
  photoDataUrls?: string[]
  createdAtIso: string
  cookReply?: {
    body: string
    createdAtIso: string
  }
}

export type Message = {
  id: string
  orderId: string
  /** Sender role for prototype: buyer or cook. */
  from: 'buyer' | 'cook'
  body: string
  createdAtIso: string
}

export type Report = {
  id: string
  /** What is being reported. */
  target: { type: 'plate' | 'cook'; id: string }
  reason: string
  details?: string
  createdAtIso: string
  reporterUserId?: string
}

export type SavedAddress = {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
}

export type SavedPaymentMethod = {
  id: string
  label: string
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Other'
  last4: string
  expiry: string
}

export type User = {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  bio?: string
  neighborhood?: string
  /** Mock phone number, optionally verified. */
  phone?: string
  phoneVerified?: boolean
  savedAddresses?: SavedAddress[]
  savedPaymentMethods?: SavedPaymentMethod[]
  /** Cook badge state (mock — `pending` after upload, `verified` after approval). */
  cookVerification?: 'none' | 'pending' | 'verified'
  /** IDs of cooks or plates this user has hidden/blocked. */
  blockedCookIds?: string[]
}
