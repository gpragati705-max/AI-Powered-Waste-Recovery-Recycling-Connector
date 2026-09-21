import type { WasteItem, WasteCategory, RecoveryPath, ConfidenceLevel } from '../types/waste';

const CATEGORIES: WasteCategory[] = [
  'Paper', 'Cardboard', 'Plastic', 'Glass', 'Metal', 'Textile', 'E-waste', 'Household', 'Other',
];
const PATHS: RecoveryPath[] = [
  'Recycle', 'Reuse', 'Upcycle', 'Donate', 'Specialized Handling',
];

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const cls =
    level === 'High' ? 'badge-high' : level === 'Medium' ? 'badge-medium' : 'badge-low';
  const dot =
    level === 'High'
      ? 'bg-green-500'
      : level === 'Medium'
      ? 'bg-amber-500'
      : 'bg-red-500';
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {level}
    </span>
  );
}

interface Props {
  items: WasteItem[];
  onChange: (updated: WasteItem[]) => void;
}

export default function WasteTable({ items, onChange }: Props) {
  function update(id: string, patch: Partial<WasteItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function togglePath(item: WasteItem, path: RecoveryPath) {
    const has = item.recoveryPaths.includes(path);
    const next = has
      ? item.recoveryPaths.filter((p) => p !== path)
      : [...item.recoveryPaths, path];
    if (next.length > 0) update(item.id, { recoveryPaths: next });
  }

  if (items.length === 0) return null;

  return (
    <section className="card overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <span aria-hidden>📋</span> Waste Summary
        </h2>
        <p className="text-xs text-stone-400">
          All fields are editable — correct any AI suggestion before matching.
        </p>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Recovery Paths</th>
              <th className="px-4 py-3">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                {/* Item name */}
                <td className="px-4 py-3">
                  <span className="font-medium text-stone-800 capitalize">{item.item}</span>
                  <p className="text-xs text-stone-400 mt-0.5 italic">"{item.rawText}"</p>
                  <p className="text-xs text-stone-400 mt-0.5">{item.reasoning}</p>
                </td>

                {/* Category dropdown */}
                <td className="px-4 py-3">
                  <select
                    value={item.category}
                    onChange={(e) =>
                      update(item.id, { category: e.target.value as WasteCategory })
                    }
                    className="text-xs rounded-lg border border-stone-200 bg-white px-2 py-1.5
                               text-stone-700 focus-ring cursor-pointer"
                    aria-label={`Category for ${item.item}`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>

                {/* Quantity text input */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.quantity ?? ''}
                    onChange={(e) =>
                      update(item.id, { quantity: e.target.value || null })
                    }
                    placeholder="e.g. 5 kg"
                    className="w-24 text-xs rounded-lg border border-stone-200 bg-white px-2 py-1.5
                               text-stone-700 focus-ring"
                    aria-label={`Quantity for ${item.item}`}
                  />
                </td>

                {/* Recovery paths multi-select */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {PATHS.map((path) => {
                      const active = item.recoveryPaths.includes(path);
                      return (
                        <button
                          key={path}
                          type="button"
                          onClick={() => togglePath(item, path)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition
                            ${active
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-stone-500 border-stone-200 hover:border-brand-400 hover:text-brand-700'
                            }`}
                          aria-pressed={active}
                        >
                          {path}
                        </button>
                      );
                    })}
                  </div>
                </td>

                {/* Confidence badge */}
                <td className="px-4 py-3">
                  <ConfidenceBadge level={item.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-stone-800 capitalize">{item.item}</p>
                <p className="text-xs text-stone-400 italic">"{item.rawText}"</p>
              </div>
              <ConfidenceBadge level={item.confidence} />
            </div>
            <p className="text-xs text-stone-500">{item.reasoning}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-stone-400 mb-1">Category</p>
                <select
                  value={item.category}
                  onChange={(e) =>
                    update(item.id, { category: e.target.value as WasteCategory })
                  }
                  className="w-full text-xs rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-stone-700 focus-ring"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Quantity</p>
                <input
                  type="text"
                  value={item.quantity ?? ''}
                  onChange={(e) => update(item.id, { quantity: e.target.value || null })}
                  placeholder="e.g. 5 kg"
                  className="w-full text-xs rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-stone-700 focus-ring"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Recovery Paths</p>
              <div className="flex flex-wrap gap-1.5">
                {PATHS.map((path) => {
                  const active = item.recoveryPaths.includes(path);
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => togglePath(item, path)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition
                        ${active
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-brand-400'
                        }`}
                      aria-pressed={active}
                    >
                      {path}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
