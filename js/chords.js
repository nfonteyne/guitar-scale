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
  { suffix: '9',    quality: 'add9',  label: 'Add 9th'        },
  { suffix: 'm9',   quality: 'm9',    label: 'Minor Add 9th'  },
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
  add9:  [0, 4, 7, 2],
  m9:    [0, 3, 7, 2],
  sus2:  [0, 2, 7],
  sus4:  [0, 5, 7],
};

// ── Moveable shape templates ───────────────────────────────────────────────────
// Offsets from barre fret n on the root string. -1 = muted.
// Frets array order: [E, A, D, G, B, e] (low to high)

// E-shape: root on low E string (open semitone = 4)
const E_TEMPLATES = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  dom7:  [0, 2, 0, 1, 0, 0],
  maj7:  [0, 2, 1, 1, 0, 0],
  m7:    [0, 2, 0, 0, 0, 0],
  add9:  [0, 2, 2, 1, 0, 2],
  m9:    [0, 2, 2, 0, 0, 2],
  sus2:  [0, 2, 4, 4, 0, 0],
  sus4:  [0, 2, 2, 2, 0, 0],
};

// A-shape: root on A string (open semitone = 9), low E muted
const A_TEMPLATES = {
  major: [-1, 0, 2, 2, 2, 0],
  minor: [-1, 0, 2, 2, 1, 0],
  dom7:  [-1, 0, 2, 0, 2, 0],
  maj7:  [-1, 0, 2, 1, 2, 0],
  m7:    [-1, 0, 2, 0, 1, 0],
  add9:  [-1, 0, 2, 4, 2, 0],
  m9:    [-1, 0, 2, 4, 1, 0],
  sus2:  [-1, 0, 2, 2, 0, 0],
  sus4:  [-1, 0, 2, 2, 3, 0],
};

// ── Open chord voicings ────────────────────────────────────────────────────────
// Key: `${rootSemi}_${quality}`  |  frets: [E, A, D, G, B, e]  |  -1 = muted

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
  '4_dom7':   [{ label: 'Open', frets: [0,  2,  0,  1,  0,  0] }],  // E7
  '9_dom7':   [{ label: 'Open', frets: [-1, 0,  2,  0,  2,  0] }],  // A7
  '2_dom7':   [{ label: 'Open', frets: [-1, -1, 0,  2,  1,  2] }],  // D7
  '7_dom7':   [{ label: 'Open', frets: [3,  2,  0,  0,  0,  1] }],  // G7
  '11_dom7':  [{ label: 'Open', frets: [-1, 2,  1,  2,  0,  2] }],  // B7

  // ── Major 7 ──
  '4_maj7':   [{ label: 'Open', frets: [0,  2,  1,  1,  0,  0] }],  // Emaj7
  '9_maj7':   [{ label: 'Open', frets: [-1, 0,  2,  1,  2,  0] }],  // Amaj7
  '2_maj7':   [{ label: 'Open', frets: [-1, -1, 0,  2,  2,  2] }],  // Dmaj7
  '7_maj7':   [{ label: 'Open', frets: [3,  2,  0,  0,  0,  2] }],  // Gmaj7
  '0_maj7':   [{ label: 'Open', frets: [-1, 3,  2,  0,  0,  0] }],  // Cmaj7

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

  // ── Add9 ──
  '4_add9':   [{ label: 'Open', frets: [0,  2,  2,  1,  0,  2] }],  // E9
  '9_add9':   [{ label: 'Open', frets: [-1, 0,  2,  4,  2,  0] }],  // A9
  '2_add9':   [{ label: 'Open', frets: [-1, 5,  4,  2,  3,  0] }],  // D9
  '7_add9':   [{ label: 'Open', frets: [3,  2,  0,  2,  0,  3] }],  // G9
  '0_add9':   [{ label: 'Open', frets: [-1, 3,  2,  0,  3,  0] }],  // C9

  // ── Minor add9 ──
  '4_m9':     [{ label: 'Open', frets: [0,  2,  2,  0,  0,  2] }],  // Em9
  '9_m9':     [{ label: 'Open', frets: [-1, 0,  2,  4,  1,  0] }],  // Am9
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
  return template.map(o => o === -1 ? -1 : barreFret + o);
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
const PAD_R = 24;
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
      x: sx(5) + 7, y: fy(1) + 5,
      fill: '#aaa', 'font-size': '10', 'font-family': 'sans-serif',
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
