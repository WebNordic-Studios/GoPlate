import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Plate } from '../../types'
import { formatMoney } from '../../lib/format'
import { Button } from '../../ui/Button'

export function PlateCard({
  plate,
  onOpen,
  onReserve,
  onOpenCook,
}: {
  plate: Plate
  onOpen: () => void
  onReserve: () => void
  onOpenCook?: () => void
}) {
  const soldOut = plate.portionsAvailable <= 0

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-natural ring-1 ring-black/5"
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
            className="h-48 w-full object-cover sm:h-52"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 rounded-2xl bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {plate.distanceMiles.toFixed(1)} miles away
          </div>
          {soldOut ? (
            <div className="absolute right-3 top-3 rounded-2xl bg-white/85 px-3 py-1 text-xs font-semibold text-gp-charcoal shadow-natural">
              Sold out
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-semibold">{plate.name}</div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gp-charcoal/70">
                <img
                  src={plate.cook.avatarUrl}
                  alt={plate.cook.name}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenCook?.()
                  }}
                  className="gp-focus -ml-1 truncate rounded-xl px-2 py-1 text-left font-semibold text-gp-charcoal/80 hover:bg-black/5"
                  aria-label={`View ${plate.cook.name} profile`}
                >
                  {plate.cook.name}
                </button>
                <div className="flex items-center gap-1 text-gp-charcoal/70">
                  <Star size={14} className="text-gp-primary" fill="currentColor" />
                  <span className="font-semibold">{plate.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-semibold text-gp-charcoal/60">From</div>
              <div className="font-display text-lg font-semibold">{formatMoney(plate.priceCents)}</div>
            </div>
          </div>

          <div className="mt-3 text-sm font-semibold text-gp-secondary">{plate.pickupWindow}</div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-gp-charcoal/60">
              {soldOut ? 'No portions left' : `${plate.portionsAvailable} portions left`}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="primary"
                disabled={soldOut}
                onClick={onReserve}
                className="px-4 py-2"
              >
                Reserve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

