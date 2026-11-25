import { describe, expect, it } from 'vitest';
import { halalFull, halalTag } from '@/lib/halal';

describe('halalTag', () => {
  it('maps the 1-4 scale to a short badge label', () => {
    expect(halalTag(1)).toBe('Souple');
    expect(halalTag(2)).toBe('Modéré');
    expect(halalTag(3)).toBe('Strict');
    expect(halalTag(4)).toBe('Strict');
  });

  it('returns null for missing / zero levels', () => {
    expect(halalTag(null)).toBeNull();
    expect(halalTag(undefined)).toBeNull();
    expect(halalTag(0)).toBeNull();
  });
});

describe('halalFull', () => {
  it('returns the full sentence for a known level', () => {
    expect(halalFull(3)).toContain('Certifié');
  });

  it('returns null when there is no level', () => {
    expect(halalFull(null)).toBeNull();
  });
});
