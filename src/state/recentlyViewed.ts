import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'goplate.recentlyViewed.v1'
const MAX = 12

function safeParse(json: string | null): string[] {
  if (!json) return []
  try {
    const arr = JSON.parse(json) as string[]
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => safeParse(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const record = useCallback((plateId: string) => {
    if (!plateId) return
    setIds((prev) => [plateId, ...prev.filter((id) => id !== plateId)].slice(0, MAX))
  }, [])

  const clear = useCallback(() => setIds([]), [])

  return { ids, record, clear }
}
