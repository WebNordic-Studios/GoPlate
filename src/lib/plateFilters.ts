import type { Plate } from '../types'

/** Listed within the last 36 hours. */
export function isJustListed(plate: Plate): boolean {
  if (!plate.createdAtIso) return false
  const ms = Date.now() - new Date(plate.createdAtIso).getTime()
  return ms >= 0 && ms < 1000 * 60 * 60 * 36
}

/** Pickup window ends within the next 4 hours (today). */
export function isPickupSoon(plate: Pick<Plate, 'pickupWindow'>, now = new Date()): boolean {
  return isPickupWindowSoon(plate.pickupWindow, now)
}

export function isPickupWindowSoon(pickupWindow: string, now = new Date()): boolean {
  const end = parsePickupWindowEnd(pickupWindow, now)
  if (!end) return false
  const ms = end.getTime() - now.getTime()
  return ms > 0 && ms <= 1000 * 60 * 60 * 4
}

export function parsePickupWindowEnd(pickupWindow: string, ref: Date): Date | null {
  const match = pickupWindow.match(/–\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i)
  if (!match) return null
  const timeStr = match[1].trim()
  const parsed = parseTimeToday(timeStr, ref)
  return parsed
}

function parseTimeToday(timeStr: string, ref: Date): Date | null {
  const normalized = timeStr.toUpperCase().replace(/\s/g, '')
  let hours = 0
  let minutes = 0
  const ampm = normalized.match(/(AM|PM)$/)
  const num = normalized.replace(/(AM|PM)$/, '')
  if (num.includes(':')) {
    const [h, m] = num.split(':').map(Number)
    hours = h
    minutes = m || 0
  } else {
    hours = Number(num)
    minutes = 0
  }
  if (Number.isNaN(hours)) return null
  if (ampm) {
    const isPm = ampm[1] === 'PM'
    if (hours === 12) hours = isPm ? 12 : 0
    else if (isPm) hours += 12
  } else if (hours <= 12 && hours >= 1 && ref.getHours() >= 12 && hours < 8) {
    hours += 12
  }
  const d = new Date(ref)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export type DiscoveryFilter = 'all' | 'just-listed' | 'pickup-soon'

export const DISCOVERY_FILTER_LABEL: Record<DiscoveryFilter, string> = {
  all: 'All plates',
  'just-listed': 'Just listed',
  'pickup-soon': 'Pickup soon',
}

export function matchesDiscoveryFilter(plate: Plate, filter: DiscoveryFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'just-listed') return isJustListed(plate)
  if (filter === 'pickup-soon') return isPickupSoon(plate)
  return true
}
