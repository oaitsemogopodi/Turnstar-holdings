(function () {
  'use strict';
  const input = el('globalSearch');
  const clear = el('globalSearchClear');
  const results = el('globalSearchResults');
  const tools = el('headerTools');
  const mobileToggle = el('mobileSearchToggle');
  const bell = el('notificationToggle');
  const panel = el('notificationPanel');
  const list = el('notificationList');
  el('financialHeadingActions').prepend(tools);
  document.fonts?.ready.then(() => {
    if ([...document.fonts].some(face => face.family.toLowerCase().includes('bootstrap-icons') && face.status === 'loaded')) tools.classList.add('bootstrap-icons-ready');
  });
  const readIds = new Set();
  let matches = [];
  let activeIndex = -1;
  let searchOpen = false;
  let notificationOpen = false;

  const day = value => Date.parse(value + 'T00:00:00Z') / 86400000;
  const dateText = value => formatDate(value);
  const normalized = value => String(value || '').toLocaleLowerCase().trim();
  const items = [
    { category: 'Sections', title: 'Financial overview', context: 'Published FY2026 results', icon: 'bar-chart-line', kind: 'section', id: 'financial' },
    { category: 'Sections', title: 'Rental portfolio', context: 'Illustrative property and tenant records', icon: 'buildings', kind: 'section', id: 'rental' },
    { category: 'Sections', title: 'Sources / About Data', context: 'Methods and source notes', icon: 'info-circle', kind: 'section', id: 'sources' },
    ...financialMetrics.map((metric, index) => ({ category: 'Financial metrics', title: metric.name, context: 'Group · FY2026', icon: 'graph-up', kind: 'metric', id: index })),
    ...properties.map(property => ({ category: 'Properties', title: property.name, context: property.region + ' · ' + property.sector, icon: 'building', kind: 'property', id: property.id })),
    ...units.filter(unit => unit.tenant).map(unit => ({ category: 'Tenants and units', title: unit.tenant, context: propertyName(unit.propertyId) + ' · ' + unit.unit, icon: 'door-open', kind: 'unit', id: unit.id }))
  ];
  function closeSearch(focus = false) {
    searchOpen = false;
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
    if (focus) input.focus();
  }
  function closeNotifications(focus = false) {
    notificationOpen = false;
    panel.hidden = true;
    bell.setAttribute('aria-expanded', 'false');
    if (focus) bell.focus();
  }
  function setMobileSearch(open) {
    tools.classList.toggle('mobile-search-open', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Close dashboard search' : 'Open dashboard search');
    if (open) {
      closeNotifications();
      input.focus();
    } else closeSearch();
  }
  function outlineIcon(kind) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const shapes = {
      section: ['M4 4h7v7H4z', 'M13 4h7v4h-7z', 'M13 10h7v10h-7z', 'M4 13h7v7H4z'],
      metric: ['M4 19h16', 'M6 15l4-4 3 2 5-7'],
      property: ['M4 21V5l9-2v18', 'M13 9h7v12', 'M8 8h1M8 12h1M8 16h1'],
      unit: ['M5 21V3h14v18', 'M9 7h6', 'M9 11h6', 'M11 21v-5h2'],
      expiry: ['M4 5h16v16H4z', 'M4 10h16', 'M8 3v4M16 3v4', 'M8 15h3'],
      escalation: ['M4 17l6-6 4 3 6-8', 'M16 6h4v4']
    };
    for (const d of shapes[kind] || shapes.section) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    }
    return svg;
  }
  function makeResult(item, index) {
    const option = document.createElement('div');
    option.className = 'global-search-option';
    option.id = 'global-result-' + index;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(index === activeIndex));
    const icon = outlineIcon(item.kind);
    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = item.title;
    const context = document.createElement('small');
    context.textContent = item.context;
    copy.append(title, context);
    option.append(icon, copy);
    option.addEventListener('pointerdown', event => event.preventDefault());
    option.addEventListener('click', () => selectResult(item));
    return option;
  }
  function paintSearch() {
    clear.hidden = !input.value;
    const query = normalized(input.value);
    results.replaceChildren();
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    if (!query) return closeSearch();
    matches = items.filter(item => normalized(item.title + ' ' + item.context).includes(query));
    const displayed = [];
    for (const category of ['Sections', 'Financial metrics', 'Properties', 'Tenants and units']) {
      const group = matches.filter(item => item.category === category).slice(0, 6);
      if (!group.length) continue;
      const heading = document.createElement('div');
      heading.className = 'global-search-group';
      heading.textContent = category;
      results.append(heading);
      group.forEach(item => {
        const index = displayed.push(item) - 1;
        results.append(makeResult(item, index));
      });
    }
    matches = displayed;
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'global-search-empty';
      empty.textContent = 'No dashboard results for “' + input.value.trim() + '”.';
      results.append(empty);
    }
    closeNotifications();
    searchOpen = true;
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function setActive(index) {
    if (!matches.length) return;
    activeIndex = (index + matches.length) % matches.length;
    results.querySelectorAll('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === activeIndex)));
    const option = el('global-result-' + activeIndex);
    input.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({ block: 'nearest' });
  }
  function focusMetric(index) {
    showSection('financial');
    const card = document.querySelector('[data-metric-index="' + index + '"]');
    if (!card) return;
    card.tabIndex = -1;
    card.focus({ preventScroll: true });
    card.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function selectResult(item) {
    closeSearch();
    if (tools.classList.contains('mobile-search-open')) setMobileSearch(false);
    if (item.kind === 'section') {
      if (item.id === 'sources') el('sourcesNav').click();
      else showSection(item.id);
    } else if (item.kind === 'metric') focusMetric(item.id);
    else {
      showSection('rental');
      if (item.kind === 'property') selectProperty(item.id);
      else {
        const unit = units.find(candidate => candidate.id === item.id);
        const changed = unit ? clearIncompatibleUnitFilters(unit, true) : [];
        selectUnit(item.id);
        explainClearedFilters(changed);
      }
    }
  }
  input.addEventListener('input', paintSearch);
  input.addEventListener('focus', () => { if (input.value.trim()) paintSearch(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!searchOpen) paintSearch();
      if (matches.length) { event.preventDefault(); setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1)); }
    } else if (event.key === 'Enter' && searchOpen && matches.length) {
      event.preventDefault();
      selectResult(matches[activeIndex < 0 ? 0 : activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      if (tools.classList.contains('mobile-search-open')) setMobileSearch(false);
    }
  });
  clear.addEventListener('click', () => { input.value = ''; paintSearch(); input.focus(); });
  mobileToggle.addEventListener('click', () => setMobileSearch(!tools.classList.contains('mobile-search-open')));

  const alerts = units.filter(unit => unit.status === 'Occupied').flatMap(unit => {
    const result = [];
    for (const spec of [
      { type: 'expiry', field: 'leaseExpiry', limit: 90, title: 'Lease expiry' },
      { type: 'escalation', field: 'nextEscalationDate', limit: 30, title: 'Rent escalation' }
    ]) {
      const due = unit[spec.field];
      const distance = due ? day(due) - day(REFERENCE_DATE) : Infinity;
      if (distance >= 0 && distance <= spec.limit) result.push({
        id: spec.type + ':' + unit.id + ':' + due,
        type: spec.type, unitId: unit.id, title: spec.title, due,
        context: (unit.tenant || unit.unit) + ' · ' + propertyName(unit.propertyId) + ' · ' + unit.unit
      });
    }
    return result;
  }).sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id));
  el('notificationReference').textContent = dateText(REFERENCE_DATE);
  function positionPanel() {
    if (!notificationOpen) return;
    const rect = bell.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    panel.style.width = width + 'px';
    panel.style.left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) + 'px';
    const height = panel.getBoundingClientRect().height;
    const below = window.innerHeight - rect.bottom - 12;
    panel.style.top = (height > below && rect.top > below
      ? Math.max(12, rect.top - height - 8)
      : Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - height - 12))) + 'px';
  }
  function updateNotifications() {
    const unread = alerts.filter(alert => !readIds.has(alert.id)).length;
    el('notificationDot').hidden = unread === 0;
    bell.setAttribute('aria-label', 'Notifications, ' + unread + ' unread');
    el('markNotificationsRead').disabled = unread === 0;
    list.replaceChildren();
    if (!alerts.length) {
      const empty = document.createElement('p');
      empty.className = 'notification-empty';
      empty.textContent = 'No demo lease alerts in the selected periods.';
      list.append(empty);
      return;
    }
    alerts.forEach(alert => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'notification-row' + (readIds.has(alert.id) ? '' : ' unread');
      const icon = outlineIcon(alert.type);
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = alert.title + ' · ' + dateText(alert.due);
      const context = document.createElement('small');
      context.textContent = alert.context;
      copy.append(title, context);
      row.append(icon, copy);
      row.addEventListener('click', () => openAlert(alert));
      list.append(row);
    });
  }
  function clearIncompatibleUnitFilters(unit, preserveTableSearch = false) {
    const changed = [];
    if (state.occupancy && state.occupancy !== unit.status) { state.occupancy = ''; changed.push('occupancy'); }
    if (state.lease && !inPeriod(unit.leaseExpiry, state.lease, state.referenceDate)) { state.lease = ''; changed.push('lease expiry'); }
    if (state.escalation && !inPeriod(unit.nextEscalationDate, state.escalation, state.referenceDate)) { state.escalation = ''; changed.push('escalation'); }
    const tableQuery = normalized(el('search').value);
    if (!preserveTableSearch && tableQuery && !normalized(unit.tenant + ' ' + unit.unit + ' ' + propertyName(unit.propertyId)).includes(tableQuery)) {
      el('search').value = '';
      changed.push('tenant table search');
    }
    return changed;
  }
  function explainClearedFilters(changed) {
    const feedback = el('navigationFeedback');
    feedback.hidden = changed.length === 0;
    feedback.textContent = changed.length ? 'Cleared incompatible ' + changed.join(', ') + ' filter' + (changed.length > 1 ? 's' : '') + ' to show this unit.' : '';
  }
  function openAlert(alert) {
    readIds.add(alert.id);
    updateNotifications();
    closeNotifications();
    const unit = units.find(candidate => candidate.id === alert.unitId);
    if (!unit) return;
    showSection('rental');
    const changed = clearIncompatibleUnitFilters(unit);
    selectUnit(unit.id);
    explainClearedFilters(changed);
  }
  bell.addEventListener('click', () => {
    if (notificationOpen) { closeNotifications(); return; }
    closeSearch();
    if (tools.classList.contains('mobile-search-open')) setMobileSearch(false);
    notificationOpen = true;
    panel.hidden = false;
    bell.setAttribute('aria-expanded', 'true');
    updateNotifications();
    positionPanel();
  });
  el('markNotificationsRead').addEventListener('click', () => {
    alerts.forEach(alert => readIds.add(alert.id));
    updateNotifications();
  });
  document.addEventListener('pointerdown', event => {
    if (searchOpen && !el('globalSearchWrap').contains(event.target)) closeSearch();
    if (notificationOpen && !el('notificationToggle').contains(event.target) && !panel.contains(event.target)) closeNotifications();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (notificationOpen) { event.preventDefault(); closeNotifications(true); }
    else if (searchOpen) { event.preventDefault(); closeSearch(true); }
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...panel.querySelectorAll('button:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', positionPanel);
  window.addEventListener('dashboard:navigation', () => {
    closeSearch();
    closeNotifications();
    const feedback = el('navigationFeedback');
    if (feedback) { feedback.hidden = true; feedback.textContent = ''; }
  });
  updateNotifications();
})();
