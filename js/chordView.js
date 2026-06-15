import { getChordSuggestions, getChordVoicings, getChordNotes, buildChordDiagram } from './chords.js';

export function initChordView() {
  const input      = document.getElementById('chordSearchInput');
  const suggestEl  = document.getElementById('chordSuggestions');
  const results    = document.getElementById('chordResults');

  let activeSuggestions = [];

  // ── Suggestions ─────────────────────────────────────────────────────────────

  function showSuggestions(suggestions) {
    activeSuggestions = suggestions;
    suggestEl.innerHTML = '';

    if (!suggestions.length) {
      hideSuggestions();
      return;
    }

    suggestions.forEach(s => {
      const item = document.createElement('button');
      item.className = 'suggestion-item';
      item.innerHTML =
        `<span class="suggestion-name">${s.name}</span>` +
        `<span class="suggestion-label">${s.label}</span>`;
      // mousedown fires before blur so the input doesn't lose focus before we read it
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        selectChord(s);
      });
      suggestEl.appendChild(item);
    });

    suggestEl.hidden = false;
    input.classList.add('has-suggestions');
  }

  function hideSuggestions() {
    suggestEl.innerHTML = '';
    suggestEl.hidden = true;
    input.classList.remove('has-suggestions');
    activeSuggestions = [];
  }

  // ── Chord display ────────────────────────────────────────────────────────────

  function selectChord(suggestion) {
    input.value = suggestion.name;
    hideSuggestions();
    showDiagrams(suggestion);
  }

  function buildCardRow(voicingList) {
    const cards = document.createElement('div');
    cards.className = 'chord-cards';
    voicingList.forEach(voicing => {
      const card = document.createElement('div');
      card.className = 'chord-card';
      card.appendChild(buildChordDiagram(voicing));
      const lbl = document.createElement('p');
      lbl.className = 'chord-card-label';
      lbl.textContent = voicing.label;
      card.appendChild(lbl);
      cards.appendChild(card);
    });
    return cards;
  }

  function showDiagrams(suggestion) {
    results.innerHTML = '';

    const { voicings, triads, quads } = getChordVoicings(suggestion.rootSemi, suggestion.quality);
    const noteNames = getChordNotes(suggestion.rootSemi, suggestion.quality).join(' – ');

    const section = document.createElement('div');
    section.className = 'chord-result-section';

    const nameEl = document.createElement('h2');
    nameEl.className = 'chord-result-name';
    nameEl.textContent = suggestion.name;

    const typeEl = document.createElement('p');
    typeEl.className = 'chord-result-type';
    typeEl.textContent = suggestion.label;

    const notesEl = document.createElement('p');
    notesEl.className = 'chord-result-notes';
    notesEl.textContent = noteNames;

    section.appendChild(nameEl);
    section.appendChild(typeEl);
    section.appendChild(notesEl);
    section.appendChild(buildCardRow(voicings));

    if (triads.length) {
      const triadTitle = document.createElement('p');
      triadTitle.className = 'chord-section-title';
      triadTitle.textContent = 'Triads';
      section.appendChild(triadTitle);
      section.appendChild(buildCardRow(triads));
    }

    if (quads.length) {
      const quadTitle = document.createElement('p');
      quadTitle.className = 'chord-section-title';
      quadTitle.textContent = '4-string shapes';
      section.appendChild(quadTitle);
      section.appendChild(buildCardRow(quads));
    }

    results.appendChild(section);
  }

  // ── Event listeners ──────────────────────────────────────────────────────────

  input.addEventListener('input', () => {
    results.innerHTML = '';
    showSuggestions(getChordSuggestions(input.value));
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && activeSuggestions.length) {
      selectChord(activeSuggestions[0]);
    }
    if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  // Delay hide so mousedown on a suggestion fires first
  input.addEventListener('blur', () => setTimeout(hideSuggestions, 120));
}
