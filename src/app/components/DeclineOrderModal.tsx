import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

const REASONS = [
  'Cannot fulfill allergens / dietary needs',
  'Sold out / prep issue',
  'Schedule conflict',
  'Other',
] as const

export function DeclineOrderModal({
  open,
  plateName,
  onClose,
  onConfirm,
}: {
  open: boolean
  plateName: string
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState<string>(REASONS[0])
  const [details, setDetails] = useState('')

  function submit() {
    const text = reason === 'Other' ? details.trim() || reason : `${reason}${details.trim() ? ` — ${details.trim()}` : ''}`
    onConfirm(text)
    setDetails('')
    onClose()
  }

  return (
    <Modal open={open} title="Decline reservation" onClose={onClose} sheetOnMobile>
      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-sm text-gp-charcoal/70">
          Decline <span className="font-semibold text-gp-charcoal">{plateName}</span>? The buyer will be notified and
          portions return to your listing.
        </p>
        <div className="grid gap-2">
          {REASONS.map((r) => (
            <label
              key={r}
              className={`gp-focus flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition ${
                reason === r ? 'bg-gp-primary/10 ring-gp-primary/40' : 'bg-gp-surface ring-black/10'
              }`}
            >
              <input
                type="radio"
                name="decline-reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-gp-primary"
              />
              <span className="text-sm font-semibold text-gp-charcoal">{r}</span>
            </label>
          ))}
        </div>
        {reason === 'Other' ? (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Brief explanation for the buyer…"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm ring-1 ring-black/5"
          />
        ) : (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            placeholder="Optional note to the buyer…"
            className="gp-focus w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm ring-1 ring-black/5"
          />
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}>
            Keep order
          </Button>
          <Button variant="primary" onClick={submit}>
            Decline order
          </Button>
        </div>
      </div>
    </Modal>
  )
}
