import { Check, ShieldCheck } from 'lucide-react'
import type { Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { Button } from '../../ui/Button'

export function CheckoutPage({
  plate,
  onConfirm,
  onBackToMarket,
}: {
  plate: Plate | null
  onConfirm: () => void
  onBackToMarket: () => void
}) {
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
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gp-charcoal/70">
              <ShieldCheck size={18} className="text-gp-secondary" />
              Secure pickup note + privacy-first location
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Name" placeholder="Filip" />
              <Field label="Phone" placeholder="(555) 123-4567" />
              <Field label="Pickup instructions" placeholder="Ring once / text on arrival" className="sm:col-span-2" />
            </div>

            <div className="mt-6 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Simulated payment</div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Card number" placeholder="4242 4242 4242 4242" />
                <Field label="Expiry" placeholder="12/34" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="ghost" onClick={onBackToMarket}>
                Back
              </Button>
              <Button variant="primary" onClick={onConfirm} leftIcon={<Check size={18} />}>
                Confirm reservation
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="font-display text-lg font-semibold">Order summary</div>
            {plate ? (
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
                  <Row label="Plate" value={formatMoney(plate.priceCents)} />
                  <Row label="Service" value="$0.00" />
                  <div className="my-2 h-px bg-black/5" />
                  <Row label="Total" value={formatMoney(plate.priceCents)} strong />
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
        className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-gp-charcoal ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
        placeholder={placeholder}
      />
    </label>
  )
}

