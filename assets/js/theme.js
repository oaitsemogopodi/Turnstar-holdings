/* Runs in the head, before CSS is loaded, to avoid a theme flash. */
(() => {
  const root = document.documentElement;
  const preference = window.matchMedia?.('(prefers-color-scheme: dark)');
  let saved = null;
  try {
    const value = localStorage.getItem('turnstar-theme');
    if (value === 'light' || value === 'dark') saved = value;
  } catch (_) {
    // Storage may be unavailable in private browsing or restricted contexts.
  }

  const systemTheme = () => 'light';
  root.setAttribute('data-bs-theme', saved || systemTheme());

  function updateButton() {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    const dark = root.getAttribute('data-bs-theme') === 'dark';
    const action = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', action);
    button.title = action;
    button.innerHTML = '<i class="bi bi-' + (dark ? 'sun' : 'moon-stars') + '" aria-hidden="true"></i>';
  }

  function applyTheme(theme, remember = false) {
    root.setAttribute('data-bs-theme', theme);
    if (remember) {
      saved = theme;
      try { localStorage.setItem('turnstar-theme', theme); } catch (_) {}
    }
    updateButton();
    window.dispatchEvent(new CustomEvent('dashboard:themechange', { detail: { theme } }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateButton();
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark', true);
    });
  });
  preference?.addEventListener?.('change', () => {
    if (!saved) applyTheme(systemTheme());
  });
  window.dashboardTheme = { applyTheme, current: () => root.getAttribute('data-bs-theme') };
})();
