import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../ui/Button'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'
import { Modal } from '../../ui/Modal'

export function LoginPage({
  onLogin,
  onSocial,
  onResetPassword,
}: {
  onLogin: (email: string, password: string) => boolean
  onSocial?: (provider: 'google' | 'apple') => boolean
  onResetPassword?: (email: string, newPassword: string) => { ok: boolean; error?: string }
}) {
  const [email, setEmail] = useState('demo@goplate.app')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPwd, setResetPwd] = useState('')
  const [resetMsg, setResetMsg] = useState<string | null>(null)
  const [resetOk, setResetOk] = useState<string | null>(null)

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
          <div className="mt-4 font-display text-2xl font-semibold">Log in</div>
          <div className="mt-1 max-w-md text-sm text-gp-charcoal/65">
            Prototype auth (local-only). Any non-empty email/password works.
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
              <Mail size={14} /> Email
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>

          <label className="block">
            <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
              <Lock size={14} /> Password
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>

          {error ? <div className="rounded-2xl bg-gp-primary/10 p-3 text-sm font-semibold text-gp-primary">{error}</div> : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="primary"
              onClick={() => {
                const ok = onLogin(email, password)
                setError(ok ? null : 'Please enter a valid email + password.')
              }}
            >
              Log in
            </Button>
            <Button variant="ghost" onClick={() => {
              setEmail('demo@goplate.app')
              setPassword('password')
              setError(null)
            }}>
              Use demo
            </Button>
            {onResetPassword ? (
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="gp-focus ml-auto rounded-xl px-2 py-1 text-sm font-semibold text-gp-secondary underline decoration-gp-secondary/30"
              >
                Forgot password?
              </button>
            ) : null}
          </div>

          <div className="text-center text-sm text-gp-charcoal/65">
            New to GoPlate?{' '}
            <Link to="/signup" className="font-semibold text-gp-secondary underline decoration-gp-secondary/30">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <Modal open={showReset} title="Reset password" onClose={() => setShowReset(false)}>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm text-gp-charcoal/70">
            Enter the email tied to your GoPlate account and a new password. In this prototype the
            change is applied locally.
          </p>
          <label className="block">
            <div className="text-xs font-semibold text-gp-charcoal/60">Email</div>
            <input
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-gp-charcoal/60">New password</div>
            <input
              type="password"
              value={resetPwd}
              onChange={(e) => setResetPwd(e.target.value)}
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>
          {resetMsg ? (
            <div className="rounded-2xl bg-gp-primary/10 p-3 text-sm font-semibold text-gp-primary">{resetMsg}</div>
          ) : null}
          {resetOk ? (
            <div className="rounded-2xl bg-gp-secondary/10 p-3 text-sm font-semibold text-gp-secondary">{resetOk}</div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowReset(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!onResetPassword) return
                const result = onResetPassword(resetEmail, resetPwd)
                if (result.ok) {
                  setResetMsg(null)
                  setResetOk('Password updated. You can log in now.')
                } else {
                  setResetOk(null)
                  setResetMsg(result.error ?? 'Could not update password.')
                }
              }}
            >
              Update password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
