import { Check, ExternalLink, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Plate, SavedAddress, User } from '../../types'
import { formatMoney } from '../../lib/format'
import {
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormState,
} from '../../lib/checkoutValidation'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { PaymentForm } from '../../ui/PaymentForm'
import { useSettings } from '../../state/settings'
import { KitchenDisclaimer } from '../../ui/KitchenDisclaimer'
import { CancellationPolicyCard } from '../components/CancellationPolicyCard'

const TIP_PERCENTS = [0, 10, 15, 20] as const

export type CheckoutConfirmPayload = {
  delivery: boolean
  contactlessInstructions?: string
  tipCents: number
  contactName: string
  contactPhone: string
  quantity: number
  addressId?: string
  paymentMethodId?: string
}

function initialForm(user: User): CheckoutFormState {
  const methods = user.savedPaymentMethods ?? []
  const firstCard = methods[0]
  return {
    name: user.displayName,
    phone: user.phone ?? '',
    instructions: '',
    selectedAddressId: user.savedAddresses?.[0]?.id ?? null,
    paymentMode: firstCard ? 'saved' : 'new',
    selectedPaymentId: firstCard?.id ?? null,
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  }
}

export function CheckoutPage({
  plate,
  user,
  enableOrderTexts,
  confirmBeforeReserve,
  confirming,
  confirmError,
  onConfirm,
  onBackToMarket,
}: {
  plate: Plate | null
  user: User
  enableOrderTexts: boolean
  confirmBeforeReserve: boolean
  confirming: boolean
  confirmError?: string | null
  onConfirm: (opts: CheckoutConfirmPayload) => void
  onBackToMarket: () => void
}) {
  const { settings } = useSettings()
  const [delivery, setDelivery] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [tipPercent, setTipPercent] = useState<number>(15)
  const [customTip, setCustomTip] = useState('')
  const [form, setForm] = useState<CheckoutFormState>(() => initialForm(user))
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [touched, setTouched] = useState(false)

  const addresses = user.savedAddresses ?? []
  const savedMethods = user.savedPaymentMethods ?? []

  useEffect(() => {
    setForm(initialForm(user))
  }, [user])

  const maxQty = plate?.portionsAvailable ?? 1

  const computed = useMemo(() => {
    if (!plate) return null
    const qty = Math.max(1, Math.min(quantity, plate.portionsAvailable))
    const subtotal = plate.priceCents * qty
    const deliveryCents = delivery && plate.deliveryAvailable ? plate.deliveryFeeCents ?? 0 : 0
    const customCents = customTip ? Math.round(Number(customTip) * 100) : 0
    const tipCents = customCents > 0 ? customCents : Math.round(subtotal * (tipPercent / 100))
    return { qty, subtotal, deliveryCents, tipCents, total: subtotal + deliveryCents + tipCents }
  }, [plate, delivery, customTip, tipPercent, quantity])

  function patchForm(patch: Partial<CheckoutFormState>) {
    setForm((prev) => ({ ...prev, ...patch }))
    if (touched) {
      setErrors(validateCheckoutForm({ ...form, ...patch }, { requireDeliveryAddress: delivery, hasSavedCards: savedMethods.length > 0 }))
    }
  }

  function handleConfirm() {
    setTouched(true)
    const nextErrors = validateCheckoutForm(form, {
      requireDeliveryAddress: delivery,
      hasSavedCards: savedMethods.length > 0,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (confirmBeforeReserve && !window.confirm('Confirm this pickup reservation? You can still cancel from Orders.')) {
      return
    }

    onConfirm({
      delivery,
      contactlessInstructions: form.instructions.trim() || undefined,
      tipCents: computed?.tipCents ?? 0,
      quantity: computed?.qty ?? 1,
      contactName: form.name.trim(),
      contactPhone: form.phone.trim(),
      addressId: delivery ? form.selectedAddressId ?? undefined : undefined,
      paymentMethodId:
        form.paymentMode === 'saved' ? form.selectedPaymentId ?? undefined : undefined,
    })
  }

  return (
    <div className="gp-container pb-32 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Checkout</div>
          <p className="mt-1 text-sm text-gp-charcoal/65">
            Reserve your pickup window. Contact details are shared with the cook after confirmation.
          </p>
        </div>
        <Link
          to="/account"
          className="gp-focus inline-flex items-center gap-1 text-sm font-semibold text-gp-secondary hover:underline"
        >
          Manage account <ExternalLink size={14} aria-hidden />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gp-charcoal/70">
              <ShieldCheck size={18} className="text-gp-secondary" />
              Contact & pickup
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CheckoutField
                label="Name"
                value={form.name}
                error={errors.name}
                onChange={(v) => patchForm({ name: v })}
                autoComplete="name"
              />
              <CheckoutField
                label="Phone"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => patchForm({ phone: v })}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
              />
              <label className="block sm:col-span-2">
                <div className="text-xs font-semibold text-gp-charcoal/60">Pickup / contactless instructions</div>
                <textarea
                  value={form.instructions}
                  onChange={(e) => patchForm({ instructions: e.target.value })}
                  rows={2}
                  maxLength={240}
                  placeholder="Leave on the doorstep, ring once on arrival, etc."
                  className="gp-focus mt-1 w-full resize-y rounded-2xl bg-gp-surface px-3 py-3 text-sm font-medium ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
                />
              </label>
            </div>

            {delivery && addresses.length > 0 ? (
              <AddressPicker
                addresses={addresses}
                selectedId={form.selectedAddressId}
                error={errors.selectedAddressId}
                onSelect={(id) => patchForm({ selectedAddressId: id })}
              />
            ) : delivery ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Add a delivery address in{' '}
                <Link to="/account" className="font-semibold underline">
                  Account
                </Link>{' '}
                to continue with delivery.
              </p>
            ) : null}

            <div className="mt-5 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Portions</div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="gp-focus grid h-10 w-10 place-items-center rounded-xl bg-gp-surface text-lg font-bold ring-1 ring-black/10 disabled:opacity-40"
                  aria-label="Decrease portions"
                >
                  −
                </button>
                <span className="min-w-[3rem] text-center font-display text-xl font-semibold tabular-nums">
                  {Math.min(quantity, maxQty)}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxQty}
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="gp-focus grid h-10 w-10 place-items-center rounded-xl bg-gp-surface text-lg font-bold ring-1 ring-black/10 disabled:opacity-40"
                  aria-label="Increase portions"
                >
                  +
                </button>
                <span className="text-xs text-gp-charcoal/55">{maxQty} available</span>
              </div>
            </div>

            {plate?.deliveryAvailable ? (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-gp-secondary/[0.06] p-4 ring-1 ring-gp-secondary/15">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="mt-0.5 text-gp-secondary" />
                  <div>
                    <div className="text-sm font-semibold text-gp-charcoal">
                      Get it delivered (+{formatMoney(plate.deliveryFeeCents ?? 0, settings.currency, settings.locale)})
                    </div>
                    <p className="mt-1 text-xs text-gp-charcoal/65">
                      The cook coordinates handoff. ETA matches the pickup window.
                      {plate.deliveryRadiusMiles
                        ? ` Within ~${plate.deliveryRadiusMiles} mi of listing.`
                        : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDelivery((v) => !v)}
                  className={`gp-focus relative h-7 w-12 shrink-0 rounded-full p-1 transition ${
                    delivery ? 'bg-gp-secondary' : 'bg-black/15'
                  }`}
                  aria-checked={delivery}
                  role="switch"
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-natural transition ${
                      delivery ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Tip your cook</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {TIP_PERCENTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setTipPercent(p)
                      setCustomTip('')
                    }}
                    className={`gp-focus rounded-2xl px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                      !customTip && tipPercent === p
                        ? 'bg-gp-primary text-white ring-gp-primary/60'
                        : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                    }`}
                  >
                    {p === 0 ? 'No tip' : `${p}%`}
                  </button>
                ))}
                <div className="flex items-center gap-1 rounded-2xl bg-gp-surface px-2 py-1.5 ring-1 ring-black/10">
                  <span className="text-xs font-semibold text-gp-charcoal/60">Custom $</span>
                  <input
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    inputMode="decimal"
                    placeholder="0.00"
                    className="gp-focus w-16 bg-transparent text-xs font-semibold text-gp-charcoal placeholder:text-gp-charcoal/40"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <PaymentForm form={form} errors={errors} savedMethods={savedMethods} onChange={patchForm} />
            </div>

            <div className="mt-5 space-y-3">
              <KitchenDisclaimer compact />
              <CancellationPolicyCard compact />
            </div>

            {enableOrderTexts && plate ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gp-primary/35 bg-gp-primary/[0.06] p-4 ring-1 ring-gp-primary/10">
                <div className="text-xs font-semibold uppercase tracking-wide text-gp-primary/90">Order text preview</div>
                <p className="mt-2 font-mono text-xs leading-relaxed text-gp-charcoal/80">
                  GoPlate: Pickup for <span className="font-semibold">{plate.name}</span> ({plate.pickupWindow}). Reply
                  HELP for options.
                  {user.phoneVerified ? ` Sent to ${form.phone || user.phone}.` : ' Verify phone in Account to enable.'}
                </p>
              </div>
            ) : null}

            {confirmError ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                {confirmError}
              </p>
            ) : null}

            <div className="sticky bottom-24 z-10 mt-6 flex flex-wrap gap-3 border-t border-black/5 bg-gp-surface/95 pt-4 md:static md:border-0 md:bg-transparent md:pt-0">
              <Button variant="ghost" onClick={onBackToMarket} disabled={confirming}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={confirming || !plate}
                leftIcon={confirming ? undefined : <Check size={18} />}
              >
                {confirming ? 'Processing…' : 'Confirm reservation'}
              </Button>
            </div>
            {confirming ? <LoadingSpinner label="Securing your reservation…" /> : null}
          </div>
        </div>

        <div>
          <div className="rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
            <div className="font-display text-lg font-semibold">Order summary</div>
            {plate && computed ? (
              <>
                <div className="mt-4 flex gap-3">
                  <img
                    src={plate.images[0]}
                    alt={plate.name}
                    className="h-16 w-20 rounded-2xl object-cover ring-1 ring-black/5"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{plate.name}</div>
                    <p className="mt-1 text-xs text-gp-charcoal/65">{plate.pickupWindow}</p>
                    <p className="mt-1 text-xs text-gp-charcoal/65">
                      Cook: <span className="font-semibold">{plate.cook.name}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <Row
                    label={computed.qty > 1 ? `Plate × ${computed.qty}` : 'Plate'}
                    value={formatMoney(computed.subtotal, settings.currency, settings.locale)}
                  />
                  {computed.deliveryCents > 0 ? (
                    <Row
                      label="Delivery"
                      value={formatMoney(computed.deliveryCents, settings.currency, settings.locale)}
                    />
                  ) : null}
                  {computed.tipCents > 0 ? (
                    <Row label="Tip" value={formatMoney(computed.tipCents, settings.currency, settings.locale)} />
                  ) : null}
                  <Row label="Service" value={formatMoney(0, settings.currency, settings.locale)} />
                  <div className="my-2 h-px bg-black/5" />
                  <Row label="Total" value={formatMoney(computed.total, settings.currency, settings.locale)} strong />
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-gp-charcoal/65">
                No plate selected. Go back to the marketplace and reserve something.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddressPicker({
  addresses,
  selectedId,
  error,
  onSelect,
}: {
  addresses: SavedAddress[]
  selectedId: string | null
  error?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-gp-charcoal/60">Delivery address</div>
      <div className="mt-2 grid gap-2">
        {addresses.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`gp-focus rounded-2xl px-4 py-3 text-left text-sm ring-1 transition ${
              selectedId === a.id
                ? 'bg-gp-primary/10 ring-gp-primary/40'
                : 'bg-gp-surface ring-black/10 hover:bg-black/5'
            }`}
          >
            <div className="font-semibold">{a.label}</div>
            <div className="mt-0.5 text-xs text-gp-charcoal/65">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.zip}
            </div>
          </button>
        ))}
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

function CheckoutField({
  label,
  value,
  error,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'tel' | 'text'
  autoComplete?: string
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gp-charcoal/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold text-gp-charcoal ring-1 ${
          error ? 'ring-red-400/60' : 'ring-black/5'
        } placeholder:text-gp-charcoal/40`}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </label>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'font-semibold' : ''}`}>
      <div className="text-gp-charcoal/70">{label}</div>
      <div className="text-gp-charcoal">{value}</div>
    </div>
  )
}
