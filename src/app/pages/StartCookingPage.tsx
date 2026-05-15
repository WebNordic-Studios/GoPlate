import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CookingPot,
  DollarSign,
  Flame,
  MapPin,
  Save,
  Timer,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Allergen, Cuisine, DietaryTag, Plate, SpiceLevel, User } from '../../types'
import { ALLERGENS, CUISINES, DIETARY_TAGS } from '../../lib/taxonomy'
import { geoForZip } from '../../lib/geo'
import { attachHorizontalWheelScroll } from '../../lib/horizontalWheelScroll'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'

type NewPlate = Omit<Plate, 'id'>

const CATEGORIES: NewPlate['category'][] = ['Hot Meals', 'Bakery', 'Desserts', 'Vegan']

const DEFAULT_COOK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'

export function StartCookingPage({
  user,
  existingPlates,
  onCreatePlate,
  onSubmitVerification,
}: {
  user: User
  existingPlates: Plate[]
  onCreatePlate: (plate: NewPlate, opts?: { asDraft?: boolean; scheduledIso?: string }) => void
  onSubmitVerification?: () => void
}) {
  const [step, setStep] = useState(0)

  const [photos, setPhotos] = useState<string[]>([])
  const [name, setName] = useState('Lemon Herb Chicken + Roasted Veg')
  const [category, setCategory] = useState<NewPlate['category']>('Hot Meals')
  const [cuisine, setCuisine] = useState<Cuisine>('American')
  const [price, setPrice] = useState('14.99')
  const [zip, setZip] = useState('10012')
  const [readyFrom, setReadyFrom] = useState('5:30 PM')
  const [readyTo, setReadyTo] = useState('7:00 PM')
  const [portions, setPortions] = useState('6')
  const [ingredients, setIngredients] = useState('Chicken thighs, lemon, garlic, rosemary, potatoes, carrots, olive oil')
  const [cooksNote, setCooksNote] = useState(
    'I cook this in small batches so it stays juicy. Pickup includes a warm herb pan sauce on the side.',
  )
  const [dietary, setDietary] = useState<Set<DietaryTag>>(() => new Set(['gluten-free']))
  const [allergens, setAllergens] = useState<Set<Allergen>>(() => new Set())
  const [noAllergens, setNoAllergens] = useState(false)
  const [spice, setSpice] = useState<SpiceLevel>(1)
  const [delivery, setDelivery] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState('3.99')
  const [scheduleAt, setScheduleAt] = useState<string>('')
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [cloneOpen, setCloneOpen] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  const myPastPlates = useMemo(() => existingPlates.filter((p) => p.cook.id === user.id), [existingPlates, user.id])

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(photos.length > 0 && name.trim())
    if (step === 1) return Boolean(price.trim() && zip.trim())
    if (step === 2) return Boolean(readyFrom.trim() && readyTo.trim() && portions.trim())
    if (step === 3) return Boolean(ingredients.trim() && cooksNote.trim())
    if (step === 4) return noAllergens || allergens.size > 0
    return false
  }, [step, photos.length, name, price, zip, readyFrom, readyTo, portions, ingredients, cooksNote, noAllergens, allergens.size])

  async function addPhotoFile(file: File) {
    if (photos.length >= 4) return
    const data = await readAsDataUrl(file)
    setPhotos((p) => [...p, data])
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    for (const f of files.slice(0, 4 - photos.length)) {
      void addPhotoFile(f)
    }
  }

  function buildPayload(): NewPlate {
    const cents = Math.round(Number(price) * 100)
    const qty = Math.max(0, Number(portions) || 0)
    const list = ingredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 18)
    const allergenList = noAllergens ? [] : Array.from(allergens)
    return {
      name: name.trim(),
      category,
      cuisine,
      priceCents: Number.isFinite(cents) ? cents : 0,
      distanceMiles: 0.6,
      rating: 5,
      ratingCount: 1,
      pickupWindow: `Ready ${readyFrom.trim()} – ${readyTo.trim()}`,
      zip: zip.trim(),
      geo: geoForZip(zip),
      images: photos.slice(),
      ingredients: list.length ? list : ['Ingredient list coming soon'],
      cooksNote: cooksNote.trim(),
      cook: {
        id: user.id,
        name: user.displayName,
        avatarUrl: user.avatarUrl ?? DEFAULT_COOK_AVATAR,
        bio:
          (user.bio ?? '').trim() ||
          'Neighborhood cook. Fresh drops, small batches, friendly handoff.',
        verified: user.cookVerification === 'verified',
      },
      portionsAvailable: qty,
      dietary: Array.from(dietary),
      allergens: allergenList,
      spice,
      deliveryAvailable: delivery,
      deliveryFeeCents: delivery ? Math.round(Number(deliveryFee) * 100) : undefined,
    }
  }

  function publishNow() {
    onCreatePlate(buildPayload())
  }

  function saveDraft() {
    onCreatePlate(buildPayload(), { asDraft: true })
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2200)
  }

  function schedulePublish() {
    if (!scheduleAt) return
    const iso = new Date(scheduleAt).toISOString()
    onCreatePlate(buildPayload(), { asDraft: true, scheduledIso: iso })
  }

  function cloneFrom(p: Plate) {
    setPhotos(p.images.slice(0, 4))
    setName(p.name)
    setCategory(p.category)
    if (p.cuisine) setCuisine(p.cuisine)
    setPrice((p.priceCents / 100).toFixed(2))
    setZip(p.zip)
    const match = p.pickupWindow.match(/Ready\s+(.+?)\s*–\s*(.+)/i)
    if (match) {
      setReadyFrom(match[1])
      setReadyTo(match[2])
    }
    setPortions(String(p.portionsAvailable || 6))
    setIngredients(p.ingredients.join(', '))
    setCooksNote(p.cooksNote)
    setDietary(new Set(p.dietary ?? []))
    setAllergens(new Set(p.allergens ?? []))
    setNoAllergens((p.allergens?.length ?? 0) === 0)
    setSpice(p.spice ?? 0)
    setDelivery(Boolean(p.deliveryAvailable))
    setDeliveryFee(((p.deliveryFeeCents ?? 399) / 100).toFixed(2))
    setStep(0)
    setCloneOpen(false)
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Create</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            List a plate, save a draft, or schedule a publish. Listings appear in the marketplace once published.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {myPastPlates.length > 0 ? (
            <Button variant="ghost" onClick={() => setCloneOpen(true)} leftIcon={<Copy size={16} />}>
              Clone past plate
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <VerificationStatusCard
          status={user.cookVerification ?? 'none'}
          onOpen={() => setVerifyOpen(true)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] bg-gp-surface/70 p-5 shadow-natural ring-1 ring-black/5">
            <Stepper step={step} />

            <fieldset className="mt-5">
              {step === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="text-sm font-semibold">Photos <span className="font-normal text-gp-charcoal/55">(drag & drop or click — up to 4)</span></div>
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop}
                      className="gp-focus mt-2 grid cursor-pointer place-items-center rounded-2xl border border-dashed border-black/15 bg-gp-bg/40 p-6 text-center transition hover:border-gp-primary/30 hover:bg-gp-primary/[0.04]"
                    >
                      <Upload size={24} className="text-gp-charcoal/55" />
                      <div className="mt-2 text-sm font-semibold text-gp-charcoal/80">Drop photos here or click to upload</div>
                      <div className="mt-0.5 text-xs text-gp-charcoal/55">PNG / JPG · we'll show the first one as the cover</div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? [])
                          for (const f of files.slice(0, 4 - photos.length)) {
                            void addPhotoFile(f)
                          }
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {photos.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photos.map((p, i) => (
                          <div key={i} className="relative">
                            <img src={p} alt="" className="h-20 w-28 rounded-xl object-cover ring-1 ring-black/10" />
                            <button
                              type="button"
                              onClick={() => setPhotos((arr) => arr.filter((_, idx) => idx !== i))}
                              className="gp-focus absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gp-charcoal text-white shadow-natural"
                              aria-label="Remove photo"
                            >
                              <X size={10} />
                            </button>
                            {i === 0 ? (
                              <div className="absolute bottom-1 left-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                                Cover
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <label className="block sm:col-span-2">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Dish name</div>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>

                  <label className="block">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Category</div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as NewPlate['category'])}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Cuisine</div>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value as Cuisine)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    >
                      {CUISINES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                      <DollarSign size={14} /> Price (USD)
                    </div>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>
                  <label className="block">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                      <MapPin size={14} /> Zip Code
                    </div>
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <div className="rounded-2xl bg-gp-bg/60 p-4 ring-1 ring-black/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">Offer delivery?</div>
                          <div className="mt-0.5 text-xs text-gp-charcoal/60">Set a flat delivery fee. Buyers can opt in at checkout.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDelivery((v) => !v)}
                          className={`gp-focus relative h-7 w-12 rounded-full p-1 transition ${delivery ? 'bg-gp-secondary' : 'bg-black/15'}`}
                          aria-checked={delivery}
                          role="switch"
                        >
                          <span className={`block h-5 w-5 rounded-full bg-white shadow-natural transition ${delivery ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      {delivery ? (
                        <label className="mt-3 block">
                          <div className="text-xs font-semibold text-gp-charcoal/60">Delivery fee (USD)</div>
                          <input
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                      <Timer size={14} /> Ready from
                    </div>
                    <input
                      value={readyFrom}
                      onChange={(e) => setReadyFrom(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>
                  <label className="block">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                      <Timer size={14} /> Ready to
                    </div>
                    <input
                      value={readyTo}
                      onChange={(e) => setReadyTo(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Portions available</div>
                    <input
                      value={portions}
                      onChange={(e) => setPortions(e.target.value)}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <label className="block">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Ingredients (comma-separated)</div>
                    <textarea
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      rows={3}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold text-gp-charcoal/60">Cook’s note</div>
                    <textarea
                      value={cooksNote}
                      onChange={(e) => setCooksNote(e.target.value)}
                      rows={3}
                      className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                  </label>

                  <div className="rounded-2xl bg-gp-bg/60 p-4 ring-1 ring-black/5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Dietary qualities</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {DIETARY_TAGS.map((t) => {
                        const active = dietary.has(t.id)
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setDietary((s) => {
                                const next = new Set(s)
                                if (active) next.delete(t.id)
                                else next.add(t.id)
                                return next
                              })
                            }
                            className={`gp-focus rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                              active
                                ? 'bg-gp-secondary text-white ring-gp-secondary/60'
                                : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                            }`}
                          >
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gp-bg/60 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">
                      <Flame size={14} className="text-orange-500" /> Spice level
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSpice(v as SpiceLevel)}
                          className={`gp-focus h-9 w-9 rounded-xl text-xs font-semibold ring-1 ${
                            spice === v
                              ? 'bg-gp-primary text-white ring-gp-primary/60'
                              : 'bg-gp-surface text-gp-charcoal/70 ring-black/10 hover:bg-black/5'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 rounded-2xl bg-gp-primary/[0.06] p-4 ring-1 ring-gp-primary/15">
                    <AlertTriangle size={18} className="mt-0.5 text-gp-primary" />
                    <div className="text-sm text-gp-charcoal/80">
                      <span className="font-semibold">Allergen disclosure is required.</span> Select every allergen your dish contains, or
                      confirm there are none. This protects your buyers and your reputation.
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-3 rounded-2xl bg-gp-bg/60 p-3 ring-1 ring-black/5">
                    <span className="text-sm font-semibold">This plate contains no common allergens</span>
                    <input
                      type="checkbox"
                      checked={noAllergens}
                      onChange={(e) => setNoAllergens(e.target.checked)}
                      className="h-5 w-5 accent-gp-secondary"
                    />
                  </label>

                  <div className={`rounded-2xl bg-gp-bg/60 p-4 ring-1 ring-black/5 ${noAllergens ? 'opacity-50' : ''}`}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Contains</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ALLERGENS.map((a) => {
                        const active = allergens.has(a.id)
                        return (
                          <button
                            key={a.id}
                            type="button"
                            disabled={noAllergens}
                            onClick={() =>
                              setAllergens((s) => {
                                const next = new Set(s)
                                if (active) next.delete(a.id)
                                else next.add(a.id)
                                return next
                              })
                            }
                            className={`gp-focus rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                              active
                                ? 'bg-rose-500 text-white ring-rose-500/60'
                                : 'bg-gp-surface text-gp-charcoal/75 ring-black/10 hover:bg-black/5'
                            } disabled:cursor-not-allowed`}
                          >
                            {a.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gp-bg/60 p-4 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">
                      <Clock size={14} /> Schedule a publish (optional)
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      className="gp-focus mt-2 w-full rounded-2xl bg-gp-surface px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                    />
                    <p className="mt-1 text-xs text-gp-charcoal/60">
                      Save as draft and we'll auto-flip it live at the time you choose.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Back
                </Button>
                {step < 4 ? (
                  <Button
                    variant="primary"
                    disabled={!canNext}
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    leftIcon={<ChevronRight size={18} />}
                  >
                    Next
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" disabled={!canNext} onClick={saveDraft} leftIcon={<Save size={16} />}>
                      Save as draft
                    </Button>
                    {scheduleAt ? (
                      <Button variant="ghost" disabled={!canNext} onClick={schedulePublish} leftIcon={<Clock size={16} />}>
                        Schedule
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      disabled={!canNext}
                      onClick={publishNow}
                      leftIcon={<CookingPot size={18} />}
                    >
                      Publish now
                    </Button>
                  </div>
                )}
              </div>
              {draftSaved ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gp-secondary/10 px-3 py-2 text-xs font-semibold text-gp-secondary ring-1 ring-gp-secondary/15">
                  <CheckCircle2 size={14} /> Draft saved
                </div>
              ) : null}
            </fieldset>
          </div>
        </div>

        <div>
          <div className="rounded-[2rem] bg-gp-surface/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <Camera size={18} className="text-gp-primary" />
              Listing preview
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-black/5">
              <img
                src={
                  photos[0] ||
                  'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1400&q=80'
                }
                alt="Preview"
                className="h-44 w-full object-cover"
              />
            </div>
            <div className="mt-4 text-sm font-semibold">{name.trim() || 'Your dish name'}</div>
            <div className="mt-1 text-xs text-gp-charcoal/65">
              {category} · {cuisine} · Zip {zip.trim() || '—'}
            </div>
            <div className="mt-4 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Pickup</div>
              <div className="mt-1 text-sm font-semibold text-gp-secondary">
                Ready {readyFrom.trim() || '—'} – {readyTo.trim() || '—'}
              </div>
              <div className="mt-2 text-xs font-semibold text-gp-charcoal/60">
                Portions: {portions.trim() || '—'} · Price: ${price.trim() || '—'}
              </div>
              {delivery ? (
                <div className="mt-2 text-xs font-semibold text-gp-secondary">Delivery offered (+${deliveryFee})</div>
              ) : null}
            </div>
          </div>

        </div>
      </div>

      <Modal open={cloneOpen} title="Clone a past plate" onClose={() => setCloneOpen(false)}>
        <div className="space-y-3 p-5 sm:p-6">
          <p className="text-sm text-gp-charcoal/70">
            Pick any plate you've listed before. We'll pre-fill the form so you can tweak before publishing.
          </p>
          <ul className="grid gap-2">
            {myPastPlates.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => cloneFrom(p)}
                  className="gp-focus flex w-full items-center gap-3 rounded-2xl bg-gp-surface px-3 py-2.5 text-left ring-1 ring-black/5 hover:bg-black/5"
                >
                  <img src={p.images[0]} alt="" className="h-12 w-16 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-gp-charcoal/60">
                      {p.category} · ${(p.priceCents / 100).toFixed(2)}
                      {p.isDraft ? ' · Draft' : ''}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal open={verifyOpen} title="Cook verification" onClose={() => setVerifyOpen(false)}>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm text-gp-charcoal/70">
            Upload a food-handler card or kitchen permit to earn the <span className="inline-flex items-center gap-1 font-semibold text-gp-secondary"><BadgeCheck size={14} />Verified</span> badge on your profile and plates.
          </p>
          <label className="block">
            <div className="text-xs font-semibold text-gp-charcoal/60">Upload certificate (PDF or image)</div>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="gp-focus mt-1 w-full rounded-2xl bg-gp-surface px-3 py-[10px] text-sm font-semibold ring-1 ring-black/5 file:mr-3 file:rounded-xl file:border-0 file:bg-gp-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gp-primary"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setVerifyOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                onSubmitVerification?.()
                setVerifyOpen(false)
              }}
            >
              Submit for review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function VerificationStatusCard({
  status,
  onOpen,
}: {
  status: NonNullable<User['cookVerification']>
  onOpen: () => void
}) {
  if (status === 'verified') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gp-secondary/10 p-4 ring-1 ring-gp-secondary/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-gp-secondary">
          <BadgeCheck size={18} /> You're verified. Plates will display the verified badge.
        </div>
      </div>
    )
  }
  if (status === 'pending') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Clock size={18} /> Verification pending review.
        </div>
        <Button variant="ghost" onClick={onOpen}>Upload again</Button>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
      <div className="text-sm text-gp-charcoal/75">
        <span className="font-semibold">Get verified</span> — earn a kitchen badge to build trust faster.
      </div>
      <Button variant="secondary" onClick={onOpen} leftIcon={<BadgeCheck size={16} />}>
        Submit certificate
      </Button>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const steps = [
    { title: 'Photos + basics', icon: <Camera size={16} /> },
    { title: 'Price + zip', icon: <DollarSign size={16} /> },
    { title: 'Pickup window', icon: <Timer size={16} /> },
    { title: 'Ingredients + tags', icon: <CookingPot size={16} /> },
    { title: 'Allergens + schedule', icon: <AlertTriangle size={16} /> },
  ]

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    return attachHorizontalWheelScroll(el)
  }, [])

  return (
    <div
      ref={scrollRef}
      className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 py-1 touch-pan-x [-webkit-overflow-scrolling:touch] items-center"
    >
      {steps.map((s, i) => {
        const active = i === step
        const done = i < step
        return (
          <div
            key={s.title}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition ${
              active
                ? 'bg-gp-secondary text-white ring-black/5'
                : done
                  ? 'bg-gp-surface text-gp-secondary ring-black/5'
                  : 'bg-gp-surface/60 text-gp-charcoal/60 ring-black/5'
            }`}
          >
            {s.icon}
            {s.title}
          </div>
        )
      })}
    </div>
  )
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}
