// Chord voicing data and SVG diagram renderer

// ── Note data ──────────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const NOTE_MAP = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

// ── Quality definitions ────────────────────────────────────────────────────────

// The canonical list used for suggestions and label display
export const QUALITIES = [
  { suffix: '',     quality: 'major', label: 'Major'          },
  { suffix: 'm',    quality: 'minor', label: 'Minor'          },
  { suffix: '7',    quality: 'dom7',  label: 'Dominant 7th'   },
  { suffix: 'maj7', quality: 'maj7',  label: 'Major 7th'      },
  { suffix: 'm7',   quality: 'm7',    label: 'Minor 7th'      },
  { suffix: '9',    quality: 'add9',  label: '9th'            },
  { suffix: 'm9',   quality: 'm9',    label: 'Minor 9th'      },
  { suffix: 'dim',   quality: 'dim',   label: 'Diminished'      },
  { suffix: 'dim7',  quality: 'dim7',  label: 'Diminished 7th'  },
  { suffix: 'm7b5',  quality: 'm7b5',  label: 'Half Diminished' },
  { suffix: 'sus2', quality: 'sus2',  label: 'Suspended 2nd'  },
  { suffix: 'sus4', quality: 'sus4',  label: 'Suspended 4th'  },
];

// Maps any user-typed suffix to an internal quality string
const QUALITY_MAP = {
  '': 'major', 'maj': 'major', 'major': 'major',
  'm': 'minor', 'min': 'minor', 'minor': 'minor',
  '7': 'dom7',
  'maj7': 'maj7', 'M7': 'maj7',
  'm7': 'm7', 'min7': 'm7',
  '9': 'add9', 'add9': 'add9', 'add2': 'add9',
  'm9': 'm9', 'min9': 'm9', 'madd9': 'm9',
  'dim': 'dim', 'diminished': 'dim',
  'dim7': 'dim7',
  'm7b5': 'm7b5', 'ø': 'm7b5', 'halfdim': 'm7b5',
  'sus2': 'sus2',
  'sus4': 'sus4',
};

// Intervals (semitones from root) for each quality, used to display chord notes
const CHORD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dom7:  [0, 4, 7, 10],
  maj7:  [0, 4, 7, 11],
  m7:    [0, 3, 7, 10],
  add9:  [0, 4, 10, 2],
  m9:    [0, 3, 10, 2],
  dim:   [0, 3, 6],
  dim7:  [0, 3, 6, 9],
  m7b5:  [0, 3, 6, 10],
  sus2:  [0, 2, 7],
  sus4:  [0, 5, 7],
};

// ── Moveable shape templates ───────────────────────────────────────────────────
// Offsets from barre fret n on the root string. null = muted; negative integers shift below the barre.
// Frets array order: [E, A, D, G, B, e] (low to high)

// E-shape: root on low E string (open semitone = 4)
// null = muted string; integers are fret offsets from the barre fret (may be negative)
const E_TEMPLATES = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  dom7:  [0, 2, 0, 1, 0, 0],
  maj7:  [0, 2, 1, 1, 0, 0],
  m7:    [0, 2, 0, 0, 0, 0],
  // 4-string inner shape (D-G-B-e): root-3rd-5th-9th, avoids stretchy full-barre
  add9:  [null, null, 2, 1, 0, 2],
  // 6-string classic barre (e.g. Am9 at fret 5 = 5-7-7-5-5-7): standard jazz position
  m9:    [0, 2, 2, 0, 0, 2],
  // dim: root–b5–root–m3rd on D-G-B (3-string, span=3)
  dim:   [null, null, 2, 0, -1, null],
  // dim7: root–b5–dim7–m3rd on D-G-B-e (4-string, span=1)
  dim7:  [null, null, 2, 3, 2, 3],
  // m7b5: 6-string voicing root–b5–b7–m3rd–b7–root
  m7b5:  [0, 1, 0, 0, 3, 0],
  sus2:  [0, 2, 4, 4, 0, 0],
  sus4:  [0, 2, 2, 2, 0, 0],
};

