export function initSidebar() {
  const sidebar = document.getElementById('controlsSidebar');
  const toggle  = document.getElementById('controlsToggle');
  const close   = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', openSidebar);
  close?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  window.addEventListener('orientationchange', closeSidebar);
}
