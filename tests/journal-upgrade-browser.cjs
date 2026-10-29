"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http"),{chromium}=require("playwright");
const base=path.resolve(__dirname,".."),width=Number(process.env.JOURNAL_WIDTH||393),checks=[],errors=[];
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname),file=path.resolve(base,"."+(name==="/"?"/index.html":name));
 if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader("Content-Type",({".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".webp":"image/webp",".json":"application/json"})[path.extname(file)]||"application/octet-stream");
 res.end(fs.readFileSync(file));
});
(async()=>{let browser;
 try{
  await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
  browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const context=await browser.newContext({viewport:{width,height:860},locale:"nl-NL",timezoneId:"Europe/Amsterdam",hasTouch:true,reducedMotion:"reduce",permissions:["clipboard-read","clipboard-write"],userAgent:"Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"});
  await context.addInitScript(()=>{
   const media={getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})};
   Object.defineProperty(navigator,"mediaDevices",{configurable:true,value:media});
   window.MediaRecorder=class {
    static isTypeSupported(t){return t==="audio/webm;codecs=opus"||t==="audio/webm";}
    constructor(stream,{mimeType}={}){this.stream=stream;this.mimeType=mimeType;this.state="inactive";}
    start(){this.state="recording";}
    stop(){if(this.state!=="recording")return;this.state="inactive";const b=new Blob([new Uint8Array([26,69,223,163,128,0,0,0,10,20,30,40,50,60,70,80,90,100,120])],{type:"audio/webm"});this.ondataavailable?.({data:b});this.onstop?.();}
   };
  });
  const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
  await page.goto("http://127.0.0.1:"+server.address().port,{waitUntil:"domcontentloaded"});
 await require('./helpers/enter-app.cjs')(page,true);
  await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("compass_life_preview_v1")));
  await page.locator('[data-memento-menu="open"]').click();
  await page.locator('#mementoMenuGrid [data-memento-dest="life:notes"]').click();
  await page.locator('[data-kc="collection"][data-id="kc2-levenspad"]').click();
  await page.locator('[data-kc="collection"][data-id="kc2-levenspad-dagboek"]').click();
  assert.equal(await page.locator(".kc-diary-hero img").count(),1);
  const forest=await page.locator(".kc-diary-hero img").getAttribute("src");
  await page.locator('[data-kc="journal-move"][data-id="-7"]').click();
  const forest2=await page.locator(".kc-diary-hero img").getAttribute("src");assert.notEqual(forest,forest2);
  await page.locator('[data-kc="journal-today"]').click();
  checks.push("Forest image changes with week selection; existing journal opens today's editor");
  assert.equal(await page.locator(".kc-diary-checkin").evaluate(x=>x.open),false);
  await page.locator(".kc-diary-checkin summary").click();
  await page.locator('[data-kc="journal-mood"][data-id="Neutraal"]').click();
  await page.locator('[data-kc-checkin="energy"]').selectOption("3");
  await page.locator('[data-kc-checkin="stress"]').selectOption("2");
  await page.locator('[data-kc-checkin="sleepStart"]').fill("2026-10-26T23:30");
  await page.locator('[data-kc-checkin="sleepEnd"]').fill("2026-10-27T07:00");
  await page.locator('[data-kc-checkin="latency"]').fill("15");
  await page.locator('[data-kc-checkin="awake"]').fill("20");
  assert.match(await page.locator("#kc-diary-sleep-result").innerText(),/6u 55m/);
  await page.locator('[data-kc="save"]').first().click();
  let saved=await stored(),n=saved.notes.find(x=>x.journal?.checkin?.energy===3);
  assert(n);assert.equal(n.body,"");assert.equal(n.journal.checkin.stress,2);
  const journalId=n.id;
  checks.push("Collapsed mood/energy/stress/sleep check-in saves with empty diary text");
  await page.locator('[data-kc="journal-date-open"]').first().click();
  await page.locator("#kc-body").fill("Vandaag ging alles redlijk goed bij mijn werk");
  await page.locator('[data-kc="journal-ai-copy"]').click();
  const clip=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(clip,/Vandaag ging alles redlijk goed/);
  assert.match(clip,/Verzin niets/);
  const androidLink=await page.locator(".kc-diary-ai a").getAttribute("href");
  assert.match(androidLink,/package=com.openai.chatgpt/);
  checks.push("AI prompts only copy on explicit click and app button uses native Android intent");
  await page.locator('[data-kc="voice-start"]').click();
  assert.equal(await page.locator(".kc-diary-live").count(),1);
  await page.locator('[data-kc="voice-stop"]').click();
  assert.equal(await page.locator(".kc-diary-audio audio").count(),1);
  await page.locator('[data-kc="voice-save"]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-kc="voice-save"]'),{timeout:10000});
  saved=await stored();n=saved.notes.find(x=>x.id===journalId);
  assert(n);assert.equal(n.attachments.length,1);assert.equal(n.attachments[0].type,"audio/webm");
  assert.equal(n.journal.checkin.energy,3);
  const binaryFound=await page.evaluate(async id=>(await window.MementoKnowledgeStore.all()).some(x=>x.id===id&&x.blob instanceof Blob&&x.blob.size>0),n.attachments[0].id);
  assert.equal(binaryFound,true);
  checks.push("Start/Stop recorded WebM attaches via guarded IndexedDB and keeps the original day identity");
  await page.locator('[data-kc="save"]').first().click();
  assert.equal((await stored()).notes.filter(x=>x.id===journalId).length,1);
  const shotDir=process.env.JOURNAL_SHOT_DIR;
  if(shotDir){fs.mkdirSync(shotDir,{recursive:true});await page.screenshot({path:path.join(shotDir,"diary-"+width+".png"),fullPage:true,animations:"disabled"});}
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert(size.scroll<=size.inner+1,JSON.stringify(size));
  assert.deepEqual(errors,[]);checks.push("No JS errors or horizontal viewport overflow");
  console.log("JOURNAL_RESULT "+JSON.stringify({width,checks}));
  await context.close();
 }catch(e){console.error("JOURNAL_FAIL "+JSON.stringify({width,checks,errors,message:String(e),stack:e.stack}));process.exitCode=1;}
 finally{if(browser)await browser.close();server.close();}
})();