// A-shape: root on A string (open semitone = 9), low E muted
// null = muted string; integers are fret offsets from the barre fret (may be negative)
const A_TEMPLATES = {
  major: [null, 0, 2, 2, 2, 0],
  minor: [null, 0, 2, 2, 1, 0],
  dom7:  [null, 0, 2, 0, 2, 0],
  maj7:  [null, 0, 2, 1, 2, 0],
  m7:    [null, 0, 2, 0, 1, 0],
  // dom9 shell: root-3rd-b7-9th on A-D-G-B (same as dom7 shell + 9th)
  add9:  [null, 0, -1, 0, 0, null],
  // m9 shell: root-m3rd-b7-9th on A-D-G-B (n=1/Bb produces D=-1; use OPEN_VOICINGS instead)
  m9:    [null, 0, -2, 0, 0, null],
  // dim: root–b5–root–m3rd on A-D-G-B (span=2)
  dim:   [null, 0, 1, 2, 1, null],
  // dim7: root–b5–root–m3rd–dim7 on A-D-G-B-e (span=2)
  dim7:  [null, 0, 1, 2, 1, 2],
  // m7b5: root–b5–b7–m3rd–b5 on A-D-G-B-e (span=2)
  m7b5:  [null, 0, 1, 0, 1, -1],
  sus2:  [null, 0, 2, 2, 0, 0],
  sus4:  [null, 0, 2, 2, 3, 0],
};

// ── Open chord voicings ────────────────────────────────────────────────────────
// Key: `${rootSemi}_${quality}`  |  frets: [E, A, D, G, B, e]  |  -1 = muted

// Compact 4-string dom7 shell: root–3rd–b7–9th on A-D-G-B strings
// A=n, D=n−1 (major 3rd), G=n (b7), B=n (9th). 1-fret span — very playable.
// Verified: (7+n)%12 = b7 of root and (11+n)%12 = 9th of root for every A-shape barre n.
// (A root excluded: D would go to fret −1; A7 open already covers it.)
function _dom7shell(n) {
  return { label: 'Compact', frets: [-1, n, n - 1, n, n, -1] };
}

// Compact 4-string maj7 shell: root–3rd–maj7–9th on A-D-G-B strings
// A=n, D=n−1 (major 3rd), G=n+1 (maj7), B=n (9th). 2-fret span.
// Verified: (7+n+1)%12 = maj7 of root for every A-shape barre n.
// (A root excluded for same reason as above.)
function _maj7shell(n) {
  return { label: 'Compact', frets: [-1, n, n - 1, n + 1, n, -1] };
}

// Compact 4-string m9 inner: root–m3rd–5th–9th on D-G-B-e (2-fret span)
// D=(r+10)%12 (root), G=(r+8)%12 (m3rd), B=(r+8)%12 (5th), e=(r+10)%12 (9th)
// Skip r=2,3: (r+10)%12 wraps below (r+8)%12 creating a 10-fret gap
function _m9inner(r) {
  const f1 = (r + 10) % 12;
  const f2 = (r + 8) % 12;
  return { label: 'Compact', frets: [-1, -1, f1, f2, f2, f1] };
}

// Compact A-D-G-B m9 shell: root–m3rd–b7–9th (2-fret span)
// A=n, D=n-2 (m3rd), G=n (b7), B=n (9th)
// Skip n=1 (Bb root): D at -1 is invalid — use _m9shell(13) in OPEN_VOICINGS instead
function _m9shell(n) {
  return { label: 'Compact', frets: [-1, n, n - 2, n, n, -1] };
}

// Compact D-G-B-e maj7 mini-barre: root(D)–5th(G)–maj7(B)–3rd(e) (2-fret span)
// D at (r+10)%12, G-B-e all at r
// Skip r=0,1: (r+10)%12 wraps 10 frets above r
function _maj7mini(r) {
  return { label: 'Compact', frets: [-1, -1, (r + 10) % 12, r, r, r] };
}

