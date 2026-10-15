/* Desktop collapse and mobile Bootstrap offcanvas share one accessible control. */
(() => {
  const button = document.getElementById('menuToggle');
  const sidebar = document.getElementById('portfolioSidebar');
  const desktop = window.matchMedia('(min-width: 992px)');
  let collapsed = false;
  function sync() {
    const hidden = desktop.matches && collapsed;
    document.body.classList.toggle('sidebar-collapsed', hidden);
    sidebar.inert = hidden;
    const expanded = desktop.matches ? !collapsed : sidebar.classList.contains('show');
    const label = desktop.matches ? (expanded ? 'Collapse sidebar' : 'Expand sidebar') : (expanded ? 'Close navigation' : 'Open navigation');
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', label);
    button.title = label;
  }
  button.addEventListener('click', () => {
    if (desktop.matches) {
      collapsed = !collapsed;
      sync();
    } else {
      window.bootstrap?.Offcanvas.getOrCreateInstance(sidebar).toggle();
    }
  });
  sidebar.addEventListener('shown.bs.offcanvas', sync);
  sidebar.addEventListener('hidden.bs.offcanvas', sync);
  desktop.addEventListener('change', () => {
    if (desktop.matches) window.bootstrap?.Offcanvas.getInstance(sidebar)?.hide();
    sync();
  });
  sync();
})();
