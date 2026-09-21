export const JAIPUR_AREAS = [
  'Anywhere in Jaipur',
  'Malviya Nagar',
  'Vaishali Nagar',
  'C-Scheme',
  'Mansarovar',
  'Raja Park',
  'Tonk Road',
  'Amer',
  'Jagatpura',
  'Johari Bazar',
  'Sanganer',
] as const;

export type JaipurArea = (typeof JAIPUR_AREAS)[number];

interface Props {
  value: string;
  onChange: (area: string) => void;
}

export default function AreaFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label htmlFor="area-select" className="text-sm font-medium text-stone-700 shrink-0">
        📍 Your area in Jaipur:
      </label>
      <select
        id="area-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-xl border border-stone-200 bg-white px-3 py-2
                   text-stone-700 focus-ring cursor-pointer shadow-sm"
        aria-label="Select your area in Jaipur"
      >
        {JAIPUR_AREAS.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
    </div>
  );
}
