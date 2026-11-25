import type { OpeningHours, TimeSlot, WeekDay } from './types';
import { WEEK_DAYS } from './types';

const DAY_LABELS: Record<WeekDay, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

/** `Date.getDay()` : 0 = dimanche … 6 = samedi → clé WeekDay. */
const JS_DAY_TO_KEY: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function dayLabel(day: WeekDay): string {
  return DAY_LABELS[day];
}

export function weekDayKey(date: Date): WeekDay {
  return JS_DAY_TO_KEY[date.getDay()];
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * `true` si `time` (minutes depuis minuit) tombe dans le créneau.
 * Gère les créneaux qui passent minuit (ex. 19:00 → 00:00) : `close <= open`.
 */
function slotCovers(slot: TimeSlot, minutes: number): boolean {
  const open = toMinutes(slot.open);
  const close = toMinutes(slot.close);
  if (close <= open) return minutes >= open || minutes < close;
  return minutes >= open && minutes < close;
}

/** Créneaux applicables à une date donnée, exceptions prises en compte. */
export function slotsForDate(oh: OpeningHours, date: Date): TimeSlot[] {
  const exception = oh.exceptions?.find((e) => e.date === isoDate(date));
  if (exception) return exception.closed ? [] : (exception.slots ?? []);
  return oh[weekDayKey(date)] ?? [];
}

export function isOpenAt(oh: OpeningHours | null | undefined, date = new Date()): boolean {
  if (!oh) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return slotsForDate(oh, date).some((slot) => slotCovers(slot, minutes));
}

export function formatSlots(slots: TimeSlot[] | undefined): string {
  if (!slots || slots.length === 0) return 'Fermé';
  return slots.map((s) => `${s.open}–${s.close}`).join(', ');
}

export interface DayRow {
  day: WeekDay;
  label: string;
  slots: TimeSlot[];
  isToday: boolean;
}

/** Lignes prêtes à afficher pour la semaine, lundi → dimanche. */
export function weekRows(oh: OpeningHours, today = new Date()): DayRow[] {
  const todayKey = weekDayKey(today);
  return WEEK_DAYS.map((day) => ({
    day,
    label: DAY_LABELS[day],
    slots: oh[day] ?? [],
    isToday: day === todayKey,
  }));
}

/** Résumé court pour aujourd'hui : "Ouvert · ferme à 22:30" / "Fermé". */
export function todaySummary(oh: OpeningHours | null | undefined, now = new Date()): string {
  if (!oh) return 'Horaires non renseignés';
  const slots = slotsForDate(oh, now);
  if (slots.length === 0) return "Fermé aujourd'hui";
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = slots.find((s) => slotCovers(s, minutes));
  if (current) return `Ouvert · ferme à ${current.close}`;
  const next = slots.find((s) => toMinutes(s.open) > minutes);
  return next ? `Fermé · ouvre à ${next.open}` : "Fermé pour aujourd'hui";
}
