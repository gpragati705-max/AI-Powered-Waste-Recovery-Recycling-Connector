import type { OrganizationMatch } from '../types/waste';

interface Props {
  match: OrganizationMatch;
  onMarkDone: (match: OrganizationMatch) => void;
}

export default function OrgCard({ match, onMarkDone }: Props) {
  const { organization: org, matchedReasons } = match;
  const isUnverified = org.verificationStatus === 'Unverified';

  return (
    <article className="card card-hover p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-800 text-base leading-snug">{org.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <span aria-hidden>📍</span> {org.area}
          </p>
        </div>

        {/* Verification badge */}
        {isUnverified ? (
          <span className="badge-unverified shrink-0" title="This is placeholder data. Verify before use.">
            ⚠ Unverified — placeholder data
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-300 shrink-0">
            ✓ Verified
            {org.lastVerifiedDate ? ` · ${org.lastVerifiedDate}` : ''}
          </span>
        )}
      </div>

      {/* Why this organisation */}
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
          Why this organisation?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {matchedReasons.map((reason) => (
            <span key={reason} className="chip">{reason}</span>
          ))}
        </div>
      </div>

      {/* Details grid */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-stone-400">Materials accepted</dt>
          <dd className="text-stone-700 font-medium">{org.acceptedCategories.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Recovery type</dt>
          <dd className="text-stone-700 font-medium">{org.acceptedRecoveryTypes.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Min. quantity</dt>
          <dd className="text-stone-700 font-medium">{org.minimumQuantity}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Collection</dt>
          <dd className="text-stone-700 font-medium">
            {[org.pickupAvailable && 'Pickup', org.dropOffAvailable && 'Drop-off']
              .filter(Boolean)
              .join(' · ') || 'N/A'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Hours</dt>
          <dd className="text-stone-700 font-medium">{org.operatingHours}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Contact</dt>
          <dd className="text-stone-700 font-medium">{org.contactPhone}</dd>
        </div>
      </dl>

      {/* Address */}
      <p className="text-xs text-stone-500 flex gap-1">
        <span aria-hidden>🏠</span>
        <span>{org.fullAddress}</span>
      </p>

      {/* Notes */}
      {org.notes && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
          ℹ {org.notes}
        </p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={() => onMarkDone(match)}
        className="w-full mt-1 inline-flex items-center justify-center gap-2
                   px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium
                   hover:bg-brand-700 active:bg-brand-800 transition focus-ring"
        id={`mark-done-${org.id}`}
      >
        <span aria-hidden>✅</span> Mark as Recovered with {org.name}
      </button>
    </article>
  );
}
