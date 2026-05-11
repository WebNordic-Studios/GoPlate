import { AlertTriangle, BadgeCheck, Flame } from 'lucide-react'
import type { Allergen, DietaryTag, SpiceLevel } from '../types'
import { allergenLabel, dietaryLabel } from '../lib/taxonomy'

const DIETARY_STYLE: Partial<Record<DietaryTag, string>> = {
  vegan: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  vegetarian: 'bg-lime-100 text-lime-800 ring-lime-200',
  'gluten-free': 'bg-amber-100 text-amber-800 ring-amber-200',
  'dairy-free': 'bg-sky-100 text-sky-800 ring-sky-200',
  'nut-free': 'bg-orange-100 text-orange-800 ring-orange-200',
  halal: 'bg-teal-100 text-teal-800 ring-teal-200',
  kosher: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  'low-carb': 'bg-violet-100 text-violet-800 ring-violet-200',
  organic: 'bg-green-100 text-green-800 ring-green-200',
}

export function DietaryBadge({ tag, size = 'sm' }: { tag: DietaryTag; size?: 'xs' | 'sm' }) {
  const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${sz} ${
        DIETARY_STYLE[tag] ?? 'bg-black/5 text-gp-charcoal/70 ring-black/10'
      }`}
    >
      {dietaryLabel(tag)}
    </span>
  )
}

export function AllergenChip({ allergen, size = 'sm' }: { allergen: Allergen; size?: 'xs' | 'sm' }) {
  const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-rose-50 font-semibold text-rose-700 ring-1 ring-rose-200 ${sz}`}
    >
      <AlertTriangle size={12} aria-hidden />
      {allergenLabel(allergen)}
    </span>
  )
}

export function SpiceMeter({ level }: { level: SpiceLevel }) {
  if (!level || level <= 0) return null
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200"
      aria-label={`Spice level ${level} of 5`}
      title={`Spice ${level}/5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          size={10}
          className={i < level ? 'text-orange-600' : 'text-orange-200'}
          fill={i < level ? 'currentColor' : 'none'}
          aria-hidden
        />
      ))}
    </span>
  )
}

export function VerifiedBadge({ size = 'sm' }: { size?: 'xs' | 'sm' }) {
  const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gp-secondary/10 font-semibold text-gp-secondary ring-1 ring-gp-secondary/20 ${sz}`}
      title="Food-handler verified cook"
    >
      <BadgeCheck size={12} aria-hidden />
      Verified
    </span>
  )
}
