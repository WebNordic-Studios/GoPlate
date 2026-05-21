import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { Plate, User } from '../../types'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { plateBelongsToUser } from '../lib/orderRoles'

export function EditPlatePage({
  user,
  plates,
  onUpdate,
  onRemove,
}: {
  user: User
  plates: Plate[]
  onUpdate: (id: string, patch: Partial<Plate>) => void
  onRemove: (id: string) => void
}) {
  const { plateId = '' } = useParams()
  const navigate = useNavigate()
  const plate = useMemo(() => plates.find((p) => p.id === plateId) ?? null, [plates, plateId])

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [portions, setPortions] = useState('')
  const [readyFrom, setReadyFrom] = useState('')
  const [readyTo, setReadyTo] = useState('')
  const [pickupAddressLine, setPickupAddressLine] = useState('')
  const [pickupInstructions, setPickupInstructions] = useState('')
  const [deliveryRadiusMiles, setDeliveryRadiusMiles] = useState('')

  useEffect(() => {
    if (!plate) return
    setName(plate.name)
    setPrice((plate.priceCents / 100).toFixed(2))
    setPortions(String(plate.portionsAvailable))
    const match = plate.pickupWindow.match(/Ready\s+(.+?)\s*–\s*(.+)/i)
    setReadyFrom(match?.[1] ?? '5:30 PM')
    setReadyTo(match?.[2] ?? '7:00 PM')
    setPickupAddressLine(plate.pickupAddressLine ?? '')
    setPickupInstructions(plate.pickupInstructions ?? '')
    setDeliveryRadiusMiles(plate.deliveryRadiusMiles != null ? String(plate.deliveryRadiusMiles) : '')
  }, [plate])

  if (!plate) {
    return (
      <div className="gp-container pb-28 pt-6">
        <EmptyState
          title="Plate not found"
          description="This listing may have been removed."
          action={<Button variant="primary" onClick={() => navigate('/me?tab=analytics')}>Analytics</Button>}
        />
      </div>
    )
  }

  if (!plateBelongsToUser(plate, user.id)) {
    return (
      <div className="gp-container pb-28 pt-6">
        <EmptyState
          title="Not your listing"
          description="You can only edit plates you created."
          action={<Button variant="primary" onClick={() => navigate('/me')}>Profile</Button>}
        />
      </div>
    )
  }

  const editing = plate

  function save() {
    const priceCents = Math.round(Number(price) * 100)
    if (!name.trim() || !Number.isFinite(priceCents) || priceCents <= 0) return
    onUpdate(editing.id, {
      name: name.trim(),
      priceCents,
      portionsAvailable: Math.max(0, Math.round(Number(portions) || 0)),
      pickupWindow: `Ready ${readyFrom.trim()} – ${readyTo.trim()}`,
      pickupAddressLine: pickupAddressLine.trim() || undefined,
      pickupInstructions: pickupInstructions.trim() || undefined,
      deliveryRadiusMiles: deliveryRadiusMiles.trim() ? Number(deliveryRadiusMiles) : undefined,
    })
    navigate('/me?tab=analytics')
  }

  function unpublish() {
    onUpdate(editing.id, { isDraft: true, scheduledPublishAtIso: undefined })
    navigate('/me?tab=analytics')
  }

  function publish() {
    onUpdate(editing.id, { isDraft: false, scheduledPublishAtIso: undefined })
    navigate('/me?tab=analytics')
  }

  function remove() {
    if (!window.confirm(`Delete "${editing.name}"? This cannot be undone.`)) return
    onRemove(editing.id)
    navigate('/me?tab=analytics')
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Edit listing</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">{editing.name}</p>
        </div>
        <Link to="/me?tab=analytics" className="text-sm font-semibold text-gp-secondary hover:underline">
          Back to analytics
        </Link>
      </div>

      <div className="mt-6 max-w-xl rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
        <div className="grid gap-4">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Price ($)" value={price} onChange={setPrice} inputMode="decimal" />
          <Field label="Portions available" value={portions} onChange={setPortions} inputMode="numeric" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ready from" value={readyFrom} onChange={setReadyFrom} />
            <Field label="Ready until" value={readyTo} onChange={setReadyTo} />
          </div>
          <Field label="Pickup address" value={pickupAddressLine} onChange={setPickupAddressLine} />
          <label className="block">
            <div className="text-xs font-semibold text-gp-charcoal/60">Pickup instructions</div>
            <textarea
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              rows={2}
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>
          <Field
            label="Delivery radius (mi)"
            value={deliveryRadiusMiles}
            onChange={setDeliveryRadiusMiles}
            inputMode="decimal"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={save}>
            Save changes
          </Button>
          {editing.isDraft ? (
            <Button variant="secondary" onClick={publish}>
              Publish now
            </Button>
          ) : (
            <Button variant="ghost" onClick={unpublish}>
              Unpublish
            </Button>
          )}
          <Button variant="ghost" onClick={remove} leftIcon={<Trash2 size={16} />} className="text-red-600">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  inputMode?: 'decimal' | 'numeric' | 'text'
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gp-charcoal/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
      />
    </label>
  )
}
