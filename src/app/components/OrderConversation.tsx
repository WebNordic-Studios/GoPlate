import { SendHorizontal } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Message } from '../../types'
import { timeAgo } from '../../lib/format'
import { useSettings } from '../../state/settings'

type Props = {
  thread: Message[]
  viewerRole: 'buyer' | 'cook'
  peerLabel: string
  onSend: (body: string) => void
  footer?: ReactNode
  compact?: boolean
  draftInputId?: string
}

export function OrderConversation({
  thread,
  viewerRole,
  peerLabel,
  onSend,
  footer,
  compact,
  draftInputId = 'order-conversation-draft',
}: Props) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()

  const sorted = useMemo(
    () => [...thread].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso)),
    [thread],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: settings.reduceMotion ? 'auto' : 'smooth', block: 'end' })
  }, [sorted.length, settings.reduceMotion])

  function submit() {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  const bubbleText = compact ? 'text-[13px]' : 'text-sm'
  const bubblePad = compact ? 'px-3.5 py-2' : 'px-3.5 py-2.5'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-4 sm:px-4">
        {!sorted.length ? (
          <div className={`mx-auto text-center text-gp-charcoal/55 ${compact ? 'mt-16 max-w-[16rem]' : 'mt-12 max-w-sm'}`}>
            <p className={`font-semibold text-gp-charcoal ${compact ? 'text-sm' : 'text-base'}`}>No messages yet</p>
            <p className={`mt-2 leading-relaxed ${compact ? 'text-[13px]' : 'text-sm'}`}>
              Say hi — confirm pickup time, allergens, or door-drop details.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {sorted.map((m, i) => {
              const mine = m.from === viewerRole
              const prev = sorted[i - 1]
              const showPeerLabel = !mine && (!prev || prev.from !== m.from)

              return (
                <div key={m.id} className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[88%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                    {showPeerLabel ? (
                      <span className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-gp-charcoal/45">
                        {peerLabel}
                      </span>
                    ) : null}
                    <div
                      className={
                        mine
                          ? `rounded-[1.35rem] rounded-br-md bg-gp-primary shadow-sm ${bubblePad}`
                          : `rounded-[1.35rem] rounded-bl-md bg-gp-surface/90 shadow-sm ring-1 ring-black/8 dark:bg-gp-surface/80 dark:ring-white/10 ${bubblePad}`
                      }
                    >
                      <p
                        className={`whitespace-pre-wrap leading-snug ${bubbleText} ${
                          mine ? 'text-white' : 'text-gp-charcoal'
                        }`}
                      >
                        {m.body}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-medium tabular-nums ${
                          mine ? 'text-white/70' : 'text-gp-charcoal/45'
                        }`}
                      >
                        {timeAgo(m.createdAtIso)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="relative z-10 shrink-0 border-t border-black/10 bg-gp-bg p-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.12)] dark:border-white/10">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="sr-only" htmlFor={draftInputId}>
            Message {peerLabel}
          </label>
          <input
            id={draftInputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="gp-focus max-h-32 min-h-[2.75rem] min-w-0 flex-1 resize-none rounded-[1.25rem] border border-transparent bg-gp-surface/90 px-4 py-3 text-[13px] text-gp-charcoal shadow-inner ring-1 ring-black/[0.06] placeholder:text-gp-charcoal/40 dark:bg-gp-surface/75 dark:ring-white/10"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="gp-focus mb-px grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gp-primary text-white shadow-sm transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-35"
            aria-label="Send"
          >
            <SendHorizontal size={20} aria-hidden />
          </button>
        </form>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
    </div>
  )
}

