import { Check, ShieldCheck, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { Button } from '../../ui/Button'
import { useSettings } from '../../state/settings'

const TIP_PERCENTS = [0, 10, 15, 20] as const

export function CheckoutPage({
  plate,
  enableOrderTexts,
  confirmBeforeReserve,
  onConfirm,
  onBackToMarket,
}: {
  plate: Plate | null
  enableOrderTexts: boolean
  confirmBeforeReserve: boolean
  onConfirm: (opts: { delivery: boolean; contactlessInstructions?: string; tipCents: number }) => void
  onBackToMarket: () => void
}) {
  const { settings } = useSettings()
  const [delivery, setDelivery] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [tipPercent, setTipPercent] = useState<number>(15)
  const [customTip, setCustomTip] = useState('')

  const computed = useMemo(() => {
    if (!plate) return null
    const subtotal = plate.priceCents
    const deliveryCents = delivery && plate.deliveryAvailable ? plate.deliveryFeeCents ?? 0 : 0
    const customCents = customTip ? Math.round(Number(customTip) * 100) : 0
    const tipCents = customCents > 0 ? customCents : Math.round(subtotal * (tipPercent / 100))
    return { subtotal, deliveryCents, tipCents, total: subtotal + deliveryCents + tipCents }
  }, [plate, delivery, customTip, tipPercent])

  function handleConfirm() {
    if (confirmBeforeReserve && !window.confirm('Confirm this pickup reservation? You can still cancel from Orders.')) {
      return
    }
    onConfirm({
      delivery,
      contactlessInstructions: instructions.trim() || undefined,
      tipCents: computed?.tipCents ?? 0,
    })
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Checkout</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            Reserve your pickup window. Address details are shared after confirmation.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gp-charcoal/70">
              <ShieldCheck size={18} className="text-gp-secondary" />
              Secure pickup note + privacy-first location
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Name" placeholder="Filip" />
              <Field label="Phone" placeholder="(555) 123-4567" />
              <label className="block sm:col-span-2">
                <div className="text-xs font-semibold text-gp-charcoal/60">Pickup / contactless instructions</div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  maxLength={240}
                  placeholder="Leave on the doorstep, ring once on arrival, etc."
                  className="gp-focus mt-1 w-full resize-y rounded-2xl bg-gp-surface px-3 py-3 text-sm font-medium ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
                />
              </label>
            </div>

            {plate?.deliveryAvailable ? (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-gp-secondary/[0.06] p-4 ring-1 ring-gp-secondary/15">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="mt-0.5 text-gp-secondary" />
                  <div>
                    <div className="text-sm font-semibold text-gp-charcoal">
                      Get it delivered (+{formatMoney(plate.deliveryFeeCents ?? 0, settings.currency, settings.locale)})
                    </div>
                    <div className="mt-1 text-xs text-gp-charcoal/65">
                      The cook will hand off to a courier on your behalf. ETA matches the pickup window.
                    </div>
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

            <div className="mt-5 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Simulated payment</div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Card number" placeholder="4242 4242 4242 4242" />
                <Field label="Expiry" placeholder="12/34" />
              </div>
            </div>

            {enableOrderTexts && plate ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gp-primary/35 bg-gp-primary/[0.06] p-4 ring-1 ring-gp-primary/10">
                <div className="text-xs font-semibold uppercase tracking-wide text-gp-primary/90">Simulated SMS</div>
                <p className="mt-2 font-mono text-xs leading-relaxed text-gp-charcoal/80">
                  GoPlate: Your pickup for <span className="font-semibold">{plate.name}</span> is coming up (
                  {plate.pickupWindow}). Reply HELP for options. — Not sent in this prototype; controlled in Settings.
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="ghost" onClick={onBackToMarket}>
                Back
              </Button>
              <Button variant="primary" onClick={handleConfirm} leftIcon={<Check size={18} />}>
                Confirm reservation
              </Button>
            </div>
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
                    <div className="mt-1 text-xs text-gp-charcoal/65">{plate.pickupWindow}</div>
                    <div className="mt-1 text-xs text-gp-charcoal/65">
                      Cook: <span className="font-semibold">{plate.cook.name}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <Row label="Plate" value={formatMoney(computed.subtotal, settings.currency, settings.locale)} />
                  {computed.deliveryCents > 0 ? (
                    <Row label="Delivery" value={formatMoney(computed.deliveryCents, settings.currency, settings.locale)} />
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
              <div className="mt-3 text-sm text-gp-charcoal/65">
                No plate selected yet. Go back to the marketplace and reserve something.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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

function Field({
  label,
  placeholder,
  className = '',
}: {
  label: string
  placeholder: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-semibold text-gp-charcoal/60">{label}</div>
      <input
        className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold text-gp-charcoal ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
        placeholder={placeholder}
      />
    </label>
  )
}
