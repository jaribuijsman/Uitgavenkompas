"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http"),{chromium}=require("playwright");
const base=path.resolve(__dirname,".."),width=Number(process.env.JOURNAL_WIDTH||393),errors=[];
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname),file=path.resolve(base,"."+(name==="/"?"/index.html":name));
 if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader("Content-Type",({".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".png":"image/png",".json":"application/json"})[path.extname(file)]||"application/octet-stream");
 res.end(fs.readFileSync(file));
});
(async()=>{let browser;
 try{
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve)});
  browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const context=await browser.newContext({viewport:{width,height:860},locale:"nl-NL",timezoneId:"Europe/Amsterdam",hasTouch:true,reducedMotion:"reduce",userAgent:"Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"});
  const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
  await page.goto("http://127.0.0.1:"+server.address().port,{waitUntil:"domcontentloaded"});
  await require("./helpers/enter-app.cjs")(page,true);
  await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  const shortcut=page.locator(".memento-diary-shortcut");
  assert.equal(await shortcut.count(),1);
  assert.equal(await page.locator('[data-life-quick-kind="note"]').count(),1);
  assert.equal(await page.locator('[data-life-quick-kind="task"]').count(),1);
  const rects=await page.evaluate(()=>{
   const a=document.querySelector(".memento-capture-kinds").getBoundingClientRect(),b=document.querySelector(".memento-capture-date").getBoundingClientRect();
   return {groupRight:a.right,dateLeft:b.left,scroll:document.documentElement.scrollWidth,inner:innerWidth};
  });
  assert(rects.groupRight<=rects.dateLeft+1,"Shortcut overlaps date: "+JSON.stringify(rects));
  assert(rects.scroll<=rects.inner+1,"Horizontal overflow: "+JSON.stringify(rects));
  await shortcut.click();
  await page.locator("#kc-body").waitFor();
  assert.equal(await page.locator(".kc-diary-selfcare").count(),1);
  assert.equal(await page.locator(".kc-diary-health").count(),1);
  assert.match(await page.locator(".kc-diary-health").innerText(),/Gezondheid en activiteit/);
  assert.equal(await page.locator('.kc-diary-selfcare').evaluate(el=>el.open),true);
  await page.locator('[data-kc-self-care="face"]').check();
  await page.locator('[data-kc-self-care="beard"]').check();
  await page.locator('[data-kc-self-care="note"]').fill("Een rustig moment voor mezelf");
  await page.locator('[data-kc="journal-selfcare-done"]').click();
  await page.waitForFunction(()=>{const life=JSON.parse(localStorage.getItem("compass_life_preview_v1")||"{}");return life.notes?.some(n=>n.journal?.selfCare?.completed);});
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("compass_life_preview_v1")));
  let data=await stored(),notes=data.notes.filter(n=>n.journal?.selfCare?.completed);
  assert.equal(notes.length,1);assert.equal(notes[0].journal.selfCare.checks.face,true);assert.equal(notes[0].journal.selfCare.checks.beard,true);
  assert.equal(notes[0].journal.selfCare.note,"Een rustig moment voor mezelf");
  assert.equal(notes[0].journal.health,undefined);
  await page.reload({waitUntil:"domcontentloaded"});
  await require("./helpers/enter-app.cjs")(page,true);
  await page.locator(".memento-diary-shortcut").click();
  await page.locator("#kc-body").waitFor();
  assert.equal(await page.locator(".kc-diary-selfcare").evaluate(el=>el.open),false);
  await page.locator(".kc-diary-selfcare summary").click();
  assert.equal(await page.locator('[data-kc-self-care="face"]').isChecked(),true);
  assert.equal(await page.locator('[data-kc-self-care="note"]').inputValue(),"Een rustig moment voor mezelf");
  await page.locator("#kc-body").fill("Vandaag schreef ik ook in mijn dagboek.");
  await page.waitForFunction(()=>{const life=JSON.parse(localStorage.getItem("compass_life_preview_v1")||"{}");return life.notes?.some(n=>n.journal?.selfCare?.completed&&n.body.includes("Vandaag schreef"));});
  data=await stored();notes=data.notes.filter(n=>n.journal?.selfCare);
  assert.equal(notes.length,1);assert.equal(notes[0].journal.selfCare.completed,true);
  // Het dagboek van 28 oktober krijgt de slaap van 27 op 28 oktober.
  await page.evaluate(()=>window.MementoKnowledge.showJournal("2026-10-28"));
  await page.locator("#kc-body").waitFor();
  await page.locator(".kc-diary-health > summary").click();
  const healthLink=page.locator(".kc-diary-health-link");
  assert.match(await healthLink.innerText(),/Samsung Health openen/);
  assert.match(await healthLink.getAttribute("href"),/^intent:\/\/#Intent;scheme=shealth;/);
  await page.locator('[data-kc-manual-health="sleepHours"]').fill("5");
  await page.locator('[data-kc-manual-health="sleepRestMinutes"]').fill("20");
  await page.locator('[data-kc-manual-health="steps"]').fill("12000");
  await page.locator('[data-kc-manual-health="sleepScore"]').fill("72");
  await page.locator('[data-kc-manual-health="restingHeartRateBpm"]').fill("58");
  await page.locator('[data-kc-manual-health="exerciseMinutes"]').fill("30");
  await page.locator(".kc-diary-checkin > summary").click();
  await page.locator('[data-kc-checkin="sleepStart"]').fill("2026-10-27T23:00");
  await page.locator('[data-kc-checkin="sleepEnd"]').fill("2026-10-28T04:20");
  await page.waitForFunction(()=>{
   const life=JSON.parse(localStorage.getItem("compass_life_preview_v1")||"{}");
   const n=life.notes?.find(n=>n.journal?.date==="2026-10-28");
   return n?.journal?.manualHealth?.steps===12000&&n.journal.manualHealth.sleepMinutes===320&&n.journal.checkin.sleepEnd==="2026-10-28T04:20";
  });
  const healthNote=(await stored()).notes.find(n=>n.journal?.date==="2026-10-28");
  assert.deepEqual(healthNote.journal.manualHealth,{version:1,sleepMinutes:320,steps:12000,sleepScore:72,restingHeartRateBpm:58,exerciseMinutes:30});
  assert.equal(healthNote.journal.checkin.sleepStart,"2026-10-27T23:00");
  assert.equal(healthNote.journal.health,undefined);
  assert.equal(healthNote.body,"");
  let viewport=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert(viewport.scroll<=viewport.inner+1,"Health editor horizontal overflow: "+JSON.stringify(viewport));
  await page.reload({waitUntil:"domcontentloaded"});
  await require("./helpers/enter-app.cjs")(page,true);
  await page.evaluate(()=>window.MementoKnowledge.showJournal("2026-10-28"));
  await page.locator(".kc-diary-health > summary").click();
  assert.equal(await page.locator('[data-kc-manual-health="sleepHours"]').inputValue(),"5");
  assert.equal(await page.locator('[data-kc-manual-health="steps"]').inputValue(),"12000");
  await page.locator('[data-kc-manual-health="steps"]').fill("");
  await page.waitForFunction(()=>{
   const life=JSON.parse(localStorage.getItem("compass_life_preview_v1")||"{}");
   const m=life.notes?.find(n=>n.journal?.date==="2026-10-28")?.journal?.manualHealth;
   return m?.sleepMinutes===320&&m.steps===undefined;
  });
  assert.deepEqual(errors,[]);

  const dir=process.env.JOURNAL_SHOT_DIR;
  if(dir){fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,"selfcare-"+width+".png"),fullPage:true,animations:"disabled"});}
  console.log("JOURNAL_SELFCARE_BROWSER_PASS "+JSON.stringify({width,rects}));
  await context.close();
 }catch(e){console.error("JOURNAL_SELFCARE_BROWSER_FAIL "+JSON.stringify({width,errors,error:String(e),stack:e.stack}));process.exitCode=1;}
 finally{if(browser)await browser.close();server.close();}
})();
