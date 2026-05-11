import type { GeoPoint } from '../types'

// Very lightweight "zip → area" mapping for the prototype.
// In a real public app you’d geocode + store exact coords server-side.
const ZIP_TABLE: Record<string, GeoPoint> = {
  '10012': { lat: 40.725, lng: -73.998, areaLabel: 'SoHo, NYC' },
  '11211': { lat: 40.7128, lng: -73.9535, areaLabel: 'Williamsburg, NYC' },
  '94110': { lat: 37.7599, lng: -122.4148, areaLabel: 'Mission, SF' },
  '60614': { lat: 41.9227, lng: -87.6513, areaLabel: 'Lincoln Park, Chicago' },
  '30309': { lat: 33.7896, lng: -84.3881, areaLabel: 'Midtown, Atlanta' },
  '98103': { lat: 47.6619, lng: -122.3426, areaLabel: 'Fremont, Seattle' },
}

export function geoForZip(zip: string): GeoPoint {
  const z = zip.trim()
  const known = ZIP_TABLE[z]
  if (known) return known

  // Default to NYC-ish with a tiny deterministic jitter by zip.
  const seed = Array.from(z).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 13
  const jitterLat = ((seed % 13) - 6) * 0.0025
  const jitterLng = (((seed * 7) % 13) - 6) * 0.0025
  return { lat: 40.73 + jitterLat, lng: -73.99 + jitterLng, areaLabel: 'Near you' }
}

/** Find the closest known ZIP to a given lat/lng using haversine distance. */
export function nearestZip(lat: number, lng: number): { zip: string; geo: GeoPoint } {
  let best: { zip: string; geo: GeoPoint; dist: number } | null = null
  for (const [zip, geo] of Object.entries(ZIP_TABLE)) {
    const d = haversine(lat, lng, geo.lat, geo.lng)
    if (!best || d < best.dist) best = { zip, geo, dist: d }
  }
  if (!best) return { zip: '10012', geo: ZIP_TABLE['10012'] }
  return { zip: best.zip, geo: best.geo }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Request the user's coordinates from the browser. Promise rejects on denial. */
export function requestUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Could not get your location.')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  })
}
