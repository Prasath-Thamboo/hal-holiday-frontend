import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ITEM_DURATION_MIN,
  dayCount,
  findTimeConflicts,
  parseHhMm,
  reorder,
} from '@/lib/trip';

describe('dayCount', () => {
  it('compte les jours de façon inclusive', () => {
    expect(dayCount('2026-05-02', '2026-05-02')).toBe(1);
    expect(dayCount('2026-05-02', '2026-05-06')).toBe(5);
  });

  it('renvoie 0 pour une plage invalide', () => {
    expect(dayCount('2026-05-06', '2026-05-02')).toBe(0);
    expect(dayCount('pas-une-date', '2026-05-02')).toBe(0);
  });
});

describe('parseHhMm', () => {
  it('convertit HH:MM en minutes', () => {
    expect(parseHhMm('00:00')).toBe(0);
    expect(parseHhMm('14:30')).toBe(870);
  });

  it('renvoie null pour une valeur invalide', () => {
    expect(parseHhMm(null)).toBeNull();
    expect(parseHhMm('9:00')).toBeNull();
    expect(parseHhMm('24:00')).toBeNull();
  });
});

describe('findTimeConflicts', () => {
  it('ignore les items sans heure', () => {
    expect(
      findTimeConflicts([
        { id: 'a', time: null },
        { id: 'b', time: null },
      ]).size,
    ).toBe(0);
  });

  it('signale un chevauchement et épargne les items hors conflit', () => {
    const conflicts = findTimeConflicts([
      { id: 'a', time: '09:00' },
      { id: 'b', time: '09:30' },
      { id: 'c', time: '15:00' },
    ]);
    expect([...conflicts].sort()).toEqual(['a', 'b']);
  });

  it('deux entrées espacées de la durée par défaut ne se chevauchent pas', () => {
    expect(DEFAULT_ITEM_DURATION_MIN).toBe(90);
    expect(
      findTimeConflicts([
        { id: 'a', time: '10:00' },
        { id: 'b', time: '11:30' },
      ]).size,
    ).toBe(0);
  });
});

describe('reorder', () => {
  it('déplace un élément sans muter la source', () => {
    const src = ['a', 'b', 'c', 'd'];
    expect(reorder(src, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(src).toEqual(['a', 'b', 'c', 'd']);
  });

  it('borne la cible', () => {
    expect(reorder(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
  });
});
