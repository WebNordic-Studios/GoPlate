import { Link } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'
import { Button } from '../../ui/Button'

export function HelpPage() {
  return (
    <div className="gp-container max-w-2xl pb-28 pt-8 md:pb-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-gp-charcoal">Help & contact</h1>
      <p className="mt-2 text-sm text-gp-charcoal/65">
        Quick answers for buyers and cooks. For urgent pickup issues, use order messages first.
      </p>

      <section className="mt-8 space-y-4">
        <Faq q="Where is my pickup address?" a="Open Orders, tap your reservation, and view Pickup details — the exact line appears after checkout." />
        <Faq q="How do waitlists work?" a="Join the waitlist on a sold-out plate. When portions reopen, you get an in-app notification (and email when enabled)." />
        <Faq q="How do I become a verified cook?" a="Submit verification from Settings. Pending, verified, and rejected states are shown on your profile and dashboard." />
        <Faq
          q="How do payouts work?"
          a="Connect a payout account from Cook → Payouts (prototype). Live payouts will use a payment partner."
        />
      </section>

      <div className="mt-10 rounded-[2rem] bg-gp-surface/80 p-6 shadow-natural ring-1 ring-black/5">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <MessageCircle size={20} className="text-gp-primary" />
          Still stuck?
        </div>
        <p className="mt-2 text-sm text-gp-charcoal/70">
          Email <a href="mailto:support@goplate.app" className="font-semibold text-gp-primary">support@goplate.app</a> with
          your order ID. Abuse reports are reviewed within 48 hours in this prototype.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/orders">
            <Button variant="primary">View orders</Button>
          </Link>
          <a href="mailto:support@goplate.app">
            <Button variant="ghost" leftIcon={<Mail size={16} />}>
              Email support
            </Button>
          </a>
        </div>
      </div>

      <p className="mt-8 text-xs text-gp-charcoal/50">
        <Link to="/terms" className="underline">
          Terms
        </Link>
        {' · '}
        <Link to="/privacy" className="underline">
          Privacy
        </Link>
      </p>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl bg-gp-surface/70 p-4 ring-1 ring-black/5">
      <div className="text-sm font-semibold text-gp-charcoal">{q}</div>
      <p className="mt-1 text-sm text-gp-charcoal/70">{a}</p>
    </div>
  )
}
