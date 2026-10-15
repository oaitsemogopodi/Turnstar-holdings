const state = {
  entityId: '',
  propertyId: '',
  unitId: '',
  occupancy: '',
  lease: '',
  escalation: '',
  referenceDate: REFERENCE_DATE
};
const tableState = { page: 1, size: 10, signature: '' };
const el = id => document.getElementById(id);
const entityName = id => entities.find(entity => entity.id === id)?.name || '';
const propertyName = id => properties.find(property => property.id === id)?.name || '';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const summaryMoney = value => 'P ' + Number(value).toLocaleString('en-BW', {
  minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  maximumFractionDigits: 2
});

function scopeKey() {
  return [activeDataset, state.entityId, state.propertyId, state.unitId].join('/');
}

function focusHeading() {
  const heading = el('title');
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
}

function finishSelection(previousScope) {
  render();
  window.dispatchEvent?.(new Event('dashboard:navigation'));
  const changed = previousScope !== scopeKey();
  const sidebar = el('portfolioSidebar');
  const offcanvas = window.bootstrap?.Offcanvas?.getInstance(sidebar);
  if (sidebar.classList.contains('show') && offcanvas) {
    if (changed) sidebar.addEventListener('hidden.bs.offcanvas', focusHeading, { once: true });
    offcanvas.hide();
  } else if (changed) {
    focusHeading();
  }
}

function selectEntity(id) {
  const previous = scopeKey();
  state.entityId = id;
  state.propertyId = '';
  state.unitId = '';
  finishSelection(previous);
}

function selectProperty(id) {
  const previous = scopeKey();
  state.propertyId = id;
  state.entityId = properties.find(property => property.id === id)?.entityId || state.entityId;
  state.unitId = '';
  finishSelection(previous);
}

function selectUnit(id) {
  const previous = scopeKey();
  const unit = units.find(unit => unit.id === id);
  state.unitId = id;
  if (unit) {
    state.entityId = unit.entityId;
    state.propertyId = unit.propertyId;
  }
  finishSelection(previous);
}

function reset() {
  const previous = scopeKey();
  Object.assign(state, {
    entityId: '', propertyId: '', unitId: '', occupancy: '', lease: '', escalation: ''
  });
  el('search').value = '';
  tableState.page = 1;
  finishSelection(previous);
}

function goLevel(level) {
  const previous = scopeKey();
  if (level === 0) state.entityId = '';
  if (level <= 1) state.propertyId = '';
  if (level <= 2) state.unitId = '';
  finishSelection(previous);
}

function controls() {
  const periods = [['', 'Any time'], ['3', 'Next 3 months'], ['6', 'Next 6 months'], ['12', 'Next 12 months']];
  const specs = [
    ['propertyId', 'Property / component', [['', 'All properties'], ...properties
      .filter(property => !state.entityId || property.entityId === state.entityId)
      .map(property => [property.id, property.name])]],
    ['unitId', 'Tenant / unit', [['', 'All tenants / units'], ...units
      .filter(unit => (!state.entityId || unit.entityId === state.entityId) &&
        (!state.propertyId || unit.propertyId === state.propertyId))
      .map(unit => [unit.id, (unit.tenant || 'Vacant unit') + ' · ' + propertyName(unit.propertyId) + ' · ' + unit.unit])]],
    ['occupancy', 'Occupancy status', [['', 'All statuses'], ['Occupied', 'Occupied'], ['Vacant', 'Vacant']]],
    ['lease', 'Lease expiry period', periods],
    ['escalation', 'Escalation period', periods]
  ];
  el('filters').innerHTML = specs.map(([key, label, options]) =>
    '<label class="filter" for="f-' + key + '">' + label +
    '<select id="f-' + key + '" data-key="' + key + '">' +
    options.map(([value, text]) => '<option value="' + value + '"' +
      (state[key] === value ? ' selected' : '') + '>' + escapeHtml(text) + '</option>').join('') +
    '</select></label>'
  ).join('');
  el('filters').querySelectorAll('select').forEach(select => {
    select.onchange = () => {
      const key = select.dataset.key;
      if (key === 'propertyId') selectProperty(select.value);
      else if (key === 'unitId') selectUnit(select.value);
      else {
        state[key] = select.value;
        render();
        // Replacing filter options must not discard keyboard focus.
        el('f-' + key).focus({ preventScroll: true });
      }
    };
  });
  el('chips').innerHTML = specs.filter(([key]) => state[key]).map(([key, label, options]) =>
    '<button type="button" class="chip" data-key="' + key + '" aria-label="Remove ' + label + ' filter">' +
    label + ': ' + escapeHtml(options.find(option => option[0] === state[key])?.[1]) +
    ' <i class="bi bi-x" aria-hidden="true"></i></button>'
  ).join('');
  el('chips').querySelectorAll('button').forEach(button => {
    button.onclick = () => {
      const key = button.dataset.key;
      if (key === 'propertyId') goLevel(1);
      else if (key === 'unitId') goLevel(2);
      else {
        state[key] = '';
        render();
        el('f-' + key).focus({ preventScroll: true });
      }
    };
  });
}

