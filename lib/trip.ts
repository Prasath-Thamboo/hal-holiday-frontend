import type { TripSlot } from './types';

export const SLOT_ORDER: Record<TripSlot, number> = {
  matin: 0,
  midi: 1,
  apres_midi: 2,
  soir: 3,
};

/** Clé i18n `planning.slot_*` pour chaque créneau. */
export const SLOT_I18N_KEY: Record<TripSlot, string> = {
  matin: 'planning.slot_matin',
  midi: 'planning.slot_midi',
  apres_midi: 'planning.slot_apres_midi',
  soir: 'planning.slot_soir',
};

/** Nombre de jours inclusifs entre deux dates `YYYY-MM-DD`. */
export function dayCount(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "samedi 2 mai" à partir d'un `YYYY-MM-DD`. */
export function formatDayLabel(date: string, locale = 'fr-FR'): string {
  const fmt =
    locale === DATE_FMT.resolvedOptions().locale
      ? DATE_FMT
      : new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
  return fmt.format(new Date(`${date}T00:00:00Z`));
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  locale = 'fr-FR',
): string {
  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  return `${fmt.format(new Date(`${startDate}T00:00:00Z`))} – ${fmt.format(
    new Date(`${endDate}T00:00:00Z`),
  )}`;
}

// ── Détection de chevauchement d'horaires ────────────────────────────────────

/**
 * Durée (minutes) supposée d'un lieu planifié qui n'a qu'une heure de début.
 * Sert uniquement à repérer les chevauchements — c'est volontairement large.
 */
export const DEFAULT_ITEM_DURATION_MIN = 90;

/** `"14:30"` → 870. `null` si le format n'est pas `HH:MM` valide. */
export function parseHhMm(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

interface ConflictItem {
  id: string;
  time: string | null;
}

/**
 * Renvoie les ids des items d'un même jour dont les plages horaires se
 * chevauchent. Seuls les items avec une heure explicite (`time`) sont
 * comparés : deux lieux dans un créneau sans heure précise ne sont pas
 * considérés comme un conflit. Chaque item est traité comme occupant
 * `[time, time + DEFAULT_ITEM_DURATION_MIN)`.
 */
export function findTimeConflicts(items: ConflictItem[]): Set<string> {
  const timed = items
    .map((it) => ({ id: it.id, start: parseHhMm(it.time) }))
    .filter((it): it is { id: string; start: number } => it.start !== null);

  const conflicts = new Set<string>();
  for (let i = 0; i < timed.length; i += 1) {
    for (let j = i + 1; j < timed.length; j += 1) {
      const a = timed[i];
      const b = timed[j];
      if (
        a.start < b.start + DEFAULT_ITEM_DURATION_MIN &&
        b.start < a.start + DEFAULT_ITEM_DURATION_MIN
      ) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }
  return conflicts;
}

/**
 * Réordonne une liste en déplaçant l'élément d'indice `from` vers `to`.
 * Renvoie une nouvelle liste (ne mute pas l'entrée).
 */
export function reorder<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  if (from < 0 || from >= next.length) return next;
  const clampedTo = Math.max(0, Math.min(to, next.length - 1));
  const [moved] = next.splice(from, 1);
  next.splice(clampedTo, 0, moved);
  return next;
}
