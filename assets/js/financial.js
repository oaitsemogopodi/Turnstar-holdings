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
  const accents=['blue','indigo','teal','blue','indigo','teal','blue'];
  const change=metric.previous===undefined?null:(metric.current/metric.previous-1)*100;
  const badge=change===null?'neutral':change===0?'neutral':metric.name==='Finance costs'?(change>0?'attention':'positive'):(change>0?'positive':'attention');
  return `<article class="kpi financial-kpi financial-card accent-${accents[index]}">
    <div class="kpi-top"><span class="kpi-label">${metric.name}</span><i class="bi bi-${icons[index]}" aria-hidden="true"></i></div>
    <div class="kpi-value" title="${money(metric.current)}">P ${(metric.current/1000000).toFixed(2)}m</div>
    <div class="kpi-note">Group · ${metric.balance?'As at 31 Jan 2026':'Annual flow'}</div>
    <div class="financial-change ${badge}">${change===null?'<i class="bi bi-dash" aria-hidden="true"></i> Comparative not verified':`<i class="bi bi-arrow-${change>=0?'up':'down'}-right" aria-hidden="true"></i> ${change>0?'+':''}${change.toFixed(2)}% <span>YoY</span>`}</div>
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
  const selected=regionalRevenue.find(region=>region.name===financialRegion);
  const annual=selected||financialMetrics[0];
  el('financialSection').innerHTML=`
    <div class="financial-heading"><div><h1 tabindex="-1" id="financialTitle">Financial overview</h1><p>Year ended 31 January 2026</p><span class="tag">Published FY2026 results</span></div><button class="export-button" id="exportFinancial">Export financial CSV</button></div>
    <section class="kpi-grid" aria-label="Group financial metrics">${financialMetrics.map(financialCard).join('')}</section>
    <div class="financial-region"><label for="financialRegion">Regional rental revenue</label><select id="financialRegion"><option value="">All regions / Group</option>${regionalRevenue.map(region=>`<option ${financialRegion===region.name?'selected':''}>${region.name}</option>`).join('')}</select><span class="tag">${selected?selected.name:'Group'} · ${money(annual.current)} annual rental revenue</span></div>
    <p class="data-basis">Regional selection affects verified rental revenue only. The seven cards above remain a separately labelled Group summary. Other financial metrics: not disclosed by region.</p>
    <div class="chart-grid">${[['financialRental','Annual rental revenue','FY2025 versus FY2026 · BWP'],['financialRegions','Rental revenue by region','Annual rental revenue · BWP'],['financialProfit','Operating profit and profit after tax','Group · annual flows · BWP'],['financialProperty','Investment property value','Group · balances at each year end · BWP']].map(([id,title,note])=>`<section class="panel"><div class="panel-heading"><div><h2>${title}</h2><p>${note}</p></div></div><div class="chart-wrap financial-chart"><canvas id="${id}"></canvas></div></section>`).join('')}</div>
    <section class="panel financial-sources"><h2>Regional revenue contribution</h2><p>Share of FY2026 Group annual rental revenue</p><div class="contribution">${regionalRevenue.map(region=>`<span class="contribution-item"><span class="contribution-bar" style="width:${region.current/354396650*100}%"></span>${region.name}: <strong>${(region.current/354396650*100).toFixed(2)}%</strong> · ${money(region.current)}</span>`).join('')}</div></section>
    <details class="panel financial-sources"><summary>Sources / About Data</summary><p>Financial figures use the supplied detailed consolidated statement figures. The 2026 report link could not be retrieved during implementation; independent PDF verification remains outstanding. Operating profit includes exchange losses using the detailed statement definition. No cash comparative has been added.</p><p>All published figures are BWP. Annual flows cover the year ended 31 January; property and cash are balances at the reporting date. YoY means percentage change, not percentage-point change. Regional shares use Group rental revenue as denominator. There are no inferred monthly financial trends.</p><p><a href="https://turnstar.co.bw/">Official company website</a> · <a href="https://turnstar.co.bw/annual-reports/">Annual reports</a> · <a href="${FINANCIAL_SOURCE}">2026 report</a> · <a href="https://www.linkedin.com/company/turnstar-holdings-limited">Company LinkedIn</a></p><p>Rental records are fictional BWP-equivalent demo amounts with a fixed 12 October 2026 reference date; no live conversion is used. The 12-component demo registry is not a definitive current property count. Mlimani City is a parent development, not an extra counted property. Geography does not imply subsidiary ownership.</p></details>`;
  el('exportFinancial').onclick=exportFinancial;
  el('financialRegion').onchange=event=>{financialRegion=event.target.value;renderFinancial();};
  const colors=['#1676C5','#76AEDD'];
  drawChart('financialRental','bar',['FY2025','FY2026'],[annual.previous,annual.current],{currency:true,colors});
  drawChart('financialRegions','bar',regionalRevenue.map(region=>region.name),regionalRevenue.map(region=>region.current),{currency:true,colors:['#1676C5','#659CCD','#A4C9E8'],onSelect:index=>{financialRegion=regionalRevenue[index].name;renderFinancial();}});
  drawChart('financialProfit','bar',['FY2025 operating profit','FY2026 operating profit','FY2025 profit after tax','FY2026 profit after tax'],[185866894,184415767,140683580,50707188],{currency:true,colors:[...colors,...colors]});
  drawChart('financialProperty','bar',['31 Jan 2025','31 Jan 2026'],[2792036806,2576575186],{currency:true,colors});
}
function showSection(next) {
  section=next;
  el('financialSection').hidden=next!=='financial'; el('rentalSection').hidden=next!=='rental';
  el('financialNav').setAttribute('aria-current',next==='financial'?'page':'false');
  el('home').setAttribute('aria-current',next==='rental'?'page':'false');
  if(next==='financial')renderFinancial();else render();
  window.bootstrap?.Offcanvas?.getInstance(el('portfolioSidebar'))?.hide();
  window.scrollTo({top:0,behavior:'auto'});
}
el('financialNav').onclick=()=>showSection('financial');
el('home').onclick=()=>showSection('rental');
showSection('financial');
