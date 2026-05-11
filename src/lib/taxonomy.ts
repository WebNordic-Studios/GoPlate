import type { Allergen, Cuisine, DietaryTag } from '../types'

export const DIETARY_TAGS: { id: DietaryTag; label: string }[] = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'nut-free', label: 'Nut-free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'low-carb', label: 'Low-carb' },
  { id: 'organic', label: 'Organic' },
]

export const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree nuts' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'sesame', label: 'Sesame' },
]

export const CUISINES: Cuisine[] = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Indian',
  'Mediterranean',
  'Middle Eastern',
  'Ethiopian',
  'French',
  'Latin American',
  'Caribbean',
  'Vietnamese',
  'Other',
]

export function dietaryLabel(t: DietaryTag): string {
  return DIETARY_TAGS.find((x) => x.id === t)?.label ?? t
}

export function allergenLabel(a: Allergen): string {
  return ALLERGENS.find((x) => x.id === a)?.label ?? a
}
