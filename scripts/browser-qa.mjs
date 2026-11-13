import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const profile=path.resolve('.cache/chrome-qa');fs.mkdirSync(profile,{recursive:true});
const portFile=path.join(profile,'DevToolsActivePort');if(fs.existsSync(portFile))fs.unlinkSync(portFile);
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--user-data-dir=${profile}`,'--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-gpu','about:blank'],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4176'},stdio:'ignore',windowsHide:true});
let socket;
try{
 let port;for(let i=0;i<100&&!port;i++){await pause(100);try{port=Number(fs.readFileSync(portFile,'utf8').split('\n')[0])}catch{}}
 assert(port,'Chrome started');
 const target=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t=>t.type==='page');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 let id=0;const pending=new Map();socket.onmessage=({data})=>{const m=JSON.parse(data);if(pending.has(m.id)){const {r,j}=pending.get(m.id);pending.delete(m.id);m.error?j(Error(m.error.message)):r(m.result)}};
 const cdp=(method,params={})=>new Promise((r,j)=>{pending.set(++id,{r,j});socket.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await cdp('Page.enable');await cdp('Runtime.enable');
 const report=[];
 for(const width of [1440,1024,768,390,320]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:4176/'});await pause(600);await evaluate('document.fonts.ready');
  await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}))`);
  const layout=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),title:document.querySelector('h1').textContent,paragraphs:[...document.querySelectorAll('[data-source-paragraph]')].map(p=>p.innerHTML),cover:document.querySelector('.news-cover').getBoundingClientRect().toJSON(),heading:document.querySelector('h1').getBoundingClientRect().toJSON()})`);
  assert(layout.scrollWidth<=width,`No page overflow at ${width}`);assert(layout.images,`All images decoded at ${width}`);assert(layout.cover.top>layout.heading.bottom,'Cover below title');
  assert.deepEqual(layout.paragraphs,JSON.parse(fs.readFileSync('research/article.json','utf8')).paragraphs);
  await evaluate(`document.querySelector('.menu-toggle').click()`);assert(await evaluate(`document.querySelector('.project-menu').open`));
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(50);assert(await evaluate(`!document.querySelector('.project-menu').open`));
  await evaluate(`document.querySelector('.header-search').click()`);assert(await evaluate(`document.activeElement.type==='search'`));await evaluate(`document.querySelector('.menu-close').click()`);
  await evaluate(`document.querySelector('[data-slide="5"]').click()`);await pause(150);assert(await evaluate(`document.querySelector('.gallery-count b').textContent==='06'&&document.querySelector('.gallery-next').disabled`));
  await evaluate(`document.querySelector('[data-slide="0"]').click()`);await pause(100);await evaluate(`document.querySelector('.gallery-track').focus()`);await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await pause(100);assert(await evaluate(`document.querySelector('.gallery-count b').textContent==='02'`));
  await evaluate(`document.querySelector('[data-slide="0"]').click();document.activeElement.blur();scrollTo(0,0)`);await pause(100);
  if([1440,390].includes(width)){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`qa/${width}-viewport.png`,Buffer.from(shot.data,'base64'))}
  report.push({width,overflow:false,images:true,exactText:true,menu:true,searchFocus:true,gallery:true});
 }
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await cdp('Page.navigate',{url:'http://127.0.0.1:4176/'});await pause(400);assert(await evaluate(`document.getAnimations().length===0&&[...document.querySelectorAll('[data-enter]')].every(e=>getComputedStyle(e).opacity==='1')`));
 await cdp('Emulation.setScriptExecutionDisabled',{value:true});await cdp('Page.navigate',{url:'http://127.0.0.1:4176/'});await pause(500);assert(await evaluate(`document.querySelectorAll('[data-source-paragraph]').length===7&&getComputedStyle(document.querySelector('h1')).opacity==='1'`));
 fs.writeFileSync('qa/browser-report.json',JSON.stringify({report,reducedMotion:true,noJavaScriptText:true},null,2));console.log('PASS: 5 widths, exact rendered text, all images, menu/Escape, search focus, gallery/dots/keyboard, reduced motion, no-JS text.');
}finally{server.kill();socket?.close();if(chrome.exitCode==null){try{execFileSync('taskkill',['/PID',String(chrome.pid),'/T','/F'],{stdio:'ignore'})}catch{chrome.kill()}}}

