import { Check, Circle } from 'lucide-react'
import type { Plate } from '../../types'

export function CookListingChecklist({ plates, userId }: { plates: Plate[]; userId: string }) {
  const mine = plates.filter((p) => p.cook.id === userId)
  const hasLive = mine.some((p) => !p.isDraft && p.portionsAvailable > 0)
  const hasPhoto = mine.some((p) => p.images.length > 0)
  const hasAllergens = mine.some((p) => (p.allergens?.length ?? 0) > 0 || p.dietary?.length)
  const hasPickup = mine.some((p) => p.pickupAddressLine || p.pickupInstructions)

  const steps = [
    { done: hasPhoto, label: 'Add at least one listing photo' },
    { done: hasAllergens, label: 'Disclose allergens or dietary tags' },
    { done: hasPickup, label: 'Set pickup address or instructions' },
    { done: hasLive, label: 'Publish a live plate with portions' },
  ]

  if (steps.every((s) => s.done)) return null

  return (
    <div className="rounded-[2rem] bg-gp-secondary/10 p-5 ring-1 ring-gp-secondary/20">
      <div className="font-display text-base font-semibold text-gp-charcoal">First listing checklist</div>
      <p className="mt-1 text-sm text-gp-charcoal/65">Complete these before your first reservation.</p>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? (
              <Check size={16} className="shrink-0 text-gp-secondary" aria-hidden />
            ) : (
              <Circle size={16} className="shrink-0 text-gp-charcoal/35" aria-hidden />
            )}
            <span className={s.done ? 'text-gp-charcoal/55 line-through' : 'font-medium text-gp-charcoal'}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
