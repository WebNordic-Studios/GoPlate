import { Ban, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Plate, User } from '../../types'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'

export function BlockedCooksPanel({
  user,
  plates,
  onUnblock,
}: {
  user: User
  plates: Plate[]
  onUnblock: (cookId: string) => void
}) {
  const navigate = useNavigate()
  const blocked = user.blockedCookIds ?? []

  const blockedCooks = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatarUrl: string }>()
    for (const id of blocked) {
      const plate = plates.find((p) => p.cook.id === id)
      if (plate) {
        map.set(id, { id, name: plate.cook.name, avatarUrl: plate.cook.avatarUrl })
      } else {
        map.set(id, {
          id,
          name: 'Blocked cook',
          avatarUrl:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        })
      }
    }
    return Array.from(map.values())
  }, [blocked, plates])

  if (blocked.length === 0) {
    return (
      <EmptyState
        icon={<UserRound size={20} />}
        title="No blocked cooks"
        description="When you block a cook from their profile, they appear here so you can unblock them later."
      />
    )
  }

  return (
    <ul className="mt-4 grid gap-3">
      {blockedCooks.map((c) => (
        <li
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gp-surface/80 p-4 ring-1 ring-black/5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <img src={c.avatarUrl} alt="" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-black/10" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Ban size={14} className="shrink-0 text-gp-charcoal/50" aria-hidden />
                {c.name}
              </div>
              <p className="mt-0.5 text-xs text-gp-charcoal/60">Hidden from marketplace and search</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(`/cooks/${c.id}`)}>
              View profile
            </Button>
            <Button variant="secondary" onClick={() => onUnblock(c.id)}>
              Unblock
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
