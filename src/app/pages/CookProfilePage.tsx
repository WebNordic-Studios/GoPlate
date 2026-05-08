import { Star } from 'lucide-react'
import type { Plate } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { Button } from '../../ui/Button'

export function CookProfilePage({
  cookId,
  plates,
  onOpenPlate,
  onReservePlate,
  isFollowing,
  onToggleFollow,
}: {
  cookId: string
  plates: Plate[]
  onOpenPlate: (plateId: string) => void
  onReservePlate: (plateId: string) => void
  isFollowing: boolean
  onToggleFollow: () => void
}) {
  const byCook = plates.filter((p) => p.cook.id === cookId)
  const cook = byCook[0]?.cook

  if (!cook) {
    return (
      <div className="gp-container pb-28 pt-6 md:pb-10">
        <div className="rounded-2xl bg-white/70 p-6 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
          Cook profile not found.
        </div>
      </div>
    )
  }

  const avg = byCook.length
    ? byCook.reduce((acc, p) => acc + p.rating, 0) / byCook.length
    : 0

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img
            src={cook.avatarUrl}
            alt={cook.name}
            className="h-16 w-16 rounded-[2rem] object-cover ring-1 ring-black/10"
          />
          <div>
            <div className="font-display text-2xl font-semibold">{cook.name}</div>
            <div className="mt-1 text-sm text-gp-charcoal/70">{cook.bio}</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gp-charcoal/70">
              <Star size={16} className="text-gp-primary" fill="currentColor" />
              <span className="font-semibold">{avg.toFixed(1)}</span>
              <span className="text-gp-charcoal/50">avg rating • {byCook.length} listings</span>
            </div>
          </div>
        </div>
        <Button variant={isFollowing ? 'ghost' : 'secondary'} onClick={onToggleFollow}>
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byCook.map((p) => (
          <PlateCard
            key={p.id}
            plate={p}
            onOpen={() => onOpenPlate(p.id)}
            onReserve={() => onReservePlate(p.id)}
          />
        ))}
      </div>
    </div>
  )
}

