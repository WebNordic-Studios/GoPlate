import { Bell, MapPin, RotateCcw, Sparkles } from 'lucide-react'
import type { Settings } from '../../state/settings'
import { Button } from '../../ui/Button'

export function SettingsPage({
  settings,
  onChange,
  onReset,
}: {
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onReset: () => void
}) {
  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold">Settings</div>
          <div className="mt-1 text-sm text-gp-charcoal/65">Preferences are saved locally for this prototype.</div>
        </div>
        <Button variant="ghost" onClick={onReset} leftIcon={<RotateCcw size={18} />}>
          Reset
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SettingCard
          icon={<MapPin size={18} className="text-gp-secondary" />}
          title="Location hints"
          description="Show friendly location prompts (like “Current location”) in search surfaces."
          checked={settings.enableLocationHints}
          onToggle={(v) => onChange('enableLocationHints', v)}
        />

        <SettingCard
          icon={<Bell size={18} className="text-gp-primary" />}
          title="Order text updates"
          description="Simulated SMS updates for pickup reminders in checkout."
          checked={settings.enableOrderTexts}
          onToggle={(v) => onChange('enableOrderTexts', v)}
        />

        <SettingCard
          icon={<Sparkles size={18} className="text-gp-charcoal" />}
          title="Reduce motion"
          description="Minimize UI animations (helpful for accessibility)."
          checked={settings.reduceMotion}
          onToggle={(v) => onChange('reduceMotion', v)}
        />
      </div>
    </div>
  )
}

function SettingCard({
  icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/5">{icon}</div>
          <div>
            <div className="font-display text-lg font-semibold">{title}</div>
            <div className="mt-1 text-sm text-gp-charcoal/70">{description}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(!checked)}
          className={`gp-focus relative h-7 w-12 rounded-full p-1 transition ${
            checked ? 'bg-gp-secondary' : 'bg-black/10'
          }`}
          aria-label={`Toggle ${title}`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow-natural transition ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

