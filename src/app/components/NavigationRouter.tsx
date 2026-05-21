import {
  Bookmark,
  Cog,
  CreditCard,
  Heart,
  Home,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Store,
  User,
  type LucideIcon,
} from 'lucide-react'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

type Props = {
  rightSlot?: ReactNode
  profilePath?: string
  /** Hide the mobile tab bar (e.g. while a full-height overlay is open). */
  hideBottomNav?: boolean
}

const MOBILE_QUICK_LINKS: {
  to: string
  label: string
  icon: LucideIcon
  tint: 'primary' | 'secondary' | 'neutral'
}[] = [
  { to: '/cook', label: 'Create', icon: Plus, tint: 'primary' },
  { to: '/me', label: 'Profile', icon: User, tint: 'secondary' },
  { to: '/favorites', label: 'Saved', icon: Heart, tint: 'secondary' },
  { to: '/waitlists', label: 'Waitlists', icon: Bookmark, tint: 'secondary' },
  { to: '/account', label: 'Account', icon: CreditCard, tint: 'primary' },
  { to: '/settings', label: 'Settings', icon: Cog, tint: 'neutral' },
]

function TopNavLink({
  to,
  children,
  className = '',
  size = 'md',
  'aria-label': ariaLabel,
  title,
}: {
  to: string
  children: ReactNode
  className?: string
  size?: 'md' | 'sm'
  'aria-label'?: string
  title?: string
}) {
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs font-semibold' : 'px-3 py-2 text-sm font-semibold'
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      title={title}
      className={({ isActive }) =>
        `gp-focus shrink-0 rounded-2xl transition ${sizing} ${className} ${
          isActive ? 'bg-black/5 text-gp-charcoal' : 'text-gp-charcoal/70 hover:bg-black/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function NavigationShellRouter({
  rightSlot,
  profilePath = '/me',
  hideBottomNav = false,
}: Props) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const quickLinks = useMemo(
    () =>
      MOBILE_QUICK_LINKS.map((link) =>
        link.to === '/me' ? { ...link, to: profilePath } : link,
      ),
    [profilePath],
  )

  const submit = useMemo(
    () => () => {
      const s = q.trim()
      if (!s) return navigate('/search')
      navigate(`/search?q=${encodeURIComponent(s)}`)
    },
    [navigate, q],
  )

  return (
    <>
      <header className="sticky top-0 z-40 overflow-x-clip border-b border-black/5 bg-white/70 backdrop-blur-glass">
        <div className="gp-container min-w-0">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-[4.75rem] md:h-20">
            <NavLink
              to="/"
              className="gp-focus flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1 sm:gap-2.5 sm:px-2"
              aria-label="GoPlate"
            >
              <span className="flex shrink-0 items-center justify-center [-webkit-tap-highlight-color:transparent]">
                <GoPlateLogoMark size="md" decorative className="drop-shadow-[0_1px_3px_rgb(0_0_0_/0.08)]" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold leading-none sm:text-base">GoPlate</div>
                <div className="hidden text-xs text-gp-charcoal/60 sm:block">Home cooking, one block away</div>
              </div>
            </NavLink>

            <div className="hidden flex-1 items-center gap-3 md:flex">
              <form
                className="max-w-md flex-1"
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
              >
                <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 shadow-natural ring-1 ring-black/5">
                  <Search size={18} className="text-gp-charcoal/60" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search dishes or cooks…"
                    className="gp-focus w-full bg-transparent text-sm font-semibold text-gp-charcoal placeholder:text-gp-charcoal/45"
                  />
                </div>
              </form>

              <nav className="flex flex-wrap items-center gap-2">
                <TopNavLink to="/market">Find Food</TopNavLink>
                <TopNavLink to="/favorites">Favorites</TopNavLink>
                <TopNavLink to="/waitlists">Waitlists</TopNavLink>
                <TopNavLink to="/orders">Orders</TopNavLink>
                <TopNavLink to="/map">Map</TopNavLink>
                <TopNavLink to="/cook">Create</TopNavLink>
                <TopNavLink to="/account">Account</TopNavLink>
                <TopNavLink
                  to="/settings"
                  aria-label="Settings"
                  title="Settings"
                  className="px-2.5"
                >
                  <Cog size={20} className="text-gp-charcoal/75" aria-hidden />
                  <span className="sr-only">Settings</span>
                </TopNavLink>
              </nav>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2">
              <NavLink
                to="/orders"
                title="Orders"
                className={({ isActive }) =>
                  `gp-focus md:hidden grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gp-charcoal/70 transition hover:bg-black/5 sm:h-10 sm:w-10 sm:rounded-2xl ${
                    isActive ? 'bg-black/10 text-gp-charcoal' : ''
                  }`
                }
                aria-label="Orders"
              >
                <ShoppingBag size={18} aria-hidden />
              </NavLink>
              {rightSlot}
            </div>
          </div>

          <nav
            className="md:hidden min-w-0 border-t border-black/[0.06] bg-gp-bg/50"
            aria-label="Quick links"
          >
            <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain py-2.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickLinks.map((link) => (
                <MobileQuickLinkPill key={link.label} {...link} />
              ))}
            </div>
          </nav>
        </div>
      </header>

      {!hideBottomNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-glass pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
          <div className="gp-container px-2 sm:px-4">
            <div className="grid grid-cols-5 gap-0.5 py-1.5 sm:gap-1 sm:py-2">
              <BottomTab to="/" label="Home" icon={<Home size={19} />} />
              <BottomTab to="/market" label="Food" title="Find food — marketplace" icon={<Store size={19} />} />
              <BottomTab to="/search" label="Search" icon={<Search size={19} />} />
              <BottomTab to="/map" label="Map" icon={<MapPin size={19} />} />
              <BottomTab to={profilePath} label="Profile" icon={<User size={19} />} />
            </div>
          </div>
        </nav>
      ) : null}
    </>
  )
}

function MobileQuickLinkPill({
  to,
  label,
  icon: Icon,
  tint,
}: {
  to: string
  label: string
  icon: LucideIcon
  tint: 'primary' | 'secondary' | 'neutral'
}) {
  const styles =
    tint === 'primary'
      ? 'bg-gp-primary/10 text-gp-primary ring-gp-primary/20'
      : tint === 'secondary'
        ? 'bg-gp-secondary/10 text-gp-secondary ring-gp-secondary/20'
        : 'bg-white text-gp-charcoal/75 ring-black/10'

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `gp-focus inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
          isActive ? 'bg-gp-primary text-white ring-gp-primary/40' : styles
        }`
      }
    >
      <Icon size={15} strokeWidth={2.25} aria-hidden />
      {label}
    </NavLink>
  )
}

function BottomTab({ to, label, icon, title }: { to: string; label: string; icon: ReactNode; title?: string }) {
  return (
    <NavLink
      to={to}
      title={title}
      className={({ isActive }) =>
        `gp-focus mx-auto flex min-w-0 w-full max-w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-semibold leading-tight sm:gap-1 sm:px-2 sm:text-xs ${
          isActive ? 'text-gp-primary' : 'text-gp-charcoal/65'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
