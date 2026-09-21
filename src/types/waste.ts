// ─── Waste categorisation types ──────────────────────────────────────────────

export type WasteCategory =
  | 'Paper'
  | 'Cardboard'
  | 'Plastic'
  | 'Glass'
  | 'Metal'
  | 'Textile'
  | 'E-waste'
  | 'Household'
  | 'Other';

export type RecoveryPath =
  | 'Recycle'
  | 'Reuse'
  | 'Upcycle'
  | 'Donate'
  | 'Specialized Handling';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

/** One classified waste item — every field the AI produced is user-editable. */
export interface WasteItem {
  /** Client-generated UUID used as React key and edit target. */
  id: string;
  /** Original sub-phrase from the user's raw input. */
  rawText: string;
  /** Cleaned display name, e.g. "newspaper", "broken charger". */
  item: string;
  /** AI-suggested category — user may override via dropdown. */
  category: WasteCategory;
  /** Free-form quantity string, e.g. "5 kg", "some", null when unknown. */
  quantity: string | null;
  /** Suggested recovery pathways — user may override via multi-select. */
  recoveryPaths: RecoveryPath[];
  confidence: ConfidenceLevel;
  /** One-sentence rationale shown below the table row. */
  reasoning: string;
  /** True for E-waste, batteries, hazardous chemicals — triggers WarningCard. */
  hasSpecialHandlingWarning?: boolean;
}

// ─── Organisation types ───────────────────────────────────────────────────────

export type VerificationStatus = 'Verified' | 'Unverified';

/** A curated local waste-recovery organisation. Never AI-generated. */
export interface Organization {
  id: string;
  name: string;
  /** Jaipur locality, or "Anywhere in Jaipur". */
  area: string;
  fullAddress: string;
  acceptedCategories: WasteCategory[];
  acceptedRecoveryTypes: RecoveryPath[];
  pickupAvailable: boolean;
  dropOffAvailable: boolean;
  /** Human-readable minimum, e.g. "No minimum" or "5 kg for pickup". */
  minimumQuantity: string;
  /** Placeholder pattern: "+91-XXXXX-XXXXX" until verified. */
  contactPhone: string;
  contactEmail?: string;
  operatingHours: string;
  verificationStatus: VerificationStatus;
  /** ISO date string, or null when Unverified. */
  lastVerifiedDate: string | null;
  notes?: string;
}

/** Result of matching an organisation against the user's current waste items. */
export interface OrganizationMatch {
  organization: Organization;
  matchedCategories: WasteCategory[];
  matchedRecoveryTypes: RecoveryPath[];
  /** Human-readable bullet chips shown in the "Why this org?" section. */
  matchedReasons: string[];
  /** Higher = better match; used for sorting. */
  score: number;
}

// ─── Impact / history types ───────────────────────────────────────────────────

/** One completed recovery event stored in localStorage. */
export interface RecoveryLogEntry {
  id: string;
  /** ISO date-time string. */
  timestamp: string;
  items: WasteItem[];
  organizationId: string;
  organizationName: string;
  area: string;
}

export interface ImpactSummary {
  collectionsCompleted: number;
  totalItemsCount: number;
  categoriesRecovered: WasteCategory[];
  /** Count of distinct org IDs used. */
  organizationsUsedCount: number;
}

// ─── AI adapter types ─────────────────────────────────────────────────────────

/** Which classifier produced the current results. */
export type ClassifierMode = 'ai' | 'local';

export interface ClassifyResult {
  items: WasteItem[];
  mode: ClassifierMode;
}
