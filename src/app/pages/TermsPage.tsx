import { LegalDocLayout } from '../components/LegalDocLayout'

export function TermsPage() {
  return (
    <LegalDocLayout title="Terms of Service" updated="May 2026">
      <p>
        GoPlate connects home cooks with neighbors seeking meals. By using GoPlate you agree these terms and our home-kitchen
        liability notice shown at signup and checkout.
      </p>
      <p>
        Cooks represent that listings are accurate, allergens are disclosed, and food is prepared in a private home kitchen
        not subject to restaurant inspection. Buyers accept variability inherent to home cooking.
      </p>
      <p>
        Reservations may be cancelled by buyers while Reserved, or declined by cooks when they cannot fulfill. Payment
        processing will follow published refund rules when live payments launch.
      </p>
      <p>We may suspend accounts that violate community guidelines or receive substantiated reports.</p>
    </LegalDocLayout>
  )
}
