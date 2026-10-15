/* Direction-aware visibility for the existing sidebar back-arrow control. */
(() => {
  const button = document.getElementById('menuToggle');
  const workspace = document.querySelector('.workspace');
  const initialTabIndex = button.getAttribute('tabindex');
  const initialAriaHidden = button.getAttribute('aria-hidden');
  let target;
  let lastY = 0;
  let upwardTravel = 0;
  let downwardTravel = 0;
  let frame = 0;
  let hidden = false;
  const topOf = scroller => scroller === window
    ? (window.scrollY || document.documentElement.scrollTop || 0)
    : scroller.scrollTop;
  const isScrollable = node => node && node.scrollHeight > node.clientHeight + 1 &&
    /^(auto|scroll|overlay)$/.test(getComputedStyle(node).overflowY);
  const scrollingTarget = () => {
    const main = workspace.querySelector('main');
    return [main, workspace].find(isScrollable) || window;
  };
  function show() {
    if (!hidden) return;
    hidden = false;
    button.classList.remove('is-scroll-hidden');
    if (initialTabIndex === null) button.removeAttribute('tabindex');
    else button.setAttribute('tabindex', initialTabIndex);
    if (initialAriaHidden === null) button.removeAttribute('aria-hidden');
    else button.setAttribute('aria-hidden', initialAriaHidden);
  }
  function hide() {
    if (hidden || button.contains(document.activeElement)) return;
    hidden = true;
    button.classList.add('is-scroll-hidden');
    button.setAttribute('tabindex', '-1');
    button.setAttribute('aria-hidden', 'true');
  }
  function update() {
    frame = 0;
    const current = Math.max(0, topOf(target));
    if (current <= 60) {
      show(); upwardTravel = 0; downwardTravel = current; lastY = current;
      return;
    }
    const change = current - lastY;
    if (Math.abs(change) < 2) return;
    lastY = current;
    if (change > 0) {
      upwardTravel = 0;
      downwardTravel += change;
      if (downwardTravel >= 60) hide();
    } else {
      downwardTravel = 0;
      upwardTravel -= change;
      if (upwardTravel >= 12) show();
    }
  }
  function onScroll() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function bindScroller() {
    const next = scrollingTarget();
    if (next === target) return;
    if (target) target.removeEventListener('scroll', onScroll);
    target = next;
    target.addEventListener('scroll', onScroll, { passive: true });
    lastY = topOf(target);
    upwardTravel = 0;
    downwardTravel = 0;
    if (lastY <= 60) show();
  }
  button.addEventListener('blur', () => {
    if (topOf(target) > 60 && downwardTravel >= 60) hide();
  });
  window.addEventListener('resize', bindScroller, { passive: true });
  window.addEventListener('dashboard:navigation', () => {
    bindScroller();
    show(); upwardTravel = 0; downwardTravel = 0;
    lastY = topOf(target);
  });
  bindScroller();
  onScroll();
})();
