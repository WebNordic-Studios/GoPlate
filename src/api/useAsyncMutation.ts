import { useCallback, useState } from 'react'
import { mapApiError } from './client'
import type { ApiError } from './types'

export function useAsyncMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const run = useCallback(
    async (...args: TArgs): Promise<{ ok: true; data: TResult } | { ok: false; error: ApiError }> => {
      setLoading(true)
      setError(null)
      try {
        const data = await fn(...args)
        return { ok: true, data }
      } catch (e) {
        const apiErr = mapApiError(e)
        setError(apiErr)
        return { ok: false, error: apiErr }
      } finally {
        setLoading(false)
      }
    },
    [fn],
  )

  return { run, loading, error, clearError: () => setError(null) }
}
