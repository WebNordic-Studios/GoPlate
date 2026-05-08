import { UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Category } from '../types'
import { Modal } from '../ui/Modal'
import { useMarketplace } from '../state/useMarketplace'
import { MarketplaceProvider } from '../state/marketplaceContext'
import { useMarketplaceContext } from '../state/marketplaceContext'
import { useAuth } from '../state/auth'
import { useSocial } from '../state/social'
import { NavigationShellRouter } from './components/NavigationRouter'
import { LandingPage } from './pages/LandingPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { PlateDetail } from './components/PlateDetail'
import { CheckoutPage } from './pages/CheckoutPage'
import { StartCookingPage } from './pages/StartCookingPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProfilePage } from './pages/ProfilePage'
import { MapPage } from './pages/MapPage'
import { LoginPage } from './pages/LoginPage'
import { MePage } from './pages/MePage'
import { CookProfilePage } from './pages/CookProfilePage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { useSettings } from '../state/settings'

export default function AppRouter() {
  const marketplace = useMarketplace()
  const { user, login, logout, updateProfile } = useAuth()
  const { settings, set: setSetting, reset: resetSettings } = useSettings()
  const social = useSocial(user?.id ?? null)

  const navigate = useNavigate()
  const location = useLocation()

  const [zip, setZip] = useState('10012')
  const [category, setCategory] = useState<Category>('All')
  const [openPlateId, setOpenPlateId] = useState<string | null>(null)

  const openPlate = openPlateId ? marketplace.byId.get(openPlateId) ?? null : null

  const rightSlot = useMemo(() => {
    return (
      <button
        type="button"
        onClick={() => navigate(user ? '/me' : '/login')}
        className="gp-focus grid h-10 w-10 place-items-center rounded-2xl text-gp-charcoal/70 transition hover:bg-black/5"
        aria-label="User profile"
      >
        <UserRound size={18} />
      </button>
    )
  }, [navigate, user])

  return (
    <MarketplaceProvider value={marketplace}>
      <div className="min-h-svh bg-gp-bg">
        <NavigationShellRouter rightSlot={rightSlot} />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  zip={zip}
                  onSearchZip={(z) => {
                    if (z) setZip(z)
                    navigate('/market')
                  }}
                  onStartCooking={() => navigate(user ? '/cook' : '/login', { state: { from: '/cook' } })}
                />
              }
            />

            <Route
              path="/market"
              element={
                <MarketplacePage
                  plates={marketplace.plates}
                  zip={zip}
                  category={category}
                  onChangeCategory={setCategory}
                  onOpenPlate={(id) => setOpenPlateId(id)}
                  onReservePlate={(id) => navigate(`/checkout/${id}`)}
                  onOpenCook={(cookId) => navigate(`/cooks/${cookId}`)}
                />
              }
            />

            <Route
              path="/map"
              element={<MapPage plates={marketplace.plates} onOpenPlate={(id) => setOpenPlateId(id)} />}
            />

            <Route
              path="/search"
              element={<SearchPage plates={marketplace.plates} onOpenPlate={(id) => setOpenPlateId(id)} />}
            />

            <Route
              path="/cooks/:cookId"
              element={
                <CookProfileRoute
                  plates={marketplace.plates}
                  onOpenPlate={(id) => setOpenPlateId(id)}
                  onReservePlate={(id) => navigate(`/checkout/${id}`)}
                  isFollowing={(cookId) => social.isFollowing(cookId)}
                  onToggleFollow={(cookId) => social.toggleFollow(cookId)}
                />
              }
            />

            <Route
              path="/checkout/:plateId"
              element={
                <CheckoutRoute
                  onConfirm={(plateId) => {
                    marketplace.reservePlate(plateId)
                    navigate('/orders')
                  }}
                />
              }
            />

            <Route path="/orders" element={<OrdersPage orders={marketplace.orders} />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route
              path="/cook"
              element={
                user ? (
                  <StartCookingPage
                    onCreatePlate={(p) => {
                      const id = marketplace.addPlate(p)
                      navigate('/market')
                      setOpenPlateId(id)
                    }}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/cook' }} />
                )
              }
            />

            <Route
              path="/me"
              element={
                user ? (
                  <MePage
                    user={user}
                    onLogout={() => logout()}
                    onSaveProfile={(p) => updateProfile(p)}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/settings"
              element={
                user ? (
                  <SettingsPage settings={settings} onChange={setSetting} onReset={resetSettings} />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/settings' }} />
                )
              }
            />

            <Route
              path="/login"
              element={
                <LoginRoute
                  onLogin={(email, password) => {
                    const ok = login(email, password)
                    if (!ok) return false
                    const from = (location.state as any)?.from as string | undefined
                    navigate(from || '/market', { replace: true })
                    return true
                  }}
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Modal open={Boolean(openPlate)} title={openPlate ? 'Plate details' : undefined} onClose={() => setOpenPlateId(null)}>
          {openPlate ? (
            <PlateDetail
              plate={openPlate}
              onReserve={() => {
                setOpenPlateId(null)
                navigate(`/checkout/${openPlate.id}`)
              }}
              isLiked={social.isLiked(openPlate.id)}
              onToggleLike={() => social.toggleLike(openPlate.id)}
              isFollowingCook={social.isFollowing(openPlate.cook.id)}
              onToggleFollowCook={() => social.toggleFollow(openPlate.cook.id)}
            />
          ) : null}
        </Modal>
      </div>
    </MarketplaceProvider>
  )
}

function LoginRoute({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  return <LoginPage onLogin={onLogin} />
}

function CheckoutRoute({ onConfirm }: { onConfirm: (plateId: string) => void }) {
  const { byId } = useMarketplaceContext()
  const params = useParams()
  const plateId = params.plateId || ''
  const plate = plateId ? byId.get(plateId) ?? null : null
  const navigate = useNavigate()

  return (
    <CheckoutPage
      plate={plate}
      onBackToMarket={() => navigate('/market')}
      onConfirm={() => {
        if (plateId) onConfirm(plateId)
      }}
    />
  )
}

function CookProfileRoute({
  plates,
  onOpenPlate,
  onReservePlate,
  isFollowing,
  onToggleFollow,
}: {
  plates: import('../types').Plate[]
  onOpenPlate: (id: string) => void
  onReservePlate: (id: string) => void
  isFollowing: (cookId: string) => boolean
  onToggleFollow: (cookId: string) => void
}) {
  const params = useParams()
  const cookId = params.cookId || ''
  return (
    <CookProfilePage
      cookId={cookId}
      plates={plates}
      onOpenPlate={onOpenPlate}
      onReservePlate={onReservePlate}
      isFollowing={isFollowing(cookId)}
      onToggleFollow={() => onToggleFollow(cookId)}
    />
  )
}

