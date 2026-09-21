import type { RecoveryLogEntry, ImpactSummary, WasteCategory } from '../types/waste';

const STORAGE_KEY = 'waste_recovery_log';

// ─── Read ──────────────────────────────────────────────────────────────────────

export function loadLog(): RecoveryLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export function appendEntry(entry: RecoveryLogEntry): void {
  const log = loadLog();
  log.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function deleteEntry(id: string): void {
  const log = loadLog().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

// ─── Derived stats ─────────────────────────────────────────────────────────────

export function computeImpact(log: RecoveryLogEntry[]): ImpactSummary {
  const categoriesSet = new Set<WasteCategory>();
  const orgsSet = new Set<string>();
  let totalItems = 0;

  for (const entry of log) {
    orgsSet.add(entry.organizationId);
    for (const item of entry.items) {
      categoriesSet.add(item.category);
      totalItems++;
    }
  }

  return {
    collectionsCompleted: log.length,
    totalItemsCount: totalItems,
    categoriesRecovered: Array.from(categoriesSet),
    organizationsUsedCount: orgsSet.size,
  };
}

// ─── Group by month ────────────────────────────────────────────────────────────

export type MonthGroup = {
  label: string; // e.g. "September 2026"
  entries: RecoveryLogEntry[];
};

export function groupByMonth(log: RecoveryLogEntry[]): MonthGroup[] {
  const map = new Map<string, RecoveryLogEntry[]>();

  for (const entry of [...log].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )) {
    const d = new Date(entry.timestamp);
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }

  return Array.from(map.entries()).map(([label, entries]) => ({ label, entries }));
}
