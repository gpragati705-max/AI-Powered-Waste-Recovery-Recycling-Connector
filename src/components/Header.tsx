import { AI_MODE_ACTIVE, AI_MODEL_NAME } from '../lib/ai';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <span className="text-2xl select-none" aria-hidden>♻️</span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-stone-800 leading-tight truncate">
            Waste Recovery &amp; Recycling Connector
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Jaipur, India · SDG 12</p>
        </div>

        {/* Mode badge */}
        {AI_MODE_ACTIVE ? (
          <span className="badge-mode-ai shrink-0">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" aria-hidden />
            AI mode: {AI_MODEL_NAME}
          </span>
        ) : (
          <span className="badge-mode shrink-0">
            <span className="h-2 w-2 rounded-full bg-stone-400" aria-hidden />
            Local classifier mode
          </span>
        )}
      </div>
    </header>
  );
}
