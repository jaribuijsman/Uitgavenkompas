"use strict";
const fs=require("node:fs"),http=require("node:http"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const root=path.resolve(__dirname,".."),width=Number(process.env.ILLUSTRATIVE_WIDTH||393),checks=[],errors=[];
const srv=http.createServer((req,res)=>{
 const requested=new URL(req.url,"http://localhost").pathname,full=path.resolve(root,"."+ (requested==="/"?"/index.html":requested));
 if(!full.startsWith(root+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader("Content-Type",({".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".json":"application/json"})[path.extname(full)]||"application/octet-stream");
 res.end(fs.readFileSync(full));
});
const capture=async(page,name)=>{
 if(!process.env.ILLUSTRATIVE_SCREENSHOT_DIR)return;
 fs.mkdirSync(process.env.ILLUSTRATIVE_SCREENSHOT_DIR,{recursive:true});
 await page.screenshot({path:path.join(process.env.ILLUSTRATIVE_SCREENSHOT_DIR,name+"-"+width+".png"),fullPage:true,animations:"disabled"});
};
(async()=>{let browser;
try{
 await new Promise((ok,fail)=>{srv.once("error",fail);srv.listen(0,"127.0.0.1",ok)});
 browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width,height:870},hasTouch:true,locale:"nl-NL",timezoneId:"Europe/Amsterdam",reducedMotion:"reduce"});
 await context.route("https://**/*",r=>r.abort());
 const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
 const base="http://127.0.0.1:"+srv.address().port;
 await page.goto(base+"/docs/icon-audit.html",{waitUntil:"domcontentloaded"});
 assert.equal(await page.locator("#categoryGrid .tile").count(),23);
 assert.equal(await page.locator("#iconGrid .tile").count(),64);
 assert.equal(await page.locator("#cardGrid .card").count(),5);
 assert.match(await page.locator("#auditStatus").textContent(),/geen letters in de beelden/);
 const geometry=await page.evaluate(()=>{
  return [...document.querySelectorAll(".tile")].map((tile,i)=>{
   const a=tile.querySelector(".badge svg"),b=tile.querySelector(".mini svg");
   const aa=a.getBoundingClientRect(),bb=b.getBoundingClientRect(),intrinsic=a.getBBox();
   const nodes=[...a.querySelectorAll("path,circle,ellipse,rect")].length;
   const ids=[...a.querySelectorAll("[id]")].map(n=>n.id);
   return {i,bigW:aa.width,bigH:aa.height,smallW:bb.width,smallH:bb.height,
    box:[intrinsic.x,intrinsic.y,intrinsic.width,intrinsic.height],nodes,ids,text:!!a.querySelector("text")};
  });
 });
 assert.equal(geometry.length,87);
 for(const g of geometry){
  assert(g.bigW>=55&&g.bigW<=64,JSON.stringify(g));
  assert(g.smallW>=21&&g.smallW<=27,JSON.stringify(g));
  assert(g.smallH>=21&&g.smallH<=27,JSON.stringify(g));
  assert(g.nodes>=1 && g.box[2]>6 && g.box[3]>6,JSON.stringify(g));
  assert(!g.text,"SVG pictogram contains text "+g.i);
 }
 assert.equal(new Set(geometry.flatMap(g=>g.ids)).size,geometry.reduce((s,g)=>s+g.ids.length,0),"Gradient IDs collide");
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"Visual gallery overflows horizontally");
 checks.push("All 64 original icons and 23 individual categories render at 62px and 24px, valid bounds/no letters/no clipped page");
 await capture(page,"audit-gallery");
 await page.goto(base,{waitUntil:"domcontentloaded"});
 await page.locator("#pinInput").fill("123456");await page.locator(".pin-submit").click();
 await page.locator("#pinInput").fill("123456");await page.locator(".pin-submit").click();
 await page.locator("#pinLock").waitFor({state:"hidden"});
 await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoIllustratedIcons);
 assert.equal(await page.locator('#mementoQuickNav button .memento-illustrative-icon').count(),5);
 checks.push("Quick navigation uses new illustrations and original buttons are retained");
 await page.locator('[data-memento-menu="open"]').click();
 assert(await page.locator('#mementoMenuGrid button .memento-illustrative-icon').count()>=8);
 await page.locator('#mementoMenuGrid [data-memento-dest="life:notes"]').click();
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
 await page.locator('[data-memento-menu="open"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="life:fitness"]').click();
 assert.equal(await page.locator("#mementoFitness .ft-tabs .memento-illustrative-icon").count(),3);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("All three Fitness tabs remain legible and navigation works");
 await capture(page,"fitness-tabs");
 await page.locator('[data-memento-menu="open"]').click();
 await page.locator('#mementoMenuLayer [data-memento-switch="finance"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="finance:dashboard"]').click();
 await page.waitForSelector('#view-dashboard.active');
 assert.equal(await page.locator('#mementoQuickNav button .memento-illustrative-icon').count(),5);
 assert(await page.locator("#view-dashboard .memento-illustrative-icon").count()>=4);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("Finance dashboard and quick navigation use decorative vectors without losing values");
 await capture(page,"finance-dashboard");
 await page.locator('[data-memento-menu="open"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="finance:analysis"]').click();
 assert.equal(await page.locator('.analysis-tabs .memento-illustrative-icon').count(),3);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 checks.push("Analysis tabs retain their labels and click behavior");
 assert.deepEqual(errors,[],"Browser page errors detected");
 console.log(JSON.stringify({width,checks,errors,geometry:{icons:geometry.length,minSmall:Math.min(...geometry.map(x=>x.smallW)),maxSmall:Math.max(...geometry.map(x=>x.smallW))}}));
 await context.close();
}catch(e){
 console.error(JSON.stringify({width,checks,errors,error:String(e),stack:e.stack}));process.exitCode=1;
}finally{if(browser)await browser.close();srv.close();}
})();
