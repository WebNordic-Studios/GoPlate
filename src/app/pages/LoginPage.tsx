import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../ui/Button'

export function LoginPage({
  onLogin,
}: {
  onLogin: (email: string, password: string) => boolean
}) {
  const [email, setEmail] = useState('demo@goplate.app')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="gp-container pb-28 pt-10 md:pb-10">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5">
        <div className="font-display text-2xl font-semibold">Log in</div>
        <div className="mt-1 text-sm text-gp-charcoal/65">
          Prototype auth (local-only). Any non-empty email/password works.
        </div>

        <div className="mt-6 grid gap-4">
          <label className="block">
            <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
              <Mail size={14} /> Email
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
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
              className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
            />
          </label>

          {error ? <div className="rounded-2xl bg-gp-primary/10 p-3 text-sm font-semibold text-gp-primary">{error}</div> : null}

          <div className="flex flex-wrap gap-3">
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
          </div>
        </div>
      </div>
    </div>
  )
}

