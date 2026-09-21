/**
 * ─── AI Adapter — src/lib/ai.ts ───────────────────────────────────────────────
 *
 * SECURITY NOTICE:
 * VITE_ environment variables are embedded in the client-side JavaScript bundle
 * at build time and are visible to any user who inspects the page source or
 * network requests. This is acceptable for local demos and hackathons.
 * For a production deployment, all AI API calls must be proxied through a
 * backend server so the API key is never exposed to end users.
 *
 * The API key is NEVER logged to the console — not even partially.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { WasteItem, WasteCategory, RecoveryPath, ConfidenceLevel, ClassifyResult } from '../types/waste';
import { classifyWasteWithKeywords } from './keywordClassifier';

// ─── Env config ────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;
const BASE_URL = (import.meta.env.VITE_AI_BASE_URL as string | undefined) ?? 'https://api.openai.com';
const MODEL = (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'gpt-4o-mini';

export const AI_MODE_ACTIVE = Boolean(API_KEY && API_KEY.trim().length > 0);
export const AI_MODEL_NAME = MODEL;

// ─── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a waste-categorisation assistant for Jaipur, India.
Given a natural-language description of waste items, return ONLY a valid JSON array.
Each element must have exactly these fields:
  rawText     : string  — the original sub-phrase from the input
  item        : string  — clean item name (e.g. "newspaper", "broken charger")
  category    : one of Paper | Cardboard | Plastic | Glass | Metal | Textile | E-waste | Household | Other
  quantity    : string or null  — e.g. "5 kg", "some", null
  recoveryPaths : array of one or more of: Recycle | Reuse | Upcycle | Donate | Specialized Handling
  confidence  : High | Medium | Low
  reasoning   : one short sentence explaining the classification
  hasSpecialHandlingWarning : boolean — true for E-waste, batteries, or hazardous chemicals

Rules:
- Do NOT invent organisations, addresses, or contact details.
- Do NOT add any text outside the JSON array.
- Use Specialized Handling for batteries, e-waste, chemicals.
- Set hasSpecialHandlingWarning to true for those items.
- If a segment is ambiguous, use Low confidence and explain in reasoning.`;

// ─── Validation ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES: WasteCategory[] = [
  'Paper', 'Cardboard', 'Plastic', 'Glass', 'Metal', 'Textile', 'E-waste', 'Household', 'Other',
];
const VALID_PATHS: RecoveryPath[] = [
  'Recycle', 'Reuse', 'Upcycle', 'Donate', 'Specialized Handling',
];
const VALID_CONFIDENCE: ConfidenceLevel[] = ['High', 'Medium', 'Low'];

let _idCounter = 0;
function nextId() {
  return `ai-${Date.now()}-${_idCounter++}`;
}

function isValidCategory(v: unknown): v is WasteCategory {
  return typeof v === 'string' && VALID_CATEGORIES.includes(v as WasteCategory);
}
function isValidPath(v: unknown): v is RecoveryPath {
  return typeof v === 'string' && VALID_PATHS.includes(v as RecoveryPath);
}
function isValidConfidence(v: unknown): v is ConfidenceLevel {
  return typeof v === 'string' && VALID_CONFIDENCE.includes(v as ConfidenceLevel);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAndValidate(raw: string): WasteItem[] | null {
  // Strip markdown code fences if the model wrapped the JSON
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();

  // Extract the first JSON array from the response
  const match = stripped.match(/\[[\s\S]*\]/);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;

  const items: WasteItem[] = [];
  for (const el of parsed) {
    if (typeof el !== 'object' || el === null) return null;
    const obj = el as Record<string, unknown>;

    if (
      typeof obj.rawText !== 'string' ||
      typeof obj.item !== 'string' ||
      !isValidCategory(obj.category) ||
      !Array.isArray(obj.recoveryPaths) ||
      !(obj.recoveryPaths as unknown[]).every(isValidPath) ||
      !isValidConfidence(obj.confidence) ||
      typeof obj.reasoning !== 'string'
    ) {
      return null; // Strict: one bad element fails the whole batch
    }

    items.push({
      id: nextId(),
      rawText: obj.rawText,
      item: obj.item,
      category: obj.category,
      quantity: (typeof obj.quantity === 'string' ? obj.quantity : null),
      recoveryPaths: obj.recoveryPaths as RecoveryPath[],
      confidence: obj.confidence,
      reasoning: obj.reasoning,
      hasSpecialHandlingWarning: Boolean(obj.hasSpecialHandlingWarning),
    });
  }

  return items.length > 0 ? items : null;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Classify user's waste description.
 * - If VITE_AI_API_KEY is set: call the configured OpenAI-compatible endpoint.
 * - On any failure or malformed JSON: silently fall back to keyword classifier.
 * - Returns both the items and which mode was used.
 */
export async function classifyWaste(userText: string): Promise<ClassifyResult> {
  if (!AI_MODE_ACTIVE) {
    return { items: classifyWasteWithKeywords(userText), mode: 'local' };
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Key is sent in Authorization header only — never logged
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userText },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[ai.ts] API returned ${response.status} — falling back to local classifier`);
      return { items: classifyWasteWithKeywords(userText), mode: 'local' };
    }

    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content ?? '';
    const validated = parseAndValidate(content);

    if (!validated) {
      console.warn('[ai.ts] Malformed or invalid JSON from model — falling back to local classifier');
      return { items: classifyWasteWithKeywords(userText), mode: 'local' };
    }

    return { items: validated, mode: 'ai' };
  } catch (err) {
    console.error('[ai.ts] Network or parse error — falling back to local classifier', err);
    return { items: classifyWasteWithKeywords(userText), mode: 'local' };
  }
}
