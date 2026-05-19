import { MessageCircle, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Category, Plate } from '../types'
import { Modal } from '../ui/Modal'
import { useMarketplace } from '../state/useMarketplace'
import { MarketplaceProvider } from '../state/marketplaceContext'
import { useMarketplaceContext } from '../state/marketplaceContext'
import { useAuth } from '../state/auth'
import { useSocial } from '../state/social'
import { useReviews } from '../state/reviews'
import { ReviewsProvider } from '../state/reviewsContext'
import { plateDisplayRating } from '../lib/reviewStats'
import { useMessages } from '../state/messages'
import { useReports } from '../state/reports'
import { useRecentlyViewed } from '../state/recentlyViewed'
import { NavigationShellRouter } from './components/NavigationRouter'
import { LandingPage } from './pages/LandingPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { MessagesDrawer } from './components/MessagesDrawer'
import { NotificationsDropdown } from './components/NotificationsDropdown'
import { HeaderUnreadBadge } from './components/HeaderUnreadBadge'
import { PlateDetail } from './components/PlateDetail'
import { CheckoutPage } from './pages/CheckoutPage'
import { StartCookingPage } from './pages/StartCookingPage'
import { OrdersPage } from './pages/OrdersPage'
import { MapPage } from './pages/MapPage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { MePage } from './pages/MePage'
import { CookProfilePage } from './pages/CookProfilePage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { CookDashboardPage } from './pages/CookDashboardPage'
import { AccountPage } from './pages/AccountPage'
import { EditPlatePage } from './pages/EditPlatePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RequireAuth } from './components/RequireAuth'
import { createLocalApi } from '../api/client'
import { ApiProvider, useApi } from '../api/ApiProvider'
import { useAsyncMutation } from '../api/useAsyncMutation'
import type { CheckoutConfirmPayload } from './pages/CheckoutPage'
import { WriteReviewModal } from './components/WriteReviewModal'
import { ReportModal } from './components/ReportModal'
import { ShareModal } from './components/ShareModal'
import { useSettings } from '../state/settings'
import { DEFAULT_SETTINGS } from '../state/settingsModel'
import { useToast } from '../ui/Toast'
import { countMessageThreadsUnread, countPickupReadyBellBadge } from './lib/headerUnreadBadges'
import { messageRoleForOrder } from './lib/orderRoles'
import { useWaitlist } from '../state/waitlist'
import { FavoritesPage } from './pages/FavoritesPage'

export default function AppRouter() {
  const marketplace = useMarketplace()
  const auth = useAuth()
  const { user } = auth

  const api = useMemo(
    () =>
      createLocalApi({
        getPlates: () => marketplace.plates,
        getOrders: () => marketplace.orders,
        getUser: () => user,
        reservePlate: (plateId, opts) => Promise.resolve(marketplace.reservePlate(plateId, opts)),
        updatePlate: (id, patch) => {
          marketplace.updatePlate(id, patch)
          return marketplace.byId.get(id) ?? null
        },
        removePlate: (id) => marketplace.removePlate(id),
      }),
    [marketplace, user],
  )

  return (
    <ApiProvider api={api}>
      <AppRouterInner marketplace={marketplace} auth={auth} />
    </ApiProvider>
  )
}

