import { useMemo } from 'react'
import type { Category, Plate } from '../../types'
import { CategoryRibbon } from '../components/CategoryRibbon'
import { PlateCard } from '../components/PlateCard'

export function MarketplacePage({
  plates,
  zip,
  category,
  onChangeCategory,
  onOpenPlate,
  onReservePlate,
  onOpenCook,
}: {
  plates: Plate[]
  zip: string
  category: Category
  onChangeCategory: (c: Category) => void
  onOpenPlate: (plateId: string) => void
  onReservePlate: (plateId: string) => void
  onOpenCook?: (cookId: string) => void
}) {
  const filtered = useMemo(() => {
    const z = zip.trim()
    return plates.filter((p) => {
      const zipOk = z ? p.zip.startsWith(z) : true
      const catOk = category === 'All' ? true : p.category === category
      return zipOk && catOk
    })
  }, [plates, zip, category])

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Marketplace</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            {zip.trim() ? (
              <>
                Showing results near <span className="font-semibold">{zip.trim()}</span>
              </>
            ) : (
              'Browse what neighbors are cooking today.'
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
          {filtered.length} plates
        </div>
      </div>

      <div className="mt-5">
        <CategoryRibbon value={category} onChange={onChangeCategory} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PlateCard
            key={p.id}
            plate={p}
            onOpen={() => onOpenPlate(p.id)}
            onReserve={() => onReservePlate(p.id)}
            onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white/70 p-6 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
          No plates match your filters yet. Try a different zip or category — or be the first to list something
          delicious.
        </div>
      ) : null}
    </div>
  )
}

