const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function target(){
  const listeners=new Map();
  return {
    scrollHeight:1000,clientHeight:500,scrollTop:0,
    addEventListener(name,handler,options){assert.ok(!listeners.has(name),'duplicate '+name+' listener');listeners.set(name,{handler,options});},
    removeEventListener(name,handler){assert.equal(listeners.get(name)?.handler,handler);listeners.delete(name);},
    emit(name){listeners.get(name)?.handler();},
    listener(name){return listeners.get(name);}
  };
}
const button=target(),windowTarget=target(),workspace=target(),main=target();
const classes=new Set(),attrs=new Map();
button.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)};
button.getAttribute=x=>attrs.has(x)?attrs.get(x):null;
button.setAttribute=(x,y)=>attrs.set(x,String(y));
button.removeAttribute=x=>attrs.delete(x);
button.contains=x=>x===button;
workspace.querySelector=()=>main;
windowTarget.scrollY=0;
const document={getElementById:()=>button,querySelector:()=>workspace,documentElement:{scrollTop:0},activeElement:null};
let queue=[],frames=0;
const context={document,window:windowTarget,getComputedStyle:x=>({overflowY:x.overflowY||'visible'}),requestAnimationFrame:fn=>{queue.push(fn);return ++frames;}};
vm.runInNewContext(fs.readFileSync('assets/js/back-button-visibility.js','utf8'),context);
const flush=()=>{while(queue.length)queue.shift()();};
const scroll=(y,t=windowTarget)=>{t.scrollY=y;t.scrollTop=y;t.emit('scroll');flush();};
flush();
assert.ok(!classes.has('is-scroll-hidden'));
assert.equal(windowTarget.listener('scroll').options.passive,true);
scroll(30);assert.ok(!classes.has('is-scroll-hidden'));
scroll(59);assert.ok(!classes.has('is-scroll-hidden'));
scroll(61);assert.ok(classes.has('is-scroll-hidden'));
assert.equal(attrs.get('tabindex'),'-1');assert.equal(attrs.get('aria-hidden'),'true');
scroll(60);scroll(59);assert.ok(!classes.has('is-scroll-hidden'),'near-top return');
scroll(120);assert.ok(classes.has('is-scroll-hidden'));
scroll(117);scroll(114);scroll(111);assert.ok(classes.has('is-scroll-hidden'));
scroll(108);assert.ok(!classes.has('is-scroll-hidden'),'12px deliberate rise');
assert.equal(attrs.has('tabindex'),false);assert.equal(attrs.has('aria-hidden'),false);
document.activeElement=button;scroll(170);scroll(232);assert.ok(!classes.has('is-scroll-hidden'),'focused button stays visible');
document.activeElement=null;button.emit('blur');assert.ok(classes.has('is-scroll-hidden'));
windowTarget.emit('dashboard:navigation');assert.ok(!classes.has('is-scroll-hidden'),'navigation reset');
main.overflowY='auto';windowTarget.emit('resize');assert.equal(windowTarget.listener('scroll'),undefined);
assert.equal(main.listener('scroll').options.passive,true);
scroll(0,main);scroll(64,main);assert.ok(classes.has('is-scroll-hidden'),'workspace scroller, including mobile layout');
scroll(52,main);assert.ok(!classes.has('is-scroll-hidden'));
console.log('Back-arrow checks passed: initial/top visibility, down/up thresholds, jitter, focus/blur, keyboard state, navigation reset, passive single listener and workspace/mobile scroller.');
