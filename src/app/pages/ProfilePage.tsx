import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { CookingPot, MapPin, Pencil, Shield, Sparkles, UserRound } from 'lucide-react'
import type { Plate, User } from '../../types'
import { formatMoney } from '../../lib/format'
import { useMarketplaceContext } from '../../state/marketplaceContext'
import { Button } from '../../ui/Button'
import { useNavigate } from 'react-router-dom'

function plateBelongsToProfile(plate: Plate, userId: string) {
  return plate.cook.id === userId || plate.cook.id === 'cook_you'
}

export function ProfilePage({ user, onOpenPlate }: { user: User; onOpenPlate: (plateId: string) => void }) {
  const navigate = useNavigate()
  const { plates } = useMarketplaceContext()

  const myPlates = useMemo(
    () => plates.filter((p) => plateBelongsToProfile(p, user.id)),
    [plates, user.id],
  )

  const bio = (user.bio ?? '').trim()
  const neighborhood = (user.neighborhood ?? '').trim()

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">Your profile</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">How you show up as a diner in this prototype build.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/me')} leftIcon={<Pencil size={18} />}>
          Edit on My GoPlate
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white/70 shadow-natural ring-1 ring-black/5">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <img
            src={
              user.avatarUrl ??
              'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80'
            }
            alt=""
            className="h-24 w-24 shrink-0 rounded-[2rem] object-cover ring-1 ring-black/10 sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl font-semibold">{user.displayName}</div>
            <div className="mt-1 text-sm text-gp-charcoal/65">{user.email}</div>
            {neighborhood ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-gp-secondary/10 px-3 py-1.5 text-xs font-semibold text-gp-secondary">
                <MapPin size={14} aria-hidden />
                {neighborhood}
              </div>
            ) : null}
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">About</div>
              {bio ? (
                <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/80">{bio}</p>
              ) : (
                <p className="mt-2 text-sm italic text-gp-charcoal/45">No description yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="profile-posts-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="profile-posts-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
              <CookingPot size={22} className="text-gp-primary" aria-hidden />
              Your posts
            </h2>
            <p className="mt-1 text-sm text-gp-charcoal/65">Plates you have listed as a cook (saved locally with your account id).</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/cook')}>
            List another
          </Button>
        </div>

        {myPlates.length === 0 ? (
          <div className="mt-5 rounded-[2rem] bg-white/70 p-8 text-center shadow-natural ring-1 ring-black/5">
            <CookingPot className="mx-auto h-10 w-10 text-gp-charcoal/25" aria-hidden />
            <p className="mt-3 font-display text-lg font-semibold text-gp-charcoal">No posts yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gp-charcoal/65">
              When you publish from Start Cooking, your dishes show up here and stay tied to your profile.
            </p>
            <Button variant="primary" className="mt-5" onClick={() => navigate('/cook')}>
              Start cooking
            </Button>
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPlates.map((plate) => (
              <li key={plate.id}>
                <ProfilePostCard plate={plate} onOpen={() => onOpenPlate(plate.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card title="Taste preferences" icon={<Sparkles size={18} className="text-gp-primary" />}>
          Vegan-friendly filters, allergy tags, and saved cooks would plug in here in a full product.
        </Card>
        <Card title="Privacy + pickup" icon={<Shield size={18} className="text-gp-secondary" />}>
          Pickup areas stay blurred until checkout is confirmed — same rules as the rest of GoPlate.
        </Card>
        <Card title="Account" icon={<UserRound size={18} className="text-gp-charcoal" />}>
          Display name, avatar, neighborhood, and bio are stored locally in your browser for this demo.
        </Card>
      </div>
    </div>
  )
}

function ProfilePostCard({ plate, onOpen }: { plate: Plate; onOpen: () => void }) {
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
      </div>
    </button>
  )
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="flex items-center gap-2 font-display text-lg font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-2 text-sm text-gp-charcoal/70">{children}</div>
    </div>
  )
}
