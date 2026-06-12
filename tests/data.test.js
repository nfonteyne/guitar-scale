import { describe, it, expect } from 'vitest';
import {
  KEYS,
  MINOR_KEYS,
  STRING_NAMES,
  getAllNotes,
  getPositions,
  getMinorPositions,
  getPentaSemitones,
  getChordSemitones,
} from '../js/data.js';

// ── Constants ─────────────────────────────────────────────────────────────────

describe('KEYS', () => {
  it('has 12 entries', () => expect(KEYS).toHaveLength(12));
  it('C has root 0',   () => expect(KEYS[0].root).toBe(0));
  it('each key has a 7-note scale', () => {
    KEYS.forEach(k => expect(k.scale).toHaveLength(7));
  });
  it('roots span 0–11 with no duplicates', () => {
    const roots = new Set(KEYS.map(k => k.root));
    expect(roots.size).toBe(12);
  });
});

describe('MINOR_KEYS', () => {
  it('has 12 entries', () => expect(MINOR_KEYS).toHaveLength(12));
  it('shares the same roots as KEYS', () => {
    KEYS.forEach((k, i) => expect(MINOR_KEYS[i].root).toBe(k.root));
  });
});

describe('STRING_NAMES', () => {
  it('has 6 strings', () => expect(STRING_NAMES).toHaveLength(6));
  it('high e first, low E last', () => {
    expect(STRING_NAMES[0]).toBe('e');
    expect(STRING_NAMES[5]).toBe('E');
  });
});

// ── getAllNotes ────────────────────────────────────────────────────────────────

describe('getAllNotes', () => {
  it('returns notes within frets 1–17', () => {
    getAllNotes(0, 'major').forEach(([, fret]) => {
      expect(fret).toBeGreaterThanOrEqual(1);
      expect(fret).toBeLessThanOrEqual(17);
    });
  });

  it('returns strings 1–6 only', () => {
    getAllNotes(0, 'major').forEach(([str]) => {
      expect(str).toBeGreaterThanOrEqual(1);
      expect(str).toBeLessThanOrEqual(6);
    });
  });

  it('C major has 7 distinct scale notes', () => {
    const names = new Set(getAllNotes(0, 'major').map(n => n[2]));
    expect(names.size).toBe(7);
  });

  it('root notes are flagged and named correctly for C major', () => {
    const roots = getAllNotes(0, 'major').filter(n => n[3]);
    expect(roots.length).toBeGreaterThan(0);
    roots.forEach(n => expect(n[2]).toBe('C'));
  });

  it('C minor has 7 distinct scale notes', () => {
    const names = new Set(getAllNotes(0, 'minor').map(n => n[2]));
    expect(names.size).toBe(7);
  });

  it('degrees are in range 1–7', () => {
    getAllNotes(0, 'major').forEach(n => {
      expect(n[4]).toBeGreaterThanOrEqual(1);
      expect(n[4]).toBeLessThanOrEqual(7);
    });
  });
});

// ── getPositions ──────────────────────────────────────────────────────────────

describe('getPositions', () => {
  it('returns 5 CAGED positions for every key', () => {
    KEYS.forEach((_, i) => expect(getPositions(i)).toHaveLength(5));
  });

  it('each position has at least one note', () => {
    getPositions(0).forEach(pos => expect(pos.notes.length).toBeGreaterThan(0));
  });

  it('all notes stay within frets 1–17', () => {
    KEYS.forEach((_, i) => {
      getPositions(i).forEach(pos => {
        pos.notes.forEach(([, fret]) => {
          expect(fret).toBeGreaterThanOrEqual(1);
          expect(fret).toBeLessThanOrEqual(17);
        });
      });
    });
  });

  it('fretRange [min, max] is consistent with actual notes', () => {
    getPositions(0).forEach(pos => {
      const frets = pos.notes.map(n => n[1]);
      expect(pos.fretRange[0]).toBe(Math.min(...frets));
      expect(pos.fretRange[1]).toBe(Math.max(...frets));
    });
  });

  it('each position contains at least one root note', () => {
    getPositions(0).forEach(pos => {
      const hasRoot = pos.notes.some(n => n[3]);
      expect(hasRoot).toBe(true);
    });
  });

  it('position names mention the CAGED shapes', () => {
    const shapes = ['A Shape', 'G Shape', 'E Shape', 'D Shape', 'C Shape'];
    getPositions(0).forEach((pos, i) => {
      expect(pos.name).toContain(shapes[i]);
    });
  });
});

