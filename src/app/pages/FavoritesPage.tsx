import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Plate } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { EmptyState } from '../../ui/EmptyState'

export function FavoritesPage({
  plates,
  likesByPlateId,
  onOpenPlate,
  onReservePlate,
  onOpenCook,
}: {
  plates: Plate[]
  likesByPlateId: Record<string, true>
  onOpenPlate: (plateId: string) => void
  onReservePlate: (plateId: string) => void
  onOpenCook?: (cookId: string) => void
}) {
  const favorites = plates.filter((p) => likesByPlateId[p.id] && !p.isDraft)

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Favorites</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Plates you have liked — tap the heart on any dish to add it here.
          </p>
        </div>
        <div className="rounded-2xl bg-gp-surface/70 px-4 py-2 text-sm font-semibold text-gp-charcoal/70 ring-1 ring-black/5">
          {favorites.length} saved
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Heart size={20} />}
            title="No favorites yet"
            description="When you like a plate from the marketplace or dish detail, it appears here for quick access."
            action={
              <Link
                to="/market"
                className="gp-focus inline-flex items-center justify-center rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-natural"
              >
                Browse marketplace
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <PlateCard
              key={p.id}
              plate={p}
              onOpen={() => onOpenPlate(p.id)}
              onReserve={() => onReservePlate(p.id)}
              onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
