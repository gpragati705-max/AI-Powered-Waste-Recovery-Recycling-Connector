import type { Organization, OrganizationMatch, WasteItem, WasteCategory, RecoveryPath } from '../types/waste';

/**
 * Match and sort organisations against the user's current waste items.
 *
 * Rules:
 * 1. Area filter: include org if org.area === selectedArea OR org.area === 'Anywhere in Jaipur'.
 * 2. Category match: org.acceptedCategories ∩ item categories must be non-empty.
 * 3. Score = number of user categories matched + number of recovery types matched.
 * 4. Sort descending by score.
 * 5. Never fabricate data — all output references only fields from the passed organisation object.
 */
export function matchOrganizations(
  organizations: Organization[],
  wasteItems: WasteItem[],
  selectedArea: string,
): OrganizationMatch[] {
  if (wasteItems.length === 0) return [];

  const userCategories = new Set<WasteCategory>(wasteItems.map((i) => i.category));
  const userPaths = new Set<RecoveryPath>(wasteItems.flatMap((i) => i.recoveryPaths));

  const results: OrganizationMatch[] = [];

  for (const org of organizations) {
    // ── Area filter ──────────────────────────────────────────────────────────
    const areaMatch =
      selectedArea === 'Anywhere in Jaipur' ||
      org.area === selectedArea ||
      org.area === 'Anywhere in Jaipur';

    if (!areaMatch) continue;

    // ── Category match ───────────────────────────────────────────────────────
    const matchedCategories = org.acceptedCategories.filter((c) => userCategories.has(c));
    if (matchedCategories.length === 0) continue;

    // ── Recovery type match ──────────────────────────────────────────────────
    const matchedRecoveryTypes = org.acceptedRecoveryTypes.filter((p) => userPaths.has(p));

    // ── Build reason chips ───────────────────────────────────────────────────
    const reasons: string[] = [];

    for (const cat of matchedCategories) {
      reasons.push(`Accepts ${cat}`);
    }
    for (const path of matchedRecoveryTypes) {
      reasons.push(`${path} available`);
    }
    if (org.dropOffAvailable) reasons.push('Drop-off available');
    if (org.pickupAvailable) reasons.push('Pickup available');
    if (org.area === 'Anywhere in Jaipur') {
      reasons.push('Serves all of Jaipur');
    } else {
      reasons.push(`Located in ${org.area}`);
    }

    // ── Score ────────────────────────────────────────────────────────────────
    const score = matchedCategories.length * 2 + matchedRecoveryTypes.length;

    results.push({
      organization: org,
      matchedCategories,
      matchedRecoveryTypes,
      matchedReasons: reasons,
      score,
    });
  }

  // Sort best match first
  return results.sort((a, b) => b.score - a.score);
}
