import { Camera, Star, X } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

export type DraftReview = {
  rating: number
  body: string
  photoDataUrls: string[]
}

export function WriteReviewModal({
  open,
  plateName,
  cookName,
  onClose,
  onSubmit,
}: {
  open: boolean
  plateName: string
  cookName: string
  onClose: () => void
  onSubmit: (draft: DraftReview) => void
}) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState<number | null>(null)
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  function reset() {
    setRating(5)
    setBody('')
    setPhotos([])
  }

  async function addPhoto(file: File) {
    if (photos.length >= 3) return
    const data = await readAsDataUrl(file)
    setPhotos((p) => [...p, data])
  }

  function removePhoto(idx: number) {
    setPhotos((p) => p.filter((_, i) => i !== idx))
  }

  return (
    <Modal open={open} title={`Rate your plate`} onClose={() => { onClose(); reset() }}>
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Plate</div>
          <div className="mt-1 font-display text-lg font-semibold">{plateName}</div>
          <div className="text-xs text-gp-charcoal/60">by {cookName}</div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Rating</div>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const v = i + 1
              const active = (hovered ?? rating) >= v
              return (
                <button
                  key={v}
                  type="button"
                  onMouseEnter={() => setHovered(v)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setRating(v)}
                  className="gp-focus rounded-xl p-1"
                  aria-label={`${v} star${v === 1 ? '' : 's'}`}
                >
                  <Star
                    size={28}
                    className={active ? 'text-gp-primary' : 'text-gp-charcoal/30'}
                    fill={active ? 'currentColor' : 'none'}
                  />
                </button>
              )
            })}
            <span className="ml-2 text-sm font-semibold text-gp-charcoal/70">{rating}.0</span>
          </div>
        </div>

        <label className="block">
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Your thoughts</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="What did you love? What could be tuned?"
            className="gp-focus mt-1 w-full resize-y rounded-2xl bg-gp-surface px-3 py-3 text-sm font-medium ring-1 ring-black/5 placeholder:text-gp-charcoal/40"
          />
          <div className="mt-1 text-right text-xs text-gp-charcoal/50">{body.length}/500</div>
        </label>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Photos (optional, up to 3)</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/10" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="gp-focus absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gp-charcoal text-white shadow-natural"
                  aria-label="Remove photo"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {photos.length < 3 ? (
              <label className="gp-focus inline-flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl bg-gp-surface ring-1 ring-dashed ring-black/15 hover:bg-black/5">
                <Camera size={18} className="text-gp-charcoal/60" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void addPhoto(f)
                    e.target.value = ''
                  }}
                />
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => { onClose(); reset() }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={body.trim().length < 4}
            onClick={() => {
              onSubmit({ rating, body: body.trim(), photoDataUrls: photos })
              reset()
            }}
          >
            Post review
          </Button>
        </div>
      </div>
    </Modal>
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