function tenantDetails() {
  const unit = units.find(unit => unit.id === state.unitId);
  el('tenantDetails').hidden = !unit;
  if (!unit) {
    el('tenantDetails').innerHTML = '';
    return;
  }
  const vacant = unit.status === 'Vacant';
  const details = (items, className = '') => '<dl class="detail-list ' + className + '">' +
    items.map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('') + '</dl>';
  const financial = [
    [vacant ? 'Asking rent' : 'Current rent', money(unit.rent)],
    ['Levy', money(unit.levy)],
    ['Parking', money(unit.parking)],
    ['Other charges', money(unit.other)]
  ];
  const lease = [
    ['Tenant', vacant ? 'Vacant unit' : unit.tenant],
    ['Region', entityName(unit.entityId)],
    ['Property', propertyName(unit.propertyId)],
    ['Unit', unit.unit],
    ['Occupation date', formatDate(unit.occupationDate)],
    ['Lease duration', vacant ? 'Not applicable' : unit.sourceLeaseDuration || unit.leaseDuration + ' months'],
    ['Lease expiry', formatDate(unit.leaseExpiry)],
    ['Escalation rate', vacant ? 'Not applicable' : Math.round(unit.escalationRate * 100) + '%'],
    ['Next escalation', formatDate(unit.nextEscalationDate)],
    ['Occupancy status', unit.status]
  ];
  el('tenantDetails').innerHTML =
    '<article class="panel tenant-summary">' +
      '<div class="tenant-intro"><div><span class="status-badge ' + (vacant ? 'is-vacant' : 'is-occupied') + '">' +
      unit.status + '</span><h2>Unit summary</h2>' +
      '<p>' + escapeHtml(entityName(unit.entityId) + ' · ' + propertyName(unit.propertyId) + ' · ' + unit.unit) + '</p></div>' +
      '<div class="tenant-total"><span>' + (vacant ? 'Asking rent / month' : 'Total monthly charges') +
      '</span><strong>' + money(vacant ? unit.rent : unit.totalMonthlyCharges) + '</strong>' +
      (vacant ? '<small>Excluded from occupied income</small>' : '<small>Rent, levy, parking and other charges</small>') +
      '</div></div>' +
      '<div class="tenant-sections"><section><h3>Financial breakdown</h3>' + details(financial, 'financial-list') +
      (vacant ? '<p class="asking-total">Total asking charges: ' + money(unit.totalMonthlyCharges) + '</p>' : '') +
      '</section><section><h3>Lease &amp; unit details</h3>' + details(lease) + '</section></div>' +
    '</article>';
}

function updateScrollHint() {
  const container = el('tableScroll');
  el('scrollHint').hidden = container.scrollWidth <= container.clientWidth + 1;
}

