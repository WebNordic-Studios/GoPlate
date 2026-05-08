import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import type { Plate } from '../../types'
import { formatMoney } from '../../lib/format'

export function MapPage({
  plates,
  onOpenPlate,
}: {
  plates: Plate[]
  onOpenPlate: (plateId: string) => void
}) {
  const mapEl = useRef<HTMLDivElement | null>(null)

  const center = useMemo(() => {
    const first = plates[0]?.geo
    return first ? ({ lat: first.lat, lng: first.lng } as L.LatLngExpression) : ({ lat: 40.73, lng: -73.99 } as L.LatLngExpression)
  }, [plates])

  useEffect(() => {
    if (!mapEl.current) return
    // React StrictMode mounts/unmounts components twice in dev.
    // Leaflet keeps an internal id on the container; clear it to avoid
    // "Map container is already initialized" hard crashes / blank screen.
    const container = mapEl.current as any
    if (container._leaflet_id) container._leaflet_id = null

    const map = L.map(mapEl.current, {
      center,
      zoom: 11,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    // Marker icons can break in Vite without config; use a simple div icon.
    const icon = L.divIcon({
      className: '',
      html:
        '<div style="width:14px;height:14px;border-radius:999px;background:#F97316;box-shadow:0 8px 18px -10px rgba(17,24,39,.7);border:2px solid white"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    const markers: L.Marker[] = []
    for (const p of plates) {
      if (!p.geo || typeof p.geo.lat !== 'number' || typeof p.geo.lng !== 'number') continue
      const m = L.marker([p.geo.lat, p.geo.lng], { icon }).addTo(map)
      const content = document.createElement('div')
      content.style.minWidth = '220px'
      content.innerHTML = `
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(p.name)}</div>
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
      markers.push(m)
    }

    return () => {
      for (const m of markers) m.remove()
      map.remove()
    }
  }, [plates, center, onOpenPlate])

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Map</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            Browse where plates are available. Click a pin to open details.
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-natural ring-1 ring-black/5">
        <div className="h-[65vh] min-h-[440px]">
          <div ref={mapEl} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeAttr(s: string) {
  return escapeHtml(s).replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

