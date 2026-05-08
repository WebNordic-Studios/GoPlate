import { MapPin, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  initialZip?: string
  onSearchZip: (zip: string) => void
}

export function Hero({ initialZip = '', onSearchZip }: Props) {
  const [zip, setZip] = useState(initialZip)
  const [focused, setFocused] = useState(false)

  const zipHint = useMemo(() => (zip.trim() ? zip.trim() : 'Zip Code'), [zip])

  return (
    <section className="relative overflow-hidden">
      <div className="gp-container py-10 sm:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-gp-charcoal sm:text-5xl">
              The kitchen next door is now your favorite restaurant.
            </h1>
            <p className="mt-4 max-w-xl text-base text-gp-charcoal/70 sm:text-lg">
              Discover hyper-local home-cooked meals and small-batch bakery drops. Reserve a pickup window,
              meet your neighborhood chefs, eat better tonight.
            </p>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault()
                onSearchZip(zip.trim())
              }}
            >
              <div className="gp-glass flex items-center gap-2 rounded-2xl p-2">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gp-primary/10 text-gp-primary">
                  <Search size={20} />
                </div>
                <div className="flex-1">
                  <label className="sr-only" htmlFor="zip">
                    Zip Code
                  </label>
                  <input
                    id="zip"
                    inputMode="numeric"
                    placeholder="Enter your Zip Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="gp-focus w-full bg-transparent px-2 py-3 text-sm font-semibold text-gp-charcoal placeholder:text-gp-charcoal/45 sm:text-base"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="gp-focus hidden rounded-2xl bg-gp-primary px-4 py-3 text-sm font-semibold text-white shadow-natural sm:inline-flex"
                >
                  Search
                </motion.button>

                <div
                  className={`mr-2 grid h-10 w-10 place-items-center rounded-2xl transition ${
                    focused ? 'bg-black/5 text-gp-secondary' : 'text-gp-charcoal/50'
                  }`}
                  aria-label="Current location"
                  title={`Use current location for ${zipHint}`}
                >
                  <MapPin size={18} />
                </div>
              </div>
              <div className="mt-2 text-xs text-gp-charcoal/60">
                Tip: Try <span className="font-semibold">10012</span> (Manhattan) or{' '}
                <span className="font-semibold">94110</span> (SF).
              </div>
            </form>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-gp-primary/15 via-white/0 to-gp-secondary/10 blur-2xl" />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-black/5"
            >
              <img
                alt="A beautifully plated home meal"
                className="h-[320px] w-full object-cover sm:h-[420px]"
                src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1800&q=80"
              />
            </motion.div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Today’s pickups" value="38" />
              <Stat label="Avg. rating" value="★ 4.8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gp-glass rounded-2xl px-4 py-3">
      <div className="text-xs font-semibold text-gp-charcoal/60">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  )
}

