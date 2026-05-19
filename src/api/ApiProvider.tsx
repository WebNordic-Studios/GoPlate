import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GoPlateApi } from './client'

type ApiContextValue = {
  api: GoPlateApi
  /** True while the simulated initial marketplace hydrate runs. */
  bootstrapping: boolean
}

const ApiContext = createContext<ApiContextValue | null>(null)

export function ApiProvider({ api, children }: { api: GoPlateApi; children: ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await api.marketplace.listPlates()
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api])

  const value = useMemo(() => ({ api, bootstrapping }), [api, bootstrapping])
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi must be used within ApiProvider')
  return ctx
}
