import { BadgeCheck, Clock, Flame, MapPin, Sparkles, Star } from 'lucide-react'
import { isJustListed, isPickupSoon } from '../../lib/plateFilters'
import { WaitlistButton } from './WaitlistButton'
import { motion, useReducedMotion } from 'framer-motion'
import type { Plate } from '../../types'
import { formatDistanceBadge, formatMoney } from '../../lib/format'
import { useSettings } from '../../state/settings'
import { useReviewsContext } from '../../state/reviewsContext'
import { Button } from '../../ui/Button'
import { DietaryBadge } from '../../ui/Badges'

export function PlateCard({
  plate,
  onOpen,
  onReserve,
  onOpenCook,
  waitlistJoined,
  onJoinWaitlist,
  onLeaveWaitlist,
  waitlistRequiresLogin,
  onWaitlistLogin,
}: {
  plate: Plate
  onOpen: () => void
  onReserve: () => void
  onOpenCook?: () => void
  waitlistJoined?: boolean
  onJoinWaitlist?: () => void
  onLeaveWaitlist?: () => void
  waitlistRequiresLogin?: boolean
  onWaitlistLogin?: () => void
}) {
  const { settings } = useSettings()
  const { plateStats } = useReviewsContext()
  const displayRating = plateStats(plate)
  const systemReduce = useReducedMotion() === true
  const reduceMotion = settings.reduceMotion || systemReduce

  const soldOut = plate.portionsAvailable <= 0
  const almostSoldOut = !soldOut && plate.portionsAvailable > 0 && plate.portionsAvailable <= 2
  const justListed = isJustListed(plate)
  const pickupSoon = isPickupSoon(plate)
  const compact = settings.compactDensity
  const imgH = compact ? 'h-40 sm:h-44' : 'h-48 sm:h-52'
  const pad = compact ? 'p-3' : 'p-4'
  const titleCls = compact ? 'font-display text-base font-semibold' : 'font-display text-lg font-semibold'
  const priceCls = compact ? 'font-display text-base font-semibold' : 'font-display text-lg font-semibold'

  const dietaryTags = (plate.dietary ?? []).slice(0, 2)
  const areaLine = [plate.geo.areaLabel, plate.zip].filter(Boolean).join(' · ')

  return (
    <motion.article
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group overflow-hidden rounded-2xl bg-gp-surface shadow-natural ring-1 ring-black/5"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen()
        }}
        className="gp-focus block w-full cursor-pointer text-left"
      >
        <div className="relative">
          <img
            src={plate.images[0]}
            alt={plate.name}
            className={`${imgH} w-full object-cover`}
            loading="lazy"
          />
          <div className="absolute left-3 top-3 rounded-2xl bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {formatDistanceBadge(plate.distanceMiles, settings.distanceUnit)}
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            {soldOut ? (
              <div className="rounded-2xl bg-white/85 px-3 py-1 text-xs font-semibold text-gp-charcoal shadow-natural">
                Sold out
              </div>
            ) : almostSoldOut ? (
              <div className="inline-flex items-center gap-1 rounded-2xl bg-orange-500/95 px-3 py-1 text-xs font-semibold text-white shadow-natural">
                <Flame size={12} aria-hidden /> Almost sold out
              </div>
            ) : null}
            {justListed && !soldOut ? (
              <div className="inline-flex items-center gap-1 rounded-2xl bg-gp-secondary/90 px-3 py-1 text-xs font-semibold text-white shadow-natural">
                <Sparkles size={12} aria-hidden /> Just listed
              </div>
            ) : null}
            {pickupSoon && !soldOut && !justListed ? (
              <div className="inline-flex items-center gap-1 rounded-2xl bg-gp-primary/90 px-3 py-1 text-xs font-semibold text-white shadow-natural">
                <Clock size={12} aria-hidden /> Pickup soon
              </div>
            ) : null}
          </div>
        </div>

        <div className={pad}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={`truncate ${titleCls}`}>{plate.name}</div>
              <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gp-charcoal/70`}>
                {settings.showCookAvatars ? (
                  <img
                    src={plate.cook.avatarUrl}
                    alt=""
                    className={`shrink-0 rounded-xl object-cover ring-2 ring-white ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`grid shrink-0 place-items-center rounded-xl bg-gp-secondary/15 font-display text-xs font-bold text-gp-secondary ring-2 ring-white ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
                    aria-hidden
                  >
                    {plate.cook.name.trim().slice(0, 1).toUpperCase()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenCook?.()
                  }}
                  className="gp-focus inline-flex min-w-0 max-w-full items-center gap-1 truncate rounded-xl px-2 py-1 text-left font-semibold text-gp-charcoal hover:bg-black/5"
                  aria-label={`View ${plate.cook.name} profile`}
                >
                  <span className="truncate">{plate.cook.name}</span>
                  {plate.cook.verified ? (
                    <BadgeCheck size={14} className="shrink-0 text-gp-secondary" aria-label="Verified cook" />
                  ) : null}
                </button>
                <span className="hidden text-gp-charcoal/35 sm:inline" aria-hidden>
                  ·
                </span>
                <div className="flex shrink-0 items-center gap-1 font-medium text-gp-charcoal/75">
                  <Star size={14} className="text-gp-primary" fill="currentColor" aria-hidden />
                  <span>{displayRating.rating.toFixed(1)}</span>
                  {displayRating.count > 0 ? (
                    <span className="text-gp-charcoal/50">({displayRating.count})</span>
                  ) : (
                    <span className="text-xs font-semibold text-gp-charcoal/45">New</span>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-semibold text-gp-charcoal/60">From</div>
              <div className={priceCls}>{formatMoney(plate.priceCents, settings.currency, settings.locale)}</div>
            </div>
          </div>

          {dietaryTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dietaryTags.map((t) => (
                <DietaryBadge key={t} tag={t} size="xs" />
              ))}
              {plate.cuisine ? (
                <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-gp-charcoal/75 ring-1 ring-black/10">
                  {plate.cuisine}
                </span>
              ) : null}
            </div>
          ) : plate.cuisine ? (
            <div className="mt-3">
              <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-gp-charcoal/75 ring-1 ring-black/10">
                {plate.cuisine}
              </span>
            </div>
          ) : null}

          {areaLine ? (
            <div
              className={`flex items-start gap-2 text-xs font-medium leading-snug text-gp-charcoal/65 ${compact ? 'mt-2' : 'mt-2.5'}`}
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-gp-secondary/90" aria-hidden />
              <span className="min-w-0">{areaLine}</span>
            </div>
          ) : null}

          {settings.showPickupWindowsOnCards ? (
            <div
              className={`inline-flex max-w-full items-start gap-2 rounded-xl bg-gp-secondary/[0.07] px-3 py-2 text-xs font-semibold leading-snug text-gp-secondary ring-1 ring-gp-secondary/10 ${compact ? 'mt-2' : 'mt-2.5'}`}
            >
              <Clock size={14} className="mt-0.5 shrink-0 opacity-90" aria-hidden />
              <span className="min-w-0">{plate.pickupWindow}</span>
            </div>
          ) : null}

          <div className={`flex items-center justify-between gap-3 ${compact ? 'mt-3' : 'mt-4'}`}>
            <div className="text-xs font-semibold text-gp-charcoal/60">
              {soldOut ? 'No portions left' : `${plate.portionsAvailable} portions left`}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {soldOut && onJoinWaitlist ? (
                <WaitlistButton
                  joined={Boolean(waitlistJoined)}
                  onJoin={onJoinWaitlist}
                  onLeave={onLeaveWaitlist ?? (() => {})}
                  requiresLogin={waitlistRequiresLogin}
                  onLogin={onWaitlistLogin}
                />
              ) : (
                <Button variant="primary" disabled={soldOut} onClick={onReserve} className={compact ? 'px-3 py-2 text-xs' : 'px-4 py-2'}>
                  Reserve
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