const OPEN_VOICINGS = {
  // ── Major ──
  '4_major':  [{ label: 'Open', frets: [0,  2,  2,  1,  0,  0] }],  // E
  '9_major':  [{ label: 'Open', frets: [-1, 0,  2,  2,  2,  0] }],  // A
  '2_major':  [{ label: 'Open', frets: [-1, -1, 0,  2,  3,  2] }],  // D
  '7_major':  [{ label: 'Open', frets: [3,  2,  0,  0,  0,  3] }],  // G
  '0_major':  [{ label: 'Open', frets: [-1, 3,  2,  0,  1,  0] }],  // C

  // ── Minor ──
  '4_minor':  [{ label: 'Open', frets: [0,  2,  2,  0,  0,  0] }],  // Em
  '9_minor':  [{ label: 'Open', frets: [-1, 0,  2,  2,  1,  0] }],  // Am
  '2_minor':  [{ label: 'Open', frets: [-1, -1, 0,  2,  3,  1] }],  // Dm

  // ── Dominant 7 ──
  // Open/standard shapes for the common open-position keys
  '4_dom7':   [{ label: 'Open', frets: [0,  2,  0,  1,  0,  0] }, _dom7shell(7)],   // E7
  '9_dom7':   [{ label: 'Open', frets: [-1, 0,  2,  0,  2,  0] }],                  // A7 (open; D fret would be −1)
  '2_dom7':   [{ label: 'Open', frets: [-1, -1, 0,  2,  1,  2] }, _dom7shell(5)],   // D7
  '7_dom7':   [{ label: 'Open', frets: [3,  2,  0,  0,  0,  1] }, _dom7shell(10)],  // G7
  '11_dom7':  [{ label: 'Open', frets: [-1, 2,  1,  2,  0,  2] }, _dom7shell(2)],   // B7
  // Compact shells for the remaining keys
  '0_dom7':   [_dom7shell(3)],   // C7
  '1_dom7':   [_dom7shell(4)],   // C#7
  '3_dom7':   [_dom7shell(6)],   // Eb7
  '5_dom7':   [_dom7shell(8)],   // F7
  '6_dom7':   [_dom7shell(9)],   // F#7
  '8_dom7':   [_dom7shell(11)],  // Ab7
  '10_dom7':  [_dom7shell(1)],   // Bb7 (n=1, D open = major 3rd of Bb ✓)

  // ── Major 7 ──
  // Open shapes for common keys + compact A-D-G-B shell + D-G-B-e mini-barre
  '4_maj7':   [{ label: 'Open', frets: [0,  2,  1,  1,  0,  0] }, _maj7shell(7),  _maj7mini(4)],   // Emaj7
  '9_maj7':   [{ label: 'Open', frets: [-1, 0,  2,  1,  2,  0] },                 _maj7mini(9)],   // Amaj7
  '2_maj7':   [{ label: 'Open', frets: [-1, -1, 0,  2,  2,  2] }, _maj7shell(5)],                  // Dmaj7 (mini = same as open)
  '7_maj7':   [{ label: 'Open', frets: [3,  2,  0,  0,  0,  2] }, _maj7shell(10), _maj7mini(7)],   // Gmaj7
  '0_maj7':   [{ label: 'Open', frets: [-1, 3,  2,  0,  0,  0] }, _maj7shell(3)],                  // Cmaj7 (r=0 wrap: skip mini)
  // Compact shells + mini-barre for remaining keys
  '1_maj7':   [_maj7shell(4)],                      // C#maj7 (r=1 wrap: skip mini)
  '3_maj7':   [_maj7shell(6),  _maj7mini(3)],       // Ebmaj7
  '5_maj7':   [_maj7shell(8),  _maj7mini(5)],       // Fmaj7
  '6_maj7':   [_maj7shell(9),  _maj7mini(6)],       // F#maj7
  '8_maj7':   [_maj7shell(11), _maj7mini(8)],       // Abmaj7
  '10_maj7':  [_maj7shell(1),  _maj7mini(10)],      // Bbmaj7
  '11_maj7':  [_maj7shell(2),  _maj7mini(11)],      // Bmaj7

  // ── Minor 7 ──
  '4_m7':     [{ label: 'Open', frets: [0,  2,  0,  0,  0,  0] }],  // Em7
  '9_m7':     [{ label: 'Open', frets: [-1, 0,  2,  0,  1,  0] }],  // Am7
  '2_m7':     [{ label: 'Open', frets: [-1, -1, 0,  2,  1,  1] }],  // Dm7

  // ── Sus2 ──
  '4_sus2':   [{ label: 'Open', frets: [0,  2,  4,  4,  0,  0] }],  // Esus2
  '9_sus2':   [{ label: 'Open', frets: [-1, 0,  2,  2,  0,  0] }],  // Asus2
  '2_sus2':   [{ label: 'Open', frets: [-1, -1, 0,  2,  3,  0] }],  // Dsus2
  '7_sus2':   [{ label: 'Open', frets: [3,  0,  0,  0,  3,  3] }],  // Gsus2

  // ── Sus4 ──
  '4_sus4':   [{ label: 'Open', frets: [0,  2,  2,  2,  0,  0] }],  // Esus4
  '9_sus4':   [{ label: 'Open', frets: [-1, 0,  2,  2,  3,  0] }],  // Asus4
  '2_sus4':   [{ label: 'Open', frets: [-1, -1, 0,  2,  3,  3] }],  // Dsus4
  '7_sus4':   [{ label: 'Open', frets: [3,  3,  0,  0,  1,  3] }],  // Gsus4

  // ── 9th (dominant 9) ──
  // Open shapes include b7; A_TEMPLATES generates dom9 shell for all non-A/non-E roots
  '4_add9':   [{ label: 'Open', frets: [0,  2,  0,  1,  0,  2] }],              // E9  (D=open=b7)
  '9_add9':   [{ label: 'Open', frets: [-1, 0,  2,  0,  2,  0] }, _dom7shell(12)],  // A9 + x-12-11-12-12-x

  // ── Minor 9th ──
  // Open shapes include b7; A_TEMPLATES generates m9 shell for all non-A/non-Bb roots
  '4_m9':     [{ label: 'Open', frets: [0,  2,  0,  0,  0,  2] }],              // Em9 (D=open=b7)
  '9_m9':     [{ label: 'Open', frets: [-1, 0,  2,  0,  1,  0] }, _m9shell(12)],   // Am9 + x-12-10-12-12-x
  '10_m9':    [_m9shell(13)],  // Bbm9 (aFret=1 makes D=−1; use octave shape instead)

  // ── Diminished ──
  // E and A roots: open-position shapes (otherwise template jumps to fret 12)
  '4_dim':    [{ label: 'Open', frets: [0,  1,  2,  0,  -1, -1] }],  // Edim
  '9_dim':    [{ label: 'Open', frets: [-1, 0,  1,  2,  1,  -1] }],  // Adim

  // ── Diminished 7th ──
  '4_dim7':   [{ label: 'Open', frets: [-1, -1, 2,  3,  2,  3 ] }],  // Edim7 x-x-2-3-2-3

  // ── Half Diminished (m7b5) ──
  '4_m7b5':   [{ label: 'Open', frets: [0,  1,  0,  0,  3,  0 ] }],  // Em7b5
  '9_m7b5':   [{ label: 'Open', frets: [-1, 0,  1,  0,  1,  -1] }],  // Am7b5
};

