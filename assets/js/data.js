// Fictional rental records only. Published financial data lives in financial.js.
const REFERENCE_DATE = '2026-10-12';
const activeDataset = 'illustrative';
const entities = [{id:'botswana',name:'Botswana'},{id:'tanzania',name:'Tanzania'},{id:'uae',name:'UAE'}];
const developments = [{id:'mlimani-city',name:'Mlimani City',region:'Tanzania'}];
const properties = [
  {
    "id": "game-city",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Game City",
    "sector": "Retail",
    "parentDevelopmentId": null
  },
  {
    "id": "nzano",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Nzano Shopping Centre",
    "sector": "Retail",
    "parentDevelopmentId": null
  },
  {
    "id": "supa-save",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Supa Save Mall",
    "sector": "Retail",
    "parentDevelopmentId": null
  },
  {
    "id": "turnstar-house",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Turnstar House",
    "sector": "Office / mixed use",
    "parentDevelopmentId": null
  },
  {
    "id": "gicp",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Gaborone International Commerce Park",
    "sector": "Industrial",
    "parentDevelopmentId": null
  },
  {
    "id": "mogoditshane",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Mogoditshane Apartments",
    "sector": "Residential",
    "parentDevelopmentId": null
  },
  {
    "id": "tapologo",
    "entityId": "botswana",
    "region": "Botswana",
    "name": "Tapologo Estate",
    "sector": "Residential",
    "parentDevelopmentId": null
  },
  {
    "id": "mlimani-retail",
    "entityId": "tanzania",
    "region": "Tanzania",
    "name": "Mlimani City — Retail Mall",
    "sector": "Retail",
    "parentDevelopmentId": "mlimani-city"
  },
  {
    "id": "mlimani-office",
    "entityId": "tanzania",
    "region": "Tanzania",
    "name": "Mlimani City — Office Park",
    "sector": "Office",
    "parentDevelopmentId": "mlimani-city"
  },
  {
    "id": "mlimani-conference",
    "entityId": "tanzania",
    "region": "Tanzania",
    "name": "Mlimani City — Conference Centre",
    "sector": "Conference",
    "parentDevelopmentId": "mlimani-city"
  },
  {
    "id": "mlimani-residential",
    "entityId": "tanzania",
    "region": "Tanzania",
    "name": "Mlimani City — Residential",
    "sector": "Residential",
    "parentDevelopmentId": "mlimani-city"
  },
  {
    "id": "palazzo",
    "entityId": "uae",
    "region": "UAE",
    "name": "Palazzo Venezia Office Block",
    "sector": "Office",
    "parentDevelopmentId": null
  }
];
const units = properties.flatMap((property,p)=>Array.from({length:5},(_,i)=>{
  const serial=p*5+i+1, vacant=serial%7===0;
  const month=10+(serial%12), year=2026+Math.floor(month/12), mm=String(month%12+1).padStart(2,'0');
  const expiry=year+'-'+mm+'-20';
  const occupation=(year-3)+'-'+mm+'-20';
  const rent=4500+p*2100+i*1250, levy=300+(serial%5)*185, parking=(serial%3)*220, other=(serial%4)*85;
  const kind=property.sector.startsWith('Office')?'Office':property.sector;
  return {id:'ts-unit-'+String(serial).padStart(3,'0'),entityId:property.entityId,region:property.region,propertyId:property.id,sector:property.sector,
    unit:'U-'+String(i+1).padStart(2,'0'),tenant:vacant?'': 'Demo '+kind+' Tenant '+String(serial).padStart(2,'0'),status:vacant?'Vacant':'Occupied',
    rent,levy,parking,other,totalMonthlyCharges:rent+levy+parking+other,escalationRate:vacant?0:0.03+(serial%4)*0.01,
    occupationDate:vacant?null:occupation,leaseDuration:vacant?0:36,leaseExpiry:vacant?null:expiry,
    nextEscalationDate:vacant?null:expiry,dataBasis:'illustrative',currencyBasis:'BWP-equivalent demo amounts'};
}));