// ── getMinorPositions ─────────────────────────────────────────────────────────

describe('getMinorPositions', () => {
  it('returns 5 positions for every minor key', () => {
    MINOR_KEYS.forEach((_, i) => expect(getMinorPositions(i)).toHaveLength(5));
  });

  it('all notes stay within frets 1–17', () => {
    MINOR_KEYS.forEach((_, i) => {
      getMinorPositions(i).forEach(pos => {
        pos.notes.forEach(([, fret]) => {
          expect(fret).toBeGreaterThanOrEqual(1);
          expect(fret).toBeLessThanOrEqual(17);
        });
      });
    });
  });

  it('each minor position contains at least one root note', () => {
    getMinorPositions(0).forEach(pos => {
      expect(pos.notes.some(n => n[3])).toBe(true);
    });
  });
});

// ── getPentaSemitones ─────────────────────────────────────────────────────────

describe('getPentaSemitones', () => {
  it('major pentatonic has 5 semitones', () => {
    expect(getPentaSemitones(0, 'major').size).toBe(5);
  });

  it('minor pentatonic has 5 semitones', () => {
    expect(getPentaSemitones(0, 'minor').size).toBe(5);
  });

  it('C major penta contains semitones 0,2,4,7,9', () => {
    const semis = getPentaSemitones(0, 'major');
    [0, 2, 4, 7, 9].forEach(s => expect(semis.has(s)).toBe(true));
  });

  it('C minor penta contains semitones 0,3,5,7,10', () => {
    const semis = getPentaSemitones(0, 'minor');
    [0, 3, 5, 7, 10].forEach(s => expect(semis.has(s)).toBe(true));
  });

  it('always contains the root semitone', () => {
    KEYS.forEach((k, i) => {
      expect(getPentaSemitones(i, 'major').has(k.root)).toBe(true);
    });
  });
});

// ── getChordSemitones ─────────────────────────────────────────────────────────

describe('getChordSemitones', () => {
  it('major triad has 3 semitones', () => {
    expect(getChordSemitones(0, 'major').size).toBe(3);
  });

  it('minor triad has 3 semitones', () => {
    expect(getChordSemitones(0, 'minor').size).toBe(3);
  });

  it('C major triad: root(0), major 3rd(4), 5th(7)', () => {
    const semis = getChordSemitones(0, 'major');
    expect(semis.has(0)).toBe(true);
    expect(semis.has(4)).toBe(true);
    expect(semis.has(7)).toBe(true);
  });

  it('C minor triad: root(0), minor 3rd(3), 5th(7)', () => {
    const semis = getChordSemitones(0, 'minor');
    expect(semis.has(0)).toBe(true);
    expect(semis.has(3)).toBe(true);
    expect(semis.has(7)).toBe(true);
  });

  it('A major triad: root(9), 3rd(1), 5th(4)', () => {
    const semis = getChordSemitones(9, 'major');
    expect(semis.has(9)).toBe(true);
    expect(semis.has(1)).toBe(true);
    expect(semis.has(4)).toBe(true);
  });

  it('always contains the root semitone', () => {
    KEYS.forEach((k, i) => {
      expect(getChordSemitones(i, 'major').has(k.root)).toBe(true);
      expect(getChordSemitones(i, 'minor').has(k.root)).toBe(true);
    });
  });
});