// ── Triad voicings ─────────────────────────────────────────────────────────────
// Standard guitar string open semitones and MIDI base pitches [E, A, D, G, B, e]
const STRING_OPENS        = [4, 9, 2, 7, 11, 4];
const STRING_BASE_PITCHES = [40, 45, 50, 55, 59, 64];

const TRIAD_STRING_SETS = [
  { indices: [3, 4, 5], label: 'G-B-e' },
  { indices: [2, 3, 4], label: 'D-G-B' },
  { indices: [1, 2, 3], label: 'A-D-G' },
  { indices: [0, 1, 2], label: 'E-A-D' },
];

const INVERSION_LABELS = ['Root pos.', '1st inv.', '2nd inv.'];

// Reject voicings whose non-zero frets don't fit in the 5-row diagram window
function fitsInWindow(frets) {
  const active = frets.filter(f => f > 0);
  if (!active.length) return true;
  const min = Math.min(...active);
  const max = Math.max(...active);
  return max <= 5 || max - min <= 4;
}

const QUAD_STRING_SETS = [
  { indices: [2, 3, 4, 5], label: 'D-G-B-e' },
  { indices: [1, 2, 3, 4], label: 'A-D-G-B' },
  { indices: [0, 1, 2, 3], label: 'E-A-D-G' },
];

const QUAD_INVERSION_LABELS = ['Root pos.', '1st inv.', '2nd inv.', '3rd inv.'];

function computeQuadVoicings(rootSemi, quality) {
  const intervals = CHORD_INTERVALS[quality];
  if (!intervals || intervals.length !== 4) return [];

  const voicings = [];

  for (const stringSet of QUAD_STRING_SETS) {
    for (let inv = 0; inv < 4; inv++) {
      const arranged = [
        intervals[inv % 4],
        intervals[(inv + 1) % 4],
        intervals[(inv + 2) % 4],
        intervals[(inv + 3) % 4],
      ];

      const frets = new Array(6).fill(-1);
      let prevPitch = -Infinity;
      let valid = true;

      for (let j = 0; j < 4; j++) {
        const si = stringSet.indices[j];
        const targetSemi = (rootSemi + arranged[j]) % 12;
        let fret = (targetSemi - STRING_OPENS[si] + 12) % 12;
        let pitch = STRING_BASE_PITCHES[si] + fret;

        if (pitch <= prevPitch) { fret += 12; pitch += 12; }
        if (fret > 12) { valid = false; break; }

        prevPitch = pitch;
        frets[si] = fret;
      }

      if (valid && fitsInWindow(frets)) {
        voicings.push({
          label: `${QUAD_INVERSION_LABELS[inv]} — ${stringSet.label}`,
          frets,
        });
      }
    }
  }

  return voicings;
}

