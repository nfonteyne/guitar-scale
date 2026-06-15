const VALID_VIEWS = ['scale', 'progressions', 'chords'];

function applyView(viewName) {
  const v = VALID_VIEWS.includes(viewName) ? viewName : 'scale';
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(`view-${v}`)?.classList.add('active');
  document.querySelector(`.nav-tab[data-view="${v}"]`)?.classList.add('active');
  if (location.hash !== `#${v}`) history.replaceState(null, '', `#${v}`);
}

export function initRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => applyView(tab.dataset.view));
  });
  window.addEventListener('hashchange', () => applyView(location.hash.slice(1)));
  applyView(location.hash.slice(1) || 'scale');
}
