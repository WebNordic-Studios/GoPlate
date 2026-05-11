import { Camera, Check, Cog, LogOut, MapPin, Pencil, UserRound } from 'lucide-react'
import type { User } from '../../types'
import { Button } from '../../ui/Button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80'

export function MePage({
  user,
  onLogout,
  onSaveProfile,
}: {
  user: User
  onLogout: () => void
  onSaveProfile: (input: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio' | 'neighborhood'>>) => void
}) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.displayName)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? DEFAULT_AVATAR)
  const [bio, setBio] = useState(user.bio ?? '')
  const [neighborhood, setNeighborhood] = useState(user.neighborhood ?? '')

  const displayBio = (user.bio ?? '').trim()
  const displayNeighborhood = (user.neighborhood ?? '').trim()

  function syncFromUser() {
    setName(user.displayName)
    setAvatarUrl(user.avatarUrl ?? DEFAULT_AVATAR)
    setBio(user.bio ?? '')
    setNeighborhood(user.neighborhood ?? '')
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl ?? avatarUrl}
            alt={user.displayName}
            className="h-16 w-16 rounded-[2rem] object-cover ring-1 ring-black/10"
          />
          <div className="min-w-0">
            <div className="font-display text-2xl font-semibold">{user.displayName}</div>
            <div className="mt-1 text-sm text-gp-charcoal/65">{user.email}</div>
            {displayNeighborhood ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-2xl bg-gp-secondary/10 px-3 py-1 text-xs font-semibold text-gp-secondary">
                <MapPin size={14} aria-hidden />
                {displayNeighborhood}
              </div>
            ) : null}
            {displayBio ? (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gp-charcoal/75">{displayBio}</p>
            ) : (
              <p className="mt-3 text-sm italic text-gp-charcoal/45">No description yet — add one when you edit your profile.</p>
            )}
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
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="gap-0 px-3"
            aria-label="Open settings"
            title="Settings"
            leftIcon={<Cog size={18} aria-hidden />}
          >
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" onClick={onLogout} leftIcon={<LogOut size={18} />}>
            Log out
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-6 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5">
          <div className="font-display text-lg font-semibold">Edit profile</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">Name, photo, and a short blurb stay on this device until you wire a real backend.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <div className="text-xs font-semibold text-gp-charcoal/60">Display name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <Camera size={14} aria-hidden /> Avatar URL
              </div>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <MapPin size={14} aria-hidden /> Neighborhood / pickup area
              </div>
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                maxLength={80}
                placeholder="e.g. East Village, Mission District"
                className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <UserRound size={14} aria-hidden /> About you
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                rows={4}
                placeholder="Favorite cuisines, dietary notes, or how you like to coordinate pickups."
                className="gp-focus mt-1 w-full resize-y rounded-2xl bg-white px-3 py-3 text-sm font-medium leading-relaxed text-gp-charcoal ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
              />
              <div className="mt-1 text-right text-xs text-gp-charcoal/50">{bio.length}/280</div>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                onSaveProfile({
                  displayName: name.trim() || user.displayName,
                  avatarUrl: avatarUrl.trim() || undefined,
                  bio: bio.trim(),
                  neighborhood: neighborhood.trim(),
                })
                setEditing(false)
              }}
              leftIcon={<Check size={18} />}
            >
              Save changes
            </Button>
            <Button variant="ghost" onClick={() => syncFromUser()}>
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
        Public cook profiles live under dish listings (click a cook’s name). Your diner profile is here and on{' '}
        <button type="button" className="gp-focus font-semibold text-gp-secondary underline decoration-gp-secondary/30" onClick={() => navigate('/profile')}>
          /profile
        </button>{' '}
        for a quick read-only view.
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
