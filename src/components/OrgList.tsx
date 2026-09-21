import type { OrganizationMatch } from '../types/waste';
import OrgCard from './OrgCard';

interface Props {
  matches: OrganizationMatch[];
  onMarkDone: (match: OrganizationMatch) => void;
}

export default function OrgList({ matches, onMarkDone }: Props) {
  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center text-stone-400 space-y-2">
        <span className="text-4xl block" aria-hidden>🔍</span>
        <p className="text-sm font-medium">No matching organisations found</p>
        <p className="text-xs">
          Try selecting "Anywhere in Jaipur" or adjust the category of an item in the table above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-400">
        {matches.length} organisation{matches.length !== 1 ? 's' : ''} matched · sorted by relevance
      </p>
      {matches.map((match) => (
        <OrgCard key={match.organization.id} match={match} onMarkDone={onMarkDone} />
      ))}
    </div>
  );
}
