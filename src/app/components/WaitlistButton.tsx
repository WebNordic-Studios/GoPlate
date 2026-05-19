import { Bell, BellOff } from 'lucide-react'
import { Button } from '../../ui/Button'

export function WaitlistButton({
  joined,
  onJoin,
  onLeave,
  requiresLogin,
  onLogin,
}: {
  joined: boolean
  onJoin: () => void
  onLeave: () => void
  requiresLogin?: boolean
  onLogin?: () => void
}) {
  if (requiresLogin) {
    return (
      <Button variant="secondary" onClick={onLogin} leftIcon={<Bell size={16} />}>
        Sign in to get notified
      </Button>
    )
  }

  if (joined) {
    return (
      <Button variant="ghost" onClick={onLeave} leftIcon={<BellOff size={16} />}>
        On waitlist — tap to leave
      </Button>
    )
  }

  return (
    <Button variant="secondary" onClick={onJoin} leftIcon={<Bell size={16} />}>
      Notify me when available
    </Button>
  )
}
