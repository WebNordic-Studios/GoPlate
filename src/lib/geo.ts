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

