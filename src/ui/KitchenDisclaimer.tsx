import { AlertTriangle } from 'lucide-react'

export function KitchenDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-amber-50/90 ring-1 ring-amber-200/80 ${compact ? 'p-3' : 'p-4'}`}
      role="note"
    >
      <div className={`flex gap-2.5 ${compact ? 'text-xs' : 'text-sm'} text-amber-950/90`}>
        <AlertTriangle size={compact ? 16 : 18} className="mt-0.5 shrink-0 text-amber-700" aria-hidden />
        <div className="space-y-1.5 leading-relaxed">
          <p className="font-semibold">Home kitchen — not a licensed restaurant</p>
          <p className="text-amber-950/80">
            Meals on GoPlate are prepared in private home kitchens that are{' '}
            <span className="font-semibold">not inspected</span> by health authorities. Cooks self-disclose
            ingredients and allergens; availability and quality may vary. By reserving, you accept these risks and
            agree GoPlate is a marketplace platform, not the seller of food.
          </p>
        </div>
      </div>
    </div>
  )
}
