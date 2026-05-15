import { Home, Search, ShoppingBag, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'

export type RouteId = 'home' | 'market' | 'orders' | 'profile' | 'cook' | 'checkout'

type Props = {
  route: RouteId
  onNavigate: (r: RouteId) => void
  rightSlot?: ReactNode
}

function TopLink({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gp-focus rounded-2xl px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-black/5 text-gp-charcoal' : 'text-gp-charcoal/70 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  )
}

export function NavigationShell({ route, onNavigate, rightSlot }: Props) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-glass">
        <div className="gp-container">
          <div className="flex h-[4.75rem] items-center justify-between gap-3 sm:h-20">
            <button
              type="button"
              onClick={() => onNavigate('home')}
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
            </button>

            <nav className="hidden items-center gap-2 md:flex">
              <TopLink active={route === 'market'} onClick={() => onNavigate('market')}>
                Find Food
              </TopLink>
              <TopLink active={route === 'cook'} onClick={() => onNavigate('cook')}>
                Start Cooking
              </TopLink>
            </nav>

            <div className="flex items-center gap-2">{rightSlot}</div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/80 backdrop-blur-glass md:hidden">
        <div className="gp-container">
          <div className="grid grid-cols-4 py-2">
            <BottomTab
              active={route === 'home'}
              label="Home"
              icon={<Home size={20} />}
              onClick={() => onNavigate('home')}
            />
            <BottomTab
              active={route === 'market'}
              label="Search"
              icon={<Search size={20} />}
              onClick={() => onNavigate('market')}
            />
            <BottomTab
              active={route === 'orders'}
              label="Orders"
              icon={<ShoppingBag size={20} />}
              onClick={() => onNavigate('orders')}
            />
            <BottomTab
              active={route === 'profile'}
              label="Profile"
              icon={<User size={20} />}
              onClick={() => onNavigate('profile')}
            />
          </div>
        </div>
      </nav>
    </>
  )
}

function BottomTab({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gp-focus mx-auto flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
        active ? 'text-gp-primary' : 'text-gp-charcoal/65'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

