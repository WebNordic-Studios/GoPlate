/** Shared waitlist props spread onto PlateCard instances. */
export function plateCardWaitlistProps(
  plateId: string,
  waitlist?: {
    isJoined: (id: string) => boolean
    onJoin: (id: string) => void
    onLeave: (id: string) => void
    requiresLogin: boolean
    onLogin: () => void
  },
) {
  if (!waitlist) return {}
  return {
    waitlistJoined: waitlist.isJoined(plateId),
    onJoinWaitlist: () => waitlist.onJoin(plateId),
    onLeaveWaitlist: () => waitlist.onLeave(plateId),
    waitlistRequiresLogin: waitlist.requiresLogin,
    onWaitlistLogin: waitlist.onLogin,
  }
}