function computeTriadVoicings(rootSemi, quality) {
  const intervals = CHORD_INTERVALS[quality];
  if (!intervals || intervals.length !== 3) return [];

  const voicings = [];

  for (const stringSet of TRIAD_STRING_SETS) {
    for (let inv = 0; inv < 3; inv++) {
      const arranged = [
        intervals[inv % 3],
        intervals[(inv + 1) % 3],
        intervals[(inv + 2) % 3],
      ];

      const frets = new Array(6).fill(-1);
      let prevPitch = -Infinity;
      let valid = true;

      for (let j = 0; j < 3; j++) {
        const si = stringSet.indices[j];
        const targetSemi = (rootSemi + arranged[j]) % 12;
        let fret = (targetSemi - STRING_OPENS[si] + 12) % 12;
        let pitch = STRING_BASE_PITCHES[si] + fret;

        // Push up one octave if pitch doesn't ascend
        if (pitch <= prevPitch) { fret += 12; pitch += 12; }
        if (fret > 12) { valid = false; break; }

        prevPitch = pitch;
        frets[si] = fret;
      }

      if (valid && fitsInWindow(frets)) {
        voicings.push({
          label: `${INVERSION_LABELS[inv]} — ${stringSet.label}`,
          frets,
        });
      }
    }
  }

  return voicings;
}

// ── Public API ─────────────────────────────────────────────────────────────────

function applyTemplate(template, barreFret) {
  return template.map(o => o === null ? -1 : barreFret + o);
}

export function getChordVoicings(rootSemi, quality) {
  const key      = `${rootSemi}_${quality}`;
  const voicings = [];

  if (OPEN_VOICINGS[key]) voicings.push(...OPEN_VOICINGS[key]);

  const eTemplate = E_TEMPLATES[quality];
  const aTemplate = A_TEMPLATES[quality];

  // E-shape barre (root on low E string, open semitone = 4)
  const eFret = (rootSemi - 4 + 12) % 12;
  if (eTemplate && (eFret > 0 || !OPEN_VOICINGS[key])) {
    voicings.push({
      label: `E shape — fret ${eFret || 12}`,
      frets: applyTemplate(eTemplate, eFret || 12),
    });
  }

  // A-shape barre (root on A string, open semitone = 9)
  const aFret = (rootSemi - 9 + 12) % 12;
  if (aTemplate && (aFret > 0 || !OPEN_VOICINGS[key])) {
    voicings.push({
      label: `A shape — fret ${aFret || 12}`,
      frets: applyTemplate(aTemplate, aFret || 12),
    });
  }

  return {
    voicings,
    triads: computeTriadVoicings(rootSemi, quality),
    quads:  computeQuadVoicings(rootSemi, quality),
  };
}

export function getChordNotes(rootSemi, quality) {
  const intervals = CHORD_INTERVALS[quality] ?? CHORD_INTERVALS.major;
  return intervals.map(i => NOTE_NAMES[(rootSemi + i) % 12]);
}

