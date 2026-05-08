import { Settings, Shield, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

export function ProfilePage() {
  return (
    <div className="gp-container pb-28 pt-6 md:pb-10">
      <div className="font-display text-2xl font-semibold">Profile</div>
      <div className="mt-1 text-sm text-gp-charcoal/65">
        Polished UI shell for the prototype — user auth is intentionally mocked.
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Taste preferences" icon={<Sparkles size={18} className="text-gp-primary" />}>
          Vegan-friendly filters, allergy tags, and saved cooks would live here.
        </Card>
        <Card title="Privacy + pickup" icon={<Shield size={18} className="text-gp-secondary" />}>
          Pickup areas stay blurred until checkout is confirmed.
        </Card>
        <Card title="Settings" icon={<Settings size={18} className="text-gp-charcoal" />}>
          Notifications, location permissions, and payments (in a real build).
        </Card>
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-natural ring-1 ring-black/5">
      <div className="flex items-center gap-2 font-display text-lg font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-2 text-sm text-gp-charcoal/70">{children}</div>
    </div>
  )
}

