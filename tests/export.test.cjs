const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const dashboard = fs.readFileSync(path.join(root, 'assets/js/dashboard.js'), 'utf8');
const exportCode = dashboard.slice(
  dashboard.indexOf('function matchingTableRecords('),
  dashboard.indexOf('function table(records)')
);
assert.ok(exportCode.includes('function exportCsv()'));

const elements = {
  search: { value: '' },
  exportCsv: { disabled: false },
  exportFeedback: { textContent: '' }
};
let download;
let revoked;
let removed;
const anchor = {
  click() { Object.assign(download, { filename: this.download, href: this.href }); },
  remove() { removed = true; }
};
const context = vm.createContext({
  Blob,
  URL: {
    createObjectURL(blob) { download = { blob }; return 'blob:test'; },
    revokeObjectURL(url) { revoked = url; }
  },
  document: {
    getElementById(id) { return elements[id]; },
    createElement(tag) { assert.equal(tag, 'a'); return anchor; },
    body: { appendChild(node) { assert.equal(node, anchor); } }
  },
  window: { setTimeout(callback) { callback(); } }
});
for (const filename of ['data.js', 'calculations.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js', filename), 'utf8'), context);
}
vm.runInContext(`
  const state = { entityId: '', propertyId: '', unitId: '', occupancy: '',
    lease: '', escalation: '', referenceDate: REFERENCE_DATE };
  const tableState = { page: 2, size: 10, signature: '' };
  const el = id => document.getElementById(id);
  const entityName = id => entities.find(item => item.id === id)?.name || '';
  const propertyName = id => properties.find(item => item.id === id)?.name || '';
`, context);
vm.runInContext(exportCode, context);

function values(expression) {
  return vm.runInContext(expression, context);
}

function csvRows(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const character = csv[i];
    if (quoted && character === '"' && csv[i + 1] === '"') { field += '"'; i++; }
    else if (character === '"') quoted = !quoted;
    else if (!quoted && character === ',') { row.push(field); field = ''; }
    else if (!quoted && character === '\r' && csv[i + 1] === '\n') {
      row.push(field); rows.push(row); row = []; field = ''; i++;
    } else field += character;
  }
  assert.equal(quoted, false);
  assert.equal(field, '');
  assert.deepEqual(row, []);
  return rows;
}

async function exportRows() {
  removed = false;
  revoked = null;
  values('exportCsv()');
  assert.equal(removed, true);
  assert.equal(revoked, 'blob:test');
  assert.equal(download.href, 'blob:test');
  assert.match(download.filename, /^turnstar-rentals-[a-z0-9-]+-\d{4}-\d{2}-\d{2}\.csv$/);
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')].join('-');
  assert.ok(download.filename.endsWith(today + '.csv'));
  const bytes = Buffer.from(await download.blob.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0, 3)], [0xEF, 0xBB, 0xBF]);
  const csv = bytes.subarray(3).toString('utf8');
  assert.ok(csv.endsWith('\r\n'));
  return csvRows(csv);
}

(async () => {
  let rows = await exportRows();
  assert.equal(rows.length - 1, 60); // All illustrative records, including vacant units.
  assert.equal(rows[0].length, 22);
  assert.equal(rows[0][15], 'Amount Basis');
  assert.equal(elements.exportFeedback.textContent, 'Exported 60 records.');
  assert.match(download.filename, /^turnstar-rentals-group-/);
  assert.equal(values('tableState.page'), 2);
  let vacant = rows.find(row => row[4] === 'Vacant');
  assert.ok(vacant);
  assert.equal(vacant[15], 'Asking amounts');
  assert.equal(vacant[10], '');
  assert.equal(vacant[11], '');
  assert.equal(vacant[12], '');
  assert.equal(vacant[14], '');
  assert.match(vacant[5], /^\d+\.\d{2}$/);
  assert.equal(vacant[9], (Number(vacant[5]) + Number(vacant[6]) + Number(vacant[7]) + Number(vacant[8])).toFixed(2));

  const entityId = values('units[0].entityId');
  assert.match(values('(() => { state.entityId = "tanzania"; return exportFilename(); })()'),
    /^turnstar-rentals-tanzania-/);
  vm.runInContext(`state.entityId = ${JSON.stringify(entityId)}`, context);
  rows = await exportRows();
  assert.equal(rows.length - 1, values('filterRecords(state).length'));
  assert.ok(rows.slice(1).every(row => row[0] === values('entityName(state.entityId)')));

  vm.runInContext('state.propertyId = units[0].propertyId', context);
  rows = await exportRows();
  assert.ok(rows.slice(1).every(row => row[1] === values('propertyName(state.propertyId)')));
  vm.runInContext('state.unitId = units[0].id', context);
  rows = await exportRows();
  assert.equal(rows.length - 1, 1);
  assert.equal(rows[1][2], values('units[0].unit'));

  vm.runInContext(`Object.assign(state, {unitId:'',occupancy:'Occupied',lease:'',escalation:''})`, context);
  elements.search.value = 'Demo';
  rows = await exportRows();
  assert.equal(rows.length - 1, values('matchingTableRecords(filterRecords(state)).length'));
  assert.ok(rows.slice(1).every(row => row[4] === 'Occupied'));

  vm.runInContext("Object.assign(state, {entityId:'',propertyId:'',occupancy:'',lease:'',escalation:''})", context);
  elements.search.value = '';
  vm.runInContext('state.unitId = units.find(unit => unit.status === "Vacant").id', context);
  rows = await exportRows();
  assert.equal(rows.length - 1, 1);
  assert.equal(rows[1][15], 'Asking amounts');
  assert.match(download.filename, /vacant-/);

  vm.runInContext(`Object.assign(state, {unitId:'',occupancy:'Occupied',lease:'12',escalation:'12'})`, context);
  const periodCount = values('matchingTableRecords(filterRecords(state)).length');
  assert.ok(periodCount > 0);
  rows = await exportRows();
  assert.equal(rows.length - 1, periodCount);
  assert.ok(rows.slice(1).every(row => row[4] === 'Occupied' && row[12] && row[14]));
  vm.runInContext(`Object.assign(state, {occupancy:'',lease:'',escalation:''})`, context);

  vm.runInContext(`state.unitId = ''; units[0].tenant = 'Élodie, "North"'; units[0].unit = '=SUM(1,2)'; units[1].tenant = ' +HYPERLINK(1)'; units[2].tenant = '@cmd'; units[3].tenant = '-2'; units[4].tenant = 'Line\\nbreak'`, context);
  rows = await exportRows();
  assert.equal(rows[1][3], 'Élodie, "North"');
  assert.equal(rows[1][2], "'=SUM(1,2)");
  assert.equal(rows[2][3], "' +HYPERLINK(1)");
  assert.equal(rows[3][3], "'@cmd");
  assert.equal(rows[4][3], "'-2");
  assert.equal(rows[5][3], 'Line\nbreak');
  assert.match(rows[1][5], /^\d+\.\d{2}$/);

  elements.search.value = 'a search with no matches';
  download = null;
  values('exportCsv()');
  assert.equal(download, null);
  assert.equal(elements.exportCsv.disabled, true);
  assert.equal(elements.exportFeedback.textContent, 'No matching records to export.');
  console.log('CSV export checks passed: scopes, combined filters, pagination, vacant data, escaping, formula guards, no results, download cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
