import { BadgeCheck, Clock, XCircle } from 'lucide-react'
import type { User } from '../types'

export type CookVerificationDisplay = 'none' | 'pending' | 'verified' | 'rejected'

export function resolveCookVerification(
  cookId: string,
  cookVerifiedOnPlate: boolean | undefined,
  currentUserId: string | undefined,
  userVerification: User['cookVerification'] | undefined,
): CookVerificationDisplay {
  if (currentUserId && cookId === currentUserId && userVerification && userVerification !== 'none') {
    return userVerification === 'rejected' ? 'rejected' : userVerification
  }
  if (cookVerifiedOnPlate) return 'verified'
  return 'none'
}

export function CookVerificationBadge({ status, size = 'sm' }: { status: CookVerificationDisplay; size?: 'xs' | 'sm' }) {
  if (status === 'none') return null
  const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  if (status === 'rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-100 font-semibold text-red-800 ring-1 ring-red-200 ${sz}`}
        title="Verification was not approved"
      >
        <XCircle size={12} aria-hidden />
        Not verified
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-100 font-semibold text-amber-800 ring-1 ring-amber-200 ${sz}`}
        title="Verification under review"
      >
        <Clock size={12} aria-hidden />
        Verification pending
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gp-secondary/10 font-semibold text-gp-secondary ring-1 ring-gp-secondary/20 ${sz}`}
      title="Food-handler verified cook"
    >
      <BadgeCheck size={12} aria-hidden />
      Verified cook
    </span>
  )
}