/** Return suggestion objects matching the current input text. */
export function getChordSuggestions(inputText) {
  const trimmed = inputText.trim();
  if (!trimmed) return [];

  const match = trimmed.match(/^([A-Ga-g][#b]?)(.*)/);
  if (!match) return [];

  const rootRaw = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  if (NOTE_MAP[rootRaw] === undefined) return [];

  const rootSemi  = NOTE_MAP[rootRaw];
  const typedLower = trimmed.toLowerCase();

  return QUALITIES
    .map(({ suffix, quality, label }) => ({
      name: `${rootRaw}${suffix}`,
      quality,
      label,
      rootSemi,
      rootName: rootRaw,
    }))
    .filter(({ name }) => name.toLowerCase().startsWith(typedLower));
}

/** Parse a raw chord string into a suggestion-like object, or null if unrecognised. */
export function parseChordInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^([A-Ga-g][#b]?)(.*)/);
  if (!match) return null;

  const rootRaw    = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const qualityRaw = match[2].trim();
  const rootSemi   = NOTE_MAP[rootRaw];
  if (rootSemi === undefined) return null;

  const quality = QUALITY_MAP[qualityRaw];
  if (!quality) return null;

  const found = QUALITIES.find(q => q.quality === quality);
  return {
    rootSemi,
    rootName: rootRaw,
    name:  `${rootRaw}${found?.suffix ?? ''}`,
    label: found?.label ?? 'Major',
    quality,
  };
}

// ── SVG chord diagram ──────────────────────────────────────────────────────────

const STR_GAP    = 20;
const FRET_GAP   = 26;
const FRETS_SHOWN = 5;
const PAD_L = 10;
const PAD_R = 34;
const PAD_T = 30;
const PAD_B = 8;
const DIAG_W = PAD_L + 5 * STR_GAP + PAD_R;
const DIAG_H = PAD_T + FRETS_SHOWN * FRET_GAP + PAD_B;

function svgNode(tag, attrs = {}, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

const sx = i  => PAD_L + i * STR_GAP;
const fy = fi => PAD_T + fi * FRET_GAP;

export function buildChordDiagram(voicing) {
  const { frets } = voicing;

  const activeFrets = frets.filter(f => f > 0);
  const minFret  = activeFrets.length ? Math.min(...activeFrets) : 0;
  const maxFret  = activeFrets.length ? Math.max(...activeFrets) : 0;
  const startFret = maxFret <= FRETS_SHOWN ? 1 : minFret;
  const showNut   = startFret === 1;

  const svg = svgNode('svg', {
    width: DIAG_W, height: DIAG_H,
    viewBox: `0 0 ${DIAG_W} ${DIAG_H}`,
    class: 'chord-diagram',
  });

  // X / O markers above the nut
  frets.forEach((f, i) => {
    if (f === -1) {
      svg.appendChild(svgNode('text', {
        x: sx(i), y: PAD_T - 10,
        'text-anchor': 'middle', fill: '#e74c3c',
        'font-size': '12', 'font-weight': '700', 'font-family': 'sans-serif',
      }, '✕'));
    } else if (f === 0) {
      svg.appendChild(svgNode('circle', {
        cx: sx(i), cy: PAD_T - 10, r: 5,
        fill: 'none', stroke: '#aaa', 'stroke-width': '1.5',
      }));
    }
  });

  // Horizontal fret lines
  for (let fi = 0; fi <= FRETS_SHOWN; fi++) {
    const isNut = showNut && fi === 0;
    svg.appendChild(svgNode('line', {
      x1: sx(0), y1: fy(fi), x2: sx(5), y2: fy(fi),
      stroke: isNut ? '#d4c49a' : '#555',
      'stroke-width': isNut ? 4 : 1.5,
    }));
  }

  // Vertical string lines
  for (let si = 0; si < 6; si++) {
    svg.appendChild(svgNode('line', {
      x1: sx(si), y1: fy(0), x2: sx(si), y2: fy(FRETS_SHOWN),
      stroke: '#666', 'stroke-width': 1.2,
    }));
  }

  // Fret number when diagram doesn't start at the nut
  if (!showNut) {
    svg.appendChild(svgNode('text', {
      x: sx(5) + 12, y: fy(0) + FRET_GAP / 2,
      'dominant-baseline': 'middle',
      fill: '#aaa', 'font-size': '12', 'font-family': 'sans-serif',
    }, `${startFret}fr`));
  }

  // Detect barre: 2+ strings at the minimum fret spanning ≥ 3 strings
  let barre = null;
  if (minFret > 0) {
    const barreStrings = frets.reduce((acc, f, i) => (f === minFret ? [...acc, i] : acc), []);
    if (barreStrings.length >= 2 && (barreStrings.at(-1) - barreStrings[0]) >= 2) {
      barre = { fret: minFret, from: barreStrings[0], to: barreStrings.at(-1) };
    }
  }

  if (barre) {
    const by = fy(barre.fret - startFret) + FRET_GAP / 2;
    svg.appendChild(svgNode('rect', {
      x: sx(barre.from) - 6, y: by - 7,
      width: (barre.to - barre.from) * STR_GAP + 12, height: 14,
      rx: 7, fill: '#e0e0e0',
    }));
  }

  // Individual dots (skip strings already covered by the barre bar)
  frets.forEach((f, si) => {
    if (f <= 0) return;
    if (barre && f === barre.fret && si >= barre.from && si <= barre.to) return;
    const row = f - startFret;
    if (row < 0 || row >= FRETS_SHOWN) return;
    svg.appendChild(svgNode('circle', {
      cx: sx(si), cy: fy(row) + FRET_GAP / 2,
      r: 7, fill: '#e0e0e0',
    }));
  });

  return svg;
}
