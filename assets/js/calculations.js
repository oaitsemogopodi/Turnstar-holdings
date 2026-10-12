const money=n=>'P '+Number(n).toLocaleString('en-BW',
{
  minimumFractionDigits:2,
  maximumFractionDigits:2
});
const formatDate=s=>s?new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',
{
  day:'2-digit',
  month:'short',
  year:'numeric',
  timeZone:'UTC'
}):'Not applicable';
function addMonths(s,
n){
  const [
    y,
    m,
    d
  ]=s.split('-').map(Number);
  const end=new Date(Date.UTC(y,
  m-1+n+1,
  0));
  return new Date(Date.UTC(y,
  m-1+n,
  Math.min(d,
  end.getUTCDate()))).toISOString().slice(0,
  10)
}

function inPeriod(date,
months,
reference=REFERENCE_DATE){
  return !!date&&date>=reference&&date<=addMonths(reference,
  Number(months))
}

function filterRecords(state){
  return units.filter(u=>(!state.entityId||u.entityId===state.entityId)&&(!state.propertyId||u.propertyId===state.propertyId)&&(!state.unitId||u.id===state.unitId)&&(!state.occupancy||u.status===state.occupancy)&&(!state.lease||inPeriod(u.leaseExpiry,
  state.lease,
  state.referenceDate))&&(!state.escalation||inPeriod(u.nextEscalationDate,
  state.escalation,
  state.referenceDate)))
}

function metrics(records,
state){
  const occupied=records.filter(u=>u.status==='Occupied');
  const sum=field=>occupied.reduce((s,
  u)=>s+u[
    field
  ],
  0);
  return {
    rent:sum('rent'),
    levy:sum('levy'),
    extras:sum('parking')+sum('other'),
    occupied:occupied.length,
    vacant:records.length-occupied.length,
    occupancy:records.length?occupied.length/records.length:null,
    escalations:occupied.filter(u=>inPeriod(u.nextEscalationDate,
    state.escalation||3,
    state.referenceDate)).length,
    expiries:occupied.filter(u=>inPeriod(u.leaseExpiry,
    state.lease||12,
    state.referenceDate)).length
  }
}

function groupedRent(records,
groups,
key){
  return groups.map(g=>records.filter(u=>u[
    key
  ]===g.id&&u.status==='Occupied').reduce((s,
  u)=>s+u.rent,
  0))
}
