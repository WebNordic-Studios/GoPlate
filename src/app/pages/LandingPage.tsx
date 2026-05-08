import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/Hero'
import { Button } from '../../ui/Button'

export function LandingPage({
  zip,
  onSearchZip,
  onStartCooking,
}: {
  zip: string
  onSearchZip: (zip: string) => void
  onStartCooking: () => void
}) {
  return (
    <div>
      <Hero initialZip={zip} onSearchZip={onSearchZip} />

      <section className="gp-container pb-28 pt-2 md:pb-12">
        <div className="grid gap-4 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5 md:grid-cols-3 md:items-center">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-semibold">Start cooking. Start earning.</div>
            <p className="mt-2 text-sm text-gp-charcoal/70">
              List a plate in minutes with a clean, multi-step flow. Your dish shows up in the marketplace and
              persists after refresh (local-only for this prototype).
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <Button variant="secondary" onClick={onStartCooking} leftIcon={<ArrowRight size={18} />}>
              Start Cooking
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5">
              <div className="font-display text-xl font-semibold">About GoPlate</div>
              <p className="mt-3 text-sm text-gp-charcoal/75">
                GoPlate is a hyper-local marketplace for home-cooked meals and artisanal bakes. It’s built for
                neighbors: short pickup windows, privacy-first locations, and small-batch drops you can trust.
              </p>
              <div className="mt-5 grid gap-3">
                <Blurb title="Neighborhood-first">Discover cooks within a few miles — not across town.</Blurb>
                <Blurb title="Privacy protected">Pickup areas are approximate until checkout.</Blurb>
                <Blurb title="Small-batch quality">Limited portions means fresher food and better craft.</Blurb>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Photo
                src="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80"
                label="Warm bakes, morning pickups"
              />
              <Photo
                src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1400&q=80"
                label="Home meals, restaurant finish"
              />
              <Photo
                src="https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=80"
                label="Seasonal, local ingredients"
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-gp-primary/10 via-white/0 to-gp-secondary/10 p-6 shadow-natural ring-1 ring-black/5">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="font-display text-xl font-semibold">A public-ready experience</div>
              <p className="mt-2 text-sm text-gp-charcoal/70">
                Browse dishes, open cook profiles, follow creators you love, and like plates to save for later —
                all with fast, app-like navigation.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button variant="primary" onClick={() => onSearchZip(zip)}>
                Explore the marketplace
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Blurb({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-gp-charcoal/70">{children}</div>
    </div>
  )
}

function Photo({
  src,
  label,
  className = '',
}: {
  src: string
  label: string
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] shadow-natural ring-1 ring-black/5 ${className}`}>
      <img src={src} alt={label} className="h-56 w-full object-cover sm:h-64" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
        <div className="text-sm font-semibold text-white">{label}</div>
      </div>
    </div>
  )
}

