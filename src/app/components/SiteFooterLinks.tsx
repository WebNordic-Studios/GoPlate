import { Link } from 'react-router-dom'

export function SiteFooterLinks() {
  return (
    <footer className="border-t border-black/5 bg-white/50">
      <div className="gp-container flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-xs font-semibold text-gp-charcoal/55">
        <Link to="/help" className="gp-focus hover:text-gp-primary">
          Help
        </Link>
        <Link to="/terms" className="gp-focus hover:text-gp-primary">
          Terms
        </Link>
        <Link to="/privacy" className="gp-focus hover:text-gp-primary">
          Privacy
        </Link>
        <Link to="/waitlists" className="gp-focus hover:text-gp-primary">
          Waitlists
        </Link>
        <Link to="/reports" className="gp-focus hover:text-gp-primary">
          My reports
        </Link>
      </div>
    </footer>
  )
}
