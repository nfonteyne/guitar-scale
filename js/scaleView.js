import { KEYS, MINOR_KEYS, getPositions, getMinorPositions, getAllNotes, getPentaSemitones, getChordSemitones } from './data.js';
import { buildFretboard, paintNotes } from './fretboard.js';

// ── State ─────────────────────────────────────────────────────────────────────

let currentKeyIndex   = 0;
let scaleType         = 'major';
let activePositions   = getPositions(0);
let displayMode       = 'notes';
let selectedPositions = new Set();
let pentaMode         = false;
let chordMode         = false;

const SCALE_TYPES = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
];

const DISPLAY_MODES = [
  { id: 'notes',     label: 'Notes' },
  { id: 'intervals', label: 'Intervals' },
  { id: 'both',      label: 'Both' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentPositions() {
  return scaleType === 'minor'
    ? getMinorPositions(currentKeyIndex)
    : getPositions(currentKeyIndex);
}

function subtitleText() {
  const name = KEYS[currentKeyIndex].name;
  return `${name} ${scaleType === 'minor' ? 'Minor' : 'Major'} — CAGED System`;
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const allNotes       = getAllNotes(currentKeyIndex, scaleType);
  let   selectedKeys   = null;
  const selectedPosData = [];

  if (selectedPositions.size > 0) {
    selectedKeys = new Set();
    for (const idx of selectedPositions) {
      selectedPosData.push(activePositions[idx]);
      for (const note of activePositions[idx].notes) {
        selectedKeys.add(`${note[0]},${note[1]}`);
      }
    }
  }

  const pentaSemitones = pentaMode ? getPentaSemitones(currentKeyIndex, scaleType) : null;
  const chordSemitones = chordMode ? getChordSemitones(currentKeyIndex, scaleType) : null;
  paintNotes(allNotes, selectedKeys, selectedPosData, displayMode, pentaSemitones, chordSemitones);

  const overlayActive = pentaMode || chordMode;
  document.getElementById('legendPenta').style.display  = overlayActive ? '' : 'none';
  document.getElementById('legendPenta2').style.display = overlayActive ? '' : 'none';

  document.querySelectorAll('.pos-btn').forEach((btn, i) => {
    btn.classList.toggle('active', selectedPositions.has(i));
  });

  updateInfoCard();
}

// ── Key selector ──────────────────────────────────────────────────────────────

function buildKeyButtons() {
  const container = document.getElementById('keyButtons');
  KEYS.forEach((key, i) => {
    const btn = document.createElement('button');
    btn.className = 'key-btn' + (i === 0 ? ' active' : '');
    btn.textContent = key.name;
    btn.addEventListener('click', () => selectKey(i));
    container.appendChild(btn);
  });
}

function selectKey(idx) {
  currentKeyIndex = idx;
  activePositions = currentPositions();
  selectedPositions.clear();

  document.querySelectorAll('.key-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  document.getElementById('subtitle').textContent  = subtitleText();
  document.getElementById('rootLabel').textContent = KEYS[idx].name;
  document.title = `Guitar Scale Trainer — ${subtitleText()}`;

  render();
}

// ── Scale type toggle ─────────────────────────────────────────────────────────

function buildScaleButtons() {
  const container = document.getElementById('scaleButtons');
  SCALE_TYPES.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'scale-btn' + (id === scaleType ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      if (scaleType === id) return;
      scaleType = id;
      activePositions = currentPositions();
      selectedPositions.clear();
      document.querySelectorAll('.scale-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.toLowerCase() === id);
      });
      document.getElementById('subtitle').textContent = subtitleText();
      document.title = `Guitar Scale Trainer — ${subtitleText()}`;
      render();
    });
    container.appendChild(btn);
  });
}

// ── Position selector ─────────────────────────────────────────────────────────

function buildPosButtons() {
  const container = document.getElementById('posButtons');
  container.innerHTML = '';
  activePositions.forEach((pos, i) => {
    const btn = document.createElement('button');
    btn.className = 'pos-btn';
    btn.textContent = pos.name;
    btn.addEventListener('click', () => togglePosition(i));
    container.appendChild(btn);
  });
}

function togglePosition(idx) {
  if (selectedPositions.has(idx)) {
    selectedPositions.delete(idx);
  } else {
    selectedPositions.add(idx);
  }
  render();
}

// ── Display mode toggle ───────────────────────────────────────────────────────

function buildDisplayButtons() {
  const container = document.getElementById('displayButtons');
  DISPLAY_MODES.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'display-btn' + (id === displayMode ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      displayMode = id;
      document.querySelectorAll('.display-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === label);
      });
      render();
    });
    container.appendChild(btn);
  });
}

// ── Overlay toggles (Pentatonic / Chord) ─────────────────────────────────────

function buildPentaButtons() {
  const container = document.getElementById('pentaButtons');

  const chordBtn = document.createElement('button');
  chordBtn.className = 'penta-btn';
  chordBtn.textContent = 'Chord (1–3–5)';

  const pentaBtn = document.createElement('button');
  pentaBtn.className = 'penta-btn';
  pentaBtn.textContent = 'Pentatonic';

  chordBtn.addEventListener('click', () => {
    chordMode = !chordMode;
    if (chordMode) { pentaMode = false; pentaBtn.classList.remove('active'); }
    chordBtn.classList.toggle('active', chordMode);
    render();
  });

  pentaBtn.addEventListener('click', () => {
    pentaMode = !pentaMode;
    if (pentaMode) { chordMode = false; chordBtn.classList.remove('active'); }
    pentaBtn.classList.toggle('active', pentaMode);
    render();
  });

  container.appendChild(chordBtn);
  container.appendChild(pentaBtn);
}

// ── Info card ─────────────────────────────────────────────────────────────────

function updateInfoCard() {
  const el      = document.getElementById('posInfo');
  const keyName = KEYS[currentKeyIndex].name;

  if (selectedPositions.size === 0) {
    const key       = scaleType === 'minor' ? MINOR_KEYS[currentKeyIndex] : KEYS[currentKeyIndex];
    const scaleName = scaleType === 'minor' ? 'Minor' : 'Major';
    el.innerHTML = `
      <h2>${keyName} ${scaleName}</h2>
      <p style="letter-spacing:0.06em; font-size:1rem;">${key.scale.join('  ·  ')}</p>
      <p class="pos-hint" style="margin-top:8px;">Click a CAGED position to focus on a box pattern.</p>`;
    return;
  }

  el.innerHTML = [...selectedPositions]
    .sort((a, b) => a - b)
    .map(i => {
      const pos = activePositions[i];
      return `
        <h2>${pos.name}</h2>
        <p>${pos.description}</p>
        <div class="roots">
          ${pos.roots.map(r => `<span class="root-tag">${keyName} — ${r}</span>`).join('')}
        </div>`;
    })
    .join('<hr class="pos-divider">');
}

// ── Public init ───────────────────────────────────────────────────────────────

export function initScaleView() {
  buildFretboard();
  buildKeyButtons();
  buildScaleButtons();
  buildPosButtons();
  buildDisplayButtons();
  buildPentaButtons();
  render();
}
