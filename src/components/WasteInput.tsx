import { useState } from 'react';

const SAMPLES = [
  '5 kg newspapers, some cardboard boxes, old clothes and a broken charger',
  '3 glass bottles, 2 kg plastic bottles, old mobile phone',
  'Old laptop, printer cables, 10 kg scrap metal, cotton kurtas',
];

interface Props {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function WasteInput({ onSubmit, isLoading }: Props) {
  const [text, setText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <section className="card p-6">
      <h2 className="section-title flex items-center gap-2">
        <span aria-hidden>📝</span> What waste do you have?
      </h2>
      <p className="text-sm text-stone-500 mb-4">
        Describe your waste items in plain language — quantities, materials, condition. The AI will
        categorise each item and suggest a recovery path.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          id="waste-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. 5 kg newspapers, some cardboard boxes, old clothes and a broken charger"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3
                     text-stone-800 placeholder-stone-400 text-sm resize-none
                     focus-ring focus:border-brand-400 focus:bg-white transition"
          disabled={isLoading}
          aria-label="Describe your waste items"
        />

        {/* Sample prompts */}
        <div className="space-y-1.5">
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">
            Try a sample:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setText(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-stone-200
                           text-stone-500 hover:border-brand-400 hover:text-brand-700
                           hover:bg-brand-50 transition"
                disabled={isLoading}
              >
                {s.length > 55 ? s.slice(0, 55) + '…' : s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-brand-600 text-white text-sm font-medium
                     hover:bg-brand-700 active:bg-brand-800
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition focus-ring"
          id="analyse-btn"
        >
          {isLoading ? (
            <>
              <span className="spinner h-4 w-4" />
              Analysing your waste…
            </>
          ) : (
            <>
              <span aria-hidden>🔍</span> Analyse Waste
            </>
          )}
        </button>
      </form>
    </section>
  );
}