function AppRouterInner({
  marketplace,
  auth,
}: {
  marketplace: ReturnType<typeof useMarketplace>
  auth: ReturnType<typeof useAuth>
}) {
  const { api } = useApi()
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
  const [reportTarget, setReportTarget] = useState<{
    type: 'plate' | 'cook' | 'review'
    id: string
    label: string
  } | null>(null)
  const waitlist = useWaitlist(user?.id ?? null)
  const [shareForPlateId, setShareForPlateId] = useState<string | null>(null)

  const openPlate = openPlateId ? marketplace.byId.get(openPlateId) ?? null : null

  // Track view when a plate is opened.
  useEffect(() => {
    if (openPlateId) {
      marketplace.recordView(openPlateId)
      recentlyViewed.record(openPlateId)
    }
  }, [openPlateId, marketplace, recentlyViewed])

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)

  const headerChromeIconBtn = (active: boolean) =>
    [
      'gp-focus grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-gp-charcoal/70 transition hover:bg-black/5',
      active ? 'bg-black/10 text-gp-charcoal' : '',
    ].join(' ')

  const headerIconNavClass = ({ isActive }: { isActive: boolean }) =>
    [
      'gp-focus grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-gp-charcoal/70 transition hover:bg-black/5',
      isActive ? 'bg-black/10 text-gp-charcoal' : '',
    ].join(' ')

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

  const messagesUnreadApprox = useMemo(
    () => (user ? countMessageThreadsUnread(marketplace.orders, messages.byOrderId) : 0),
    [user, marketplace.orders, messages.byOrderId],
  )

  const notificationsUnreadApprox = useMemo(
    () => (user ? countPickupReadyBellBadge(marketplace.orders) : 0),
    [user, marketplace.orders],
  )

  const reviewOrder = reviewForOrderId
    ? marketplace.orders.find((o) => o.id === reviewForOrderId) ?? null
    : null
  const reviewPlate = reviewOrder ? marketplace.byId.get(reviewOrder.plateId) ?? null : null

  const reserveMutation = useAsyncMutation(
    useCallback(
      async (plateId: string, opts: CheckoutConfirmPayload) => {
        auth.updateProfile({ phone: opts.contactPhone })
        const orderId = await api.marketplace.reservePlate(plateId, {
          buyerId: user?.id,
          delivery: opts.delivery,
          contactlessInstructions: opts.contactlessInstructions,
          tipCents: opts.tipCents,
        })
        if (!orderId) throw new Error('No portions left for this plate.')
        return orderId
      },
      [api, user?.id, auth],
    ),
  )

  async function handleReservePlate(plateId: string, opts: CheckoutConfirmPayload) {
    const result = await reserveMutation.run(plateId, opts)
    if (result.ok) {
      toast.push({
        kind: 'success',
        title: 'Reserved!',
        description: 'Find your pickup code in Orders.',
      })
      navigate('/orders')
    } else {
      toast.push({ kind: 'error', title: 'Could not reserve', description: result.error.message })
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

  function syncPlateRatingFromReviews(plateId: string, reviewList = reviews.reviews) {
    const plate = marketplace.byId.get(plateId)
    if (!plate) return
    const stats = plateDisplayRating(reviewList, plate)
    marketplace.updatePlate(plateId, { rating: stats.rating, ratingCount: stats.count })
  }

  function handleSubmitReview(draft: { rating: number; body: string; photoDataUrls: string[] }) {
    if (!reviewOrder || !reviewPlate || !user) return
    if (reviews.reviews.some((r) => r.orderId === reviewOrder.id)) {
      toast.push({ kind: 'error', title: 'Already reviewed', description: 'You already left a review for this order.' })
      return
    }
    reviews.addReview({
      orderId: reviewOrder.id,
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
    syncPlateRatingFromReviews(reviewPlate.id, [
      {
        id: 'pending',
        orderId: reviewOrder.id,
        plateId: reviewPlate.id,
        cookId: reviewPlate.cook.id,
        userId: user.id,
        userName: user.displayName,
        userAvatarUrl: user.avatarUrl,
        rating: draft.rating,
        body: draft.body,
        photoDataUrls: draft.photoDataUrls,
        createdAtIso: new Date().toISOString(),
      },
      ...reviews.reviews,
    ])
    setReviewForOrderId(null)
    toast.push({
      kind: 'success',
      title: 'Review posted',
      description: 'Thanks for the feedback!',
    })
  }

  function handleDeleteReview(reviewId: string) {
    const review = reviews.reviews.find((r) => r.id === reviewId)
    if (!review) return
    const plate = marketplace.byId.get(review.plateId)
    const remaining = reviews.reviews.filter((r) => r.id !== reviewId)
    reviews.removeReview(reviewId)
    if (review.orderId) marketplace.clearOrderReviewed(review.orderId)
    if (plate) {
      const stats = plateDisplayRating(
        remaining.filter((r) => r.plateId === plate.id),
        plate,
      )
      marketplace.updatePlate(plate.id, { rating: stats.rating, ratingCount: stats.count })
    }
    toast.push({ kind: 'info', title: 'Review removed' })
  }

  return (
    <MarketplaceProvider value={marketplace}>
      <ReviewsProvider api={reviews}>
      <div className={rootShellClass}>
        <NavigationShellRouter
          profilePath={user ? '/me' : '/login'}
          hideBottomNav={messagesOpen}
          rightSlot={
            <>
              <NotificationsDropdown
                open={notificationsOpen}
                onOpenChange={(v) => {
                  if (v) setMessagesOpen(false)
                  setNotificationsOpen(v)
                }}
                user={user}
                orders={marketplace.orders}
                badgeCount={notificationsUnreadApprox}
              />
              <button
                type="button"
                data-gp-messages-drawer-trigger
                onClick={() => {
                  setNotificationsOpen(false)
                  setMessagesOpen((o) => !o)
                }}
                className={`relative ${headerChromeIconBtn(messagesOpen)}`}
                aria-expanded={messagesOpen}
                aria-controls="messages-drawer-panel"
                aria-label={messagesUnreadApprox ? `Messages (${messagesUnreadApprox} unread)` : 'Messages'}
                title={messagesUnreadApprox ? `Messages · ${messagesUnreadApprox} unread` : 'Messages'}
              >
                <MessageCircle size={18} aria-hidden />
                <HeaderUnreadBadge count={messagesUnreadApprox} />
              </button>
              <MessagesDrawer
                open={messagesOpen}
                onOpenChange={setMessagesOpen}
                user={user}
                orders={marketplace.orders}
                messagesByOrderId={messages.byOrderId}
                platesById={marketplace.byId}
                onSendMessage={(orderId, body) => {
                  const order = marketplace.orders.find((o) => o.id === orderId)
                  const plate = order ? marketplace.byId.get(order.plateId) : undefined
                  const role = messageRoleForOrder(order!, user!.id, plate)
                  messages.sendMessage(orderId, role, body)
                }}
                forcedReduceMotion={settings.reduceMotion}
              />
              <NavLink
                to={user ? '/me' : '/login'}
                aria-label={user ? 'User profile' : 'Sign in'}
                title={user ? 'Profile' : 'Sign in'}
                className={headerIconNavClass}
              >
                <UserRound size={18} aria-hidden />
              </NavLink>
            </>
          }
        />

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
                  waitlist={{
                    isJoined: waitlist.isJoined,
                    onJoin: (id) => {
                      if (!user) {
                        navigate('/login', { state: { from: '/market' } })
                        return
                      }
                      waitlist.join(id)
                      toast.push({ kind: 'success', title: 'On waitlist', description: 'We will notify you when a portion opens.' })
                    },
                    onLeave: (id) => {
                      waitlist.leave(id)
                      toast.push({ kind: 'info', title: 'Removed from waitlist' })
                    },
                    requiresLogin: !user,
                    onLogin: () => navigate('/login', { state: { from: '/market' } }),
                  }}
                />
              }
            />

            <Route
              path="/favorites"
              element={
                user ? (
                  <FavoritesPage
                    plates={visiblePlates}
                    likesByPlateId={social.likesByPlateId}
                    onOpenPlate={(id) => setOpenPlateId(id)}
                    onReservePlate={(id) => navigate(`/checkout/${id}`)}
                    onOpenCook={(cookId) => navigate(`/cooks/${cookId}`)}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/favorites' }} />
                )
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
                  currentUserId={user?.id}
                  onCookReply={(reviewId, body) => {
                    reviews.replyToReview(reviewId, body)
                    toast.push({ kind: 'success', title: 'Reply posted', description: 'Visible on the review.' })
                  }}
                  userCookVerification={user?.cookVerification}
                  onUnblock={(cookId) => {
                    auth.unblockCook(cookId)
                    toast.push({ kind: 'success', title: 'Cook unblocked' })
                  }}
                  onReportReview={(reviewId, label) =>
                    setReportTarget({ type: 'review', id: reviewId, label })
                  }
                />
              }
            />

            <Route
              path="/checkout/:plateId"
              element={
                <RequireAuth user={user} from={location.pathname}>
                  <CheckoutRoute
                    user={user!}
                    confirming={reserveMutation.loading}
                    confirmError={reserveMutation.error?.message ?? null}
                    onConfirm={(plateId, opts) => void handleReservePlate(plateId, opts)}
                  />
                </RequireAuth>
              }
            />

            <Route
              path="/orders"
              element={
                <OrdersPage
                  user={user}
                  orders={marketplace.orders}
                  plates={marketplace.byId}
                  messagesByOrderId={messages.byOrderId}
                  onSendMessage={(orderId, body) => {
                    const order = marketplace.orders.find((o) => o.id === orderId)
                    const plate = order ? marketplace.byId.get(order.plateId) : undefined
                    const role = messageRoleForOrder(order!, user!.id, plate)
                    messages.sendMessage(orderId, role, body)
                  }}
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

            <Route path="/profile" element={<Navigate to={user ? '/me' : '/login'} replace />} />

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
              path="/cook/edit/:plateId"
              element={
                user ? (
                  <EditPlatePage
                    user={user}
                    plates={marketplace.plates}
                    onUpdate={(id, patch) => marketplace.updatePlate(id, patch)}
                    onRemove={(id) => marketplace.removePlate(id)}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/cook/edit' }} />
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
                    onOpenPlate={(id) => setOpenPlateId(id)}
                    onDeleteReview={handleDeleteReview}
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
                    user={user}
                    plates={visiblePlates}
                    settings={settings}
                    onChange={setSetting}
                    onReset={handleResetSettings}
                    onApplyMarketplaceZip={(z) => setZip(z.trim())}
                    onApplyDefaultCategory={(c) => setCategory(c)}
                    onUnblockCook={(id) => {
                      auth.unblockCook(id)
                      toast.push({ kind: 'success', title: 'Cook unblocked' })
                    }}
                    onApproveCookVerification={() => {
                      auth.setCookVerification('verified')
                      toast.push({ kind: 'success', title: 'Cook verified', description: 'Badge shown on your profile.' })
                    }}
                    onImportComplete={() => window.location.reload()}
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

            <Route path="*" element={<NotFoundPage />} />
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
              onOpenCook={() => {
                const cookId = openPlate.cook.id
                setOpenPlateId(null)
                navigate(`/cooks/${cookId}`)
              }}
              waitlistJoined={waitlist.isJoined(openPlate.id)}
              onJoinWaitlist={() => {
                if (!user) {
                  navigate('/login', { state: { from: `/checkout/${openPlate.id}` } })
                  return
                }
                waitlist.join(openPlate.id)
                toast.push({ kind: 'success', title: 'On waitlist', description: 'We will notify you when a portion opens.' })
              }}
              onLeaveWaitlist={() => waitlist.leave(openPlate.id)}
              waitlistRequiresLogin={!user}
              onWaitlistLogin={() => navigate('/login', { state: { from: `/p/${openPlate.id}` } })}
            />
          ) : null}
        </Modal>

        <WriteReviewModal
          open={Boolean(reviewOrder && reviewPlate)}
          plateName={reviewPlate?.name ?? ''}
          cookName={reviewPlate?.cook.name ?? ''}
          onClose={() => setReviewForOrderId(null)}
          onSubmit={handleSubmitReview}
        />

        {reportTarget ? (
          <ReportModal
            open={Boolean(reportTarget)}
            target={{
              kind: reportTarget.type === 'review' ? 'review' : reportTarget.type,
              label: reportTarget.label,
            }}
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
      </ReviewsProvider>
    </MarketplaceProvider>
  )
}

function CheckoutRoute({
  user,
  confirming,
  confirmError,
  onConfirm,
}: {
  user: import('../types').User
  confirming: boolean
  confirmError: string | null
  onConfirm: (plateId: string, opts: CheckoutConfirmPayload) => void
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
      user={user}
      enableOrderTexts={settings.enableOrderTexts}
      confirmBeforeReserve={settings.confirmBeforeReserve}
      confirming={confirming}
      confirmError={confirmError}
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
  currentUserId,
  userCookVerification,
  onCookReply,
  onUnblock,
  onReportReview,
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
  currentUserId?: string
  userCookVerification?: import('../types').User['cookVerification']
  onCookReply?: (reviewId: string, body: string) => void
  onUnblock?: (cookId: string) => void
  onReportReview?: (reviewId: string, label: string) => void
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
      currentUserId={currentUserId}
      userCookVerification={currentUserId === cookId ? userCookVerification : undefined}
      onCookReply={onCookReply}
      onUnblock={onUnblock ? () => onUnblock(cookId) : undefined}
      onReportReview={onReportReview}
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
