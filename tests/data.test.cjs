const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({});
const run=code=>vm.runInContext(code,context);
for(const file of ['data','calculations'])run(fs.readFileSync(`assets/js/${file}.js`,'utf8'));
let dashboard=fs.readFileSync('assets/js/dashboard.js','utf8');
run(dashboard.slice(0,dashboard.indexOf("el('reset').onclick")));
// Isolate selection logic from UI rendering for deterministic hierarchy checks.
run('finishSelection=()=>{}');
const financial=fs.readFileSync('assets/js/financial.js','utf8');
run(financial.slice(0,financial.indexOf("el('financialNav').onclick")));
assert.equal(run('units.length'),60);
assert.equal(run('properties.length'),12);
assert.equal(run('new Set(units.map(u=>u.id)).size'),60);
assert.equal(run('regionalRevenue.reduce((s,r)=>s+r.current,0)'),354396650);
assert.equal(run('regionalRevenue.reduce((s,r)=>s+r.previous,0)'),344114314);
assert.equal(run('financialMetrics.length'),7);
assert.equal(run('financialMetrics.find(m=>m.name.startsWith("Cash")).previous'),undefined);
assert.equal(run('financialRows().length'),19);
assert.ok(run('financialCsv().startsWith("\\uFEFFMetric,Scope,")'));
assert.ok(run('units.every(u=>u.totalMonthlyCharges===u.rent+u.levy+u.parking+u.other)'));
assert.ok(run(`units.every(u=>u.status==='Vacant' ? !u.tenant&&!u.occupationDate&&!u.leaseExpiry&&!u.nextEscalationDate&&u.escalationRate===0 : addMonths(u.occupationDate,u.leaseDuration)===u.leaseExpiry&&u.nextEscalationDate<=u.leaseExpiry)`));
assert.ok(run(`units.every(u=>u.dataBasis==='illustrative'&&properties.some(p=>p.id===u.propertyId&&p.entityId===u.entityId))`));
assert.equal(run('metrics(units,state).rent'),run('units.filter(u=>u.status==="Occupied").reduce((s,u)=>s+u.rent,0)'));
for(const months of [3,6,12]){
  assert.ok(run(`units.some(u=>inPeriod(u.leaseExpiry,${months}))`));
  assert.ok(run(`units.some(u=>inPeriod(u.nextEscalationDate,${months}))`));
}
for(let i=0;i<60;i++){
  run(`selectUnit(units[${i}].id)`);
  assert.ok(run(`state.unitId===units[${i}].id&&state.propertyId===units[${i}].propertyId&&state.entityId===units[${i}].entityId`));
  assert.equal(run('filterRecords(state).length'),1);
}
for(let i=0;i<12;i++){
  run(`selectProperty(properties[${i}].id)`);
  assert.ok(run(`state.entityId===properties[${i}].entityId&&!state.unitId`));
  assert.equal(run('filterRecords(state).length'),5);
}
for(const id of ['botswana','tanzania','uae']){
  run(`selectEntity('${id}')`);
  assert.ok(run('!state.propertyId&&!state.unitId'));
  assert.equal(run('filterRecords(state).length'),id==='botswana'?35:id==='tanzania'?20:5);
}
run(`selectUnit(units[0].id); goLevel(1)`);
assert.ok(run('state.entityId==="botswana"&&!state.propertyId&&!state.unitId'));
run('goLevel(0)');assert.equal(run('filterRecords(state).length'),60);
run(`state.occupancy='Vacant';state.lease='3'`);assert.equal(run('filterRecords(state).length'),0);
console.log('Data checks passed: financial reconciliation, Group CSV, cash omission, IDs, lease consistency, vacant exclusion, event windows, every unit/property/region, breadcrumbs and combined empty state.');
