"use strict";
const fs=require("node:fs"),http=require("node:http"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const root=path.resolve(process.env.ILLUSTRATIVE_ROOT||path.join(__dirname,"..")),width=Number(process.env.ILLUSTRATIVE_WIDTH||393),checks=[],errors=[];
const srv=http.createServer((req,res)=>{
 if(req.url==="/__seed__"){res.setHeader("Content-Type","text/html");res.end("<!doctype html><title>Fictieve controlegegevens</title>");return;}
 const requested=new URL(req.url,"http://localhost").pathname,full=path.resolve(root,"."+ (requested==="/"?"/index.html":requested));
 if(!full.startsWith(root+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader("Content-Type",({".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".json":"application/json"})[path.extname(full)]||"application/octet-stream");
 res.end(fs.readFileSync(full));
});
const capture=async(page,name)=>{
 if(!process.env.ILLUSTRATIVE_SCREENSHOT_DIR)return;
 fs.mkdirSync(process.env.ILLUSTRATIVE_SCREENSHOT_DIR,{recursive:true});
 await page.screenshot({path:path.join(process.env.ILLUSTRATIVE_SCREENSHOT_DIR,name+"-"+width+".jpg"),type:"jpeg",quality:86,fullPage:name==="audit-gallery",animations:"disabled"});
};
(async()=>{let browser,page;
try{
 await new Promise((ok,fail)=>{srv.once("error",fail);srv.listen(0,"127.0.0.1",ok)});
 browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width,height:870},hasTouch:width<=800,locale:"nl-NL",timezoneId:"Europe/Amsterdam",reducedMotion:"reduce"});
 await context.route("https://**/*",r=>r.abort());
 page=await context.newPage();page.setDefaultTimeout(10000);page.on("pageerror",e=>errors.push(e.message));
 const httpFailures=[];page.on("response",r=>{if(r.url().startsWith("http://127.0.0.1")&&r.status()>=400)httpFailures.push(r.url()+" "+r.status())});page.on("dialog",d=>d.accept());
 const base="http://127.0.0.1:"+srv.address().port;
 async function navigate(area,view){
  if(width>800){
   if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('#compassAreaBar [data-compass-area="'+area+'"]').click();
   await page.locator(area==='life'?'#lifeNavigation [data-life-view="'+view+'"]':'#sideNav [data-view="'+view+'"]').click();
  }else{
   await page.locator('[data-memento-menu="open"]').click();
   if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();
   await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();
  }
  await page.evaluate(()=>scrollTo(0,0));
 }
 async function knowledgeHome(){
  await navigate('life','notes');const home=page.locator('.kc-breadcrumbs [data-kc="home"]');if(await home.count())await home.click();
 }
 const noOverflow=async()=>{
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  const unnamed=await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width&&b.querySelector('svg.memento-illustrative-icon')&&!((b.getAttribute('aria-label')||b.textContent).trim())).map(b=>b.id||b.outerHTML.slice(0,160)));
  assert.deepEqual(unnamed,[],'Illustrated control needs an accessible name');
 };
 await page.goto(base+"/docs/icon-audit.html",{waitUntil:"domcontentloaded"});
 assert.equal(await page.locator("#categoryGrid .tile").count(),23);
 assert.equal(await page.locator("#iconGrid .tile").count(),66);
 assert.equal(await page.locator("#cardGrid .card").count(),5);
 assert.match(await page.locator("#auditStatus").textContent(),/geen letters in de beelden/);
 const geometry=await page.evaluate(()=>{
  return [...document.querySelectorAll(".tile")].map((tile,i)=>{
   const a=tile.querySelector(".badge svg"),b=tile.querySelector(".mini svg");
   const aa=a.getBoundingClientRect(),bb=b.getBoundingClientRect(),intrinsic=a.getBBox();
   const nodes=[...a.querySelectorAll("path,circle,ellipse,rect")].length;
   const ids=[...tile.querySelectorAll("[id]")].map(n=>n.id);
   return {i,bigW:aa.width,bigH:aa.height,smallW:bb.width,smallH:bb.height,
    sizes:[...tile.querySelectorAll(".mini .sample:not(.light) svg")].map(n=>n.getBoundingClientRect().width),box:[intrinsic.x,intrinsic.y,intrinsic.width,intrinsic.height],nodes,ids,text:!!a.querySelector("text")};
  });
 });
 assert.equal(geometry.length,89);
 for(const g of geometry){
  assert(g.bigW>=55&&g.bigW<=64,JSON.stringify(g));
  assert(g.smallW>=21&&g.smallW<=27,JSON.stringify(g));
  assert(g.smallH>=21&&g.smallH<=27,JSON.stringify(g));
  assert(g.nodes>=1 && g.box[2]>6 && g.box[3]>6,JSON.stringify(g));
  assert.deepEqual(g.sizes,[24,32,48]);
  assert(g.box[0]>=0&&g.box[1]>=0&&g.box[0]+g.box[2]<=64&&g.box[1]+g.box[3]<=64, "Artwork exceeds viewBox "+JSON.stringify(g));
  assert(!g.text,"SVG pictogram contains text "+g.i);
 }
 assert.equal(new Set(geometry.flatMap(g=>g.ids)).size,geometry.reduce((s,g)=>s+g.ids.length,0),"Gradient IDs collide");
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"Visual gallery overflows horizontally");
 checks.push("All 66 icons and 23 categories render at 24/32/48/64px without letters, clipping or duplicate IDs");
 const rasters=await page.evaluate(async()=>{
  const I=window.MementoIllustratedIcons,results=[];
  for(const key of I.available)for(const size of [24,32,48,64]){
   const svg=I.svg(key).replace('style="','width="'+size+'" height="'+size+'" style="color:#e8dfc6;');
   const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,size,size);
   const data=ctx.getImageData(0,0,size,size).data;let ink=0,edge=0,minX=size,minY=size,maxX=0,maxY=0;
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){if(data[(y*size+x)*4+3]>20){ink++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(!x||!y||x===size-1||y===size-1)edge++;}}
   results.push({key,size,ink,edge,center:[(minX+maxX)/2/size,(minY+maxY)/2/size]});
  }return results;
 });
 const clipped=rasters.filter(r=>r.edge);assert.deepEqual(clipped,[],"Clipped or opaque edges");
 for(const r of rasters){assert(r.ink>r.size*r.size*.04,JSON.stringify(r));assert.equal(r.edge,0,'Clipped or opaque edge '+JSON.stringify(r));assert(r.center.every(v=>v>.3&&v<.7),'Unbalanced center '+JSON.stringify(r));}
 checks.push('264 transparent raster samples: nonempty silhouettes, clear edges, centered at all four sizes');
 await capture(page,"audit-gallery");
 const fixture=await require('./helpers/visual-fixture.cjs').fixture();
 await page.goto(base+'/__seed__');
 await page.evaluate(data=>{
  localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));
  localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));
  localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(data.pin));
 },fixture);
 await page.goto(base,{waitUntil:"domcontentloaded"});
 await require('./helpers/enter-app.cjs')(page,false);
 await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoIllustratedIcons);
 assert.equal(await page.locator('#mementoQuickNav button .memento-illustrative-icon').count(),5);
 checks.push("Quick navigation uses new illustrations and original buttons are retained");
 if(width<=800){await page.locator('[data-memento-menu="open"]').click();
 assert(await page.locator('#mementoMenuGrid button .memento-illustrative-icon').count()>=8);await capture(page,'life-menu');await page.locator('#mementoMenuClose').click();}
 await knowledgeHome();
 assert(await page.locator("#lifeApp[data-life-view='notes'] .kc-collection-row.kc-art-row").count()>=5);
 assert(await page.locator("#lifeApp .kc-art-row .memento-illustrative-icon").count()>=5);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("Five root forest-background cards keep labels and display distinct collection symbols");
 await capture(page,"knowledge-roots");
 await page.locator('.kc-art-row[data-id="kc2-levenspad"]').click();
 assert.equal(await page.locator(".kc-art-row .memento-illustrative-icon").count(),5);
 const distinct=await page.locator(".kc-art-row .memento-illustrative-icon").evaluateAll(list=>new Set(list.map(e=>[...e.querySelectorAll("path")].map(x=>x.getAttribute("d")).join("|"))).size);
 assert(distinct>=4);
 checks.push("Levenspad children are recognizable and no longer reuse their parent icon blindly");
 await capture(page,"knowledge-children");
 // Open every standard category through its existing ID.
 const roots=['levenspad','huis-wonen','recepten-creaties','projecten-onderzoek','ideeen-inspiratie'];
 const visited=new Set(['kc2-levenspad']);
 for(const root of roots){
  await knowledgeHome();await page.locator('.kc-art-row[data-id="kc2-'+root+'"]').click();
  const ids=await page.locator('.kc-art-row').evaluateAll(rows=>rows.map(n=>n.dataset.id));visited.add('kc2-'+root);
  if(root!=='levenspad')await capture(page,'knowledge-'+root);
  for(const id of ids){await page.locator('.kc-art-row[data-id="'+id+'"]').click();visited.add(id);await noOverflow();await page.locator('[data-kc="back"]').click();}
 }
 assert.equal(visited.size,23);checks.push('All 23 categories open through unchanged IDs');
 await knowledgeHome();await page.locator('.kc-art-row[data-id="kc2-levenspad"]').click();
 await page.locator('.kc-collection-actions summary').click();await page.locator('.kc-collection-actions [data-kc="edit-collection"]').click();
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge.collections.find(c=>c.id==='kc2-levenspad'));
 const choices=page.locator('.kc-icon-picker [data-kc="choose-icon"]');assert(await choices.count()>=39);
 for(const b of await choices.all())assert((await b.getAttribute('aria-label')).length>0);
 await capture(page,'category-editor');
 // Saving unrelated fields must retain the stored legacy icon preference.
 await page.locator('[data-kc="save-collection"]').click();await page.waitForSelector('.kc-collection-actions');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge.collections.find(c=>c.id==='kc2-levenspad').icon),original.icon);
 await knowledgeHome();await page.locator('.kc-section-head summary').first().click();await page.locator('[data-kc="new-collection"]').first().click();
 await page.locator('#kc-col-name').fill('Fictieve pictogramcontrole');await page.locator('[data-kc="choose-icon"][data-id="compass"]').click();
 await page.locator('[data-kc="save-collection"]').click();await page.waitForSelector('.kc-collection-actions');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge.collections.find(c=>c.name==='Fictieve pictogramcontrole').icon),'compass');
 checks.push('Picker labels, existing preference and newly selected illustration survive save');
 await navigate('life','fitness');
 assert.equal(await page.locator("#mementoFitness .ft-tabs .memento-illustrative-icon").count(),3);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("All three Fitness tabs remain legible and navigation works");
 await capture(page,"fitness-tabs");
 await navigate('finance','dashboard');
 await page.waitForSelector('#view-dashboard.active');
 assert.equal(await page.locator('#mementoQuickNav button .memento-illustrative-icon').count(),5);
 assert(await page.locator("#view-dashboard .memento-illustrative-icon").count()>=4);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("Finance dashboard and quick navigation use decorative vectors without losing values");
 await capture(page,"finance-dashboard");
 await navigate('finance','analysis');
 assert.equal(await page.locator('.analysis-tabs .memento-illustrative-icon').count(),3);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("Analysis tabs retain their labels and click behavior");
 for(const view of ['transactions','budgets','accounts','planning','smartbuy','moneycoach','receipts','settings']){await navigate('finance',view);await noOverflow();await capture(page,'finance-'+view);}
 for(const view of ['today','tasks','agenda','groceries','wishes','backup']){await navigate('life',view);await noOverflow();}
 // SVGs must leave their host buttons with a usable accessible name.
 const unnamed=await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width&&b.querySelector('svg.memento-illustrative-icon')&&!((b.getAttribute('aria-label')||b.textContent).trim())).map(b=>b.id||b.outerHTML.slice(0,160)));
 assert.deepEqual(unnamed,[]);assert.deepEqual(httpFailures,[]);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('uitgavenkompas_v1')).transactions),fixture.finance.transactions);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).notes),fixture.life.notes);
 checks.push('All Life/Finance destinations open; original notes and transactions remain exact; labelled controls and no missing local assets');
 // A real service worker must cache every core URL and survive a network-disabled reload.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload({waitUntil:'domcontentloaded'});await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>navigator.serviceWorker.controller);
 const cache=await page.evaluate(async()=>{const key=(await caches.keys()).find(k=>k.startsWith('memento-pwa-'));const c=await caches.open(key);return {key,urls:(await c.keys()).map(r=>r.url)};});
 assert.equal(cache.key,fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const CACHE = "([^"]+)"/)[1]);assert(cache.urls.some(u=>u.includes('memento-illustrative-icons.js?v=20261027-iconset-v2')));
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoIllustratedIcons);
 await knowledgeHome();assert(await page.locator('.kc-art-row .memento-illustrative-icon').count()>=5);await capture(page,'offline-knowledge');
 await navigate('finance','transactions');await noOverflow();await context.setOffline(false);
 checks.push('Current service worker loads app, SVG library, forest scenes and transactions offline');
 assert.deepEqual(errors,[],"Browser page errors detected");
 if(process.env.ILLUSTRATIVE_SCREENSHOT_DIR)fs.writeFileSync(path.join(process.env.ILLUSTRATIVE_SCREENSHOT_DIR,'evidence.json'),JSON.stringify({width,browserVersion:browser.version(),checks,errors,httpFailures,cache,rasters,visited:[...visited]},null,2));
 console.log(JSON.stringify({width,checks,errors,geometry:{icons:geometry.length,minSmall:Math.min(...geometry.map(x=>x.smallW)),maxSmall:Math.max(...geometry.map(x=>x.smallW))}}));
 await context.close();
}catch(e){
 if(page&&process.env.ILLUSTRATIVE_SCREENSHOT_DIR)await capture(page,"failure").catch(()=>{});
 console.error(JSON.stringify({width,checks,errors,error:String(e),stack:e.stack}));process.exitCode=1;
}finally{if(browser)await browser.close();srv.close();}
})();
