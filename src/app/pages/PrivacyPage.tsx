import { LegalDocLayout } from '../components/LegalDocLayout'

export function PrivacyPage() {
  return (
    <LegalDocLayout title="Privacy Policy" updated="May 2026">
      <p>
        We collect account information (email, display name, phone), order and message data necessary to coordinate pickup,
        and optional profile details you provide.
      </p>
      <p>
        Exact pickup addresses are shared only with buyers who have an active reservation for your listing. Public listings
        show neighborhood-level location only.
      </p>
      <p>
        In this prototype, data is stored locally in your browser for demos. A production service would use encrypted
        storage, access controls, and a published data retention schedule.
      </p>
      <p>You may request export or deletion of your account data once account management APIs are available.</p>
    </LegalDocLayout>
  )
}
