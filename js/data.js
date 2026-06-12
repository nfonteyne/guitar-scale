// CAGED positions for any major key.
// C major patterns serve as the base; all other keys are derived by
// shifting every fret by the key's semitone offset, then wrapping
// positions that exceed fret 17 down one octave (−12).

// ── Constants ─────────────────────────────────────────────────────────────────

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // natural minor (W-H-W-W-H-W-W)

const MAJOR_PENTA_INTERVALS = [0, 2, 4, 7, 9];   // 1 2 3 5 6
const MINOR_PENTA_INTERVALS = [0, 3, 5, 7, 10];  // 1 b3 4 5 b7

// Open-string semitones from C=0, index 0 = string 1 (high e)
const STRING_OPEN = [4, 11, 7, 2, 9, 4];

export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

// ── Keys ──────────────────────────────────────────────────────────────────────

export const KEYS = [
  { name: 'C',  root: 0,  scale: ['C', 'D',  'E',  'F',  'G',  'A',  'B']  },
  { name: 'C#', root: 1,  scale: ['C#','D#', 'F',  'F#', 'G#', 'A#', 'C']  },
  { name: 'D',  root: 2,  scale: ['D', 'E',  'F#', 'G',  'A',  'B',  'C#'] },
  { name: 'D#', root: 3,  scale: ['D#','F',  'G',  'G#', 'A#', 'C',  'D']  },
  { name: 'E',  root: 4,  scale: ['E', 'F#', 'G#', 'A',  'B',  'C#', 'D#'] },
  { name: 'F',  root: 5,  scale: ['F', 'G',  'A',  'A#', 'C',  'D',  'E']  },
  { name: 'F#', root: 6,  scale: ['F#','G#', 'A#', 'B',  'C#', 'D#', 'F']  },
  { name: 'G',  root: 7,  scale: ['G', 'A',  'B',  'C',  'D',  'E',  'F#'] },
  { name: 'G#', root: 8,  scale: ['G#','A#', 'C',  'C#', 'D#', 'F',  'G']  },
  { name: 'A',  root: 9,  scale: ['A', 'B',  'C#', 'D',  'E',  'F#', 'G#'] },
  { name: 'A#', root: 10, scale: ['A#','C',  'D',  'D#', 'F',  'G',  'A']  },
  { name: 'B',  root: 11, scale: ['B', 'C#', 'D#', 'E',  'F#', 'G#', 'A#'] },
];

// Natural minor keys — same root names, minor scale note spellings (all sharps)
export const MINOR_KEYS = [
  { name: 'C',  root: 0,  scale: ['C', 'D', 'D#','F', 'G', 'G#','A#'] },
  { name: 'C#', root: 1,  scale: ['C#','D#','E', 'F#','G#','A', 'B']  },
  { name: 'D',  root: 2,  scale: ['D', 'E', 'F', 'G', 'A', 'A#','C']  },
  { name: 'D#', root: 3,  scale: ['D#','F', 'F#','G#','A#','B', 'C#'] },
  { name: 'E',  root: 4,  scale: ['E', 'F#','G', 'A', 'B', 'C', 'D']  },
  { name: 'F',  root: 5,  scale: ['F', 'G', 'G#','A#','C', 'C#','D#'] },
  { name: 'F#', root: 6,  scale: ['F#','G#','A', 'B', 'C#','D', 'E']  },
  { name: 'G',  root: 7,  scale: ['G', 'A', 'A#','C', 'D', 'D#','F']  },
  { name: 'G#', root: 8,  scale: ['G#','A#','B', 'C#','D#','E', 'F#'] },
  { name: 'A',  root: 9,  scale: ['A', 'B', 'C', 'D', 'E', 'F', 'G']  },
  { name: 'A#', root: 10, scale: ['A#','C', 'C#','D#','F', 'F#','G#'] },
  { name: 'B',  root: 11, scale: ['B', 'C#','D', 'E', 'F#','G', 'A']  },
];

// ── C major base patterns ─────────────────────────────────────────────────────
// Source: guitarscale.org/c-major.html (verified against fretboard diagrams)
// Each note: [string, fret, noteName, isRoot]
//   string 1 = high e, string 6 = low E

