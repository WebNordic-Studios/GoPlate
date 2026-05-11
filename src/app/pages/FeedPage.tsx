import { useMemo } from 'react'
import { Heart, UserPlus2 } from 'lucide-react'
import type { Plate } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { EmptyState } from '../../ui/EmptyState'
import { Button } from '../../ui/Button'
import { useNavigate } from 'react-router-dom'

export function FeedPage({
  plates,
  followsByCookId,
  likesByPlateId,
  onOpenPlate,
  onReservePlate,
  onOpenCook,
}: {
  plates: Plate[]
  followsByCookId: Record<string, true>
  likesByPlateId: Record<string, true>
  onOpenPlate: (id: string) => void
  onReservePlate: (id: string) => void
  onOpenCook?: (cookId: string) => void
}) {
  const navigate = useNavigate()
  const followed = useMemo(
    () =>
      plates
        .filter((p) => !p.isDraft && followsByCookId[p.cook.id])
        .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? '')),
    [plates, followsByCookId],
  )

  const likedPlates = useMemo(
    () => plates.filter((p) => likesByPlateId[p.id]),
    [plates, likesByPlateId],
  )

  // Simple recommendation: same category or cuisine as something you like, excluding
  // already-liked plates and ones from followed cooks (those have their own rail).
  const recommended = useMemo(() => {
    if (likedPlates.length === 0) return [] as Plate[]
    const likedCategories = new Set(likedPlates.map((p) => p.category))
    const likedCuisines = new Set(likedPlates.map((p) => p.cuisine).filter(Boolean))
    return plates
      .filter(
        (p) =>
          !p.isDraft &&
          !likesByPlateId[p.id] &&
          !followsByCookId[p.cook.id] &&
          (likedCategories.has(p.category) || (p.cuisine && likedCuisines.has(p.cuisine))),
      )
      .slice(0, 9)
  }, [plates, likedPlates, likesByPlateId, followsByCookId])

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">Your feed</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Fresh drops from cooks you follow, plus dishes picked from what you've liked.
          </p>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="following-rail">
        <h2 id="following-rail" className="flex items-center gap-2 font-display text-lg font-semibold">
          <UserPlus2 size={18} className="text-gp-secondary" aria-hidden /> From cooks you follow
        </h2>
        {followed.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<UserPlus2 size={20} />}
              title="Follow cooks to fill your feed"
              description="Tap “Follow” on a cook profile or plate detail and we'll surface their new listings here."
              action={
                <Button variant="primary" onClick={() => navigate('/market')}>
                  Browse the marketplace
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {followed.map((p) => (
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
      </section>

      {recommended.length > 0 ? (
        <section className="mt-10" aria-labelledby="recs-rail">
          <h2 id="recs-rail" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Heart size={18} className="text-gp-primary" aria-hidden /> Based on what you've liked
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((p) => (
              <PlateCard
                key={p.id}
                plate={p}
                onOpen={() => onOpenPlate(p.id)}
                onReserve={() => onReservePlate(p.id)}
                onOpenCook={onOpenCook ? () => onOpenCook(p.cook.id) : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
