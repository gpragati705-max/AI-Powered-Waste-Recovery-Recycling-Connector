import type {
  WasteItem,
  WasteCategory,
  RecoveryPath,
  ConfidenceLevel,
} from '../types/waste';

// ─── Keyword rules ─────────────────────────────────────────────────────────────

interface KeywordRule {
  keywords: string[];
  item: string;
  category: WasteCategory;
  recoveryPaths: RecoveryPath[];
  confidence: ConfidenceLevel;
  reasoning: string;
  hasSpecialHandlingWarning?: boolean;
}

const RULES: KeywordRule[] = [
  {
    keywords: ['newspaper', 'newspapers', 'paper', 'magazine', 'magazines', 'newspaper'],
    item: 'newspaper / paper',
    category: 'Paper',
    recoveryPaths: ['Recycle'],
    confidence: 'High',
    reasoning: 'Paper and newspapers are widely recyclable through paper mills.',
  },
  {
    keywords: ['cardboard', 'box', 'boxes', 'carton', 'cartons', 'corrugated'],
    item: 'cardboard / boxes',
    category: 'Cardboard',
    recoveryPaths: ['Recycle'],
    confidence: 'High',
    reasoning: 'Cardboard boxes are among the most recycled materials globally.',
  },
  {
    keywords: ['plastic', 'bottle', 'bottles', 'container', 'containers', 'bag', 'bags', 'polybag', 'wrapper'],
    item: 'plastic',
    category: 'Plastic',
    recoveryPaths: ['Recycle'],
    confidence: 'High',
    reasoning: 'Plastic items can be routed to recyclers; clean and dry before disposal.',
  },
  {
    keywords: ['glass', 'bottle', 'jar', 'jars', 'mirror', 'mirrors', 'window pane'],
    item: 'glass',
    category: 'Glass',
    recoveryPaths: ['Recycle'],
    confidence: 'High',
    reasoning: 'Glass is 100% recyclable without quality loss.',
  },
  {
    keywords: ['metal', 'iron', 'steel', 'aluminium', 'aluminum', 'tin', 'can', 'cans', 'scrap'],
    item: 'metal / scrap',
    category: 'Metal',
    recoveryPaths: ['Recycle', 'Reuse'],
    confidence: 'High',
    reasoning: 'Metal scrap has high recovery value and can be remelted or reused.',
  },
  {
    keywords: ['clothes', 'cloth', 'clothing', 'shirt', 'shirts', 'trousers', 'jeans', 'dress', 'fabric', 'textile', 'sari', 'kurta', 'saree', 'dupatta', 'old clothes'],
    item: 'old clothes / textiles',
    category: 'Textile',
    recoveryPaths: ['Donate', 'Reuse', 'Upcycle'],
    confidence: 'High',
    reasoning: 'Wearable textiles should be donated; non-wearable can be upcycled into rags or insulation.',
  },
  {
    keywords: ['charger', 'phone', 'mobile', 'laptop', 'computer', 'television', 'tv', 'monitor', 'battery', 'batteries', 'cable', 'cables', 'wire', 'wires', 'electronic', 'electronics', 'keyboard', 'mouse', 'printer', 'tablet', 'ewaste', 'e-waste', 'circuit', 'board', 'bulb', 'cfl', 'led bulb'],
    item: 'electronic / e-waste',
    category: 'E-waste',
    recoveryPaths: ['Specialized Handling', 'Recycle'],
    confidence: 'High',
    reasoning: 'E-waste contains hazardous materials; must be sent to certified e-waste recyclers.',
    hasSpecialHandlingWarning: true,
  },
  {
    keywords: ['furniture', 'sofa', 'chair', 'table', 'bed', 'mattress', 'cupboard', 'cabinet', 'shelf'],
    item: 'old furniture',
    category: 'Household',
    recoveryPaths: ['Donate', 'Reuse'],
    confidence: 'Medium',
    reasoning: 'Functional furniture can be donated; damaged pieces may need specialised disposal.',
  },
  {
    keywords: ['paint', 'chemical', 'chemicals', 'pesticide', 'pesticides', 'solvent', 'solvents', 'thinner', 'bleach', 'acid'],
    item: 'chemical / hazardous waste',
    category: 'Other',
    recoveryPaths: ['Specialized Handling'],
    confidence: 'High',
    reasoning: 'Chemicals are hazardous and must never go in general household waste.',
    hasSpecialHandlingWarning: true,
  },
];

// ─── Quantity extraction ────────────────────────────────────────────────────────

const QTY_RE = /(\d+(?:\.\d+)?)\s*(kg|g|gram|grams|kilo|kilos|litre|litres|liter|liters|piece|pieces|pcs|item|items|unit|units|pair|pairs|set|sets)?/i;

function extractQuantity(text: string): string | null {
  const m = text.match(QTY_RE);
  if (!m) return null;
  const num = m[1];
  const unit = m[2] ? m[2].toLowerCase() : '';
  if (/kg|kilo/i.test(unit)) return `${num} kg`;
  if (/g|gram/i.test(unit)) return `${num} g`;
  if (/litre|liter/i.test(unit)) return `${num} L`;
  if (/piece|pcs|item|unit/i.test(unit)) return `${num} item${Number(num) !== 1 ? 's' : ''}`;
  if (/pair/i.test(unit)) return `${num} pair${Number(num) !== 1 ? 's' : ''}`;
  return `${num}`;
}

// ─── Segment splitting ─────────────────────────────────────────────────────────

/** Split user input on commas, "and", semicolons, line breaks. */
function splitSegments(text: string): string[] {
  return text
    .split(/,|\band\b|;|\n/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ─── Main classifier ───────────────────────────────────────────────────────────

let _idCounter = 0;
function nextId() {
  return `local-${Date.now()}-${_idCounter++}`;
}

export function classifyWasteWithKeywords(userText: string): WasteItem[] {
  const segments = splitSegments(userText);
  const results: WasteItem[] = [];

  for (const segment of segments) {
    const lower = segment.toLowerCase();
    let matched = false;

    for (const rule of RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        results.push({
          id: nextId(),
          rawText: segment,
          item: rule.item,
          category: rule.category,
          quantity: extractQuantity(segment),
          recoveryPaths: [...rule.recoveryPaths],
          confidence: rule.confidence,
          reasoning: rule.reasoning,
          hasSpecialHandlingWarning: rule.hasSpecialHandlingWarning ?? false,
        });
        matched = true;
        break; // use first matching rule
      }
    }

    if (!matched && segment.length > 1) {
      // Fallback: unknown item
      results.push({
        id: nextId(),
        rawText: segment,
        item: segment,
        category: 'Other',
        quantity: extractQuantity(segment),
        recoveryPaths: ['Recycle'],
        confidence: 'Low',
        reasoning: 'Could not match to a known category — please verify and correct.',
        hasSpecialHandlingWarning: false,
      });
    }
  }

  return results;
}
