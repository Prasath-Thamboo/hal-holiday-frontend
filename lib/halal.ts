/**
 * Échelle `halal_level` (1–4) → libellés d'affichage.
 * `full` : phrase complète (fiche lieu). `tag` : badge court (carte).
 */
export const HALAL_FULL_LABELS: Record<number, string> = {
  1: 'Niveau 1 — Auto-déclaré',
  2: 'Niveau 2 — Validé par la mosquée locale',
  3: 'Niveau 3 — Certifié par un organisme agréé',
  4: 'Niveau 4 — 100% Halal',
};

export const HALAL_TAG_LABELS: Record<number, string> = {
  1: 'Souple',
  2: 'Modéré',
  3: 'Strict',
  4: 'Strict',
};

export const HALAL_SLIDER_MARKS: { value: number; label: string }[] = [
  { value: 1, label: '1 · Souple' },
  { value: 2, label: '2 · Modéré' },
  { value: 3, label: '3 · Strict' },
  { value: 4, label: '4 · 100% halal' },
];

export function halalTag(level: number | null | undefined): string | null {
  if (!level) return null;
  return HALAL_TAG_LABELS[level] ?? null;
}

export function halalFull(level: number | null | undefined): string | null {
  if (!level) return null;
  return HALAL_FULL_LABELS[level] ?? null;
}
