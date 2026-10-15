const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const nodes=new Map();
class Element {
 constructor(id){this.id=id;this.attributes={};this.children=[];this.parent=null;this.hidden=false;this.dataset={};}
 setAttribute(k,v){this.attributes[k]=v;}
 contains(node){return !!node&&(node.parent===this||this.children.some(c=>c.contains(node)));}
 append(...items){for(const item of items){if(item.parent)item.parent.children=item.parent.children.filter(c=>c!==item);item.parent=this;this.children.push(item);}}
 prepend(item){this.append(item);this.children=[item,...this.children.filter(c=>c!==item)];}
 focus(){this.focused=true;}scrollIntoView(){}
 set innerHTML(text){this.html=text;this.children=[];for(const match of text.matchAll(/id="([^"]+)"/g)){const child=new Element(match[1]);nodes.set(child.id,child);this.append(child);}this.regionButtons=[...text.matchAll(/data-region="([^"]*)"/g)].map(m=>{const b=new Element('region');b.dataset.region=m[1];return b;});}
 get innerHTML(){return this.html||'';}
 querySelectorAll(selector){return selector==='[data-region]'?this.regionButtons||[]:[];}
 querySelector(selector){return new Element(selector);}
}
const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);};
for(const id of ['financialSection','rentalSection','financialNav','home','sourcesNav','skipLink','themeToggle','rentalHeadingActions','exportCsv','portfolioSidebar'])get(id);
get('header').append(get('themeToggle'));
const toggle=get('themeToggle');toggle.onclick=()=>{};
const doc={getElementById:get,querySelector:()=>get('header'),documentElement:{getAttribute:()=> 'light'}};
const chartCalls=[];
const context=vm.createContext({document:doc,window:{scrollTo(){},matchMedia:()=>({matches:false}),addEventListener(){}},el:get,drawChart:(...args)=>chartCalls.push(args),money:n=>'P '+n.toLocaleString('en'),csvText:String,render(){},setTimeout(){}});
vm.runInContext(fs.readFileSync('assets/js/financial.js','utf8'),context);
assert.equal(get('financialSection').hidden,false);assert.equal(get('rentalSection').hidden,true);
assert.equal(get('financialNav').attributes['aria-current'],'page');
assert.equal(chartCalls.length,4);
assert.equal(chartCalls[0][4].series[0].data[0],344114314);
assert.equal(chartCalls[1][1],'doughnut');
assert.equal(chartCalls[2][4].series[1].data[1],50707188);
const markup=get('financialSection').innerHTML;
assert.equal((markup.match(/<article class="kpi /g)||[]).length,7);
assert.ok(markup.includes('vs FY2025'));assert.ok(markup.includes('Group financial summary'));
assert.ok(!markup.includes('<select'));assert.ok(!markup.includes('data-region="undefined"'));
get('financialSection').querySelectorAll('[data-region]')[1].onclick();
assert.equal(vm.runInContext('financialRegion',context),'Botswana');
assert.equal(chartCalls.at(-4)[4].series[1].data[0],180022652);
assert.equal(get('themeToggle'),toggle);assert.equal(typeof toggle.onclick,'function');
get('home').onclick();assert.equal(get('financialSection').hidden,true);assert.equal(toggle.parent.id,'rentalHeadingActions');
get('financialNav').onclick();assert.equal(toggle.parent.id,'financialHeadingActions');
get('sourcesNav').onclick();assert.equal(get('aboutData').open,true);
const css=fs.readFileSync('assets/css/redesign.css','utf8');
assert.ok(css.includes('.financial-kpis {grid-template-columns:repeat(12,minmax(0,1fr));}'));
assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('max-width:650px'));assert.ok(css.includes('data-bs-theme="dark"'));
console.log('Presentation checks passed: financial template, grouped chart values, contribution chart, regional pill selection, theme-toggle retention, section navigation, sources entry and responsive rules.');

// Exercise the actual renderer with a Chart.js test double.
context.Chart=class {
 static defaults={font:{}};
 constructor(canvas,config){this.canvas=canvas;this.data=config.data;this.options=config.options;}
 destroy(){} update(){}
};
vm.runInContext(fs.readFileSync('assets/js/charts.js','utf8'),context);
vm.runInContext('chartEmptyState=()=>{}',context);
vm.runInContext("drawChart('groupedTest','bar',['Revenue'],[2],{currency:true,series:[{label:'FY2025',data:[1],backgroundColor:'#A8CDEE'},{label:'FY2026',data:[2],backgroundColor:'#1676C5'}]})",context);
assert.equal(vm.runInContext('chartInstances.groupedTest.data.datasets.length',context),2);
assert.equal(vm.runInContext('chartInstances.groupedTest.options.plugins.legend.display',context),true);
assert.equal(vm.runInContext("chartInstances.groupedTest.options.plugins.tooltip.callbacks.label({dataset:{label:'FY2026'},raw:2})",context),'FY2026: P 2');
assert.ok(get('groupedTest').attributes['aria-label'].includes('FY2025 P 1'));
vm.runInContext('applyChartTheme()',context);
assert.equal(vm.runInContext('chartInstances.groupedTest.options.plugins.legend.labels.color',context),'#526174');
console.log('Chart renderer checks passed: grouped series, legend, exact tooltips, accessible labels and theme refresh.');
