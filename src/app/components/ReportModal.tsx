import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

const REASONS = [
  'Suspected food-safety issue',
  'Misleading photo or description',
  'Allergens not disclosed',
  'Inappropriate content',
  'Spam or scam',
  'Other',
]

export function ReportModal({
  open,
  target,
  onClose,
  onSubmit,
  onBlock,
}: {
  open: boolean
  target: { kind: 'plate' | 'cook'; label: string }
  onClose: () => void
  onSubmit: (input: { reason: string; details?: string }) => void
  onBlock?: () => void
}) {
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  return (
    <Modal open={open} title="Report" onClose={onClose}>
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start gap-3 rounded-2xl bg-gp-primary/5 p-3 ring-1 ring-gp-primary/10">
          <Flag size={18} className="mt-0.5 text-gp-primary" />
          <div className="text-sm text-gp-charcoal/80">
            You're reporting <span className="font-semibold">{target.label}</span>. Our prototype stores
            reports locally so you can see how triage would feel.
          </div>
        </div>

        <label className="block">
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Reason</div>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Details (optional)</div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Give a short description so we can investigate."
            className="gp-focus mt-1 w-full resize-y rounded-2xl bg-gp-surface px-3 py-3 text-sm font-medium ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {target.kind === 'cook' && onBlock ? (
            <Button variant="ghost" onClick={onBlock}>
              Block this cook
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => onSubmit({ reason, details: details.trim() || undefined })}>
              Submit report
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