const C_MAJOR_POSITIONS = [
  {
    name: 'Position 1 — A Shape',
    notes: [
      [1, 3, 'G', false], [1, 5, 'A', false],
      [2, 3, 'D', false], [2, 5, 'E', false], [2, 6, 'F', false],
      [3, 2, 'A', false], [3, 4, 'B', false], [3, 5, 'C', true],
      [4, 2, 'E', false], [4, 3, 'F', false], [4, 5, 'G', false],
      [5, 2, 'B', false], [5, 3, 'C', true],  [5, 5, 'D', false],
      [6, 3, 'G', false], [6, 5, 'A', false],
    ],
  },
  {
    name: 'Position 2 — G Shape',
    notes: [
      [1, 5, 'A', false], [1, 7, 'B', false], [1, 8, 'C', true],
      [2, 5, 'E', false], [2, 6, 'F', false], [2, 8, 'G', false],
      [3, 4, 'B', false], [3, 5, 'C', true],  [3, 7, 'D', false],
      [4, 5, 'G', false], [4, 7, 'A', false],
      [5, 5, 'D', false], [5, 7, 'E', false], [5, 8, 'F', false],
      [6, 5, 'A', false], [6, 7, 'B', false], [6, 8, 'C', true],
    ],
  },
  {
    name: 'Position 3 — E Shape',
    notes: [
      [1, 7,  'B', false], [1, 8,  'C', true],  [1, 10, 'D', false],
      [2, 8,  'G', false], [2, 10, 'A', false],
      [3, 7,  'D', false], [3, 9,  'E', false],  [3, 10, 'F', false],
      [4, 7,  'A', false], [4, 9,  'B', false],  [4, 10, 'C', true],
      [5, 7,  'E', false], [5, 8,  'F', false],  [5, 10, 'G', false],
      [6, 7,  'B', false], [6, 8,  'C', true],   [6, 10, 'D', false],
    ],
  },
  {
    name: 'Position 4 — D Shape',
    notes: [
      [1, 10, 'D', false], [1, 12, 'E', false], [1, 13, 'F', false],  // e
      [2, 10, 'A', false], [2, 12, 'B', false], [2, 13, 'C', true],   // B
      [3, 9,  'E', false], [3, 10, 'F', false], [3, 12, 'G', false],  // G — starts fret 9
      [4, 9,  'B', false], [4, 10, 'C', true],  [4, 12, 'D', false],  // D — starts fret 9
      [5, 10, 'G', false], [5, 12, 'A', false],                        // A — 2 notes
      [6, 10, 'D', false], [6, 12, 'E', false], [6, 13, 'F', false],  // E
    ],
  },
  {
    name: 'Position 5 — C Shape',
    notes: [
      [1, 12, 'E', false], [1, 13, 'F', false], [1, 15, 'G', false],
      [2, 12, 'B', false], [2, 13, 'C', true],  [2, 15, 'D', false],
      [3, 12, 'G', false], [3, 14, 'A', false],
      [4, 12, 'D', false], [4, 14, 'E', false], [4, 15, 'F', false],
      [5, 12, 'A', false], [5, 14, 'B', false], [5, 15, 'C', true],
      [6, 12, 'E', false], [6, 13, 'F', false], [6, 15, 'G', false],
    ],
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return every scale note of the given key across frets 1–17 (all 6 strings).
 * Used for the default "all notes" view.
 */
export function getAllNotes(keyIndex, scaleType = 'major') {
  const intervals = scaleType === 'minor' ? MINOR_INTERVALS : MAJOR_INTERVALS;
  const key       = scaleType === 'minor' ? MINOR_KEYS[keyIndex] : KEYS[keyIndex];

  const noteMap   = {};
  const degreeMap = {};
  intervals.forEach((interval, i) => {
    const semi      = (key.root + interval) % 12;
    noteMap[semi]   = key.scale[i];
    degreeMap[semi] = i + 1;
  });

  const notes = [];
  for (let str = 1; str <= 6; str++) {
    for (let fret = 1; fret <= 17; fret++) {
      const semi = (STRING_OPEN[str - 1] + fret) % 12;
      if (noteMap[semi] !== undefined) {
        notes.push([str, fret, noteMap[semi], semi === key.root, degreeMap[semi]]);
      }
    }
  }
  return notes;
}

/**
 * Return the 5 CAGED positions for the given key index (0 = C … 11 = B).
 * Positions are derived by transposing the C major base patterns.
 */
export function getPositions(keyIndex) {
  const key = KEYS[keyIndex];
  const offset = key.root;

  // semitone → note name for this key
  const noteMap = {};
  MAJOR_INTERVALS.forEach((interval, i) => {
    noteMap[(offset + interval) % 12] = key.scale[i];
  });

  return C_MAJOR_POSITIONS.map(pos => {
    // Shift every fret by the key offset
    const rawNotes = pos.notes.map(([str, fret]) => [str, fret + offset]);

    // If the position exceeds fret 17, drop it one octave
    const maxRaw = Math.max(...rawNotes.map(n => n[1]));
    const adj = maxRaw > 17 ? -12 : 0;

    // semitone → scale degree (1–7) for this key
    const degreeMap = {};
    MAJOR_INTERVALS.forEach((interval, i) => {
      degreeMap[(offset + interval) % 12] = i + 1;
    });

    const notes = rawNotes.map(([str, fret]) => {
      const f = fret + adj;
      const semitone = (STRING_OPEN[str - 1] + f) % 12;
      const noteName = noteMap[semitone];
      const isRoot = semitone === key.root;
      const degree = degreeMap[semitone];
      return [str, f, noteName, isRoot, degree];
    });

    const frets = notes.map(n => n[1]);
    const minF = Math.min(...frets);
    const maxF = Math.max(...frets);
    const shapeName = pos.name.split('—')[1]?.trim() ?? pos.name;

    const rootNotes = notes
      .filter(n => n[3])
      .map(n => `${STRING_NAMES[n[0] - 1]} string fret ${n[1]}`);

    return {
      name: pos.name,
      fretRange: [minF, maxF],
      description: `${shapeName} — ${key.name} major scale, frets ${minF}–${maxF}.`,
      roots: rootNotes,
      notes,
    };
  });
}

/**
 * Return the Set of semitones (0–11) for the tonic triad (root, 3rd, 5th).
 */
export function getChordSemitones(keyIndex, scaleType) {
  const root      = scaleType === 'minor' ? MINOR_KEYS[keyIndex].root : KEYS[keyIndex].root;
  const intervals = scaleType === 'minor' ? [0, 3, 7] : [0, 4, 7];
  return new Set(intervals.map(i => (root + i) % 12));
}

/**
 * Return the Set of semitones (0–11) belonging to the pentatonic scale
 * rooted at the given key index.
 * pentaType: 'major' | 'minor'
 */
export function getPentaSemitones(keyIndex, pentaType) {
  const root      = KEYS[keyIndex].root;
  const intervals = pentaType === 'minor' ? MINOR_PENTA_INTERVALS : MAJOR_PENTA_INTERVALS;
  return new Set(intervals.map(i => (root + i) % 12));
}

/**
 * Return the 5 CAGED positions for a natural minor key.
 * Natural minor is the relative minor of a major key — identical notes and box
 * positions, but the root and scale degrees are reassigned to the minor root.
 */
export function getMinorPositions(keyIndex) {
  const minorKey  = MINOR_KEYS[keyIndex];
  const minorRoot = minorKey.root;

  // Minor scale degree map: semitone → 1–7
  const degreeMap = {};
  MINOR_INTERVALS.forEach((interval, i) => {
    degreeMap[(minorRoot + interval) % 12] = i + 1;
  });

  // Reuse the relative major's box positions (same frets, same notes)
  const relMajorIndex     = (keyIndex + 3) % 12;
  const relMajorPositions = getPositions(relMajorIndex);

  return relMajorPositions.map(pos => {
    const notes = pos.notes.map(([str, fret, name]) => {
      const semi   = (STRING_OPEN[str - 1] + fret) % 12;
      const isRoot = semi === minorRoot;
      const degree = degreeMap[semi];
      return [str, fret, name, isRoot, degree];
    });

    const rootNotes = notes
      .filter(n => n[3])
      .map(n => `${STRING_NAMES[n[0] - 1]} string fret ${n[1]}`);

    const shapeName = pos.name.split('—')[1]?.trim() ?? pos.name;

    return {
      name: pos.name,
      fretRange: pos.fretRange,
      description: `${shapeName} — ${minorKey.name} minor scale, frets ${pos.fretRange[0]}–${pos.fretRange[1]}.`,
      roots: rootNotes,
      notes,
    };
  });
}
