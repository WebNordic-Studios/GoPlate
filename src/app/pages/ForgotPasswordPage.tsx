import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../ui/Button'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'

export function ForgotPasswordPage({
  onReset,
}: {
  onReset: (email: string, newPassword: string) => { ok: boolean; error?: string }
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const result = onReset(email, password)
    if (result.ok) setDone(true)
    else setError(result.error ?? 'Could not reset password.')
  }

  return (
    <div className="gp-container pb-28 pt-10 md:pb-10">
      <div className="mx-auto max-w-md rounded-[2rem] bg-gp-surface/80 p-6 shadow-natural ring-1 ring-black/5">
        <div className="flex flex-col items-center text-center">
          <GoPlateLogoMark size="md" decorative />
          <h1 className="mt-4 font-display text-xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-gp-charcoal/65">
            Enter the email on your account and choose a new password (prototype — stored locally).
          </p>
        </div>
        {done ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-gp-secondary">Password updated</p>
            <Link to="/login" className="gp-focus mt-4 inline-block text-sm font-semibold text-gp-primary underline">
              Sign in
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <label className="block text-xs font-semibold text-gp-charcoal/60">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm ring-1 ring-black/5"
              />
            </label>
            <label className="block text-xs font-semibold text-gp-charcoal/60">
              New password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm ring-1 ring-black/5"
              />
            </label>
            <label className="block text-xs font-semibold text-gp-charcoal/60">
              Confirm password
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-2.5 text-sm ring-1 ring-black/5"
              />
            </label>
            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
            <Button variant="primary" className="w-full" onClick={submit}>
              Update password
            </Button>
          </div>
        )}
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-gp-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
