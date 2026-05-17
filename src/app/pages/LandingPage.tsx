import {
  ArrowRight,
  BadgeCheck,
  ChefHat,
  Clock,
  History,
  Leaf,
  MapPinned,
  Package,
  Quote,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Hero } from '../components/Hero'
import { Button } from '../../ui/Button'
import { GoPlateLogoMark } from '../../ui/GoPlateLogo'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'
import { useMarketplaceContext } from '../../state/marketplaceContext'
import { useRecentlyViewed } from '../../state/recentlyViewed'
import { useNavigate } from 'react-router-dom'

export function LandingPage({
  zip,
  onSearchZip,
  onStartCooking,
}: {
  zip: string
  onSearchZip: (zip: string) => void
  onStartCooking: () => void
}) {
  const { byId } = useMarketplaceContext()
  const navigate = useNavigate()
  const { ids } = useRecentlyViewed()
  const recent = ids.map((id) => byId.get(id)).filter(Boolean) as import('../../types').Plate[]
  const recentRailRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = recentRailRef.current
    if (!el) return
    return attachHorizontalWheelScroll(el)
  }, [recent.length])

  return (
    <div>
      <Hero initialZip={zip} onSearchZip={onSearchZip} />

      {recent.length > 0 ? (
        <section className="gp-container pt-6">
          <div className="rounded-[2rem] bg-gp-surface/70 p-5 shadow-natural ring-1 ring-black/5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <History size={18} className="text-gp-secondary" aria-hidden /> Recently viewed
              </h2>
              <button
                type="button"
                onClick={() => navigate('/market')}
                className="gp-focus rounded-xl px-2 py-1 text-xs font-semibold text-gp-secondary underline decoration-gp-secondary/30"
              >
                See all
              </button>
            </div>
            <div
              ref={recentRailRef}
              className="-mx-2 mt-4 flex gap-3 overflow-x-auto overscroll-x-contain px-2 py-1 touch-pan-x [-webkit-overflow-scrolling:touch] items-stretch"
            >
              {recent.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate('/market')}
                  className="gp-focus w-[200px] shrink-0 overflow-hidden rounded-2xl bg-gp-surface text-left shadow-natural ring-1 ring-black/5 transition hover:ring-gp-primary/20"
                >
                  <img src={p.images[0]} alt="" className="h-28 w-full object-cover" />
                  <div className="p-3">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="mt-0.5 text-xs text-gp-charcoal/60">{p.cook.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="gp-container pb-28 pt-2 md:pb-16">
        <div className="grid gap-3 sm:grid-cols-3">
          <ValueCard
            icon={<MapPinned className="h-5 w-5" aria-hidden />}
            title="Walk to pickup"
            body="Most meals are a short stroll away — not a cross-town drive."
          />
          <ValueCard
            icon={<ChefHat className="h-5 w-5" aria-hidden />}
            title="Know your cook"
            body="Real profiles, specialties, and pickup windows you can plan around."
          />
          <ValueCard
            icon={<Leaf className="h-5 w-5" aria-hidden />}
            title="Small batches"
            body="Limited portions mean fresher food and less waste."
          />
        </div>

        <div className="mt-12 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-secondary/80">How it works</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gp-charcoal sm:text-3xl">
              Browse, reserve, pick up — that simple
            </h2>
            <p className="mt-3 text-sm text-gp-charcoal/70 sm:text-base">
              Whether you are hungry tonight or listing your first plate, GoPlate keeps every step clear and
              neighbor-friendly.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">For diners</div>
              <ol className="mt-4 space-y-4">
                <Step
                  n={1}
                  title="Search by zip"
                  body="See what is cooking nearby with clear pickup windows and portion counts."
                  icon={<MapPinned className="h-5 w-5" aria-hidden />}
                />
                <Step
                  n={2}
                  title="Reserve your plate"
                  body="Lock a slot, review pickup details, and message the cook if something changes."
                  icon={<UtensilsCrossed className="h-5 w-5" aria-hidden />}
                />
                <Step
                  n={3}
                  title="Pick up and enjoy"
                  body="Meet at the agreed spot, grab your meal, and leave feedback that helps the whole block."
                  icon={<Package className="h-5 w-5" aria-hidden />}
                />
              </ol>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50">For home cooks</div>
              <ol className="mt-4 space-y-4">
                <Step
                  n={1}
                  title="List with confidence"
                  body="Walk through a guided flow: photos, allergens, pricing, and pickup rules in one place."
                  icon={<ChefHat className="h-5 w-5" aria-hidden />}
                />
                <Step
                  n={2}
                  title="Prep in batches you control"
                  body="Set caps so every plate is made fresh — no surprise volume spikes."
                  icon={<Clock className="h-5 w-5" aria-hidden />}
                />
                <Step
                  n={3}
                  title="Hand off, then iterate"
                  body="Ratings and follows help you grow a loyal neighborhood following."
                  icon={<Sparkles className="h-5 w-5" aria-hidden />}
                />
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5 md:grid-cols-3 md:items-center">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-semibold">Create. Start earning.</div>
            <p className="mt-2 text-sm text-gp-charcoal/70">
              List a plate in minutes with a clean, multi-step flow. Your dish appears in the marketplace and stays
              visible after refresh in this prototype build — perfect for demos and investor walkthroughs.
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <Button variant="secondary" onClick={onStartCooking} leftIcon={<ArrowRight size={18} />}>
              Create
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-gp-secondary/80">Why GoPlate</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gp-charcoal sm:text-3xl">
              Built for blocks, not big-box logistics
            </h2>
            <p className="mt-3 text-sm text-gp-charcoal/70 sm:text-base">
              Every surface is tuned for clarity: fewer taps, honest descriptions, and respectful boundaries around
              where food meets the street.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureTile
              icon={<ShieldCheck className="h-6 w-6" aria-hidden />}
              title="Privacy-first pickup"
              description="Approximate areas until checkout so cooks and guests both feel safe."
            />
            <FeatureTile
              icon={<Leaf className="h-6 w-6" aria-hidden />}
              title="Small-batch by design"
              description="Limited portions keep quality high and waste low."
            />
            <FeatureTile
              icon={<BadgeCheck className="h-6 w-6" aria-hidden />}
              title="Profiles you can trust"
              description="Cook bios, specialties, and social signals in one cohesive profile."
            />
            <FeatureTile
              icon={<UtensilsCrossed className="h-6 w-6" aria-hidden />}
              title="App-like navigation"
              description="Browse, detail views, and checkout feel fast on phone or desktop."
            />
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5">
              <div className="flex items-start gap-4">
                <div className="flex shrink-0 items-start pt-0.5">
                  <GoPlateLogoMark
                    size="xl"
                    decorative
                    className="drop-shadow-[0_3px_12px_rgb(0_0_0_/0.09)] sm:scale-[1.04]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-semibold">About GoPlate</div>
                  <p className="mt-3 text-sm leading-relaxed text-gp-charcoal/75">
                    GoPlate connects neighbors who cook at home with neighbors who want a great meal nearby. You
                    reserve a plate, pick it up on schedule, and skip the anonymous delivery middleman.
                  </p>
                  <div className="mt-5 grid gap-3">
                    <Blurb title="Truly local">See what is cooking within a few blocks or a short walk.</Blurb>
                    <Blurb title="Pickup, not delivery">Agreed windows and handoff codes keep handoffs simple.</Blurb>
                    <Blurb title="Cooks you can meet">Profiles, ratings, and messages — the way a block should feel.</Blurb>
                  </div>
                </div>
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

        <div className="mt-12 rounded-[2rem] bg-gp-secondary/[0.06] p-6 shadow-natural ring-1 ring-black/5 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gp-secondary/80">Voices from the block</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gp-charcoal sm:text-3xl">
                What neighbors are saying
              </h2>
            </div>
            <p className="max-w-md text-sm text-gp-charcoal/65">
              Representative quotes for this concept build — swap in real testimonials as you onboard your first
              cohort.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Testimonial
              quote="The pickup window was five minutes from my desk. I have not ordered generic delivery since."
              name="Jordan M."
              role="Diner · Brooklyn"
            />
            <Testimonial
              quote="Listing my sourdough used to mean juggling DMs. Now everything lives in one tidy flow."
              name="Priya S."
              role="Home baker · Oakland"
            />
            <Testimonial
              quote="I love seeing who is cooking, not just a logo. It feels like a farmers market that never closes."
              name="Alex R."
              role="Diner · Chicago"
            />
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] bg-white/70 p-6 shadow-natural ring-1 ring-black/5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-gp-charcoal sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gp-charcoal/70">
            Straight answers for operators, cooks, and curious neighbors evaluating a pilot.
          </p>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <FaqItem
              q="Is GoPlate a delivery service?"
              a="No — it is built around scheduled pickups at agreed locations. That keeps costs down and food quality up while respecting residential privacy."
            />
            <FaqItem
              q="How do you handle food safety?"
              a="Cooks disclose ingredients and allergens clearly at listing time. In a production deployment you would layer jurisdiction-specific permits, insurance, and kitchen inspections on top of this experience."
            />
            <FaqItem
              q="Can I try the product without signing up?"
              a="Yes. Browse the marketplace, open cook profiles, and explore plates. Account creation unlocks checkout, follows, and the cook onboarding flow."
            />
            <FaqItem
              q="What happens to my data in this build?"
              a="This prototype stores marketplace data locally in your browser so flows feel persistent during demos. A live product would move that to secure cloud infrastructure with explicit privacy controls."
            />
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-gp-primary/10 via-white/0 to-gp-secondary/10 p-6 shadow-natural ring-1 ring-black/5">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="font-display text-xl font-semibold">A public-ready experience</div>
              <p className="mt-2 text-sm text-gp-charcoal/70">
                Browse dishes, open cook profiles, follow creators you love, and like plates to save for later — all
                with fast, app-like navigation.
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

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gp-primary/10 text-gp-primary">{icon}</div>
      <div className="mt-3 font-display text-base font-semibold text-gp-charcoal">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/70">{body}</p>
    </div>
  )
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: number
  title: string
  body: string
  icon: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-gp-primary/10 text-gp-primary">
        {icon}
        <span className="sr-only">Step {n}</span>
      </div>
      <div className="min-w-0 pt-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-gp-primary/80">{n}.</span>
          <div className="font-display text-base font-semibold text-gp-charcoal">{title}</div>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-gp-charcoal/70">{body}</p>
      </div>
    </li>
  )
}

function FeatureTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gp-secondary/10 text-gp-secondary">{icon}</div>
      <div className="mt-4 font-display text-base font-semibold text-gp-charcoal">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-gp-charcoal/70">{description}</p>
    </div>
  )
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <figure className="flex h-full flex-col rounded-[2rem] bg-white/80 p-5 shadow-natural ring-1 ring-black/5">
      <Quote className="h-8 w-8 text-gp-primary/35" aria-hidden />
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gp-charcoal/85">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-4 border-t border-black/5 pt-4">
        <div className="text-sm font-semibold text-gp-charcoal">{name}</div>
        <div className="text-xs text-gp-charcoal/55">{role}</div>
      </figcaption>
    </figure>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-gp-bg/80 p-4 ring-1 ring-black/5 transition open:bg-white open:ring-gp-primary/15">
      <summary className="cursor-pointer list-none font-display text-sm font-semibold text-gp-charcoal marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-2">
          {q}
          <span className="mt-0.5 shrink-0 text-gp-primary transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-gp-charcoal/70">{a}</p>
    </details>
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
