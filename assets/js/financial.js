// Supplied detailed consolidated statement figures; report download unavailable during implementation.
const FINANCIAL_SOURCE = 'https://turnstar.co.bw/turnstar-annual-report-2026/';
const financialMetrics = [
  {name:'Annual rental revenue',current:354396650,previous:344114314},
  {name:'Operating profit',current:184415767,previous:185866894},
  {name:'Profit after tax',current:50707188,previous:140683580},
  {name:'Investment property value',current:2576575186,previous:2792036806,balance:true},
  {name:'Finance costs',current:43237065,previous:38888505},
  {name:'Cash and cash equivalents',current:64663956,balance:true},
  {name:'Profit before tax',current:64350996,previous:188559801}
];
const regionalRevenue = [
  {name:'Botswana',current:180022652,previous:173613374},
  {name:'Tanzania',current:171603647,previous:168087528},
  {name:'UAE / Dubai',current:2770351,previous:2413412}
];
let financialRegion = '';
let section = 'financial';
function financialCard(metric,index) {
  const icons=['cash-stack','bar-chart-line','wallet2','buildings','bank','safe2','graph-up'];
  const accents=Array(7).fill('blue');
  const change=metric.previous===undefined?null:(metric.current/metric.previous-1)*100;
  const badge=change===null?'neutral':change===0?'neutral':metric.name==='Finance costs'?(change>0?'attention':'positive'):(change>0?'positive':'attention');
  return `<article class="kpi financial-kpi financial-card accent-${accents[index]}" data-metric-index="${index}">
    <div class="kpi-top"><span class="kpi-label">${metric.name}</span><i class="bi bi-${icons[index]}" aria-hidden="true"></i></div>
    <div class="kpi-value" title="${money(metric.current)}">P ${(metric.current/1000000).toFixed(2)}m</div>
    <div class="kpi-note">Group · ${metric.balance?'As at 31 Jan 2026':'Annual flow'}</div>
    <div class="financial-change ${badge}">${change===null?'<i class="bi bi-dash" aria-hidden="true"></i> Comparative not verified':`<i class="bi bi-arrow-${change>=0?'up':'down'}-right" aria-hidden="true"></i> ${change>0?'+':''}${change.toFixed(2)}% <span>vs FY2025</span>`}</div>
  </article>`;
}
function financialRows() {
  const rows=[];
  financialMetrics.forEach(metric=>{
    rows.push([metric.name,'Group','FY2026','2026-01-31',metric.current,'BWP','Published FY2026 results',FINANCIAL_SOURCE]);
    if(metric.previous!==undefined) rows.push([metric.name,'Group','FY2025','2025-01-31',metric.previous,'BWP','Published FY2025 comparative',FINANCIAL_SOURCE]);
  });
  regionalRevenue.filter(region=>!financialRegion||region.name===financialRegion).forEach(region=>{
    rows.push(['Annual rental revenue',region.name,'FY2026','2026-01-31',region.current,'BWP','Published FY2026 results',FINANCIAL_SOURCE]);
    rows.push(['Annual rental revenue',region.name,'FY2025','2025-01-31',region.previous,'BWP','Published FY2025 comparative',FINANCIAL_SOURCE]);
  });
  return rows;
}
function financialCsv() {
  return '\uFEFF'+[['Metric','Scope','Financial year','Period end','Value','Currency / unit','Data basis','Source URL'],...financialRows()].map(row=>row.map(csvText).join(',')).join('\r\n')+'\r\n';
}
function exportFinancial() {
  const url=URL.createObjectURL(new Blob([financialCsv()],{type:'text/csv;charset=utf-8'}));
  const anchor=document.createElement('a'); anchor.href=url; anchor.download='turnstar-financial-FY2026.csv';
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderFinancial() {
  const selected=regionalRevenue.find(r=>r.name===financialRegion);
  const annual=selected||financialMetrics[0];
  const panel=(id,title,note,cls='')=>'<section class="panel '+cls+'"><div class="panel-heading"><div><h2>'+title+'</h2><p>'+note+'</p></div></div><div class="chart-wrap financial-chart"><canvas id="'+id+'"></canvas></div></section>';
  for(const id of ['headerTools','themeToggle']) { const node=el(id); if(node&&el('financialSection').contains(node)) document.querySelector('.app-header').append(node); }
  el('financialSection').innerHTML=`
    <div class="financial-heading"><div><h1 tabindex="-1" id="financialTitle">Financial overview</h1><p>Year ended 31 January 2026 <span class="heading-separator">/</span> <span class="basis-inline">Published FY2026 results</span></p></div><div class="heading-actions" id="financialHeadingActions"><button class="export-button" id="exportFinancial"><i class="bi bi-download" aria-hidden="true"></i> Export CSV</button></div></div>
    <section class="kpi-grid financial-kpis" aria-label="Group financial metrics">${financialMetrics.map(financialCard).join('')}</section>
    <div class="financial-scope"><nav class="entity-pills" aria-label="Regional rental revenue">${[{name:'All Regions',value:''},...regionalRevenue.map(r=>({name:r.name==='UAE / Dubai'?'UAE':r.name,value:r.name}))].map(r=>'<button class="entity-pill '+(financialRegion===r.value?'active':'')+'" type="button" data-region="'+r.value+'" aria-pressed="'+(financialRegion===r.value)+'">'+r.name+'</button>').join('')}</nav><p class="data-basis">Cards: Group results. Regional selection changes verified rental revenue only.</p></div>
    <div class="financial-layout">${panel('financialRental','Rental revenue comparison',(selected?selected.name:'Group')+' annual revenue ? BWP millions','performance-panel')}
    <section class="panel contribution-panel"><div class="panel-heading"><div><h2>Regional contribution</h2><p>FY2026 Group rental revenue</p></div></div><div class="chart-wrap contribution-donut"><canvas id="financialRegions"></canvas></div><div class="region-legend">${regionalRevenue.map((r,i)=>'<button type="button" class="region-legend-row" data-region="'+r.name+'"><span class="region-dot region-'+i+'"></span><span>'+r.name+'<small>'+money(r.current)+'</small></span><strong>'+(r.current/354396650*100).toFixed(2)+'%</strong></button>').join('')}</div></section>
    ${panel('financialProfit','Operating performance','Group ? annual flows ? BWP millions','support-panel')}
    ${panel('financialProperty','Investment property value','Group ? balances at reporting date ? BWP billions','support-panel')}</div>
    <section class="panel financial-summary"><div class="panel-heading"><div><h2>Group financial summary</h2><p>Exact published amounts ? BWP</p></div><span class="tag">FY2026 / FY2025</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Metric</th><th>FY2026</th><th>FY2025</th><th>Change</th></tr></thead><tbody>${financialMetrics.map(m=>'<tr><th scope="row">'+m.name+'<small>'+ (m.balance?'Balance at 31 January':'Annual flow')+'</small></th><td>'+money(m.current)+'</td><td>'+(m.previous===undefined?'Not verified':money(m.previous))+'</td><td>'+(m.previous===undefined?'?':((m.current/m.previous-1)*100).toFixed(2)+'%')+'</td></tr>').join('')}</tbody></table></div></section>
    <details id="aboutData" class="panel financial-sources"><summary>Sources / About Data</summary><p>Financial figures use the supplied detailed consolidated statement figures. The 2026 report link could not be retrieved during implementation; independent PDF verification remains outstanding. Operating profit includes exchange losses using the detailed statement definition. No cash comparative has been added.</p><p>All published figures are BWP. Annual flows cover the year ended 31 January; property and cash are balances at the reporting date. YoY means percentage change, not percentage-point change. Regional shares use Group rental revenue as denominator. There are no inferred monthly financial trends.</p><p><a href="https://turnstar.co.bw/">Official company website</a> · <a href="https://turnstar.co.bw/annual-reports/">Annual reports</a> · <a href="${FINANCIAL_SOURCE}">2026 report</a> · <a href="https://www.linkedin.com/company/turnstar-holdings-limited">Company LinkedIn</a></p><p>Rental records are fictional BWP-equivalent demo amounts with a fixed 12 October 2026 reference date; no live conversion is used. The 12-component demo registry is not a definitive current property count. Mlimani City is a parent development, not an extra counted property. Geography does not imply subsidiary ownership.</p></details>`;
  el('exportFinancial').onclick=exportFinancial;
  el('financialSection').querySelectorAll('[data-region]').forEach(button=>button.onclick=()=>{
    financialRegion=button.dataset.region; renderFinancial();
    el('financialSection').querySelector('.entity-pill[aria-pressed="true"]').focus({preventScroll:true});
  });
  drawChart('financialRental','bar',['Annual rental revenue'],[annual.current],{currency:true,series:[{label:'FY2025',data:[annual.previous],backgroundColor:'#A8CDEE'},{label:'FY2026',data:[annual.current],backgroundColor:'#1676C5'}]});
  drawChart('financialRegions','doughnut',regionalRevenue.map(r=>r.name),regionalRevenue.map(r=>r.current),{currency:true,colors:['#1676C5','#17365D','#76AEDD'],entityIds:['botswana','tanzania','uae'],onSelect:index=>{financialRegion=regionalRevenue[index].name;renderFinancial();}});
  drawChart('financialProfit','bar',['Operating profit','Profit after tax'],[184415767,50707188],{currency:true,series:[{label:'FY2025',data:[185866894,140683580],backgroundColor:'#A8CDEE'},{label:'FY2026',data:[184415767,50707188],backgroundColor:'#1676C5'}]});
  drawChart('financialProperty','bar',['31 Jan 2025','31 Jan 2026'],[2792036806,2576575186],{currency:true,colors:['#A8CDEE','#1676C5']});
  if(section==='financial') { const tools=el('headerTools'); if(tools)el('financialHeadingActions').prepend(tools,el('themeToggle')); else el('financialHeadingActions').prepend(el('themeToggle')); }
  window.dispatchEvent?.(new Event('dashboard:navigation'));
}
function showSection(next) {
  section=next;
  el('financialSection').hidden=next!=='financial'; el('rentalSection').hidden=next!=='rental';
  el('financialNav').setAttribute('aria-current',next==='financial'?'page':'false');
  el('home').setAttribute('aria-current',next==='rental'?'page':'false');
  if(next==='financial')renderFinancial();else { render(); el('rentalHeadingActions').append(...(el('headerTools')?[el('headerTools')]:[]),el('themeToggle'),el('exportCsv')); }
  el('skipLink').href=next==='financial'?'#financialTitle':'#title';
  window.dispatchEvent?.(new Event('dashboard:navigation'));
  window.bootstrap?.Offcanvas?.getInstance(el('portfolioSidebar'))?.hide();
  window.scrollTo({top:0,behavior:'auto'});
}
el('financialNav').onclick=()=>showSection('financial');
el('home').onclick=()=>showSection('rental');
el('sourcesNav').onclick=()=>{showSection('financial');el('aboutData').open=true;el('aboutData').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});el('aboutData').querySelector('summary').focus({preventScroll:true});};
showSection('financial');
