import type { RecoveryLogEntry } from '../types/waste';
import { groupByMonth } from '../lib/storage';

interface Props {
  log: RecoveryLogEntry[];
  onDelete: (id: string) => void;
}

export default function RecoveryHistory({ log, onDelete }: Props) {
  const groups = groupByMonth(log);

  if (groups.length === 0) {
    return (
      <section className="card p-6 text-center text-stone-400 space-y-2">
        <span className="text-4xl block" aria-hidden>📂</span>
        <p className="text-sm font-medium">No recovery history yet</p>
        <p className="text-xs">
          Each time you click "Mark as Recovered" on an organisation card, it will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-6 space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <span aria-hidden>🗓️</span> Recovery History
      </h2>

      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-1">
            {group.label}
          </h3>

          {group.entries.map((entry) => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            const timeStr = date.toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit',
            });

            const cats = [...new Set(entry.items.map((i) => i.category))];

            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100"
              >
                {/* Date column */}
                <div className="shrink-0 text-center w-12">
                  <p className="text-lg font-bold text-brand-700">
                    {date.getDate()}
                  </p>
                  <p className="text-xs text-stone-400 leading-none">
                    {date.toLocaleDateString('en-IN', { month: 'short' })}
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{entry.organizationName}</p>
                  <p className="text-xs text-stone-400">{entry.area} · {dateStr} at {timeStr}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.items.map((item) => (
                      <span
                        key={item.id}
                        className="text-xs px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600"
                      >
                        {item.item}
                        {item.quantity ? ` · ${item.quantity}` : ''}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cats.map((cat) => (
                      <span key={cat} className="chip text-xs">{cat}</span>
                    ))}
                  </div>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="shrink-0 text-stone-300 hover:text-danger-600 transition focus-ring rounded"
                  aria-label={`Delete entry for ${entry.organizationName} on ${dateStr}`}
                  title="Delete this entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
