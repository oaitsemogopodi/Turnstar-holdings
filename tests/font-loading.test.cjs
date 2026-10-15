const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let release;
const loaded=new Promise(resolve=>{release=resolve;});
const requests=[];let created=0,updated=0,resized=0;
const canvas={id:'fontChart',setAttribute(name,value){this[name]=value;}};
const document={fonts:{load:spec=>{requests.push(spec);return loaded;},ready:Promise.resolve()},documentElement:{getAttribute:()=> 'light'},getElementById:()=>canvas};
class ChartMock {
 static defaults={font:{}};
 constructor(canvas,config){created++;this.canvas=canvas;this.data=config.data;this.options=config.options;}
 destroy(){} update(){updated++;} resize(){resized++;}
}
const context=vm.createContext({document,window:{addEventListener(){}},Chart:ChartMock,money:n=>'P '+n,Promise});
vm.runInContext(fs.readFileSync('assets/js/charts.js','utf8'),context);
vm.runInContext('chartEmptyState=()=>{}',context);
vm.runInContext("drawChart('fontChart','bar',['FY2026'],[42],{currency:true})",context);
assert.equal(created,0,'chart measurement waits for font');
assert.deepEqual(requests,['400 12px Manrope','500 12px Manrope','600 12px Manrope','700 12px Manrope']);
release([]);
setImmediate(()=>{
  assert.equal(created,1);
  assert.equal(resized,1);
  assert.equal(updated,1);
  assert.match(ChartMock.defaults.font.family,/Manrope/);
  assert.equal(canvas['aria-label'],'FY2026: P 42');
  console.log('Font loading checks passed: four requested weights, delayed chart creation, Manrope labels and resize after loading.');
});
