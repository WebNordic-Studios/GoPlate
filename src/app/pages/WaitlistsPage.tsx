import { Bell, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Plate } from '../../types'
import { PlateCard } from '../components/PlateCard'
import { plateCardWaitlistProps } from '../components/PlateCardExtras'
import { EmptyState } from '../../ui/EmptyState'

export function WaitlistsPage({
  plates,
  joinedPlateIds,
  waitlist,
  onOpenPlate,
  onReservePlate,
}: {
  plates: Plate[]
  joinedPlateIds: string[]
  waitlist: {
    isJoined: (id: string) => boolean
    onJoin: (id: string) => void
    onLeave: (id: string) => void
    requiresLogin: boolean
    onLogin: () => void
  }
  onOpenPlate: (id: string) => void
  onReservePlate: (id: string) => void
}) {
  const set = new Set(joinedPlateIds)
  const entries = plates.filter((p) => set.has(p.id))

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">My waitlists</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Plates you joined when sold out — we notify you when portions reopen.
          </p>
        </div>
        <div className="rounded-2xl bg-gp-surface/70 px-4 py-2 text-sm font-semibold ring-1 ring-black/5">
          {entries.length} active
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Bell size={20} />}
            title="No waitlists yet"
            description="Tap Join waitlist on a sold-out dish from the marketplace or plate detail."
            action={
              <Link
                to="/market"
                className="gp-focus inline-flex rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Browse marketplace
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((p) => (
            <PlateCard
              key={p.id}
              plate={p}
              onOpen={() => onOpenPlate(p.id)}
              onReserve={() => onReservePlate(p.id)}
              {...plateCardWaitlistProps(p.id, waitlist)}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gp-charcoal/50">
        Also save plates with <Heart size={12} className="inline" aria-hidden /> on{' '}
        <Link to="/favorites" className="font-semibold text-gp-primary underline">
          Favorites
        </Link>
        .
      </p>
    </div>
  )
}
