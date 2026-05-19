import type { ReactNode } from 'react'
import { CreditCard, Lock } from 'lucide-react'
import type { SavedPaymentMethod } from '../types'
import { detectCardBrand, formatCardNumber, type CheckoutFormErrors, type CheckoutFormState } from '../lib/checkoutValidation'

export function PaymentForm({
  form,
  errors,
  savedMethods,
  onChange,
}: {
  form: CheckoutFormState
  errors: CheckoutFormErrors
  savedMethods: SavedPaymentMethod[]
  onChange: (patch: Partial<CheckoutFormState>) => void
}) {
  const hasSaved = savedMethods.length > 0

  return (
    <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
      <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
        <Lock size={14} className="text-gp-secondary" aria-hidden />
        Payment
      </div>
      <p className="mt-1 text-xs text-gp-charcoal/55">
        Prototype checkout — card data is validated locally and never sent to a server.
      </p>

      {hasSaved ? (
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Payment method">
          {savedMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={form.paymentMode === 'saved' && form.selectedPaymentId === m.id}
              onClick={() => onChange({ paymentMode: 'saved', selectedPaymentId: m.id })}
              className={`gp-focus rounded-2xl px-3 py-2 text-left text-xs font-semibold ring-1 transition ${
                form.paymentMode === 'saved' && form.selectedPaymentId === m.id
                  ? 'bg-gp-primary text-white ring-gp-primary/60'
                  : 'bg-gp-surface text-gp-charcoal/80 ring-black/10 hover:bg-black/5'
              }`}
            >
              {m.label} · {m.brand} •••• {m.last4}
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={form.paymentMode === 'new'}
            onClick={() => onChange({ paymentMode: 'new', selectedPaymentId: null })}
            className={`gp-focus rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition ${
              form.paymentMode === 'new'
                ? 'bg-gp-primary text-white ring-gp-primary/60'
                : 'bg-gp-surface text-gp-charcoal/80 ring-black/10 hover:bg-black/5'
            }`}
          >
            New card
          </button>
        </div>
      ) : null}

      {(form.paymentMode === 'new' || !hasSaved) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <PayField
            label="Card number"
            value={form.cardNumber}
            error={errors.cardNumber}
            onChange={(v) => onChange({ cardNumber: formatCardNumber(v), paymentMode: 'new' })}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            autoComplete="cc-number"
            icon={<CreditCard size={16} className="text-gp-charcoal/40" />}
          />
          <PayField
            label="Expiry"
            value={form.cardExpiry}
            error={errors.cardExpiry}
            onChange={(v) => {
              const digits = v.replace(/\D/g, '').slice(0, 4)
              const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
              onChange({ cardExpiry: formatted, paymentMode: 'new' })
            }}
            placeholder="12/34"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
          <PayField
            label="CVC"
            value={form.cardCvc}
            error={errors.cardCvc}
            onChange={(v) => onChange({ cardCvc: v.replace(/\D/g, '').slice(0, 4), paymentMode: 'new' })}
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
          />
          {form.cardNumber.replace(/\s/g, '').length >= 4 ? (
            <div className="flex items-end pb-3 text-xs font-semibold text-gp-charcoal/60">
              {detectCardBrand(form.cardNumber.replace(/\s/g, ''))}
            </div>
          ) : null}
        </div>
      )}

      {errors.payment ? <p className="mt-2 text-xs font-semibold text-red-600">{errors.payment}</p> : null}
    </div>
  )
}

function PayField({
  label,
  value,
  error,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  icon,
  className = '',
}: {
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  placeholder: string
  inputMode?: 'numeric' | 'text'
  autoComplete?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-semibold text-gp-charcoal/60">{label}</div>
      <div className="relative mt-1">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</span> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={`gp-focus w-full rounded-2xl bg-gp-surface py-3 text-sm font-semibold text-gp-charcoal ring-1 ${
            error ? 'ring-red-400/60' : 'ring-black/5'
          } placeholder:text-gp-charcoal/40 ${icon ? 'pl-10 pr-3' : 'px-3'}`}
        />
      </div>
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </label>
  )
}
