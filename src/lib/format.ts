import type { CurrencyCode, DistanceUnit, LocaleCode } from '../state/settingsModel'

/**
 * Format a USD-cent amount as a localized currency string. The amount is stored
 * in cents to avoid float drift; for non-USD currencies we use a flat
 * approximation since this is a prototype (no live FX rates).
 */
export function formatMoney(
  cents: number,
  currency: CurrencyCode = 'USD',
  locale: LocaleCode = 'en-US',
) {
  const usd = cents / 100
  const amount = usd * FX_FROM_USD[currency]
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount)
  } catch {
    return `$${usd.toFixed(2)}`
  }
}

const FX_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.5,
  JPY: 156,
  INR: 83,
}

export function formatDistanceBadge(miles: number, unit: DistanceUnit) {
  if (unit === 'km') {
    const km = miles * 1.60934
    return `${km.toFixed(1)} km away`
  }
  return `${miles.toFixed(1)} miles away`
}

export function formatDistanceShort(miles: number, unit: DistanceUnit) {
  if (unit === 'km') return `${(miles * 1.60934).toFixed(1)} km`
  return `${miles.toFixed(1)} mi`
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Generates a 4-digit pickup-handoff code. */
export function generateHandoffCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

/** A relative-time formatter ("3 min ago"). */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const min = Math.round(diffMs / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const days = Math.round(hr / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(days / 365)}y ago`
}
