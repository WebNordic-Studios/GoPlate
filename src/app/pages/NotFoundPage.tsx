import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'
import { EmptyState } from '../../ui/EmptyState'

export function NotFoundPage() {
  return (
    <div className="gp-container pb-28 pt-10 md:pb-12">
      <EmptyState
        icon={<MapPinOff size={22} />}
        title="Page not found"
        description="That route does not exist. Head back to the marketplace or search for a dish."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/market"
              className="gp-focus inline-flex items-center justify-center rounded-2xl bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-natural"
            >
              Browse marketplace
            </Link>
            <Link
              to="/search"
              className="gp-focus inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-gp-charcoal hover:bg-black/5"
            >
              Search
            </Link>
          </div>
        }
      />
    </div>
  )
}
