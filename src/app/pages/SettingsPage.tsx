import type { ReactNode } from 'react'
import {
  Accessibility,
  Bell,
  Coins,
  Download,
  Globe,
  LayoutGrid,
  MapPin,
  Monitor,
  Moon,
  Navigation,
  RotateCcw,
  Ruler,
  Shield,
  Sparkles,
  Sun,
  Tag,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CreditCard, Upload, UserRound } from 'lucide-react'
import type { Category, Plate, User } from '../../types'
import type { CurrencyCode, LocaleCode, Settings, ThemeMode } from '../../state/settingsModel'
import { exportLocalGoPlateData, importLocalGoPlateData } from '../../state/settingsModel'
import { BlockedCooksPanel } from '../components/BlockedCooksPanel'
import { Button } from '../../ui/Button'

const CATEGORY_OPTIONS: Category[] = ['All', 'Hot Meals', 'Bakery', 'Desserts', 'Vegan']

export function SettingsPage({
  user,
  plates,
  settings,
  onChange,
  onReset,
  onApplyMarketplaceZip,
  onApplyDefaultCategory,
  onUnblockCook,
  onApproveCookVerification,
  onImportComplete,
}: {
  user: User
  plates: Plate[]
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onReset: () => void
  onApplyMarketplaceZip: (zip: string) => void
  onApplyDefaultCategory: (category: Category) => void
  onUnblockCook: (cookId: string) => void
  onApproveCookVerification: () => void
  onImportComplete: () => void
}) {
  const importRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  return (
    <div className="gp-container pb-28 pt-6 md:pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Settings</div>
          <p className="mt-2 max-w-2xl text-sm text-gp-charcoal/70">
            Preferences persist in this browser via local storage. Changes apply across the marketplace, map, search,
            checkout, and the home hero.
          </p>
        </div>
        <Button variant="ghost" onClick={onReset} leftIcon={<RotateCcw size={18} />}>
          Reset all
        </Button>
      </div>

      <div className="mt-10 space-y-10">
        <SettingsSection
          title="Account"
          description="Addresses, payment methods, and phone verification used at checkout."
          icon={<CreditCard size={18} className="text-gp-secondary" />}
        >
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <p className="text-sm text-gp-charcoal/70">
              Manage saved addresses and cards so checkout can prefill your details.
            </p>
            <Link
              to="/account"
              className="gp-focus mt-4 inline-flex items-center gap-2 rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-natural"
            >
              <UserRound size={18} aria-hidden />
              Open account
            </Link>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Marketplace defaults"
          description="Control what zip and category load when you browse plates."
          icon={<Navigation size={18} className="text-gp-secondary" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50" htmlFor="default-zip">
                Default zip code
              </label>
              <input
                id="default-zip"
                inputMode="numeric"
                autoComplete="postal-code"
                value={settings.defaultZip}
                onChange={(e) => onChange('defaultZip', e.target.value)}
                className="gp-focus mt-2 w-full rounded-2xl border border-black/5 bg-white px-3 py-3 text-sm font-semibold text-gp-charcoal placeholder:text-gp-charcoal/40"
                placeholder="10012"
              />
              <p className="mt-2 text-xs text-gp-charcoal/60">
                Used as your saved home base. Apply when you want the marketplace header and search context to match.
              </p>
              <Button
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
                onClick={() => onApplyMarketplaceZip(settings.defaultZip)}
              >
                Use for marketplace &amp; search
              </Button>
            </div>

            <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50"
                htmlFor="default-category"
              >
                Default marketplace category
              </label>
              <select
                id="default-category"
                value={settings.defaultCategory}
                onChange={(e) => onChange('defaultCategory', e.target.value as Category)}
                className="gp-focus mt-2 w-full rounded-2xl border border-black/5 bg-white px-3 py-3 text-sm font-semibold text-gp-charcoal"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gp-charcoal/60">
                Sets which ribbon filter is selected when you open the marketplace from this device.
              </p>
              <Button
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
                onClick={() => onApplyDefaultCategory(settings.defaultCategory)}
              >
                Apply category now
              </Button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Discovery & distance"
          description="Tune how location and distance read across cards, detail, and the map."
          icon={<Ruler size={18} className="text-gp-primary" />}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <SettingCard
              icon={<MapPin size={18} className="text-gp-secondary" />}
              title="Location hints on home"
              description="Show the zip tip line and the decorative map pin beside the hero search field."
              checked={settings.enableLocationHints}
              onToggle={(v) => onChange('enableLocationHints', v)}
            />

            <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/5">
                  <Tag size={18} className="text-gp-charcoal" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold">Distance units</div>
                  <p className="mt-1 text-sm text-gp-charcoal/70">
                    Switch between miles and kilometers on plate cards, dish modals, and the map list.
                  </p>
                  <div className="mt-4 flex rounded-2xl bg-gp-bg p-1 ring-1 ring-black/5">
                    <button
                      type="button"
                      onClick={() => onChange('distanceUnit', 'mi')}
                      className={`gp-focus flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                        settings.distanceUnit === 'mi'
                          ? 'bg-white text-gp-charcoal shadow-sm'
                          : 'text-gp-charcoal/60 hover:text-gp-charcoal'
                      }`}
                    >
                      Miles
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange('distanceUnit', 'km')}
                      className={`gp-focus flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                        settings.distanceUnit === 'km'
                          ? 'bg-white text-gp-charcoal shadow-sm'
                          : 'text-gp-charcoal/60 hover:text-gp-charcoal'
                      }`}
                    >
                      Kilometers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Theme, layout density, motion, and what appears on listing cards."
          icon={<LayoutGrid size={18} className="text-gp-charcoal" />}
        >
          <div className="mb-4 rounded-[2rem] bg-gp-surface/80 p-5 shadow-natural ring-1 ring-black/5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/5">
                <Moon size={18} className="text-gp-charcoal" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-semibold">Theme</div>
                <p className="mt-1 text-sm text-gp-charcoal/70">
                  Pick a theme. "System" follows your OS preference.
                </p>
                <div className="mt-3 flex rounded-2xl bg-gp-bg p-1 ring-1 ring-black/5">
                  {(
                    [
                      { id: 'system', label: 'System', icon: <Monitor size={14} /> },
                      { id: 'light', label: 'Light', icon: <Sun size={14} /> },
                      { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
                    ] as { id: ThemeMode; label: string; icon: ReactNode }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange('themeMode', opt.id)}
                      className={`gp-focus inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                        settings.themeMode === opt.id
                          ? 'bg-gp-surface text-gp-charcoal shadow-sm'
                          : 'text-gp-charcoal/60 hover:text-gp-charcoal'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SettingCard
              icon={<Sparkles size={18} className="text-gp-charcoal" />}
              title="Reduce motion"
              description="Short-circuit transitions and hover motion across the shell (pairs with your OS setting in
              key components)."
              checked={settings.reduceMotion}
              onToggle={(v) => onChange('reduceMotion', v)}
            />

            <SettingCard
              icon={<LayoutGrid size={18} className="text-gp-secondary" />}
              title="Compact marketplace cards"
              description="Tighter imagery and padding on marketplace, search, and cook profile grids."
              checked={settings.compactDensity}
              onToggle={(v) => onChange('compactDensity', v)}
            />

            <SettingCard
              icon={<Tag size={18} className="text-gp-charcoal" />}
              title="Cook avatars on cards"
              description="Show the cook portrait next to their name on plate cards and in the dish modal header."
              checked={settings.showCookAvatars}
              onToggle={(v) => onChange('showCookAvatars', v)}
            />

            <SettingCard
              icon={<Bell size={18} className="text-gp-charcoal" />}
              title="Pickup windows on cards"
              description="Show the green pickup line under the title on marketplace-style cards."
              checked={settings.showPickupWindowsOnCards}
              onToggle={(v) => onChange('showPickupWindowsOnCards', v)}
            />

            <SettingCard
              icon={<Shield size={18} className="text-rose-600" />}
              title="Show allergen badges"
              description="Display allergen warnings on the plate detail screen so eaters can spot issues quickly."
              checked={settings.showAllergenBadges}
              onToggle={(v) => onChange('showAllergenBadges', v)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Currency & locale"
          description="Pick the currency and number format used across the marketplace and checkout."
          icon={<Coins size={18} className="text-gp-primary" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50" htmlFor="currency">
                Currency
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => onChange('currency', e.target.value as CurrencyCode)}
                className="gp-focus mt-2 w-full rounded-2xl border border-black/5 bg-gp-surface px-3 py-3 text-sm font-semibold text-gp-charcoal"
              >
                {(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'] as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gp-charcoal/60">
                Prototype FX is a flat approximation. A real product would refresh rates and persist a server-side currency
                preference.
              </p>
            </div>
            <div className="rounded-2xl bg-gp-bg p-4 ring-1 ring-black/5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gp-charcoal/50" htmlFor="locale">
                <Globe size={14} className="inline-block align-text-bottom" /> Locale
              </label>
              <select
                id="locale"
                value={settings.locale}
                onChange={(e) => onChange('locale', e.target.value as LocaleCode)}
                className="gp-focus mt-2 w-full rounded-2xl border border-black/5 bg-gp-surface px-3 py-3 text-sm font-semibold text-gp-charcoal"
              >
                {(['en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP'] as LocaleCode[]).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gp-charcoal/60">
                Affects number formatting via <span className="font-mono text-[11px]">Intl.NumberFormat</span>.
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Accessibility"
          description="Sharper focus for keyboard navigation."
          icon={<Accessibility size={18} className="text-gp-secondary" />}
        >
          <SettingCard
            icon={<Accessibility size={18} className="text-gp-primary" />}
            title="Stronger focus rings"
            description="Use a thicker orange outline on focused controls for higher visibility."
            checked={settings.strongerFocusRings}
            onToggle={(v) => onChange('strongerFocusRings', v)}
          />
        </SettingsSection>

        <SettingsSection
          title="Ordering & checkout"
          description="Control confirmations and the simulated SMS preview on the checkout screen."
          icon={<Bell size={18} className="text-gp-primary" />}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <SettingCard
              icon={<Bell size={18} className="text-gp-primary" />}
              title="Pickup SMS preview"
              description="Show a sample text reminder block while reviewing checkout (still fully local / simulated)."
              checked={settings.enableOrderTexts}
              onToggle={(v) => onChange('enableOrderTexts', v)}
            />

            <SettingCard
              icon={<Shield size={18} className="text-gp-secondary" />}
              title="Confirm before reserving"
              description="Require an extra browser confirmation when you tap “Confirm reservation”."
              checked={settings.confirmBeforeReserve}
              onToggle={(v) => onChange('confirmBeforeReserve', v)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Your data on this device"
          description="Export what GoPlate stores locally so you can back up or inspect it."
          icon={<Download size={18} className="text-gp-secondary" />}
        >
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <div className="font-display text-lg font-semibold">Download local backup</div>
            <p className="mt-2 text-sm text-gp-charcoal/70">
              Includes marketplace, settings, and account data from{' '}
              <span className="font-mono text-xs">localStorage</span>. Import replaces keys in this browser.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => exportLocalGoPlateData()} leftIcon={<Download size={18} />}>
                Export JSON
              </Button>
              <Button variant="ghost" onClick={() => importRef.current?.click()} leftIcon={<Upload size={18} />}>
                Import JSON
              </Button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  const result = await importLocalGoPlateData(file)
                  if (result.ok) {
                    setImportMsg('Import complete — reloading…')
                    onImportComplete()
                  } else {
                    setImportMsg(result.error)
                  }
                }}
              />
            </div>
            {importMsg ? <p className="mt-3 text-sm font-semibold text-gp-charcoal/70">{importMsg}</p> : null}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Blocked cooks"
          description="Cooks you have hidden from browse and search."
          icon={<UserRound size={18} className="text-gp-charcoal/60" />}
        >
          <BlockedCooksPanel user={user} plates={plates} onUnblock={onUnblockCook} />
        </SettingsSection>

        <SettingsSection
          title="Cook verification"
          description="Food-handler badge shown on your cook profile."
          icon={<BadgeCheck size={18} className="text-gp-secondary" />}
        >
          <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
            <p className="text-sm text-gp-charcoal/70">
              Status:{' '}
              <span className="font-semibold capitalize">{user.cookVerification ?? 'none'}</span>
            </p>
            {user.cookVerification === 'pending' ? (
              <Button variant="secondary" className="mt-4" onClick={onApproveCookVerification}>
                Simulate approval (demo)
              </Button>
            ) : user.cookVerification !== 'verified' ? (
              <p className="mt-3 text-xs text-gp-charcoal/60">
                Submit documents from <Link to="/cook" className="font-semibold text-gp-secondary underline">Create</Link>.
              </p>
            ) : (
              <p className="mt-3 text-xs font-semibold text-gp-secondary">Verified cook badge active.</p>
            )}
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-natural ring-1 ring-black/5">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold tracking-tight text-gp-charcoal">{title}</h2>
          <p className="mt-1 text-sm text-gp-charcoal/65">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
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
          className={`gp-focus relative h-7 w-12 shrink-0 rounded-full p-1 transition ${
            checked ? 'bg-gp-secondary' : 'bg-black/10'
          }`}
          role="switch"
          aria-checked={checked}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white shadow-natural transition ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
