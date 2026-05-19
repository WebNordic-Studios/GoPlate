import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'goplate.waitlist.v1'

type WaitlistState = Record<string, string[]>

function safeParse(json: string | null): WaitlistState {
  if (!json) return {}
  try {
    const obj = JSON.parse(json) as WaitlistState
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

export function useWaitlist(userId: string | null) {
  const [state, setState] = useState<WaitlistState>(() => safeParse(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const joinedPlateIds = useMemo(() => {
    if (!userId) return new Set<string>()
    return new Set(
      Object.entries(state)
        .filter(([, ids]) => ids.includes(userId))
        .map(([plateId]) => plateId),
    )
  }, [state, userId])

  const join = useCallback(
    (plateId: string) => {
      if (!userId) return false
      setState((prev) => {
        const list = prev[plateId] ?? []
        if (list.includes(userId)) return prev
        return { ...prev, [plateId]: [...list, userId] }
      })
      return true
    },
    [userId],
  )

  const leave = useCallback(
    (plateId: string) => {
      if (!userId) return
      setState((prev) => {
        const list = (prev[plateId] ?? []).filter((id) => id !== userId)
        if (list.length === 0) {
          const next = { ...prev }
          delete next[plateId]
          return next
        }
        return { ...prev, [plateId]: list }
      })
    },
    [userId],
  )

  const isJoined = useCallback((plateId: string) => joinedPlateIds.has(plateId), [joinedPlateIds])

  const countForPlate = useCallback((plateId: string) => state[plateId]?.length ?? 0, [state])

  return { join, leave, isJoined, countForPlate }
}
