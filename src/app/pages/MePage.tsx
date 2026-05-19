import { BarChart3, Camera, Check, ChefHat, Cog, CreditCard, LogOut, MapPin, Pencil, PencilLine, Star, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Plate, User } from '../../types'
import { formatMoney } from '../../lib/format'
import { useMarketplaceContext } from '../../state/marketplaceContext'
import { Button } from '../../ui/Button'
import { ProfileAnalyticsPanel } from '../components/ProfileAnalyticsPanel'
import { MyReviewsPanel } from '../components/MyReviewsPanel'
import { plateBelongsToUser } from '../lib/orderRoles'
import { useReviewsContext } from '../../state/reviewsContext'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80'

type MeTab = 'posts' | 'analytics' | 'reviews'

export function MePage({
  user,
  onLogout,
  onSaveProfile,
  onOpenPlate,
  onDeleteReview,
}: {
  user: User
  onLogout: () => void
  onSaveProfile: (input: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio' | 'neighborhood'>>) => void
  onOpenPlate: (plateId: string) => void
  onDeleteReview: (reviewId: string) => void
}) {
  const navigate = useNavigate()
  const { plates, orders, views, byId } = useMarketplaceContext()
  const { userReviews } = useReviewsContext()
  const [tab, setTab] = useState<MeTab>('posts')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.displayName)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? DEFAULT_AVATAR)
  const [bio, setBio] = useState(user.bio ?? '')
  const [neighborhood, setNeighborhood] = useState(user.neighborhood ?? '')

  const myPlates = useMemo(
    () => plates.filter((p) => plateBelongsToUser(p, user.id)),
    [plates, user.id],
  )

  const displayBio = (user.bio ?? '').trim()
  const displayNeighborhood = (user.neighborhood ?? '').trim()
  const avatarSrc = user.avatarUrl ?? DEFAULT_AVATAR

  function syncFromUser() {
    setName(user.displayName)
    setAvatarUrl(user.avatarUrl ?? DEFAULT_AVATAR)
    setBio(user.bio ?? '')
    setNeighborhood(user.neighborhood ?? '')
  }

  function saveAndClose() {
    onSaveProfile({
      displayName: name.trim() || user.displayName,
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim(),
      neighborhood: neighborhood.trim(),
    })
    setEditing(false)
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">Profile</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">Your diner identity and cook listings in one place.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white/70 shadow-natural ring-1 ring-black/5">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <img
            src={editing ? avatarUrl : avatarSrc}
            alt=""
            className="h-24 w-24 shrink-0 rounded-[2rem] object-cover ring-1 ring-black/10 sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl font-semibold">{user.displayName}</div>
            <div className="mt-1 text-sm text-gp-charcoal/65">{user.email}</div>
            {displayNeighborhood ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-gp-secondary/10 px-3 py-1.5 text-xs font-semibold text-gp-secondary">
                <MapPin size={14} aria-hidden />
                {displayNeighborhood}
              </div>
            ) : null}
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">About</div>
              {displayBio ? (
                <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/80">{displayBio}</p>
              ) : (
                <p className="mt-2 text-sm italic text-gp-charcoal/45">No description yet — tap Edit profile to add one.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-black/5 bg-gp-bg/40 px-4 py-3 sm:px-6">
          <Button
            variant={editing ? 'secondary' : 'ghost'}
            onClick={() => {
              if (editing) {
                saveAndClose()
              } else {
                syncFromUser()
                setEditing(true)
              }
            }}
            leftIcon={editing ? <Check size={18} /> : <Pencil size={18} />}
          >
            {editing ? 'Save' : 'Edit profile'}
          </Button>
          {editing ? (
            <Button
              variant="ghost"
              onClick={() => {
                syncFromUser()
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => navigate('/account')} leftIcon={<CreditCard size={18} aria-hidden />}>
            Account
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            leftIcon={<Cog size={18} aria-hidden />}
          >
            Settings
          </Button>
          <Button variant="ghost" onClick={onLogout} leftIcon={<LogOut size={18} />}>
            Log out
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5 sm:p-6">
          <div className="font-display text-lg font-semibold">Edit profile</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Name, photo, neighborhood, and bio are saved locally in this prototype.
          </p>
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
        </div>
      ) : null}

      <div className="mt-10">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/[0.04] p-1 ring-1 ring-black/5">
          <MeTabButton
            active={tab === 'posts'}
            onClick={() => setTab('posts')}
            label="Your posts"
            icon={<ChefHat size={16} aria-hidden />}
          />
          <MeTabButton
            active={tab === 'analytics'}
            onClick={() => setTab('analytics')}
            label="Analytics"
            icon={<BarChart3 size={16} aria-hidden />}
          />
          <MeTabButton
            active={tab === 'reviews'}
            onClick={() => setTab('reviews')}
            label="Reviews"
            icon={<Star size={16} aria-hidden />}
          />
        </div>

        {tab === 'analytics' ? (
          <ProfileAnalyticsPanel userId={user.id} orders={orders} plates={plates} views={views} />
        ) : tab === 'reviews' ? (
          <MyReviewsPanel
            reviews={userReviews(user.id)}
            platesById={byId}
            onOpenPlate={onOpenPlate}
            onDeleteReview={onDeleteReview}
          />
        ) : (
          <section className="mt-6" aria-labelledby="my-posts-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="my-posts-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
              <ChefHat size={22} className="text-gp-primary" aria-hidden />
              Your posts
            </h2>
            <p className="mt-1 text-sm text-gp-charcoal/65">Plates you have listed as a cook.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/cook')}>
            List another
          </Button>
        </div>

        {myPlates.length === 0 ? (
          <div className="mt-5 rounded-[2rem] bg-white/70 p-8 text-center shadow-natural ring-1 ring-black/5">
            <ChefHat className="mx-auto h-10 w-10 text-gp-charcoal/25" aria-hidden />
            <p className="mt-3 font-display text-lg font-semibold text-gp-charcoal">No posts yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gp-charcoal/65">
              When you publish from Create, your dishes show up here.
            </p>
            <Button variant="primary" className="mt-5" onClick={() => navigate('/cook')}>
              Create a plate
            </Button>
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPlates.map((plate) => (
              <li key={plate.id}>
                <ProfilePostCard
                  plate={plate}
                  onOpen={() => onOpenPlate(plate.id)}
                  onEdit={() => navigate(`/cook/edit/${plate.id}`)}
                />
              </li>
            ))}
          </ul>
        )}
          </section>
        )}
      </div>
    </div>
  )
}

function MeTabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gp-focus flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active ? 'bg-white text-gp-charcoal shadow-sm ring-1 ring-black/5' : 'text-gp-charcoal/60 hover:text-gp-charcoal'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ProfilePostCard({ plate, onOpen, onEdit }: { plate: Plate; onOpen: () => void; onEdit: () => void }) {
  const soldOut = plate.portionsAvailable <= 0
  const src = plate.images[0] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'

  return (
    <button
      type="button"
      onClick={onOpen}
      className="gp-focus w-full overflow-hidden rounded-[2rem] bg-white text-left shadow-natural ring-1 ring-black/5 transition hover:ring-gp-primary/25"
    >
      <div className="relative aspect-[4/3] w-full">
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        {soldOut ? (
          <span className="absolute right-3 top-3 rounded-2xl bg-white/90 px-3 py-1 text-xs font-semibold text-gp-charcoal shadow-natural">
            Sold out
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="line-clamp-2 font-display text-base font-semibold leading-snug">{plate.name}</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-gp-charcoal/60">
          <span className="rounded-xl bg-gp-bg px-2 py-0.5 text-gp-charcoal/75">{plate.category}</span>
          <span>{formatMoney(plate.priceCents)}</span>
        </div>
        <div className="mt-2 line-clamp-1 text-xs font-medium text-gp-secondary">{plate.pickupWindow}</div>
        <div className="mt-2 text-xs text-gp-charcoal/55">
          {soldOut ? 'No portions left' : `${plate.portionsAvailable} portion${plate.portionsAvailable === 1 ? '' : 's'} left`}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="gp-focus mt-3 inline-flex items-center gap-1 rounded-xl bg-gp-bg px-2.5 py-1.5 text-xs font-semibold text-gp-charcoal ring-1 ring-black/10"
        >
          <PencilLine size={14} aria-hidden />
          Manage
        </button>
      </div>
    </button>
  )
}
