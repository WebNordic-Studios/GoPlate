import { Cog, Home, MapPin, Plus, Search, ShoppingBag, Store, User } from 'lucide-react'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

type Props = {
  rightSlot?: ReactNode
  profilePath?: string
}

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

export function NavigationShellRouter({ rightSlot, profilePath = '/me' }: Props) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

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
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-glass">
        <div className="gp-container">
          <div className="flex h-[4.75rem] items-center justify-between gap-3 sm:h-20">
            <NavLink
              to="/"
              className="gp-focus flex items-center gap-2.5 rounded-2xl px-2 py-1"
              aria-label="GoPlate"
            >
              <span className="flex shrink-0 items-center justify-center [-webkit-tap-highlight-color:transparent]">
                <GoPlateLogoMark size="md" decorative className="drop-shadow-[0_1px_3px_rgb(0_0_0_/0.08)]" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-base font-semibold leading-none">GoPlate</div>
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
                <TopNavLink to="/orders">Orders</TopNavLink>
                <TopNavLink to="/map">Map</TopNavLink>
                <TopNavLink to="/cook">Create</TopNavLink>
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
                  `gp-focus md:hidden grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-gp-charcoal/70 transition hover:bg-black/5 ${
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

          {/* Narrow screens: extras not in the tab bar */}
          <div className="md:hidden">
            <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-3 pt-0.5 no-scrollbar">
              <TopNavLink to={profilePath} size="sm" aria-label="Profile" title="Profile">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <User size={14} className="shrink-0 text-gp-charcoal/55" aria-hidden />
                  Profile
                </span>
              </TopNavLink>
              <TopNavLink to="/cook" size="sm">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Plus size={14} className="shrink-0 text-gp-charcoal/55" aria-hidden />
                  Create
                </span>
              </TopNavLink>
              <TopNavLink to="/settings" aria-label="Settings" title="Settings" size="sm">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Cog size={14} className="shrink-0 text-gp-charcoal/55" aria-hidden />
                  Settings
                </span>
              </TopNavLink>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-glass pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="gp-container px-2 sm:px-4">
          <div className="grid grid-cols-5 gap-0.5 py-1.5 sm:gap-1 sm:py-2">
            <BottomTab to="/" label="Home" icon={<Home size={19} />} />
            <BottomTab to="/market" label="Food" title="Find food — marketplace" icon={<Store size={19} />} />
            <BottomTab to="/search" label="Search" icon={<Search size={19} />} />
            <BottomTab to="/map" label="Map" icon={<MapPin size={19} />} />
            <BottomTab to="/me" label="Profile" icon={<User size={19} />} />
          </div>
        </div>
      </nav>
    </>
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

