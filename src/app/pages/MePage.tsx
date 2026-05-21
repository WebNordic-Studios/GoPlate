import { BarChart3, Camera, Check, ChefHat, Cog, CreditCard, LogOut, MapPin, Pencil, PencilLine, Star, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Plate, User } from '../../types'
import { formatMoney } from '../../lib/format'
import { useMarketplaceContext } from '../../state/marketplaceContext'
import { Button } from '../../ui/Button'
import { ProfileAnalyticsPanel } from '../components/ProfileAnalyticsPanel'
import { MyReviewsPanel } from '../components/MyReviewsPanel'
import { plateBelongsToUser } from '../lib/orderRoles'
import { readAsDataUrl } from '../../lib/readAsDataUrl'
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
  waitlistCountForPlate,
  onNotifyWaitlist,
  onOpenOrder,
  onOpenMessages,
}: {
  user: User
  onLogout: () => void
  onSaveProfile: (input: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio' | 'neighborhood'>>) => void
  onOpenPlate: (plateId: string) => void
  onDeleteReview: (reviewId: string) => void
  waitlistCountForPlate?: (plateId: string) => number
  onNotifyWaitlist?: (plateId: string) => void
  onOpenOrder?: (orderId: string) => void
  onOpenMessages?: (orderId: string) => void
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { plates, orders, views, byId } = useMarketplaceContext()
  const { userReviews } = useReviewsContext()
  const [tab, setTab] = useState<MeTab>(() => {
    const t = searchParams.get('tab')
    return t === 'analytics' || t === 'reviews' ? t : 'posts'
  })

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'analytics' || t === 'reviews' || t === 'posts') setTab(t)
  }, [searchParams])

  function selectTab(next: MeTab) {
    setTab(next)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'posts') p.delete('tab')
        else p.set('tab', next)
        return p
      },
      { replace: true },
    )
  }
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.displayName)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? DEFAULT_AVATAR)
  const [bio, setBio] = useState(user.bio ?? '')
  const [neighborhood, setNeighborhood] = useState(user.neighborhood ?? '')
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const myPlates = useMemo(() => {
    const mine = plates.filter((p) => plateBelongsToUser(p, user.id))
    return [...mine].sort((a, b) => {
      if (Boolean(a.isDraft) !== Boolean(b.isDraft)) return a.isDraft ? -1 : 1
      return (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? '')
    })
  }, [plates, user.id])

  async function onAvatarFile(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return
    try {
      const data = await readAsDataUrl(file)
      setAvatarUrl(data)
    } catch {
      /* ignore read errors in prototype */
    }
  }

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
            <div className="block sm:col-span-2">
              <div className="text-xs font-semibold text-gp-charcoal/60">Profile photo</div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-[1.5rem] object-cover ring-2 ring-black/10"
                />
                <div className="flex flex-col gap-2">
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      void onAvatarFile(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Camera size={16} />}
                    onClick={() => avatarFileRef.current?.click()}
                  >
                    Browse for image
                  </Button>
                  <p className="text-xs text-gp-charcoal/55">PNG or JPG from your device</p>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-gp-secondary hover:underline">
                  Or paste an image URL
                </summary>
                <input
                  value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value.trim() || DEFAULT_AVATAR)}
                  placeholder="https://…"
                  className="gp-focus mt-2 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                />
              </details>
            </div>
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
            onClick={() => selectTab('posts')}
            label="Your posts"
            icon={<ChefHat size={16} aria-hidden />}
          />
          <MeTabButton
            active={tab === 'analytics'}
            onClick={() => selectTab('analytics')}
            label="Analytics"
            icon={<BarChart3 size={16} aria-hidden />}
          />
          <MeTabButton
            active={tab === 'reviews'}
            onClick={() => selectTab('reviews')}
            label="Reviews"
            icon={<Star size={16} aria-hidden />}
          />
        </div>

        {tab === 'analytics' ? (
          <ProfileAnalyticsPanel
            user={user}
            orders={orders}
            plates={plates}
            views={views}
            waitlistCountForPlate={waitlistCountForPlate}
            onNotifyWaitlist={onNotifyWaitlist}
            onOpenOrder={onOpenOrder}
            onOpenMessages={onOpenMessages}
          />
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
  const soldOut = !plate.isDraft && plate.portionsAvailable <= 0
  const isDraft = Boolean(plate.isDraft)
  const scheduled = isDraft && Boolean(plate.scheduledPublishAtIso)
  const src = plate.images[0] ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`gp-focus w-full overflow-hidden rounded-[2rem] text-left shadow-natural transition ${
        isDraft
          ? 'border-2 border-dashed border-amber-400/80 bg-amber-50/40 ring-1 ring-amber-200/60 hover:border-amber-500'
          : 'bg-white ring-1 ring-black/5 hover:ring-gp-primary/25'
      }`}
    >
      <div className="relative aspect-[4/3] w-full">
        <img
          src={src}
          alt=""
          className={`h-full w-full object-cover ${isDraft ? 'opacity-80 saturate-[0.85]' : ''}`}
          loading="lazy"
        />
        {isDraft ? (
          <span className="absolute left-3 top-3 rounded-2xl bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-natural">
            {scheduled ? 'Scheduled draft' : 'Draft'}
          </span>
        ) : soldOut ? (
          <span className="absolute right-3 top-3 rounded-2xl bg-white/90 px-3 py-1 text-xs font-semibold text-gp-charcoal shadow-natural">
            Sold out
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-2xl bg-gp-secondary/90 px-3 py-1 text-xs font-semibold text-white shadow-natural">
            Live
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="line-clamp-2 font-display text-base font-semibold leading-snug">{plate.name}</div>
        {isDraft ? (
          <p className="mt-2 text-xs font-medium text-amber-800/90">
            {scheduled
              ? `Publishes ${new Date(plate.scheduledPublishAtIso!).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
              : 'Not visible on the marketplace until you publish.'}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-gp-charcoal/60">
          <span
            className={`rounded-xl px-2 py-0.5 ${isDraft ? 'bg-amber-100 text-amber-900' : 'bg-gp-bg text-gp-charcoal/75'}`}
          >
            {plate.category}
          </span>
          <span>{formatMoney(plate.priceCents)}</span>
        </div>
        <div className={`mt-2 line-clamp-1 text-xs font-medium ${isDraft ? 'text-amber-800/80' : 'text-gp-secondary'}`}>
          {plate.pickupWindow}
        </div>
        <div className="mt-2 text-xs text-gp-charcoal/55">
          {isDraft
            ? 'Only you can see this listing'
            : soldOut
              ? 'No portions left'
              : `${plate.portionsAvailable} portion${plate.portionsAvailable === 1 ? '' : 's'} left`}
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
