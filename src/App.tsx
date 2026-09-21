import { useState, useCallback } from 'react';
import type { WasteItem, OrganizationMatch, RecoveryLogEntry } from './types/waste';
import { classifyWaste } from './lib/ai';
import { classifyWasteWithKeywords } from './lib/keywordClassifier';
import { matchOrganizations } from './lib/matchingEngine';
import { loadLog, appendEntry, deleteEntry, computeImpact } from './lib/storage';

import orgsData from './data/organizations.json';
import type { Organization } from './types/waste';

import Header from './components/Header';
import WasteInput from './components/WasteInput';
import WasteTable from './components/WasteTable';
import WarningCard from './components/WarningCard';
import AreaFilter from './components/AreaFilter';
import OrgList from './components/OrgList';
import ImpactDashboard from './components/ImpactDashboard';
import RecoveryHistory from './components/RecoveryHistory';
import DidYouKnow from './components/DidYouKnow';

const ORGANIZATIONS = orgsData as Organization[];

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function App() {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [lastInput, setLastInput] = useState('');
  const [selectedArea, setSelectedArea] = useState('Anywhere in Jaipur');

  // ── History ────────────────────────────────────────────────────────────────
  const [log, setLog] = useState<RecoveryLogEntry[]>(() => loadLog());

  const refreshLog = useCallback(() => setLog(loadLog()), []);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'classifier' | 'history'>('classifier');

  // ── Classify ───────────────────────────────────────────────────────────────
  async function handleAnalyse(text: string) {
    setLastInput(text);
    setAppState('loading');
    setErrorMsg('');
    try {
      const result = await classifyWaste(text);
      setWasteItems(result.items);
      setAppState('results');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setAppState('error');
    }
  }

  function handleRetry() {
    if (lastInput) handleAnalyse(lastInput);
  }

  function handleFallback() {
    const items = classifyWasteWithKeywords(lastInput);
    setWasteItems(items);
    setAppState('results');
    setErrorMsg('');
  }

  // ── Re-match when items or area change ────────────────────────────────────
  const matches: OrganizationMatch[] =
    appState === 'results'
      ? matchOrganizations(ORGANIZATIONS, wasteItems, selectedArea)
      : [];

  // ── Mark as recovered ─────────────────────────────────────────────────────
  function handleMarkDone(match: OrganizationMatch) {
    const entry: RecoveryLogEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: wasteItems,
      organizationId: match.organization.id,
      organizationName: match.organization.name,
      area: match.organization.area,
    };
    appendEntry(entry);
    refreshLog();
    // Provide feedback
    alert(
      `✅ Logged! "${wasteItems.map((i) => i.item).join(', ')}" marked as recovered with ${match.organization.name}.`
    );
  }

  // ── Delete history entry ──────────────────────────────────────────────────
  function handleDeleteEntry(id: string) {
    deleteEntry(id);
    refreshLog();
  }

  const impact = computeImpact(log);

  // ── Tab button helper ──────────────────────────────────────────────────────
  function tabClass(tab: typeof activeTab) {
    return `px-4 py-2 text-sm font-medium rounded-lg transition focus-ring ${
      activeTab === tab
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
    }`;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* ── Tab bar ── */}
        <nav className="flex gap-2" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => setActiveTab('classifier')}
            className={tabClass('classifier')}
            aria-current={activeTab === 'classifier' ? 'page' : undefined}
          >
            ♻️ Waste Classifier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={tabClass('history')}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            📊 Impact &amp; History
            {log.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                {log.length}
              </span>
            )}
          </button>
        </nav>

        {/* ═══════════ CLASSIFIER TAB ═══════════ */}
        {activeTab === 'classifier' && (
          <div className="space-y-6">
            {/* Educational tip */}
            <DidYouKnow />

            {/* Waste input */}
            <WasteInput onSubmit={handleAnalyse} isLoading={appState === 'loading'} />

            {/* Error state */}
            {appState === 'error' && (
              <div className="card p-5 border-danger-200 bg-danger-50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>❌</span>
                  <h3 className="font-semibold text-danger-700">Analysis failed</h3>
                </div>
                <p className="text-sm text-danger-700">{errorMsg || 'Could not reach the AI service.'}</p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-sm px-4 py-2 rounded-xl bg-danger-600 text-white hover:bg-danger-700 transition focus-ring"
                  >
                    🔄 Retry
                  </button>
                  <button
                    type="button"
                    onClick={handleFallback}
                    className="text-sm px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition focus-ring"
                  >
                    Continue with local classifier instead
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {appState === 'results' && wasteItems.length > 0 && (
              <>
                {/* Hazardous warning */}
                <WarningCard items={wasteItems} />

                {/* Editable table */}
                <WasteTable items={wasteItems} onChange={setWasteItems} />

                {/* Area filter + org matching */}
                <section className="space-y-4">
                  <div className="card p-5 space-y-4">
                    <h2 className="section-title flex items-center gap-2 mb-0">
                      <span aria-hidden>🏢</span> Matching Recovery Organisations
                    </h2>
                    <AreaFilter value={selectedArea} onChange={setSelectedArea} />
                  </div>
                  <OrgList matches={matches} onMarkDone={handleMarkDone} />
                </section>
              </>
            )}

            {/* Empty results */}
            {appState === 'results' && wasteItems.length === 0 && (
              <div className="card p-8 text-center text-stone-400 space-y-2">
                <span className="text-4xl" aria-hidden>🤔</span>
                <p className="text-sm font-medium">No items detected</p>
                <p className="text-xs">
                  Try describing your waste more specifically, e.g. "5 kg newspapers, old phone".
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ HISTORY TAB ═══════════ */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <ImpactDashboard summary={impact} />
            <RecoveryHistory log={log} onDelete={handleDeleteEntry} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200 py-6">
        <p className="text-center text-xs text-stone-400">
          Built for the 1M1B × IBM SkillsBuild AI for Sustainability Internship · SDG 12 ·{' '}
          <span aria-hidden>♻️</span> Jaipur, India
        </p>
        <p className="text-center text-xs text-stone-300 mt-1">
          Organisation data is placeholder only — verify all details before use.
          No personal data is collected or stored externally.
        </p>
      </footer>
    </div>
  );
}
