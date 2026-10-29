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
   window.__diarySpeech=[];
   window.SpeechRecognition=class {
    constructor(){this.continuous=false;this.interimResults=false;}
    start(){window.__diarySpeech.push(this);this.onstart?.();}
    stop(){this.onend?.();}
    emit(text){this.onresult?.({results:[{0:{transcript:text},isFinal:true}]});}
    end(){this.onend?.();}
   };
   window.webkitSpeechRecognition=window.SpeechRecognition;
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
  assert.equal(await page.locator(".kc-diary-checkin").count(),0);
  assert.equal(await page.locator('[data-kc="journal-mood"]').count(),0);
  assert.equal(await page.locator("[data-kc-checkin]").count(),0);
  await page.locator(".kc-diary-health > summary").click();
  await page.locator('[data-kc-manual-health="sleepHours"]').fill("6");
  await page.locator('[data-kc-manual-health="sleepRestMinutes"]').fill("55");
  await page.locator('[data-kc-manual-health="sleepScore"]').fill("82");
  await page.locator('[data-kc-manual-health="steps"]').fill("12345");
  await page.locator('[data-kc-manual-health="exerciseMinutes"]').fill("30");
  await page.locator('[data-kc-manual-health="restingHeartRateBpm"]').fill("60");
  assert.match(await page.locator("#kc-diary-summary").innerText(),/Slaap 6u 55m · 12.345 stappen/);
  await page.locator('[data-kc="save"]').first().click();
  let saved=await stored(),n=saved.notes.find(x=>x.journal?.manualHealth?.steps===12345);
  assert(n);assert.equal(n.body,"");assert.deepEqual(n.journal.manualHealth,{version:1,sleepMinutes:415,steps:12345,sleepScore:82,restingHeartRateBpm:60,exerciseMinutes:30});assert.equal(n.journal.checkin,undefined);
  const journalId=n.id;
  checks.push("Single Samsung Health input saves with empty diary text and no mood/energy/stress form");
  await page.locator('[data-kc="journal-date-open"]').first().click();
  await page.locator("#kc-body").fill("Vandaag ging alles redlijk goed bij mijn werk");
  await page.locator('[data-kc="journal-ai-copy"]').click();
  const clip=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(clip,/Vandaag ging alles redlijk goed/);
  assert.match(clip,/Verzin niets/);
  const androidLink=await page.locator(".kc-diary-ai a").getAttribute("href");
  assert.match(androidLink,/package=com.openai.chatgpt/);
  checks.push("AI prompts only copy on explicit click and app button uses native Android intent");
  assert.equal(await page.locator(".kc-diary-voice").count(),0);
  await page.locator('[data-kc="journal-speech"]').click();
  assert.equal(await page.locator('[data-kc="journal-speech"]').getAttribute("aria-pressed"),"true");
  await page.evaluate(()=>window.__diarySpeech[0].emit("Ik was bij mijn werk"));
  await page.waitForFunction(()=>document.querySelector("#kc-body")?.value.includes("Ik was bij mijn werk"));
  await page.evaluate(()=>window.__diarySpeech[0].end());
  await page.waitForFunction(()=>window.__diarySpeech.length>=2);
  await page.evaluate(()=>window.__diarySpeech[1].emit("en daarna naar huis"));
  assert.match(await page.locator("#kc-body").inputValue(),/Ik was bij mijn werk en daarna naar huis/);
  await page.locator('[data-kc="journal-speech"]').click();
  assert.equal(await page.locator('[data-kc="journal-speech"]').getAttribute("aria-pressed"),"false");
  await page.waitForTimeout(440);
  assert.equal(await page.evaluate(()=>window.__diarySpeech.length),2);
  await page.locator("#kc-body").fill((await page.locator("#kc-body").inputValue())+" Goed handmatig aangepast.");
  await page.waitForTimeout(930);
  saved=await stored();n=saved.notes.find(x=>x.id===journalId);
  assert.equal(n.journal.manualHealth.sleepMinutes,415);
  assert.match(n.body,/Goed handmatig aangepast/);
  assert.equal(n.attachments?.length||0,0);
  checks.push("Journal-only dictation resumes after silence, keeps manual edits and health values without audio attachments");
  // Shortening the mobile viewport approximates the keyboard, not a physical Android IME.
  await page.locator("#kc-body").focus();
  await page.setViewportSize({width,height:460});
  await page.waitForFunction(()=>document.body.classList.contains("memento-diary-keyboard"));
  assert.equal(await page.locator("#mementoQuickNav").evaluate(el=>getComputedStyle(el).display),"none");
  assert(await page.locator("#kc-body").evaluate(el=>el.getBoundingClientRect().height<300));
  await page.setViewportSize({width,height:860});
  await page.locator("#kc-title").focus();
  checks.push("Shortened mobile viewport keeps diary input scrollable and hides fixed navigation when typing");
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