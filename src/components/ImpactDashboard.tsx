import type { ImpactSummary } from '../types/waste';

const CATEGORY_EMOJI: Record<string, string> = {
  Paper: '📰', Cardboard: '📦', Plastic: '🧴', Glass: '🍶',
  Metal: '🔩', Textile: '👕', 'E-waste': '💻', Household: '🏠', Other: '♻️',
};

interface Props {
  summary: ImpactSummary;
}

export default function ImpactDashboard({ summary }: Props) {
  const stats = [
    {
      id: 'collections',
      label: 'Collections completed',
      value: summary.collectionsCompleted,
      icon: '✅',
    },
    {
      id: 'items',
      label: 'Total items logged',
      value: summary.totalItemsCount,
      icon: '📋',
    },
    {
      id: 'categories',
      label: 'Categories recovered',
      value: summary.categoriesRecovered.length,
      icon: '🗂️',
    },
    {
      id: 'orgs',
      label: 'Organizations connected',
      value: summary.organizationsUsedCount,
      icon: '🤝',
    },
  ];

  return (
    <section className="card p-6 space-y-5">
      <h2 className="section-title flex items-center gap-2">
        <span aria-hidden>📊</span> Your Recovery Impact
      </h2>

      {/* Stat counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.id} className="bg-stone-50 rounded-xl p-4 text-center border border-stone-100">
            <div className="text-2xl mb-1" aria-hidden>{s.icon}</div>
            <div className="text-2xl font-bold text-brand-700">{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Categories recovered */}
      {summary.categoriesRecovered.length > 0 && (
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
            Categories recovered
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.categoriesRecovered.map((cat) => (
              <span key={cat} className="chip">
                {CATEGORY_EMOJI[cat] ?? '♻️'} {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.collectionsCompleted === 0 && (
        <p className="text-xs text-stone-400 text-center py-2">
          No collections logged yet — use "Mark as Recovered" on an organisation card to start tracking.
        </p>
      )}
    </section>
  );
}