function matchingTableRecords(records) {
  const query = el('search').value.toLowerCase().trim();
  return records.filter(unit =>
    (unit.tenant + ' ' + unit.unit + ' ' + propertyName(unit.propertyId)).toLowerCase().includes(query)
  );
}

const csvHeaders = [
  'Region', 'Property', 'Unit', 'Tenant', 'Status', 'Current Rental (P)',
  'Levy (P)', 'Parking (P)', 'Other Charges (P)', 'Total Monthly Charges (P)',
  'Escalation Rate (%)', 'Date of Occupation', 'Next Escalation Date',
  'Lease Duration', 'Lease Expiry', 'Amount Basis', 'Sector', 'Region ID', 'Property ID', 'Unit ID', 'Currency basis', 'Data basis'
];

function csvText(value) {
  let text = String(value ?? '');
  // A leading apostrophe keeps spreadsheet apps from evaluating untrusted text.
  if (/^[\s\uFEFF]*[=+\-@]/u.test(text)) text = "'" + text;
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function rentalCsv(records) {
  const rows = records.map(unit => {
    const vacant = unit.status === 'Vacant';
    const amount = key => Number(unit[key]).toFixed(2);
    return [
      csvText(entityName(unit.entityId)), csvText(propertyName(unit.propertyId)),
      csvText(unit.unit), csvText(unit.tenant), csvText(unit.status),
      amount('rent'), amount('levy'), amount('parking'), amount('other'),
      amount('totalMonthlyCharges'),
      vacant || unit.escalationRate == null ? '' : String(Number((unit.escalationRate * 100).toFixed(4))),
      unit.occupationDate || '', unit.nextEscalationDate || '',
      csvText(unit.sourceLeaseDuration || (unit.leaseDuration ? unit.leaseDuration + ' months' : '')),
      unit.leaseExpiry || '', csvText(vacant ? 'Asking amounts' : 'Scheduled charges'), csvText(unit.sector), csvText(unit.entityId), csvText(unit.propertyId), csvText(unit.id), csvText(unit.currencyBasis), csvText(unit.dataBasis)
    ];
  });
  return '\uFEFF' + [csvHeaders.map(csvText), ...rows].map(row => row.join(',')).join('\r\n') + '\r\n';
}

function exportFilename() {
  const unit = units.find(item => item.id === state.unitId);
  const scope = unit ? (unit.status === 'Vacant' ? 'vacant ' + unit.unit : unit.tenant)
    : state.propertyId ? propertyName(state.propertyId)
      : state.entityId ? entityName(state.entityId) : 'group';
  const slug = scope.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'selection';
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')].join('-');
  return 'turnstar-rentals-' + slug + '-' + date + '.csv';
}

function exportCsv() {
  const records = matchingTableRecords(filterRecords(state));
  if (!records.length) {
    el('exportFeedback').textContent = 'No matching records to export.';
    el('exportCsv').disabled = true;
    return;
  }
  const blob = new Blob([rentalCsv(records)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename();
  anchor.hidden = true;
  document.body.appendChild(anchor);
  try {
    anchor.click();
    el('exportFeedback').textContent = 'Exported ' + records.length +
      (records.length === 1 ? ' record.' : ' records.');
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function table(records) {
  const query = el('search').value.toLowerCase().trim();
  const matching = matchingTableRecords(records);
  const signature = activeDataset + '/' + records.map(unit => unit.id).join(',') + '/' + query;
  if (signature !== tableState.signature) {
    tableState.page = 1;
    tableState.signature = signature;
    el('exportFeedback').textContent = '';
  }
  el('exportCsv').disabled = matching.length === 0;
  if (!matching.length) el('exportFeedback').textContent = 'No matching records to export.';
  const pages = Math.max(1, Math.ceil(matching.length / tableState.size));
  tableState.page = Math.min(Math.max(1, tableState.page), pages);
  const start = (tableState.page - 1) * tableState.size;
  const shown = matching.slice(start, start + tableState.size);
  el('tableCount').textContent = matching.length
    ? (start + 1) + '–' + (start + shown.length) + ' of ' + matching.length + ' units · select a tenant for details'
    : '0 matching units';
  el('rows').innerHTML = shown.length ? shown.map(unit => {
    const vacant = unit.status === 'Vacant';
    return '<tr data-id="' + unit.id + '" class="' + (unit.id === state.unitId ? 'selected' : '') + '">' +
      '<th scope="row"><button type="button" class="tenant-button" data-unit="' + unit.id + '" ' +
      (unit.id === state.unitId ? 'aria-current="true" ' : '') +
      'aria-label="View details for ' + escapeHtml(vacant ? 'vacant ' + unit.unit + ' at ' + propertyName(unit.propertyId) : unit.tenant) + '">' +
      '<span><span class="tenant-name">' + escapeHtml(unit.tenant || 'Vacant unit') + '</span>' +
      '<span class="unit-label">' + unit.unit + ' <span class="status-badge ' + (vacant ? 'is-vacant' : 'is-occupied') + '">' +
      unit.status + '</span>' + (vacant ? ' · asking amounts' : '') + '</span></span>' +
      '<i class="bi bi-arrow-up-right" aria-hidden="true"></i></button></th>' +
      '<td class="property-cell">' + escapeHtml(propertyName(unit.propertyId)) + '</td>' +
      '<td>' + money(unit.rent) + '</td><td>' + money(unit.levy) + '</td>' +
      '<td>' + money(unit.parking + unit.other) + '</td><td><strong>' + money(unit.totalMonthlyCharges) + '</strong></td>' +
      '<td>' + (vacant ? '—' : Math.round(unit.escalationRate * 100) + '%') + '</td>' +
      '<td>' + (vacant ? 'Not applicable' : formatDate(unit.nextEscalationDate)) + '</td>' +
      '<td>' + (vacant ? 'Not applicable' : formatDate(unit.leaseExpiry)) + '</td></tr>';
  }).join('') : '<tr><td colspan="9" class="table-empty"><i class="bi bi-search" aria-hidden="true"></i>' +
    '<strong>No matching units</strong><span>Try another search or clear a portfolio filter.</span></td></tr>';
  el('rows').querySelectorAll('tr[data-id]').forEach(row => {
    row.onclick = () => selectUnit(row.dataset.id);
    // Native buttons provide Enter/Space activation without invalid row roles.
    row.querySelector('button').onclick = event => {
      event.stopPropagation();
      selectUnit(row.dataset.id);
    };
  });
  el('pageStatus').textContent = 'Page ' + tableState.page + ' of ' + pages;
  el('prevPage').disabled = tableState.page <= 1;
  el('nextPage').disabled = tableState.page >= pages;
  updateScrollHint();
}

function render() {
  controls();
  const records = filterRecords(state);
  const totals = metrics(records, state);
  const unit = units.find(unit => unit.id === state.unitId);
  document.body.classList.toggle('tenant-view', !!unit);
  el('title').textContent = unit
    ? (unit.status === 'Vacant' ? 'Vacant · ' + unit.unit : unit.tenant)
    : state.propertyId ? propertyName(state.propertyId) : state.entityId ? entityName(state.entityId) : 'Turnstar Holdings Limited';
  const [year, month, day] = state.referenceDate.split('-').map(Number);
  const referenceLabel = String(day).padStart(2, '0') + ' ' +
    new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric', timeZone: 'UTC'
    });
  el('subtitle').textContent = 'Rental demo reference date · ' + referenceLabel;
  const crumbs = [
    ['Turnstar Holdings Limited', 0],
    ...(state.entityId ? [[entityName(state.entityId), 1]] : []),
    ...(state.propertyId ? [[propertyName(state.propertyId), 2]] : []),
    ...(unit ? [[unit.status === 'Vacant' ? unit.unit : unit.tenant, 3]] : [])
  ];
  el('breadcrumbs').innerHTML = crumbs.map(([name, level], index) =>
    (index ? '<i class="bi bi-chevron-right" aria-hidden="true"></i>' : '') +
    (index === crumbs.length - 1 ? '<span aria-current="page">' + escapeHtml(name) + '</span>' :
      '<button type="button" data-level="' + level + '">' + escapeHtml(name) + '</button>')
  ).join('');
  el('breadcrumbs').querySelectorAll('[data-level]').forEach(button => {
    button.onclick = () => goLevel(Number(button.dataset.level));
  });
  const entityOptions = [{ id: '', name: 'All regions' }, ...entities];
  el('entityNav').innerHTML = entityOptions.map(entity =>
    '<button type="button" class="entity-pill ' + (entity.id === state.entityId ? 'active' : '') +
    '" data-entity="' + entity.id + '" aria-pressed="' + (entity.id === state.entityId) + '">' +
    '<i class="bi bi-' + (entity.id ? 'buildings' : 'grid-1x2') + '" aria-hidden="true"></i>' +
    entity.name + '</button>'
  ).join('');
  el('entityNav').querySelectorAll('[data-entity]').forEach(button => {
    button.onclick = () => selectEntity(button.dataset.entity);
  });
  const cards = [
    ['Monthly rental', summaryMoney(totals.rent), 'Occupied income', 'cash-stack', true],
    ['Levy / service charges', summaryMoney(totals.levy), 'Occupied units only', 'receipt', true],
    ['Parking / other charges', summaryMoney(totals.extras), 'Combined monthly charges', 'car-front', true],
    ['Occupied sample units', totals.occupied, totals.occupancy === null ? '— occupancy' : (totals.occupancy * 100).toFixed(1) + '% occupancy', 'building-check'],
    ['Vacant sample units', totals.vacant, 'Asking rent excluded', 'door-open'],
    ['Upcoming escalations', totals.escalations, 'Next ' + (state.escalation || 3) + ' months', 'graph-up-arrow'],
    ['Upcoming lease expiries', totals.expiries, 'Next ' + (state.lease || 12) + ' months', 'calendar-event']
  ];
  el('kpis').innerHTML = cards.map(([label, value, note, icon, financial], index) => {
    const accent = financial ? 'kpi-financial' : index === 3 ? 'kpi-occupied'
      : index === 4 ? 'kpi-vacant' : 'kpi-event' + (value > 0 ? ' has-events' : '');
    return '<article class="kpi ' + (financial ? 'financial-kpi' : 'unit-kpi') + ' ' + accent + '">' +
      '<div class="kpi-top"><span class="kpi-label">' + label + '</span>' +
      '<i class="bi bi-' + icon + '" aria-hidden="true"></i></div>' +
      '<div class="kpi-value">' + value + '</div><div class="kpi-note">' + note + '</div></article>';
  }).join('');
  el('empty').innerHTML = records.length ? '' :
    '<div class="empty-message"><i class="bi bi-funnel" aria-hidden="true"></i> No units match these combined filters. Your hierarchy is retained; clear filters to broaden the view.</div>';
  tenantDetails();
  updateCharts(records, totals);
  table(records);
}

el('reset').onclick = reset;
el('home').onclick = reset;
el('clear').onclick = () => {
  state.occupancy = '';
  state.lease = '';
  state.escalation = '';
  render();
  el('clear').focus({ preventScroll: true });
};
el('search').oninput = () => table(filterRecords(state));
el('exportCsv').onclick = exportCsv;
el('pageSize').onchange = event => {
  tableState.size = Number(event.target.value);
  tableState.page = 1;
  table(filterRecords(state));
};
el('prevPage').onclick = () => {
  tableState.page--;
  table(filterRecords(state));
};
el('nextPage').onclick = () => {
  tableState.page++;
  table(filterRecords(state));
};
window.addEventListener('resize', updateScrollHint);
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(updateScrollHint).observe(el('tableScroll'));
}
render();
