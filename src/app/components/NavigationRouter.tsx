import { Cog, Home, Search, ShoppingBag, User } from 'lucide-react'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

type Props = {
  rightSlot?: ReactNode
}

function TopNavLink({
  to,
  children,
  className = '',
  'aria-label': ariaLabel,
  title,
}: {
  to: string
  children: ReactNode
  className?: string
  'aria-label'?: string
  title?: string
}) {
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      title={title}
      className={({ isActive }) =>
        `gp-focus rounded-2xl px-3 py-2 text-sm font-semibold transition ${className} ${
          isActive ? 'bg-black/5 text-gp-charcoal' : 'text-gp-charcoal/70 hover:bg-black/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function NavigationShellRouter({ rightSlot }: Props) {
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
              <div className="hidden sm:block">
                <div className="font-display text-base font-semibold leading-none">GoPlate</div>
                <div className="text-xs text-gp-charcoal/60">Neighborhood gourmet</div>
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

              <nav className="hidden items-center gap-2 lg:flex">
              <TopNavLink to="/market">Find Food</TopNavLink>
              <TopNavLink to="/map">Map</TopNavLink>
              <TopNavLink to="/cook">Start Cooking</TopNavLink>
              <TopNavLink to="/settings" aria-label="Settings" title="Settings" className="px-2.5">
                <Cog size={20} className="text-gp-charcoal/75" aria-hidden />
                <span className="sr-only">Settings</span>
              </TopNavLink>
              </nav>
            </div>

            <div className="flex items-center gap-2">{rightSlot}</div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/80 backdrop-blur-glass md:hidden">
        <div className="gp-container">
          <div className="grid grid-cols-4 py-2">
            <BottomTab to="/" label="Home" icon={<Home size={20} />} />
            <BottomTab to="/search" label="Search" icon={<Search size={20} />} />
            <BottomTab to="/orders" label="Orders" icon={<ShoppingBag size={20} />} />
            <BottomTab to="/me" label="Profile" icon={<User size={20} />} />
          </div>
        </div>
      </nav>
    </>
  )
}

function BottomTab({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `gp-focus mx-auto flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
          isActive ? 'text-gp-primary' : 'text-gp-charcoal/65'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

