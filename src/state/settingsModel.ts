import type { Category } from '../types'

export const SETTINGS_STORAGE_KEY = 'goplate.settings.v1'
export const MARKETPLACE_STORAGE_KEY = 'goplate.marketplace.v1'

export type DistanceUnit = 'mi' | 'km'
export type ThemeMode = 'system' | 'light' | 'dark'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR'
export type LocaleCode = 'en-US' | 'en-GB' | 'en-CA' | 'en-AU' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ja-JP'

export type Settings = {
  enableLocationHints: boolean
  enableOrderTexts: boolean
  reduceMotion: boolean
  defaultZip: string
  distanceUnit: DistanceUnit
  compactDensity: boolean
  confirmBeforeReserve: boolean
  showCookAvatars: boolean
  defaultCategory: Category
  showPickupWindowsOnCards: boolean
  strongerFocusRings: boolean
  themeMode: ThemeMode
  currency: CurrencyCode
  locale: LocaleCode
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  showAllergenBadges: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  enableLocationHints: true,
  enableOrderTexts: true,
  reduceMotion: false,
  defaultZip: '10012',
  distanceUnit: 'mi',
  compactDensity: false,
  confirmBeforeReserve: false,
  showCookAvatars: true,
  defaultCategory: 'All',
  showPickupWindowsOnCards: true,
  strongerFocusRings: false,
  themeMode: 'system',
  currency: 'USD',
  locale: 'en-US',
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: false,
  showAllergenBadges: true,
}

const CATEGORIES: Category[] = ['All', 'Hot Meals', 'Bakery', 'Desserts', 'Vegan']
const THEMES: ThemeMode[] = ['system', 'light', 'dark']
const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR']
const LOCALES: LocaleCode[] = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP']

function isCategory(x: unknown): x is Category {
  return typeof x === 'string' && (CATEGORIES as readonly string[]).includes(x)
}

function isDistanceUnit(x: unknown): x is DistanceUnit {
  return x === 'mi' || x === 'km'
}

function isOneOf<T extends string>(x: unknown, options: readonly T[]): x is T {
  return typeof x === 'string' && (options as readonly string[]).includes(x)
}

export function safeParseSettingsJson(json: string | null): unknown {
  if (!json) return null
  try {
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}

export function migrateSettings(raw: unknown): Settings {
  const d = DEFAULT_SETTINGS
  if (!raw || typeof raw !== 'object') return d
  const o = raw as Record<string, unknown>
  const defaultZip =
    typeof o.defaultZip === 'string' && o.defaultZip.trim().length > 0 ? o.defaultZip.trim().slice(0, 10) : d.defaultZip
  return {
    enableLocationHints: typeof o.enableLocationHints === 'boolean' ? o.enableLocationHints : d.enableLocationHints,
    enableOrderTexts: typeof o.enableOrderTexts === 'boolean' ? o.enableOrderTexts : d.enableOrderTexts,
    reduceMotion: typeof o.reduceMotion === 'boolean' ? o.reduceMotion : d.reduceMotion,
    defaultZip,
    distanceUnit: isDistanceUnit(o.distanceUnit) ? o.distanceUnit : d.distanceUnit,
    compactDensity: typeof o.compactDensity === 'boolean' ? o.compactDensity : d.compactDensity,
    confirmBeforeReserve: typeof o.confirmBeforeReserve === 'boolean' ? o.confirmBeforeReserve : d.confirmBeforeReserve,
    showCookAvatars: typeof o.showCookAvatars === 'boolean' ? o.showCookAvatars : d.showCookAvatars,
    defaultCategory: isCategory(o.defaultCategory) ? o.defaultCategory : d.defaultCategory,
    showPickupWindowsOnCards:
      typeof o.showPickupWindowsOnCards === 'boolean' ? o.showPickupWindowsOnCards : d.showPickupWindowsOnCards,
    strongerFocusRings: typeof o.strongerFocusRings === 'boolean' ? o.strongerFocusRings : d.strongerFocusRings,
    themeMode: isOneOf(o.themeMode, THEMES) ? o.themeMode : d.themeMode,
    currency: isOneOf(o.currency, CURRENCIES) ? o.currency : d.currency,
    locale: isOneOf(o.locale, LOCALES) ? o.locale : d.locale,
    emailNotifications: typeof o.emailNotifications === 'boolean' ? o.emailNotifications : d.emailNotifications,
    smsNotifications: typeof o.smsNotifications === 'boolean' ? o.smsNotifications : d.smsNotifications,
    pushNotifications: typeof o.pushNotifications === 'boolean' ? o.pushNotifications : d.pushNotifications,
    showAllergenBadges: typeof o.showAllergenBadges === 'boolean' ? o.showAllergenBadges : d.showAllergenBadges,
  }
}

export function exportLocalGoPlateData() {
  const payload = buildExportPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `goplate-local-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function buildExportPayload() {
  return {
    exportedAt: new Date().toISOString(),
    [SETTINGS_STORAGE_KEY]: localStorage.getItem(SETTINGS_STORAGE_KEY),
    [MARKETPLACE_STORAGE_KEY]: localStorage.getItem(MARKETPLACE_STORAGE_KEY),
    'goplate.auth.v1': localStorage.getItem('goplate.auth.v1'),
    'goplate.accounts.v1': localStorage.getItem('goplate.accounts.v1'),
  }
}

export function importLocalGoPlateData(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as Record<string, string | null>
        if (!raw[SETTINGS_STORAGE_KEY] && !raw[MARKETPLACE_STORAGE_KEY]) {
          resolve({ ok: false, error: 'Not a GoPlate backup file.' })
          return
        }
        for (const [key, value] of Object.entries(raw)) {
          if (key === 'exportedAt' || value == null) continue
          if (typeof value === 'string') localStorage.setItem(key, value)
        }
        resolve({ ok: true })
      } catch {
        resolve({ ok: false, error: 'Could not parse backup JSON.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, error: 'Could not read file.' })
    reader.readAsText(file)
  })
}
