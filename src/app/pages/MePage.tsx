import { Camera, Check, LogOut, Pencil, Settings } from 'lucide-react'
import type { User } from '../../types'
import { Button } from '../../ui/Button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function MePage({
  user,
  onLogout,
  onSaveProfile,
}: {
  user: User
  onLogout: () => void
  onSaveProfile: (input: Partial<Pick<User, 'displayName' | 'avatarUrl'>>) => void
}) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.displayName)
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl ??
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80',
  )

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl ?? avatarUrl}
            alt={user.displayName}
            className="h-16 w-16 rounded-[2rem] object-cover ring-1 ring-black/10"
          />
          <div>
            <div className="font-display text-2xl font-semibold">{user.displayName}</div>
            <div className="mt-1 text-sm text-gp-charcoal/65">{user.email}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => setEditing((v) => !v)}
            leftIcon={editing ? <Check size={18} /> : <Pencil size={18} />}
          >
            {editing ? 'Done' : 'Edit profile'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/settings')} leftIcon={<Settings size={18} />}>
            Settings
          </Button>
          <Button variant="ghost" onClick={onLogout} leftIcon={<LogOut size={18} />}>
            Log out
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-6 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5">
          <div className="font-display text-lg font-semibold">Edit profile</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-semibold text-gp-charcoal/60">Display name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
            <label className="block">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <Camera size={14} /> Avatar URL
              </div>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                onSaveProfile({ displayName: name.trim() || user.displayName, avatarUrl: avatarUrl.trim() })
                setEditing(false)
              }}
              leftIcon={<Check size={18} />}
            >
              Save changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setName(user.displayName)
                setAvatarUrl(
                  user.avatarUrl ??
                    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80',
                )
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Account" value={user.displayName} />
        <Card title="Status" value="Active" />
        <Card title="Plan" value="Neighborhood (Prototype)" />
      </div>

      <div className="mt-6 rounded-[2rem] bg-white/70 p-6 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
        This is your logged-in profile page. Public cook profiles live under dish listings (click a cook’s name),
        and you can follow cooks + like dishes across the app.
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="text-xs font-semibold text-gp-charcoal/60">{title}</div>
      <div className="mt-2 font-display text-lg font-semibold">{value}</div>
    </div>
  )
}

