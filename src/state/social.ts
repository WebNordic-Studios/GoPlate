import { useEffect, useMemo, useState } from 'react'

type SocialState = {
  likesByPlateId: Record<string, true>
  followsByCookId: Record<string, true>
  /** Notify when followed cook publishes a new live listing. */
  notifyOnListingByCookId: Record<string, true>
}

const LEGACY_SOCIAL_KEY = 'goplate.social.v1'

function isRecordOfTrue(value: unknown): value is Record<string, true> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeSocialState(raw: unknown, userId: string | null): SocialState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { likesByPlateId: {}, followsByCookId: {}, notifyOnListingByCookId: {} }
  }

  const o = raw as Record<string, unknown>

  // Legacy shape: { "user_xxx": { likesByPlateId, ... } }
  if (userId && o[userId] && typeof o[userId] === 'object' && !('likesByPlateId' in o)) {
    return normalizeSocialState(o[userId], null)
  }

  return {
    likesByPlateId: isRecordOfTrue(o.likesByPlateId) ? o.likesByPlateId : {},
    followsByCookId: isRecordOfTrue(o.followsByCookId) ? o.followsByCookId : {},
    notifyOnListingByCookId: isRecordOfTrue(o.notifyOnListingByCookId) ? o.notifyOnListingByCookId : {},
  }
}

function safeParse(json: string | null, userId: string | null): SocialState | null {
  if (!json) return null
  try {
    return normalizeSocialState(JSON.parse(json) as unknown, userId)
  } catch {
    return null
  }
}

function keyForUser(userId: string | null) {
  return `${LEGACY_SOCIAL_KEY}.${userId ?? 'anon'}`
}

const DEFAULTS: SocialState = { likesByPlateId: {}, followsByCookId: {}, notifyOnListingByCookId: {} }

function loadSocialState(storageKey: string, userId: string | null): SocialState {
  const stored = localStorage.getItem(storageKey)
  if (stored) return safeParse(stored, userId) ?? DEFAULTS

  if (userId) {
    const legacy = localStorage.getItem(LEGACY_SOCIAL_KEY)
    if (legacy) return safeParse(legacy, userId) ?? DEFAULTS
  }

  return DEFAULTS
}

export function useSocial(userId: string | null) {
  const storageKey = useMemo(() => keyForUser(userId), [userId])
  const [state, setState] = useState<SocialState>(() => loadSocialState(storageKey, userId))

  useEffect(() => {
    setState(loadSocialState(storageKey, userId))
  }, [storageKey, userId])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  const likesByPlateId = state.likesByPlateId ?? DEFAULTS.likesByPlateId
  const followsByCookId = state.followsByCookId ?? DEFAULTS.followsByCookId
  const notifyOnListingByCookId = state.notifyOnListingByCookId ?? DEFAULTS.notifyOnListingByCookId

  function toggleLike(plateId: string) {
    setState((prev) => {
      const likes = { ...(prev.likesByPlateId ?? {}) }
      if (likes[plateId]) delete likes[plateId]
      else likes[plateId] = true
      return { ...prev, likesByPlateId: likes }
    })
  }

  function toggleFollow(cookId: string) {
    setState((prev) => {
      const follows = { ...(prev.followsByCookId ?? {}) }
      const notify = { ...(prev.notifyOnListingByCookId ?? {}) }
      if (follows[cookId]) {
        delete follows[cookId]
        delete notify[cookId]
      } else {
        follows[cookId] = true
        notify[cookId] = true
      }
      return { ...prev, followsByCookId: follows, notifyOnListingByCookId: notify }
    })
  }

  function toggleNotifyOnListing(cookId: string) {
    setState((prev) => {
      const notify = { ...(prev.notifyOnListingByCookId ?? {}) }
      if (notify[cookId]) delete notify[cookId]
      else notify[cookId] = true
      return { ...prev, notifyOnListingByCookId: notify }
    })
  }

  function notifyOnListing(cookId: string) {
    return Boolean(notifyOnListingByCookId[cookId])
  }

  function isLiked(plateId: string) {
    return Boolean(likesByPlateId[plateId])
  }

  function isFollowing(cookId: string) {
    return Boolean(followsByCookId[cookId])
  }

  return {
    isLiked,
    isFollowing,
    notifyOnListing,
    toggleLike,
    toggleFollow,
    toggleNotifyOnListing,
    likesByPlateId,
    followsByCookId,
    notifyOnListingByCookId,
  }
}
