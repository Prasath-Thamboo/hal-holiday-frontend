import { describe, expect, it } from 'vitest';
import type { OpeningHours } from '@/lib/types';
import {
  formatSlots,
  isOpenAt,
  todaySummary,
  weekDayKey,
  weekRows,
} from '@/lib/opening-hours';

// 2026-01-05 is a Monday; 2026-01-11 is a Sunday.
const MON = (h: number, m = 0) => new Date(2026, 0, 5, h, m);
const SUN = (h: number, m = 0) => new Date(2026, 0, 11, h, m);

describe('weekDayKey', () => {
  it('maps JS getDay() to the mon..sun key', () => {
    expect(weekDayKey(MON(10))).toBe('mon');
    expect(weekDayKey(SUN(10))).toBe('sun');
  });
});

describe('isOpenAt', () => {
  const hours: OpeningHours = {
    mon: [
      { open: '12:00', close: '14:30' },
      { open: '19:00', close: '22:30' },
    ],
  };

  it('is true inside a slot and false in the gap / after closing', () => {
    expect(isOpenAt(hours, MON(13))).toBe(true);
    expect(isOpenAt(hours, MON(16))).toBe(false);
    expect(isOpenAt(hours, MON(23))).toBe(false);
  });

  it('is false on a day with no slots', () => {
    expect(isOpenAt(hours, SUN(13))).toBe(false);
  });

  it('is false for null / undefined opening hours', () => {
    expect(isOpenAt(null, MON(13))).toBe(false);
    expect(isOpenAt(undefined, MON(13))).toBe(false);
  });

  it('handles a slot that runs past midnight (close <= open)', () => {
    const overnight: OpeningHours = { mon: [{ open: '19:00', close: '02:00' }] };
    expect(isOpenAt(overnight, MON(23, 30))).toBe(true);
    expect(isOpenAt(overnight, MON(1))).toBe(true); // 01:00 still within the run
    expect(isOpenAt(overnight, MON(12))).toBe(false);
  });

  it('lets a closed exception override the weekly schedule', () => {
    const withException: OpeningHours = {
      ...hours,
      exceptions: [{ date: '2026-01-05', closed: true }],
    };
    expect(isOpenAt(withException, MON(13))).toBe(false);
  });

  it('lets an exception provide replacement slots', () => {
    const withException: OpeningHours = {
      ...hours,
      exceptions: [
        { date: '2026-01-05', closed: false, slots: [{ open: '08:00', close: '10:00' }] },
      ],
    };
    expect(isOpenAt(withException, MON(9))).toBe(true);
    expect(isOpenAt(withException, MON(13))).toBe(false); // weekly slot no longer applies
  });
});

describe('formatSlots', () => {
  it('renders "Fermé" for an empty or missing list', () => {
    expect(formatSlots([])).toBe('Fermé');
    expect(formatSlots(undefined)).toBe('Fermé');
  });

  it('joins slots with an en dash', () => {
    expect(formatSlots([{ open: '09:00', close: '18:00' }])).toBe('09:00–18:00');
    expect(
      formatSlots([
        { open: '12:00', close: '14:30' },
        { open: '19:00', close: '22:30' },
      ]),
    ).toBe('12:00–14:30, 19:00–22:30');
  });
});

describe('weekRows', () => {
  it('returns 7 rows from Monday to Sunday and flags today', () => {
    const rows = weekRows({ mon: [{ open: '09:00', close: '18:00' }] }, MON(10));
    expect(rows.map((r) => r.day)).toEqual([
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
      'sun',
    ]);
    expect(rows.find((r) => r.isToday)?.day).toBe('mon');
    expect(rows[0].slots).toHaveLength(1);
  });
});

describe('todaySummary', () => {
  const hours: OpeningHours = { mon: [{ open: '12:00', close: '14:30' }] };

  it('reports the closing time while open', () => {
    expect(todaySummary(hours, MON(13))).toBe('Ouvert · ferme à 14:30');
  });

  it('reports the next opening time before it opens', () => {
    expect(todaySummary(hours, MON(9))).toBe('Fermé · ouvre à 12:00');
  });

  it('reports a fully closed day', () => {
    expect(todaySummary(hours, SUN(13))).toBe("Fermé aujourd'hui");
  });

  it('reports missing hours', () => {
    expect(todaySummary(null, MON(13))).toBe('Horaires non renseignés');
  });
});
