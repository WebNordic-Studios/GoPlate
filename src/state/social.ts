import { useEffect, useMemo, useState } from 'react'

type SocialState = {
  likesByPlateId: Record<string, true>
  followsByCookId: Record<string, true>
}

function safeParse(json: string | null): SocialState | null {
  if (!json) return null
  try {
    return JSON.parse(json) as SocialState
  } catch {
    return null
  }
}

function keyForUser(userId: string | null) {
  return `goplate.social.v1.${userId ?? 'anon'}`
}

const DEFAULTS: SocialState = { likesByPlateId: {}, followsByCookId: {} }

export function useSocial(userId: string | null) {
  const storageKey = useMemo(() => keyForUser(userId), [userId])
  const [state, setState] = useState<SocialState>(() => safeParse(localStorage.getItem(storageKey)) ?? DEFAULTS)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  function toggleLike(plateId: string) {
    setState((prev) => {
      const next = { ...prev, likesByPlateId: { ...prev.likesByPlateId } }
      if (next.likesByPlateId[plateId]) delete next.likesByPlateId[plateId]
      else next.likesByPlateId[plateId] = true
      return next
    })
  }

  function toggleFollow(cookId: string) {
    setState((prev) => {
      const next = { ...prev, followsByCookId: { ...prev.followsByCookId } }
      if (next.followsByCookId[cookId]) delete next.followsByCookId[cookId]
      else next.followsByCookId[cookId] = true
      return next
    })
  }

  function isLiked(plateId: string) {
    return Boolean(state.likesByPlateId[plateId])
  }

  function isFollowing(cookId: string) {
    return Boolean(state.followsByCookId[cookId])
  }

  return {
    isLiked,
    isFollowing,
    toggleLike,
    toggleFollow,
    likesByPlateId: state.likesByPlateId,
    followsByCookId: state.followsByCookId,
  }
}

