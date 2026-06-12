// SVG fretboard renderer
// All layout math lives here so app.js only calls high-level functions.

// ── Layout constants ──────────────────────────────────────────────────────────
export const NUM_STRINGS = 6;
export const NUM_FRETS   = 17;   // frets 1–17 displayed

const FW    = 55;   // fret compartment width (px)
const SH    = 32;   // vertical gap between strings (px)
const PAD_L = 38;   // left padding — room for string labels
const PAD_R = 24;
const PAD_T = 34;   // top padding — room for fret numbers
const PAD_B = 18;

export const SVG_W = PAD_L + NUM_FRETS * FW + PAD_R;
export const SVG_H = PAD_T + (NUM_STRINGS - 1) * SH + PAD_B;

// string name labels, index 0 → string 1 (high e)
const STRING_NAMES  = ['e', 'B', 'G', 'D', 'A', 'E'];
const STRING_COLORS = ['#d8d8d8', '#d0d0b0', '#c8c860', '#c09030', '#b07820', '#906010'];
const STRING_WIDTHS = [1, 1.2, 1.5, 2, 2.5, 3];

const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17];

// ── Coordinate helpers ────────────────────────────────────────────────────────

/** X centre of a fret compartment (fret 1 = first box after the nut). */
export function fretCX(fret) {
  return PAD_L + (fret - 0.5) * FW;
}

/** Y centre of a string (string 1 = high e = top). */
export function stringCY(str) {
  return PAD_T + (str - 1) * SH;
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build the static fretboard skeleton (wood, nut, fret lines, inlays,
 * strings, labels). Call once after the SVG element exists in the DOM.
 */
export function buildFretboard(svgEl_) {
  const svg = svgEl_ ?? document.getElementById('fretboard');
  svg.setAttribute('width',   SVG_W);
  svg.setAttribute('height',  SVG_H);
  svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);

  // Wood background
  svg.appendChild(svgEl('rect', {
    x: PAD_L, y: PAD_T - 18,
    width: NUM_FRETS * FW, height: (NUM_STRINGS - 1) * SH + 36,
    fill: '#2e1a0e', rx: 5,
  }));

  // Highlight boxes for selected CAGED positions (populated dynamically)
  svg.appendChild(svgEl('g', { id: 'highlightLayer' }));

  // Nut
  svg.appendChild(svgEl('rect', {
    x: PAD_L - 5, y: PAD_T - 18,
    width: 6, height: (NUM_STRINGS - 1) * SH + 36,
    fill: '#d4c49a',
  }));

  // Fret lines
  for (let f = 1; f <= NUM_FRETS; f++) {
    const x = PAD_L + f * FW;
    svg.appendChild(svgEl('line', {
      x1: x, y1: PAD_T - 18, x2: x, y2: PAD_T + (NUM_STRINGS - 1) * SH + 18,
      stroke: '#7a5a3a',
      'stroke-width': f === 12 ? 3 : 1.5,
    }));
  }

  // Inlay dots
  for (const f of INLAY_FRETS) {
    const cx = fretCX(f);
    if (f === 12) {
      for (const s of [2, 4]) {
        svg.appendChild(svgEl('circle', { cx, cy: stringCY(s), r: 5, fill: '#5a3a1a', opacity: 0.8 }));
      }
    } else {
      svg.appendChild(svgEl('circle', {
        cx, cy: PAD_T + (NUM_STRINGS - 1) * SH / 2,
        r: 5, fill: '#5a3a1a', opacity: 0.8,
      }));
    }
  }

  // Strings
  for (let s = 1; s <= NUM_STRINGS; s++) {
    const y = stringCY(s);
    svg.appendChild(svgEl('line', {
      x1: PAD_L - 5, y1: y, x2: PAD_L + NUM_FRETS * FW, y2: y,
      stroke: STRING_COLORS[s - 1],
      'stroke-width': STRING_WIDTHS[s - 1],
    }));
  }

  // String labels
  for (let s = 1; s <= NUM_STRINGS; s++) {
    const t = svgEl('text', {
      x: PAD_L - 16, y: stringCY(s) + 4,
      'text-anchor': 'middle',
      fill: '#888', 'font-size': '12', 'font-family': 'monospace',
    });
    t.textContent = STRING_NAMES[s - 1];
    svg.appendChild(t);
  }

  // Fret numbers
  for (let f = 1; f <= NUM_FRETS; f++) {
    const t = svgEl('text', {
      x: fretCX(f), y: PAD_T - 19,
      'text-anchor': 'middle',
      fill: f === 12 ? '#f5c842' : '#666',
      'font-size': '11', 'font-family': 'sans-serif',
      'font-weight': f === 12 ? '700' : '400',
    });
    t.textContent = f;
    svg.appendChild(t);
  }

  // Empty group for note dots — gets rebuilt on each renderPosition call
  svg.appendChild(svgEl('g', { id: 'notesLayer' }));
}

