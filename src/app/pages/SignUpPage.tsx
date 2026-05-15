import { Lock, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../ui/Button'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'

export function SignUpPage({
  onSignUp,
  onSocial,
}: {
  onSignUp: (input: {
    email: string
    password: string
    displayName: string
  }) => { ok: boolean; error?: string }
  onSocial?: (provider: 'google' | 'apple') => boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const result = onSignUp({ email, password, displayName })
    if (!result.ok) setError(result.error ?? 'Could not create account.')
  }

  return (
    <div className="gp-container pb-28 pt-10 md:pb-10">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-gp-surface/80 p-6 shadow-natural ring-1 ring-black/5">
        <div className="flex flex-col items-center text-center">
          <div className="flex min-h-[11rem] items-center justify-center py-2 sm:min-h-[11.75rem]">
            <GoPlateLogoMark
              decorative
              size="2xl"
              className="drop-shadow-[0_2px_8px_rgb(0_0_0_/0.08)]"
            />
          </div>
          <div className="mt-4 font-display text-2xl font-semibold">Create your account</div>
          <div className="mt-1 max-w-md text-sm text-gp-charcoal/65">
            Join GoPlate to follow cooks, reserve dishes, and list your own plates.
          </div>
        </div>

        {onSocial ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button variant="ghost" onClick={() => onSocial('google')} className="!justify-center ring-1 ring-black/10">
              Continue with Google
            </Button>
            <Button variant="ghost" onClick={() => onSocial('apple')} className="!justify-center ring-1 ring-black/10">
              Continue with Apple
            </Button>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-wide text-gp-charcoal/45">
          <div className="h-px flex-1 bg-black/10" />
          or
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
              <UserRound size={14} /> Display name
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex C."
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>

          <label className="block">
            <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
              <Mail size={14} /> Email
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <Lock size={14} /> Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
            <label className="block">
              <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                <Lock size={14} /> Confirm password
              </div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl bg-gp-primary/10 p-3 text-sm font-semibold text-gp-primary">{error}</div>
          ) : null}

          <Button variant="primary" onClick={submit}>
            Create account
          </Button>

          <div className="text-center text-sm text-gp-charcoal/65">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gp-secondary underline decoration-gp-secondary/30">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
