import { Camera, ChevronLeft, ChevronRight, CookingPot, DollarSign, MapPin, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Plate } from '../../types'
import { geoForZip } from '../../lib/geo'
import { Button } from '../../ui/Button'

type NewPlate = Omit<Plate, 'id'>

const CATEGORIES: NewPlate['category'][] = ['Hot Meals', 'Bakery', 'Desserts', 'Vegan']

export function StartCookingPage({
  onCreatePlate,
}: {
  onCreatePlate: (plate: NewPlate) => void
}) {
  const [cookMode, setCookMode] = useState(true)
  const [step, setStep] = useState(0)

  const [photoUrl, setPhotoUrl] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [name, setName] = useState('Lemon Herb Chicken + Roasted Veg')
  const [category, setCategory] = useState<NewPlate['category']>('Hot Meals')
  const [price, setPrice] = useState('14.99')
  const [zip, setZip] = useState('10012')
  const [readyFrom, setReadyFrom] = useState('5:30 PM')
  const [readyTo, setReadyTo] = useState('7:00 PM')
  const [portions, setPortions] = useState('6')
  const [ingredients, setIngredients] = useState('Chicken thighs, lemon, garlic, rosemary, potatoes, carrots, olive oil')
  const [cooksNote, setCooksNote] = useState(
    'I cook this in small batches so it stays juicy. Pickup includes a warm herb pan sauce on the side.',
  )

  const canNext = useMemo(() => {
    if (!cookMode) return false
    if (step === 0) return Boolean((photoUrl || photoDataUrl) && name.trim())
    if (step === 1) return Boolean(price.trim() && zip.trim())
    if (step === 2) return Boolean(readyFrom.trim() && readyTo.trim() && portions.trim())
    if (step === 3) return Boolean(ingredients.trim() && cooksNote.trim())
    return false
  }, [cookMode, step, photoUrl, photoDataUrl, name, price, zip, readyFrom, readyTo, portions, ingredients, cooksNote])

  async function onFile(file: File) {
    const data = await readAsDataUrl(file)
    setPhotoDataUrl(data)
    setPhotoUrl('')
  }

  function submit() {
    const cents = Math.round(Number(price) * 100)
    const qty = Math.max(0, Number(portions) || 0)
    const img = (photoDataUrl || photoUrl).trim()
    const list = ingredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 18)

    const newPlate: NewPlate = {
      name: name.trim(),
      category,
      priceCents: Number.isFinite(cents) ? cents : 0,
      distanceMiles: 0.6,
      rating: 5,
      ratingCount: 1,
      pickupWindow: `Ready ${readyFrom.trim()} – ${readyTo.trim()}`,
      zip: zip.trim(),
      geo: geoForZip(zip),
      images: [img].filter(Boolean),
      ingredients: list.length ? list : ['Ingredient list coming soon'],
      cooksNote: cooksNote.trim(),
      cook: {
        id: 'cook_you',
        name: 'You',
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        bio: 'Neighborhood cook. Fresh drops, small batches, friendly handoff.',
      },
      portionsAvailable: qty,
    }

    onCreatePlate(newPlate)
  }

  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Start Cooking</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">
            Toggle into Cook Mode, list a plate, and watch it appear instantly in the marketplace (saved to localStorage).
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 shadow-natural ring-1 ring-black/5">
          <div className="text-xs font-semibold text-gp-charcoal/60">Cook Mode</div>
          <button
            type="button"
            onClick={() => setCookMode((v) => !v)}
            className={`gp-focus relative h-7 w-12 rounded-full p-1 transition ${
              cookMode ? 'bg-gp-secondary' : 'bg-black/10'
            }`}
            aria-label="Toggle cook mode"
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow-natural transition ${
                cookMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <Stepper step={step} />

            <fieldset disabled={!cookMode} className="mt-5">
              {step === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="text-sm font-semibold">Photo</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-xs font-semibold text-gp-charcoal/60">Image URL</div>
                      <input
                        value={photoUrl}
                        onChange={(e) => {
                          setPhotoUrl(e.target.value)
                          setPhotoDataUrl(null)
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs font-semibold text-gp-charcoal/60">Upload</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) void onFile(f)
                        }}
                        className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-[10px] text-sm font-semibold ring-1 ring-black/5 file:mr-3 file:rounded-xl file:border-0 file:bg-gp-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gp-primary"
                      />
                    </label>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5">
                    <img
                      src={
                        (photoDataUrl || photoUrl).trim() ||
                        'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1400&q=80'
                      }
                      alt="Preview"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                </div>

                <label className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-gp-charcoal/60">Dish name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-gp-charcoal/60">Category</div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NewPlate['category'])}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
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
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                    <MapPin size={14} /> Zip Code
                  </div>
                  <input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
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
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gp-charcoal/60">
                    <Timer size={14} /> Ready to
                  </div>
                  <input
                    value={readyTo}
                    onChange={(e) => setReadyTo(e.target.value)}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-gp-charcoal/60">Portions available</div>
                  <input
                    value={portions}
                    onChange={(e) => setPortions(e.target.value)}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
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
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
                <label className="block">
                  <div className="text-xs font-semibold text-gp-charcoal/60">Cook’s note</div>
                  <textarea
                    value={cooksNote}
                    onChange={(e) => setCooksNote(e.target.value)}
                    rows={3}
                    className="gp-focus mt-1 w-full rounded-2xl bg-white px-3 py-3 text-sm font-semibold ring-1 ring-black/5"
                  />
                </label>
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
              {step < 3 ? (
                <Button
                  variant="primary"
                  disabled={!canNext}
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  leftIcon={<ChevronRight size={18} />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  disabled={!canNext}
                  onClick={submit}
                  leftIcon={<CookingPot size={18} />}
                >
                  List Plate
                </Button>
              )}
            </div>
            </fieldset>
          </div>
        </div>

        <div>
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <Camera size={18} className="text-gp-primary" />
              Listing preview
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-black/5">
              <img
                src={
                  (photoDataUrl || photoUrl).trim() ||
                  'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1400&q=80'
                }
                alt="Preview"
                className="h-44 w-full object-cover"
              />
            </div>
            <div className="mt-4 text-sm font-semibold">{name.trim() || 'Your dish name'}</div>
            <div className="mt-1 text-xs text-gp-charcoal/65">
              {category} • Zip {zip.trim() || '—'}
            </div>
            <div className="mt-4 rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-gp-charcoal/60">Pickup</div>
              <div className="mt-1 text-sm font-semibold text-gp-secondary">
                Ready {readyFrom.trim() || '—'} – {readyTo.trim() || '—'}
              </div>
              <div className="mt-2 text-xs font-semibold text-gp-charcoal/60">
                Portions: {portions.trim() || '—'} • Price: ${price.trim() || '—'}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/70 p-5 text-sm text-gp-charcoal/70 shadow-natural ring-1 ring-black/5">
            Cook Mode is <span className="font-semibold">{cookMode ? 'on' : 'off'}</span>. When it’s off, the
            form is intentionally locked to mimic role-based access.
          </div>
        </div>
      </div>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const steps = [
    { title: 'Photo + basics', icon: <Camera size={16} /> },
    { title: 'Price + zip', icon: <DollarSign size={16} /> },
    { title: 'Pickup window', icon: <Timer size={16} /> },
    { title: 'Ingredients + note', icon: <CookingPot size={16} /> },
  ]

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
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
                  ? 'bg-white text-gp-secondary ring-black/5'
                  : 'bg-white/60 text-gp-charcoal/60 ring-black/5'
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

