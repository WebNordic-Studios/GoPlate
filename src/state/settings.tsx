/* Context modules pair a provider with a consumer hook; both must live together. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  migrateSettings,
  safeParseSettingsJson,
  type Settings,
} from './settingsModel'

type SettingsContextValue = {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function resolveTheme(mode: Settings['themeMode']): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return mode
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    migrateSettings(safeParseSettingsJson(localStorage.getItem(SETTINGS_STORAGE_KEY))),
  )

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // Apply the theme class to <html> so Tailwind `dark:` variants light up.
  useEffect(() => {
    const html = document.documentElement
    function apply() {
      const theme = resolveTheme(settings.themeMode)
      html.classList.toggle('dark', theme === 'dark')
      html.style.colorScheme = theme
    }
    apply()
    if (settings.themeMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => apply()
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [settings.themeMode])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      set(key, v) {
        setSettings((prev) => ({ ...prev, [key]: v }))
      },
      reset() {
        setSettings(DEFAULT_SETTINGS)
      },
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
