import { Mail, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../../types'
import { Button } from '../../ui/Button'

export function VerifyEmailPage({
  user,
  onVerify,
}: {
  user: User
  onVerify: () => void
}) {
  const verified = Boolean(user.emailVerified)

  return (
    <div className="gp-container max-w-lg pb-28 pt-10 md:pb-12">
      <div className="rounded-[2rem] bg-gp-surface/80 p-6 text-center shadow-natural ring-1 ring-black/5">
        {verified ? (
          <>
            <ShieldCheck size={40} className="mx-auto text-gp-secondary" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-gp-charcoal/65">{user.email} is confirmed on this device.</p>
            <Link to="/market" className="gp-focus mt-6 inline-block">
              <Button variant="primary">Continue browsing</Button>
            </Link>
          </>
        ) : (
          <>
            <Mail size={40} className="mx-auto text-gp-primary" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Verify your email</h1>
            <p className="mt-2 text-sm text-gp-charcoal/65">
              We sent a link to <span className="font-semibold">{user.email}</span>. In this prototype, tap below to
              simulate verification.
            </p>
            <Button variant="primary" className="mt-6 w-full" onClick={onVerify}>
              I verified my email
            </Button>
            <p className="mt-4 text-xs text-gp-charcoal/50">Required before publishing your first cook listing.</p>
          </>
        )}
      </div>
    </div>
  )
}
