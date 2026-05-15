import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import { Info, Layers, Search, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Category, Plate } from '../../types'
import { formatDistanceShort, formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { Button } from '../../ui/Button'
import { CategoryRibbon } from '../components/CategoryRibbon'

const DEFAULT_CENTER: L.LatLngExpression = { lat: 40.73, lng: -73.99 }

/** Serialized Leaflet bounds for React state (prototype locales stay away from the antimeridian). */
type ViewportBounds = { south: number; west: number; north: number; east: number }

function plateInViewport(plate: Plate, bounds: ViewportBounds): boolean {
  const { lat, lng } = plate.geo
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
}

export function MapPage({
  plates,
  onOpenPlate,
}: {
  plates: Plate[]
  onOpenPlate: (plateId: string) => void
}) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const [category, setCategory] = useState<Category>('All')
  const [query, setQuery] = useState('')
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null)

  const withGeo = useMemo(
    () =>
      plates.filter((p) => p.geo && typeof p.geo.lat === 'number' && typeof p.geo.lng === 'number'),
    [plates],
  )

  const mapPlates = useMemo(() => {
    let list = withGeo
    if (category !== 'All') list = list.filter((p) => p.category === category)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cook.name.toLowerCase().includes(q) ||
          p.geo.areaLabel.toLowerCase().includes(q) ||
          p.zip.includes(q),
      )
    }
    return list
  }, [withGeo, category, query])

  const center = useMemo(() => {
    const first = mapPlates[0]?.geo
    return first ? ({ lat: first.lat, lng: first.lng } as L.LatLngExpression) : DEFAULT_CENTER
  }, [mapPlates])

  const stats = useMemo(() => {
    const areas = new Set(mapPlates.map((p) => p.geo.areaLabel))
    const cooks = new Set(mapPlates.map((p) => p.cook.id))
    const available = mapPlates.filter((p) => p.portionsAvailable > 0).length
    return {
      pins: mapPlates.length,
      areas: areas.size,
      cooks: cooks.size,
      available,
    }
  }, [mapPlates])

  const sidebarPlates = useMemo(() => {
    if (!viewportBounds) return []
    return mapPlates.filter((p) => plateInViewport(p, viewportBounds))
  }, [mapPlates, viewportBounds])

  /** Avoid one frame listing pins against bounds from before filters changed (map effect runs after paint). */
  useEffect(() => {
    setViewportBounds(null)
  }, [category, query])

  useEffect(() => {
    if (!mapEl.current) return
    const container = mapEl.current as HTMLElement & { _leaflet_id?: number | null }
    if (container._leaflet_id) container._leaflet_id = null

    const map = L.map(mapEl.current, {
      center,
      zoom: 11,
      scrollWheelZoom: true,
    })

    // Voyager + gp-map-apple-like CSS: closest Leaflet-friendly analogue to Apple Maps’ warm, quiet standard style.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      detectRetina: true,
    }).addTo(map)

    const layer: L.LayerGroup = L.layerGroup().addTo(map)

    function renderClusters() {
      layer.clearLayers()
      const zoom = map.getZoom()
      const cellDeg = zoom >= 14 ? 0 : zoom >= 12 ? 0.01 : zoom >= 10 ? 0.05 : zoom >= 8 ? 0.15 : 0.6
      const buckets = new Map<string, Plate[]>()
      for (const p of mapPlates) {
        if (!p.geo) continue
        let key: string
        if (cellDeg <= 0) {
          key = `${p.geo.lat.toFixed(6)},${p.geo.lng.toFixed(6)}`
        } else {
          const lat = Math.floor(p.geo.lat / cellDeg)
          const lng = Math.floor(p.geo.lng / cellDeg)
          key = `${lat}_${lng}`
        }
        const arr = buckets.get(key) ?? []
        arr.push(p)
        buckets.set(key, arr)
      }

      for (const arr of buckets.values()) {
        if (arr.length === 1) {
          const p = arr[0]
          const color = categoryMarkerColor(p.category)
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:14px;height:14px;border-radius:999px;background:${color};box-shadow:0 8px 18px -10px rgba(17,24,39,.7);border:2px solid white"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          })
          const m = L.marker([p.geo.lat, p.geo.lng], { icon }).addTo(layer)
          const content = document.createElement('div')
          content.style.minWidth = '220px'
          content.innerHTML = `
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(p.name)}</div>
            <div style="opacity:.72;font-size:12px;margin-bottom:4px">${escapeHtml(p.category)}</div>
            <div style="opacity:.72;font-size:12px;margin-bottom:8px">${escapeHtml(p.geo.areaLabel)} • ${escapeHtml(
              p.pickupWindow,
            )}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:10px">${escapeHtml(formatMoney(p.priceCents))}</div>
            <button data-plate-id="${escapeAttr(
              p.id,
            )}" style="border:0;border-radius:16px;padding:10px 12px;background:#F97316;color:white;font-weight:700;cursor:pointer">View dish</button>
          `
          m.bindPopup(content)
          m.on('popupopen', () => {
            const btn = content.querySelector('button[data-plate-id]') as HTMLButtonElement | null
            if (!btn) return
            L.DomEvent.disableClickPropagation(btn)
            L.DomEvent.on(btn, 'click', () => onOpenPlate(p.id))
          })
        } else {
          const avgLat = arr.reduce((s, p) => s + p.geo.lat, 0) / arr.length
          const avgLng = arr.reduce((s, p) => s + p.geo.lng, 0) / arr.length
          const size = arr.length >= 30 ? 56 : arr.length >= 10 ? 48 : 40
          const bg = arr.length >= 30 ? '#BE185D' : arr.length >= 10 ? '#F97316' : '#064E3B'
          const fontSize = arr.length >= 100 ? '11px' : '13px'
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};color:white;display:grid;place-items:center;font-weight:800;font-size:${fontSize};box-shadow:0 16px 28px -14px rgba(17,24,39,.65);border:3px solid rgba(255,255,255,.9)">${arr.length}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
          const clusterMarker = L.marker([avgLat, avgLng], { icon }).addTo(layer)
          clusterMarker.on('click', () => {
            const b = L.latLngBounds(arr.map((p) => [p.geo.lat, p.geo.lng] as L.LatLngTuple))
            map.fitBounds(b, { padding: [60, 60], maxZoom: 15 })
          })
        }
      }
    }

    function onMapViewChanged() {
      renderClusters()
      const b = map.getBounds()
      setViewportBounds({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      })
    }

    map.on('zoomend moveend', onMapViewChanged)

    const latlngs: L.LatLngTuple[] = mapPlates
      .filter((p) => p.geo && typeof p.geo.lat === 'number' && typeof p.geo.lng === 'number')
      .map((p) => [p.geo.lat, p.geo.lng])

    if (latlngs.length === 0) {
      map.setView(DEFAULT_CENTER, 11)
    } else if (latlngs.length === 1) {
      map.setView(latlngs[0], 13)
    } else {
      const b = L.latLngBounds(latlngs)
      map.fitBounds(b, { padding: [48, 48], maxZoom: 14 })
    }

    onMapViewChanged()

    return () => {
      map.off('zoomend moveend', onMapViewChanged)
      layer.clearLayers()
      map.remove()
    }
  }, [mapPlates, center, onOpenPlate])

  const hiddenByGeo = plates.length - withGeo.length

  return (
    <div className="gp-container pb-28 pt-6 md:pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Neighborhood map</div>
          <p className="mt-2 max-w-2xl text-sm text-gp-charcoal/70 sm:text-base">
            See where today’s pickups cluster, filter by category, and open a dish without leaving the map. Pins match
            plate type in the legend below.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill label="Dishes on map" value={String(stats.pins)} />
        <StatPill label="Pickup areas" value={String(stats.areas)} />
        <StatPill label="Cooks shown" value={String(stats.cooks)} />
        <StatPill label="With portions left" value={String(stats.available)} />
      </div>

      <div className="mt-6 rounded-[2rem] bg-white/70 p-4 shadow-natural ring-1 ring-black/5 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">Category</div>
            <div className="mt-2">
              <CategoryRibbon value={category} onChange={setCategory} />
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50" htmlFor="map-search">
              Search
            </label>
            <div className="gp-glass mt-2 flex items-center gap-2 rounded-2xl px-3 py-2">
              <Search size={18} className="shrink-0 text-gp-charcoal/45" aria-hidden />
              <input
                id="map-search"
                type="search"
                placeholder="Dish, cook, area, or zip…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="gp-focus min-w-0 flex-1 bg-transparent text-sm font-semibold text-gp-charcoal placeholder:text-gp-charcoal/40"
              />
            </div>
          </div>
        </div>
      </div>

      {hiddenByGeo > 0 ? (
        <p className="mt-4 text-xs text-gp-charcoal/55">
          {hiddenByGeo} listing{hiddenByGeo === 1 ? '' : 's'} hidden: missing map coordinates in this build.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="relative isolate z-0 overflow-hidden rounded-[2rem] bg-white shadow-natural ring-1 ring-black/5">
            <div className="h-[52vh] min-h-[360px] lg:h-[min(68vh,640px)]">
              <div className="gp-map-apple-like h-full w-full">
                <div ref={mapEl} className="h-full w-full" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-4 shadow-natural ring-1 ring-black/5">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-gp-charcoal">
                <Layers className="h-4 w-4 text-gp-secondary" aria-hidden />
                Pin legend
              </div>
              <ul className="mt-3 space-y-2 text-sm text-gp-charcoal/75">
                <LegendRow color={categoryMarkerColor('Hot Meals')} label="Hot Meals" />
                <LegendRow color={categoryMarkerColor('Bakery')} label="Bakery" />
                <LegendRow color={categoryMarkerColor('Desserts')} label="Desserts" />
                <LegendRow color={categoryMarkerColor('Vegan')} label="Vegan" />
                <LegendRow color="#064E3B" label="Cluster (zoom to expand)" />
              </ul>
            </div>
            <div className="rounded-2xl bg-gp-secondary/[0.06] p-4 ring-1 ring-black/5">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-gp-charcoal">
                <Info className="h-4 w-4 text-gp-primary" aria-hidden />
                Map tips
              </div>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-gp-charcoal/70">
                <li>Scroll to zoom; drag to pan the neighborhood.</li>
                <li>Tap a pin for pickup window, price, and a quick link into the dish.</li>
                <li>Tap a numbered cluster to zoom into that area.</li>
                <li>Combine filters to plan a route across multiple stops.</li>
                <li>The sidebar lists meals only inside your current map window.</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-lg font-semibold">In this view</div>
            <span className="rounded-full bg-gp-primary/10 px-3 py-1 text-xs font-semibold text-gp-primary">
              {sidebarPlates.length} here
            </span>
          </div>
          <p className="mt-1 text-xs text-gp-charcoal/60">
            Only dishes inside the map frame — pan or zoom to explore another pocket.
          </p>
          <div className="mt-4 max-h-[min(68vh,640px)] space-y-3 overflow-y-auto pr-1">
            {sidebarPlates.map((p) => (
              <MapPlateRow key={p.id} plate={p} onOpen={() => onOpenPlate(p.id)} />
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-10 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5 sm:p-8">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Why a map-first view</h2>
        <p className="mt-2 max-w-3xl text-sm text-gp-charcoal/70">
          Hyper-local food is inherently spatial: two dishes with the same name can feel totally different when one is
          a six-minute walk and the other is a twenty-minute drive. The map keeps distance honest, helps you batch
          pickups, and reinforces that GoPlate is about neighbors — not anonymous city-wide delivery.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MapBlurb title="Plan a loop" body="Spot clusters, line up two pickups in one outing, and avoid backtracking." />
          <MapBlurb
            title="Privacy-aware pins"
            body="Markers reflect general areas; exact addresses stay gated until checkout, matching the rest of the app."
          />
          <MapBlurb
            title="Apple Maps–style polish"
            body="Apple doesn’t ship public web tiles, so we pair a clean OSM-backed basemap with warm, softened rendering—cream land, gentle greens, calm blues—for that familiar Maps calm."
          />
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-natural ring-1 ring-black/5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-gp-charcoal">{value}</div>
    </div>
  )
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow-sm"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span>{label}</span>
    </li>
  )
}

function MapPlateRow({ plate, onOpen }: { plate: Plate; onOpen: () => void }) {
  const { settings } = useSettings()
  const soldOut = plate.portionsAvailable <= 0
  return (
    <div className="flex gap-3 rounded-2xl bg-white/90 p-3 shadow-natural ring-1 ring-black/5">
      <img
        src={plate.images[0]}
        alt=""
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold">{plate.name}</div>
        <div className="mt-0.5 text-xs text-gp-charcoal/60">{plate.geo.areaLabel}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gp-charcoal/65">
          <span className="inline-flex items-center gap-1 font-medium text-gp-charcoal/75">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: categoryMarkerColor(plate.category) }}
              aria-hidden
            />
            {plate.category}
          </span>
          <span className="text-gp-charcoal/35">·</span>
          <span className="flex items-center gap-0.5">
            <Star size={12} className="text-gp-primary" fill="currentColor" aria-hidden />
            {plate.rating.toFixed(1)}
          </span>
          <span className="text-gp-charcoal/35">·</span>
          <span>{formatDistanceShort(plate.distanceMiles, settings.distanceUnit)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gp-charcoal">{formatMoney(plate.priceCents)}</span>
          <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={onOpen}>
            View
          </Button>
        </div>
        {soldOut ? <div className="mt-1 text-[11px] font-semibold text-gp-charcoal/50">Sold out</div> : null}
      </div>
    </div>
  )
}

function MapBlurb({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
      <div className="font-display text-sm font-semibold text-gp-charcoal">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/70">{body}</p>
    </div>
  )
}

function categoryMarkerColor(category: Plate['category']): string {
  switch (category) {
    case 'Hot Meals':
      return '#F97316'
    case 'Bakery':
      return '#D97706'
    case 'Desserts':
      return '#BE185D'
    case 'Vegan':
      return '#059669'
    default:
      return '#F97316'
  }
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeAttr(s: string) {
  return escapeHtml(s).replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}
