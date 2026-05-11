import { Check, Copy, ExternalLink, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

export function ShareModal({
  open,
  title,
  url,
  onClose,
}: {
  open: boolean
  title: string
  url: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(t)
  }, [copied])

  const twitter = useMemo(
    () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    [title, url],
  )
  const facebook = useMemo(
    () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    [url],
  )

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* user cancelled */
      }
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      setCopied(true)
    }
  }

  return (
    <Modal open={open} title="Share" onClose={onClose}>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/55">Sharing</div>
          <div className="mt-1 font-display text-lg font-semibold">{title}</div>
        </div>

        <div className="rounded-2xl bg-gp-surface/80 p-3 ring-1 ring-black/5">
          <div className="text-xs font-semibold text-gp-charcoal/60">Link preview</div>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-gp-bg px-3 py-2 ring-1 ring-black/5">
            <code className="truncate text-xs text-gp-charcoal/80">{url}</code>
            <button
              type="button"
              onClick={copy}
              className="gp-focus inline-flex items-center gap-1 rounded-xl bg-gp-secondary px-3 py-1.5 text-xs font-semibold text-white"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <a
            href={twitter}
            target="_blank"
            rel="noreferrer noopener"
            className="gp-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold text-gp-charcoal ring-1 ring-black/10 hover:bg-black/5"
          >
            <ExternalLink size={16} /> Twitter
          </a>
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer noopener"
            className="gp-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold text-gp-charcoal ring-1 ring-black/10 hover:bg-black/5"
          >
            <ExternalLink size={16} /> Facebook
          </a>
          <button
            type="button"
            onClick={nativeShare}
            className="gp-focus inline-flex items-center justify-center gap-2 rounded-2xl bg-gp-surface px-3 py-2.5 text-sm font-semibold text-gp-charcoal ring-1 ring-black/10 hover:bg-black/5"
          >
            <Send size={16} /> More…
          </button>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
