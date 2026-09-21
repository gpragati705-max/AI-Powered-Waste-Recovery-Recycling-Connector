import type { WasteItem } from '../types/waste';

const HAZARD_CATEGORIES = ['E-waste', 'Other'] as const;
const HAZARD_KEYWORDS = ['battery', 'batteries', 'chemical', 'paint', 'hazard', 'acid', 'solvent'];

function isHazardous(item: WasteItem): boolean {
  if (item.hasSpecialHandlingWarning) return true;
  if (HAZARD_CATEGORIES.includes(item.category as 'E-waste' | 'Other')) return true;
  const lower = item.item.toLowerCase() + ' ' + item.rawText.toLowerCase();
  return HAZARD_KEYWORDS.some((kw) => lower.includes(kw));
}

interface Props {
  items: WasteItem[];
}

export default function WarningCard({ items }: Props) {
  const hazardous = items.filter(isHazardous);
  if (hazardous.length === 0) return null;

  const isEwaste = hazardous.some((i) => i.category === 'E-waste');
  const isChem = hazardous.some(
    (i) => i.category === 'Other' && HAZARD_KEYWORDS.some((kw) => i.item.toLowerCase().includes(kw))
  );

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-danger-50 p-5 space-y-3"
      aria-label="Hazardous waste warning"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>⚠️</span>
        <h3 className="font-semibold text-danger-700">
          Responsible Disposal Required
        </h3>
      </div>

      <p className="text-sm text-danger-700">
        The following items <strong>must NOT go in general household waste</strong>. Improper
        disposal can contaminate soil and groundwater and is harmful to health.
      </p>

      <ul className="space-y-1">
        {hazardous.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm text-danger-700">
            <span aria-hidden className="mt-0.5">•</span>
            <span>
              <strong className="capitalize">{item.item}</strong>
              {item.quantity ? ` (${item.quantity})` : ''}
              {' '}— requires{' '}
              <span className="font-medium">
                {item.category === 'E-waste'
                  ? 'certified e-waste recycling'
                  : 'specialised / authorised disposal'}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-red-200 pt-3 space-y-1">
        {isEwaste && (
          <p className="text-xs text-danger-700 font-medium">
            🔌 E-waste: Take to a certified collection centre or arrange pickup through a verified e-waste recycler.
          </p>
        )}
        {isChem && (
          <p className="text-xs text-danger-700 font-medium">
            🧪 Chemicals / Hazardous: Contact your local municipal authority for authorised disposal instructions.
          </p>
        )}
        <p className="text-xs text-danger-700 font-medium">
          🔋 Batteries: Never discard in regular bins — drop at electronics stores or authorised collection points.
        </p>
      </div>
    </div>
  );
}
