import { useEffect, useState } from 'react'

export type Settings = {
  enableLocationHints: boolean
  enableOrderTexts: boolean
  reduceMotion: boolean
}

const KEY = 'goplate.settings.v1'

function safeParse(json: string | null): Settings | null {
  if (!json) return null
  try {
    return JSON.parse(json) as Settings
  } catch {
    return null
  }
}

const DEFAULTS: Settings = {
  enableLocationHints: true,
  enableOrderTexts: true,
  reduceMotion: false,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => safeParse(localStorage.getItem(KEY)) ?? DEFAULTS)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
  }, [settings])

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setSettings(DEFAULTS)
  }

  return { settings, set, reset }
}

