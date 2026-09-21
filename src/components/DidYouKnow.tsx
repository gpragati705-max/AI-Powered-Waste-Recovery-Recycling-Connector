import { useState, useCallback } from 'react';
import { educationalTips } from '../data/educationalTips';

export default function DidYouKnow() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * educationalTips.length));

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % educationalTips.length);
  }, []);

  return (
    <aside className="rounded-xl bg-teal-50 border border-teal-200 p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-teal-800 flex items-center gap-2">
          <span aria-hidden>💡</span> Did you know?
        </h2>
        <button
          type="button"
          onClick={next}
          className="text-xs text-teal-600 hover:text-teal-800 hover:underline transition focus-ring rounded"
          aria-label="Show next tip"
        >
          Next tip →
        </button>
      </div>
      <p className="text-sm text-teal-900 leading-relaxed">
        {educationalTips[idx]}
      </p>
      <p className="text-xs text-teal-500">
        {idx + 1} of {educationalTips.length} tips
      </p>
    </aside>
  );
}
