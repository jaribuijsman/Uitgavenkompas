'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.env.MEMENTO_LIVE_OUT||'/workspace/memento-evidence/live',url='https://jaribuijsman.github.io/Uitgavenkompas/';fs.mkdirSync(out,{recursive:true});
(async()=>{let browser;const report={url,checkedAt:new Date().toISOString(),checks:[],errors:[],failure:null};
try{
 const envProxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;let proxy;
 if(envProxy){const p=new URL(envProxy);proxy={server:p.origin,...(p.username?{username:decodeURIComponent(p.username),password:decodeURIComponent(p.password)}:{})};}
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',proxy,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [360,393,412]){
  const ctx=await browser.newContext({viewport:{width,height:852},hasTouch:true,isMobile:true,locale:'nl-NL',timezoneId:'Europe/Amsterdam',reducedMotion:'reduce'});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.origin===new URL(url).origin||['data:','blob:'].includes(u.protocol)?r.continue():r.abort();});
  const page=await ctx.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);
  assert.equal(await page.locator('#pinLock').isVisible(),false);assert.equal(await page.locator('.memento-duty-badge').getAttribute('data-duty-code'),await page.evaluate(()=>window.MementoFitnessCore.duty(window.MementoKnowledgeCore.journalDate()).code));
  await page.screenshot({path:path.join(out,width+'-live-day.jpg'),type:'jpeg',quality:75});
  await page.locator('#mementoQuickNav [data-memento-dest="life:notes"]').tap();assert.equal(await page.locator('#lifeTitle').innerText(),'Notities');assert.equal(await page.locator('[data-kc-input=central-search]').isVisible(),true);await page.screenshot({path:path.join(out,width+'-live-notes.jpg'),type:'jpeg',quality:75});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>navigator.serviceWorker.controller&&window.MementoStorageGuard?.writable);const cache=await page.evaluate(()=>caches.keys());assert(cache.some(k=>k===process.env.MEMENTO_LIVE_EXPECT_CACHE)||!process.env.MEMENTO_LIVE_EXPECT_CACHE);
  await ctx.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);assert.equal(await page.locator('#pinLock').isVisible(),false);report.checks.push({width,http:200,liveUI:true,offlineReload:true,cache,personalDataEntered:false});await ctx.close();
 }
 assert.deepEqual(report.errors,[]);
}catch(e){report.failure=String(e);process.exitCode=1;}
finally{if(browser)await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
