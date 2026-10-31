'use strict';
// Real Chromium regression: native horizontal day swipe, quick navigation, data preservation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out='/tmp/memento-day-swipe';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {task}=require('./helpers/storage-fixture.cjs');
 const fixture=await require('./helpers/visual-fixture.cjs').fixture();
 const withDate=(id,title,date)=>({...task(id,title),date,focusDate:'',done:false,archived:false,deletedAt:''});
 fixture.life.tasks=[
  withDate('day-0','Taak vandaag voorbeeld','2026-10-31'),
  withDate('day-1','Taak morgen voorbeeld','2026-11-01'),
  withDate('day-2','Taak overmorgen voorbeeld','2026-11-02'),
  withDate('day-late','Achterstallige taak voorbeeld','2026-10-30'),
  withDate('day-none','Zonder planning voorbeeld','')
 ];
 fixture.life.appointments=[];fixture.life.googleAppointments=[];fixture.life.appointmentChecks={};
 const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [360,393,412]){
   const ctx=await browser.newContext({viewport:{width,height:820},hasTouch:true,isMobile:true,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
   await ctx.route('https://**/*',async route=>{
    const u=new URL(route.request().url());if(u.hostname!=='memento.test')return route.abort();
    const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream'});
   });
   await ctx.addInitScript(()=>{const D=Date,t=D.parse('2026-10-31T13:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]))}static now(){return t}}});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('https://memento.test/manifest.json');
   await page.evaluate(data=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(data.pin));},fixture);
   await page.goto('https://memento.test/');await require('./helpers/enter-app.cjs')(page);
   await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   await page.locator('#mementoQuickNav [data-memento-dest="life:today"]').click();
   const track=page.locator('#lifeDayTrack'),slides=track.locator(':scope > .life-day-column');
   assert.equal(await slides.count(),3);
   assert.equal(await page.locator('.life-day-tabs button').count(),3);
   assert.equal(await page.locator('#lifeContent .life-day-foot,#lifeContent .life-unplanned').count(),0);
   assert.equal(await slides.nth(0).getByText('Taak vandaag voorbeeld').count(),1);
   assert.equal(await slides.nth(1).getByText('Taak morgen voorbeeld').count(),1);
   assert.equal(await slides.nth(2).getByText('Taak overmorgen voorbeeld').count(),1);
   assert.equal(await slides.nth(0).getByText('Achterstallige taak voorbeeld').count(),1);
   assert.equal(await slides.nth(1).getByText('Achterstallige taak voorbeeld').count(),0);
   const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).tasks);
   await track.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,width+'-vandaag.png'),animations:'disabled'});
   const buttons=page.locator('.life-day-tabs button');
   for(const i of [1,2,0]){
    await buttons.nth(i).click();
    await page.waitForFunction(n=>{const el=document.querySelector('#lifeDayTrack');return Math.abs(el.scrollLeft-el.clientWidth*n)<=2},i);
    assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,'No horizontal page overflow');
   }
   // Native scroll is available independently from the tab buttons.
   await track.evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
   await page.waitForFunction(()=>document.querySelector('[data-life-day-slide="1"]').getAttribute('aria-pressed')==='true');
   await track.focus();await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('[data-life-day-slide="2"]').getAttribute('aria-pressed')==='true');
   if(width===393){
    await buttons.first().click();await track.scrollIntoViewIfNeeded();
    const box=await track.boundingBox(),y=box.y+Math.min(80,box.height/2);
    const cdp=await ctx.newCDPSession(page),from=box.x+box.width*.8,to=box.x+box.width*.18;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y,id:1}]});
    for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from+(to-from)*i/10,y,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(()=>document.querySelector('#lifeDayTrack').scrollLeft>10);
   }
   await buttons.nth(2).click();await page.screenshot({path:path.join(out,width+'-overmorgen.png'),animations:'disabled'});
   const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).tasks);
   assert.deepEqual(after,before,'Swiping is read-only');
   await page.locator('#mementoQuickNav [data-memento-dest="life:tasks"]').click();
   assert.equal(await page.getByText('Zonder planning voorbeeld',{exact:true}).count(),1,'Unplanned task still exists in Taken');
   assert.deepEqual(errors,[],'No browser errors');
   console.log('PASS native day swipe/navigation, data retention and compact layout at '+width+' CSS px');
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
