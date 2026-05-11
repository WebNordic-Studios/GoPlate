import { useState } from 'react'
import { Bell, BellOff, CreditCard, MapPin, Phone, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import type { SavedAddress, SavedPaymentMethod, User } from '../../types'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { useToast } from '../../ui/Toast'
import { useSettings } from '../../state/settings'

export function AccountPage({
  user,
  onAddAddress,
  onRemoveAddress,
  onAddCard,
  onRemoveCard,
  onVerifyPhone,
}: {
  user: User
  onAddAddress: (a: Omit<SavedAddress, 'id'>) => void
  onRemoveAddress: (id: string) => void
  onAddCard: (c: Omit<SavedPaymentMethod, 'id'>) => void
  onRemoveCard: (id: string) => void
  onVerifyPhone: (phone: string) => void
}) {
  const toast = useToast()
  const { settings, set: setSetting } = useSettings()

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="font-display text-2xl font-semibold tracking-tight">Account</div>
      <p className="mt-1 text-sm text-gp-charcoal/65">
        Phone verification, saved addresses, saved payment methods, and notification preferences.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <PhoneVerificationCard user={user} onVerify={(p) => {
          onVerifyPhone(p)
          toast.push({ kind: 'success', title: 'Phone verified', description: p })
        }} />

        <NotificationsCard
          email={settings.emailNotifications}
          sms={settings.smsNotifications}
          push={settings.pushNotifications}
          onChange={(k, v) => setSetting(k, v)}
        />

        <AddressesCard
          addresses={user.savedAddresses ?? []}
          onAdd={(a) => {
            onAddAddress(a)
            toast.push({ kind: 'success', title: 'Address saved' })
          }}
          onRemove={(id) => {
            onRemoveAddress(id)
            toast.push({ kind: 'info', title: 'Address removed' })
          }}
        />

        <PaymentMethodsCard
          methods={user.savedPaymentMethods ?? []}
          onAdd={(m) => {
            onAddCard(m)
            toast.push({ kind: 'success', title: 'Card saved' })
          }}
          onRemove={(id) => {
            onRemoveCard(id)
            toast.push({ kind: 'info', title: 'Card removed' })
          }}
        />
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gp-primary/10 text-gp-primary">{icon}</div>
        <div className="font-display text-lg font-semibold">{title}</div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function PhoneVerificationCard({ user, onVerify }: { user: User; onVerify: (p: string) => void }) {
  const [phone, setPhone] = useState(user.phone ?? '')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const verified = user.phoneVerified

  function sendCode() {
    if (phone.trim().length < 7) {
      setError('Enter a valid phone number.')
      return
    }
    setError(null)
    setSent(true)
  }

  function confirm() {
    if (code.trim().length < 4) {
      setError('Enter the 4-digit code (any digits in the prototype).')
      return
    }
    setError(null)
    onVerify(phone)
    setSent(false)
    setCode('')
  }

  return (
    <Card title="Phone verification" icon={<Phone size={18} />}>
      {verified ? (
        <div className="rounded-2xl bg-gp-secondary/10 p-4 ring-1 ring-gp-secondary/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-gp-secondary">
            <ShieldCheck size={16} /> Verified · {user.phone}
          </div>
          <p className="mt-1 text-xs text-gp-charcoal/70">
            Buyers can confirm a real number reached the cook (and vice versa) at handoff.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <div className="text-xs font-semibold text-gp-charcoal/60">Phone number</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
            />
          </label>
          {sent ? (
            <label className="block">
              <div className="text-xs font-semibold text-gp-charcoal/60">Enter the 4-digit code (any digits work)</div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="1234"
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
          ) : null}
          {error ? <div className="rounded-2xl bg-gp-primary/10 p-3 text-xs font-semibold text-gp-primary">{error}</div> : null}
          {sent ? (
            <div className="flex gap-2">
              <Button variant="primary" onClick={confirm}>Confirm</Button>
              <Button variant="ghost" onClick={() => setSent(false)}>Resend</Button>
            </div>
          ) : (
            <Button variant="primary" onClick={sendCode}>Send code</Button>
          )}
        </div>
      )}
    </Card>
  )
}

function NotificationsCard({
  email,
  sms,
  push,
  onChange,
}: {
  email: boolean
  sms: boolean
  push: boolean
  onChange: (key: 'emailNotifications' | 'smsNotifications' | 'pushNotifications', value: boolean) => void
}) {
  return (
    <Card title="Notifications" icon={email || sms || push ? <Bell size={18} /> : <BellOff size={18} />}>
      <div className="space-y-3">
        <Toggle
          label="Email notifications"
          description="Order updates, weekly highlights, follower digests."
          checked={email}
          onChange={(v) => onChange('emailNotifications', v)}
        />
        <Toggle
          label="SMS notifications"
          description="Pickup reminders and short status pings."
          checked={sms}
          onChange={(v) => onChange('smsNotifications', v)}
        />
        <Toggle
          label="Push notifications"
          description="Live order timeline (Reserved → Ready → Picked up)."
          checked={push}
          onChange={(v) => onChange('pushNotifications', v)}
        />
      </div>
    </Card>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-0.5 text-xs text-gp-charcoal/65">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`gp-focus relative h-7 w-12 shrink-0 rounded-full p-1 transition ${
          checked ? 'bg-gp-secondary' : 'bg-black/15'
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span className={`block h-5 w-5 rounded-full bg-white shadow-natural transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function AddressesCard({
  addresses,
  onAdd,
  onRemove,
}: {
  addresses: SavedAddress[]
  onAdd: (a: Omit<SavedAddress, 'id'>) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('Home')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  function submit() {
    if (!line1.trim() || !city.trim() || !zip.trim()) return
    onAdd({ label: label.trim() || 'Address', line1: line1.trim(), line2: line2.trim() || undefined, city: city.trim(), state: state.trim(), zip: zip.trim() })
    setOpen(false)
    setLine1(''); setLine2(''); setCity(''); setState(''); setZip('')
  }

  return (
    <Card title="Saved addresses" icon={<MapPin size={18} />}>
      {addresses.length === 0 && !open ? (
        <EmptyState
          icon={<MapPin size={18} />}
          title="No addresses saved"
          description="Add a delivery address so checkout can pre-fill it later."
          action={<Button variant="secondary" onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>Add address</Button>}
        />
      ) : (
        <ul className="space-y-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{a.label}</div>
                <div className="text-xs text-gp-charcoal/70">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ''} · {a.city}, {a.state} {a.zip}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                className="gp-focus rounded-xl p-1.5 text-gp-charcoal/60 hover:bg-black/5 hover:text-gp-primary"
                aria-label="Remove address"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="mt-4 space-y-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (Home, Work)"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street address"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
          <input
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="Apt / unit (optional)"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="gp-focus col-span-2 rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
            />
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="gp-focus rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
            />
          </div>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="ZIP"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Save address</Button>
          </div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="mt-3">
          <Button variant="ghost" onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>
            Add another
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

function PaymentMethodsCard({
  methods,
  onAdd,
  onRemove,
}: {
  methods: SavedPaymentMethod[]
  onAdd: (m: Omit<SavedPaymentMethod, 'id'>) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('Personal card')
  const [brand, setBrand] = useState<SavedPaymentMethod['brand']>('Visa')
  const [last4, setLast4] = useState('')
  const [expiry, setExpiry] = useState('')

  function submit() {
    if (last4.length !== 4) return
    onAdd({ label: label.trim() || 'Card', brand, last4, expiry })
    setOpen(false)
    setLast4(''); setExpiry('')
  }

  return (
    <Card title="Payment methods" icon={<CreditCard size={18} />}>
      {methods.length === 0 && !open ? (
        <EmptyState
          icon={<CreditCard size={18} />}
          title="No saved cards"
          description="Add a card to speed up checkout. In this prototype only the last 4 are stored."
          action={<Button variant="secondary" onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>Add card</Button>}
        />
      ) : (
        <ul className="space-y-2">
          {methods.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-12 place-items-center rounded-lg bg-gp-secondary/15 text-[10px] font-bold uppercase tracking-wider text-gp-secondary">
                  {m.brand}
                </div>
                <div>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-gp-charcoal/70">•••• {m.last4} · exp {m.expiry || '—'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="gp-focus rounded-xl p-1.5 text-gp-charcoal/60 hover:bg-black/5 hover:text-gp-primary"
                aria-label="Remove card"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="mt-4 space-y-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as SavedPaymentMethod['brand'])}
              className="gp-focus rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
            >
              {(['Visa', 'Mastercard', 'Amex', 'Discover', 'Other'] as const).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Last 4"
              inputMode="numeric"
              className="gp-focus rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
            />
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="gp-focus rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold ring-1 ring-black/5"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>Save card</Button>
          </div>
        </div>
      ) : methods.length > 0 ? (
        <div className="mt-3">
          <Button variant="ghost" onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>
            Add another
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