/**
 * Render all scale notes, optionally dimming those outside selected positions.
 * @param {Array}       allNotes       - every scale note across frets 1-17
 * @param {Set|null}    selectedKeys   - Set of "str,fret" strings to highlight; null = highlight all
 * @param {Array}       positions      - selected position objects (for box outlines)
 * @param {string}      displayMode    - 'notes' | 'intervals' | 'both'
 * @param {Set|null}    pentaSemitones - Set of semitones in the active pentatonic; null = no overlay
 */
export function paintNotes(allNotes, selectedKeys, positions, displayMode = 'notes', pentaSemitones = null, chordSemitones = null) {
  // Redraw highlight boxes
  const hlGroup = document.getElementById('highlightLayer');
  hlGroup.innerHTML = '';
  for (const pos of positions) {
    const [f1, f2] = pos.fretRange;
    hlGroup.appendChild(svgEl('rect', {
      x: PAD_L + (f1 - 1) * FW,
      y: PAD_T - 18,
      width: (f2 - f1 + 1) * FW,
      height: (NUM_STRINGS - 1) * SH + 36,
      fill: 'rgba(245,200,66,0.07)',
      stroke: 'rgba(245,200,66,0.28)',
      'stroke-width': 1,
      rx: 5,
    }));
  }

  // Redraw note dots
  const layer = document.getElementById('notesLayer');
  layer.innerHTML = '';

  const STRING_OPEN_LOCAL = [4, 11, 7, 2, 9, 4];

  for (const [str, fret, name, isRoot, degree] of allNotes) {
    const highlighted = selectedKeys === null || selectedKeys.has(`${str},${fret}`);
    const cx = fretCX(fret);
    const cy = stringCY(str);

    const semi     = (STRING_OPEN_LOCAL[str - 1] + fret) % 12;
    const isPenta  = pentaSemitones  !== null && pentaSemitones.has(semi);
    const isChord  = chordSemitones  !== null && chordSemitones.has(semi);
    const overlay  = pentaSemitones !== null || chordSemitones !== null;
    const isActive = isPenta || isChord;

    if (!highlighted) {
      // Dim ghost dot — no label
      layer.appendChild(svgEl('circle', {
        cx, cy, r: 7,
        fill:           isRoot ? 'rgba(192,57,43,0.28)' : 'rgba(26,110,181,0.2)',
        stroke:         isRoot ? 'rgba(231,76,60,0.45)'  : 'rgba(52,152,219,0.35)',
        'stroke-width': 1.5,
      }));
      continue;
    }

    // Choose colours — both penta and chord overlays share the same green scheme
    let fillColor, strokeColor;
    if (isActive && isRoot) {
      fillColor = '#2ecc71'; strokeColor = '#ffffff';
    } else if (isActive) {
      fillColor = '#1a5c3a'; strokeColor = '#2ecc71';
    } else if (overlay) {
      // note outside the active overlay — dim it
      fillColor = isRoot ? 'rgba(192,57,43,0.45)' : 'rgba(26,110,181,0.35)';
      strokeColor = isRoot ? 'rgba(231,76,60,0.6)' : 'rgba(52,152,219,0.5)';
    } else {
      fillColor = isRoot ? '#c0392b' : '#1a6eb5';
      strokeColor = isRoot ? '#e74c3c' : '#3498db';
    }

    // Full-brightness dot
    layer.appendChild(svgEl('circle', {
      cx, cy, r: 12,
      fill:           fillColor,
      stroke:         strokeColor,
      'stroke-width': 2,
    }));

    if (displayMode === 'both') {
      const top = svgEl('text', {
        x: cx, y: cy - 1,
        'text-anchor': 'middle',
        fill: 'white', 'font-size': '8', 'font-weight': '700', 'font-family': 'sans-serif',
      });
      top.textContent = degree;
      layer.appendChild(top);

      const bot = svgEl('text', {
        x: cx, y: cy + 7,
        'text-anchor': 'middle',
        fill: 'rgba(255,255,255,0.85)', 'font-size': '7', 'font-weight': '600', 'font-family': 'sans-serif',
      });
      bot.textContent = name;
      layer.appendChild(bot);
    } else {
      const label = svgEl('text', {
        x: cx, y: cy + 4,
        'text-anchor': 'middle',
        fill: 'white',
        'font-size': displayMode === 'intervals' ? '11' : '10',
        'font-weight': '700', 'font-family': 'sans-serif',
      });
      label.textContent = displayMode === 'intervals' ? degree : name;
      layer.appendChild(label);
    }
  }
}
