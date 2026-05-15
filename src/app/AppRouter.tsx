import { UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Category, Plate } from '../types'
import { Modal } from '../ui/Modal'
import { useMarketplace } from '../state/useMarketplace'
import { MarketplaceProvider } from '../state/marketplaceContext'
import { useMarketplaceContext } from '../state/marketplaceContext'
import { useAuth } from '../state/auth'
import { useSocial } from '../state/social'
import { useReviews } from '../state/reviews'
import { useMessages } from '../state/messages'
import { useReports } from '../state/reports'
import { useRecentlyViewed } from '../state/recentlyViewed'
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
import { SignUpPage } from './pages/SignUpPage'
import { MePage } from './pages/MePage'
import { CookProfilePage } from './pages/CookProfilePage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { CookDashboardPage } from './pages/CookDashboardPage'
import { AccountPage } from './pages/AccountPage'
import { WriteReviewModal } from './components/WriteReviewModal'
import { ReportModal } from './components/ReportModal'
import { ShareModal } from './components/ShareModal'
import { useSettings } from '../state/settings'
import { DEFAULT_SETTINGS } from '../state/settingsModel'
import { useToast } from '../ui/Toast'

export default function AppRouter() {
  const marketplace = useMarketplace()
  const auth = useAuth()
  const { user } = auth
  const { settings, set: setSetting, reset: resetSettings } = useSettings()
  const social = useSocial(user?.id ?? null)
  const reviews = useReviews()
  const messages = useMessages()
  const reports = useReports()
  const recentlyViewed = useRecentlyViewed()
  const toast = useToast()

  const navigate = useNavigate()
  const location = useLocation()

  const [zip, setZip] = useState(settings.defaultZip)
  const [category, setCategory] = useState<Category>(settings.defaultCategory)

  function handleResetSettings() {
    resetSettings()
    setZip(DEFAULT_SETTINGS.defaultZip)
    setCategory(DEFAULT_SETTINGS.defaultCategory)
  }
  const [openPlateId, setOpenPlateId] = useState<string | null>(null)

  // Review / report / share state for the active plate modal.
  const [reviewForOrderId, setReviewForOrderId] = useState<string | null>(null)
  const [reportTarget, setReportTarget] = useState<{ type: 'plate' | 'cook'; id: string; label: string } | null>(null)
  const [shareForPlateId, setShareForPlateId] = useState<string | null>(null)

  const openPlate = openPlateId ? marketplace.byId.get(openPlateId) ?? null : null

  // Track view when a plate is opened.
  useEffect(() => {
    if (openPlateId) {
      marketplace.recordView(openPlateId)
      recentlyViewed.record(openPlateId)
    }
  }, [openPlateId, marketplace, recentlyViewed])

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

  const rootShellClass = [
    'min-h-svh bg-gp-bg',
    settings.reduceMotion ? 'gp-reduce-motion' : '',
    settings.strongerFocusRings ? 'gp-strong-focus' : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Hide blocked cooks from public surfaces.
  const blocked = useMemo(() => new Set(user?.blockedCookIds ?? []), [user?.blockedCookIds])
  const visiblePlates = useMemo(
    () => marketplace.plates.filter((p) => !blocked.has(p.cook.id)),
    [marketplace.plates, blocked],
  )

  const reviewOrder = reviewForOrderId
    ? marketplace.orders.find((o) => o.id === reviewForOrderId) ?? null
    : null
  const reviewPlate = reviewOrder ? marketplace.byId.get(reviewOrder.plateId) ?? null : null

  function handleReservePlate(
    plateId: string,
    opts?: { delivery?: boolean; contactlessInstructions?: string; tipCents?: number },
  ) {
    const orderId = marketplace.reservePlate(plateId, opts)
    if (orderId) {
      toast.push({
        kind: 'success',
        title: 'Reserved!',
        description: 'Find your pickup code in Orders.',
      })
      navigate('/orders')
    } else {
      toast.push({ kind: 'error', title: 'Could not reserve', description: 'No portions left.' })
    }
  }

  function handleCreatePlate(input: Omit<Plate, 'id'>, opts?: { asDraft?: boolean; scheduledIso?: string }) {
    const id = marketplace.addPlate({
      ...input,
      isDraft: Boolean(opts?.asDraft || opts?.scheduledIso),
      scheduledPublishAtIso: opts?.scheduledIso,
    })
    if (opts?.asDraft && !opts.scheduledIso) {
      toast.push({ kind: 'info', title: 'Draft saved', description: 'Find it in your dashboard.' })
      return
    }
    if (opts?.scheduledIso) {
      toast.push({
        kind: 'info',
        title: 'Scheduled',
        description: `Goes live ${new Date(opts.scheduledIso).toLocaleString()}.`,
      })
      navigate('/cook/dashboard')
      return
    }
    toast.push({ kind: 'success', title: 'Plate listed', description: 'Now visible in the marketplace.' })
    navigate('/market')
    setOpenPlateId(id)
  }

  return (
    <MarketplaceProvider value={marketplace}>
      <div className={rootShellClass}>
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
                  plates={visiblePlates}
                  zip={zip}
                  category={category}
                  onChangeCategory={setCategory}
                  onChangeZip={(z) => setZip(z)}
                  onOpenPlate={(id) => setOpenPlateId(id)}
                  onReservePlate={(id) => navigate(`/checkout/${id}`)}
                  onOpenCook={(cookId) => navigate(`/cooks/${cookId}`)}
                  followsByCookId={social.followsByCookId}
                  likesByPlateId={social.likesByPlateId}
                />
              }
            />

            <Route
              path="/map"
              element={<MapPage plates={visiblePlates} onOpenPlate={(id) => setOpenPlateId(id)} />}
            />

            <Route
              path="/search"
              element={<SearchPage plates={visiblePlates} onOpenPlate={(id) => setOpenPlateId(id)} />}
            />

            <Route path="/feed" element={<Navigate to="/market#for-you" replace />} />

            <Route
              path="/cooks/:cookId"
              element={
                <CookProfileRoute
                  plates={visiblePlates}
                  reviewsList={reviews.reviews}
                  isFollowing={(cookId) => social.isFollowing(cookId)}
                  onToggleFollow={(cookId) => social.toggleFollow(cookId)}
                  isBlocked={(cookId) => blocked.has(cookId)}
                  onReport={(cookId, label, input) => {
                    reports.file({
                      target: { type: 'cook', id: cookId },
                      reason: input.reason,
                      details: input.details,
                      reporterUserId: user?.id,
                    })
                    toast.push({ kind: 'success', title: 'Report submitted', description: label })
                  }}
                  onBlock={(cookId, label) => {
                    auth.blockCook(cookId)
                    toast.push({ kind: 'info', title: 'Cook blocked', description: label })
                  }}
                  onOpenPlate={(id) => setOpenPlateId(id)}
                  onReservePlate={(id) => navigate(`/checkout/${id}`)}
                />
              }
            />

            <Route
              path="/checkout/:plateId"
              element={
                <CheckoutRoute
                  onConfirm={(plateId, opts) => handleReservePlate(plateId, opts)}
                />
              }
            />

            <Route
              path="/orders"
              element={
                <OrdersPage
                  orders={marketplace.orders}
                  plates={marketplace.byId}
                  messagesByOrderId={messages.byOrderId}
                  onSendMessage={(orderId, from, body) => messages.sendMessage(orderId, from, body)}
                  onUpdateStatus={(orderId, status) => {
                    marketplace.updateOrderStatus(orderId, status)
                    toast.push({ kind: 'info', title: `Order ${status}` })
                  }}
                  onCancel={(orderId) => {
                    marketplace.updateOrderStatus(orderId, 'Cancelled')
                    toast.push({ kind: 'info', title: 'Order cancelled' })
                  }}
                  onLeaveReview={(orderId) => setReviewForOrderId(orderId)}
                />
              }
            />

            <Route
              path="/profile"
              element={
                user ? (
                  <ProfilePage user={user} onOpenPlate={(id) => setOpenPlateId(id)} />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/profile' }} />
                )
              }
            />

            <Route
              path="/account"
              element={
                user ? (
                  <AccountPage
                    user={user}
                    onAddAddress={(a) => auth.addAddress(a)}
                    onRemoveAddress={(id) => auth.removeAddress(id)}
                    onAddCard={(c) => auth.addPaymentMethod(c)}
                    onRemoveCard={(id) => auth.removePaymentMethod(id)}
                    onVerifyPhone={(p) => auth.verifyPhone(p)}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/account' }} />
                )
              }
            />

            <Route
              path="/cook"
              element={
                user ? (
                  <StartCookingPage
                    user={user}
                    existingPlates={marketplace.plates}
                    onCreatePlate={handleCreatePlate}
                    onSubmitVerification={() => {
                      auth.setCookVerification('pending')
                      toast.push({
                        kind: 'info',
                        title: 'Verification pending',
                        description: 'We review uploads within 24 hours in production.',
                      })
                    }}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/cook' }} />
                )
              }
            />

            <Route
              path="/cook/dashboard"
              element={
                user ? (
                  <CookDashboardPage
                    user={user}
                    plates={marketplace.plates}
                    orders={marketplace.orders}
                    views={marketplace.views}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/cook/dashboard' }} />
                )
              }
            />

            <Route
              path="/me"
              element={
                user ? (
                  <MePage
                    user={user}
                    onLogout={() => auth.logout()}
                    onSaveProfile={(p) => auth.updateProfile(p)}
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
                  <SettingsPage
                    settings={settings}
                    onChange={setSetting}
                    onReset={handleResetSettings}
                    onApplyMarketplaceZip={(z) => setZip(z.trim())}
                    onApplyDefaultCategory={(c) => setCategory(c)}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/settings' }} />
                )
              }
            />

            <Route
              path="/login"
              element={
                <LoginPage
                  onLogin={(email, password) => {
                    const ok = auth.login(email, password)
                    if (!ok) return false
                    const navState = location.state as { from?: string } | null | undefined
                    const from = typeof navState?.from === 'string' ? navState.from : undefined
                    navigate(from || '/market', { replace: true })
                    return true
                  }}
                  onSocial={(provider) => {
                    const ok = auth.socialLogin(provider)
                    if (ok) navigate('/market', { replace: true })
                    return ok
                  }}
                  onResetPassword={(email, newPassword) => auth.resetPassword(email, newPassword)}
                />
              }
            />

            <Route
              path="/signup"
              element={
                <SignUpPage
                  onSignUp={(input) => {
                    const result = auth.signUp(input)
                    if (result.ok) navigate('/market', { replace: true })
                    return result
                  }}
                  onSocial={(provider) => {
                    const ok = auth.socialLogin(provider)
                    if (ok) navigate('/market', { replace: true })
                    return ok
                  }}
                />
              }
            />

            <Route path="/p/:plateId" element={<PlateLinkRoute onOpen={(id) => setOpenPlateId(id)} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Modal open={Boolean(openPlate)} title={openPlate ? 'Plate details' : undefined} onClose={() => setOpenPlateId(null)}>
          {openPlate ? (
            <PlateDetail
              plate={openPlate}
              reviews={reviews.byPlateId.get(openPlate.id)}
              onReserve={() => {
                setOpenPlateId(null)
                navigate(`/checkout/${openPlate.id}`)
              }}
              isLiked={social.isLiked(openPlate.id)}
              onToggleLike={() => social.toggleLike(openPlate.id)}
              isFollowingCook={social.isFollowing(openPlate.cook.id)}
              onToggleFollowCook={() => social.toggleFollow(openPlate.cook.id)}
              onShare={() => setShareForPlateId(openPlate.id)}
              onReport={() =>
                setReportTarget({ type: 'plate', id: openPlate.id, label: openPlate.name })
              }
            />
          ) : null}
        </Modal>

        <WriteReviewModal
          open={Boolean(reviewOrder && reviewPlate)}
          plateName={reviewPlate?.name ?? ''}
          cookName={reviewPlate?.cook.name ?? ''}
          onClose={() => setReviewForOrderId(null)}
          onSubmit={(draft) => {
            if (!reviewOrder || !reviewPlate || !user) return
            reviews.addReview({
              plateId: reviewPlate.id,
              cookId: reviewPlate.cook.id,
              userId: user.id,
              userName: user.displayName,
              userAvatarUrl: user.avatarUrl,
              rating: draft.rating,
              body: draft.body,
              photoDataUrls: draft.photoDataUrls,
            })
            marketplace.markOrderReviewed(reviewOrder.id)
            setReviewForOrderId(null)
            toast.push({
              kind: 'success',
              title: 'Review posted',
              description: 'Thanks for the feedback!',
            })
          }}
        />

        {reportTarget ? (
          <ReportModal
            open={Boolean(reportTarget)}
            target={{ kind: reportTarget.type, label: reportTarget.label }}
            onClose={() => setReportTarget(null)}
            onSubmit={(input) => {
              reports.file({
                target: { type: reportTarget.type, id: reportTarget.id },
                reason: input.reason,
                details: input.details,
                reporterUserId: user?.id,
              })
              toast.push({
                kind: 'success',
                title: 'Report submitted',
                description: 'Thanks — we will review it.',
              })
              setReportTarget(null)
            }}
          />
        ) : null}

        {shareForPlateId ? (
          <ShareModal
            open={Boolean(shareForPlateId)}
            title={marketplace.byId.get(shareForPlateId)?.name ?? 'Plate'}
            url={`${window.location.origin}/p/${shareForPlateId}`}
            onClose={() => setShareForPlateId(null)}
          />
        ) : null}
      </div>
    </MarketplaceProvider>
  )
}

function CheckoutRoute({
  onConfirm,
}: {
  onConfirm: (
    plateId: string,
    opts: { delivery: boolean; contactlessInstructions?: string; tipCents: number },
  ) => void
}) {
  const { byId } = useMarketplaceContext()
  const { settings } = useSettings()
  const params = useParams()
  const plateId = params.plateId || ''
  const plate = plateId ? byId.get(plateId) ?? null : null
  const navigate = useNavigate()

  return (
    <CheckoutPage
      plate={plate}
      enableOrderTexts={settings.enableOrderTexts}
      confirmBeforeReserve={settings.confirmBeforeReserve}
      onBackToMarket={() => navigate('/market')}
      onConfirm={(opts) => {
        if (plateId) onConfirm(plateId, opts)
      }}
    />
  )
}

function CookProfileRoute({
  plates,
  reviewsList,
  isFollowing,
  onToggleFollow,
  isBlocked,
  onReport,
  onBlock,
  onOpenPlate,
  onReservePlate,
}: {
  plates: Plate[]
  reviewsList: import('../types').Review[]
  isFollowing: (cookId: string) => boolean
  onToggleFollow: (cookId: string) => void
  isBlocked: (cookId: string) => boolean
  onReport: (cookId: string, label: string, input: { reason: string; details?: string }) => void
  onBlock: (cookId: string, label: string) => void
  onOpenPlate: (id: string) => void
  onReservePlate: (id: string) => void
}) {
  const params = useParams()
  const cookId = params.cookId || ''
  const cookName = plates.find((p) => p.cook.id === cookId)?.cook.name ?? 'this cook'
  return (
    <CookProfilePage
      cookId={cookId}
      plates={plates}
      reviews={reviewsList}
      onOpenPlate={onOpenPlate}
      onReservePlate={onReservePlate}
      isFollowing={isFollowing(cookId)}
      onToggleFollow={() => onToggleFollow(cookId)}
      onReport={(input) => onReport(cookId, cookName, input)}
      onBlock={() => onBlock(cookId, cookName)}
      isBlocked={isBlocked(cookId)}
    />
  )
}

function PlateLinkRoute({ onOpen }: { onOpen: (id: string) => void }) {
  const params = useParams()
  const id = params.plateId || ''
  const navigate = useNavigate()
  useEffect(() => {
    if (id) {
      onOpen(id)
      navigate('/market', { replace: true })
    }
  }, [id, navigate, onOpen])
  return null
}
