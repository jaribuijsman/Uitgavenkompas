"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http"),{chromium}=require("playwright");
const root=path.resolve(__dirname,".."),width=Number(process.env.MEMENTO_TEST_WIDTH||393),checks=[],errors=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,"http://localhost"),name=url.pathname==="/"?"/index.html":url.pathname,file=path.resolve(root,"."+name);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader("Content-Type",({".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".webp":"image/webp",".json":"application/json"})[path.extname(file)]||"application/octet-stream");
 res.end(fs.readFileSync(file));
});
(async()=>{let browser;
 try{
  await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
  browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const context=await browser.newContext({viewport:{width,height:830},locale:"nl-NL",timezoneId:"Europe/Amsterdam",hasTouch:true,reducedMotion:"reduce"});
  await context.route("https://**/*",r=>r.abort());
  await context.addInitScript(()=>{
   window.SpeechRecognition=window.webkitSpeechRecognition=class{
    start(){this.onstart?.();this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:"Herinner me aan de afspraak"}],{isFinal:true})]});this.onend?.();}
    stop(){this.onend?.();}
   };
  });
  const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
  const url="http://127.0.0.1:"+server.address().port;
  await page.goto(url,{waitUntil:"domcontentloaded"});
  if (await page.locator("html").getAttribute("data-memento-pin-lock") !== "disabled") {
    await page.locator("#pinInput").fill("123456");await page.locator(".pin-submit").click();
    await page.locator("#pinInput").fill("123456");await page.locator(".pin-submit").click();
  }
  await page.locator("#pinLock").waitFor({state:"hidden"});
  await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("compass_life_preview_v1")));
  const nav=async(dest)=>{await page.locator('[data-memento-menu="open"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+dest+'"]').click()};
  await nav("notes");
  assert.equal(await page.locator("#kc-quick-text").count(),1);
  await page.locator("#kc-quick-text").fill("Startnotitie");
  await page.locator('#kc-quick-mic').click();
  assert.equal(await page.locator("#kc-quick-text").inputValue(),"Startnotitie Herinner me aan de afspraak");
  assert.equal((await stored()).notes.some(n=>n.body.includes("Startnotitie Herinner")),false);
  checks.push("Browser speech transcription remains editable and unpersisted until user confirms");
  await page.locator('[data-kc="quick-save"]').click();
  assert.equal((await stored()).notes.filter(n=>n.body==="Startnotitie Herinner me aan de afspraak").length,1);
  assert.equal((await stored()).notes.find(n=>n.body.startsWith("Startnotitie")).collectionId,"inbox");
  assert.equal(await page.locator("#kc-quick-text").inputValue(),"");
  checks.push("Quick note saves precisely once in existing Knowledge Inbox");
  await page.locator("#kc-quick-text").fill("Bij opslagfout bewaren");
  await page.evaluate(()=>{
   window.mementoOriginalSetItem=Storage.prototype.setItem;
   Storage.prototype.setItem=function(k,v){if(k==="compass_life_preview_v1")throw Error("Simulated quota");return window.mementoOriginalSetItem.call(this,k,v);}
  });
  await page.locator('[data-kc="quick-save"]').click();
  assert.equal(await page.locator("#kc-quick-text").inputValue(),"Bij opslagfout bewaren");
  assert.equal((await stored()).notes.some(n=>n.body==="Bij opslagfout bewaren"),false);
  await page.evaluate(()=>{Storage.prototype.setItem=window.mementoOriginalSetItem});
  await page.locator('[data-kc="quick-save"]').click();
  assert.equal((await stored()).notes.some(n=>n.body==="Bij opslagfout bewaren"),true);
  checks.push("Quota refusal keeps draft and allows explicit retry");
  await page.locator("#kc-quick-text").fill("Nog uitwerken");
  await page.locator('[data-kc="quick-expand"]').click();
  assert.equal(await page.locator("#kc-body").inputValue(),"Nog uitwerken");
  await page.locator("#kc-body").fill("Nog uitwerken en aanvullen");
  await page.locator('[data-kc="save"]').click();
  assert.equal((await stored()).notes.some(n=>n.body==="Nog uitwerken en aanvullen"),true);
  checks.push("Expand into existing editor retains text and normal saved note identity");
  await nav("fitness");
  await page.locator('#mementoFitness [data-fit="profile"]').first().click();
  await page.locator("#fitnessDialog [name=starter]").check();
  await page.locator("#fitnessDialog button[type=submit]").click();
  const rid=(await stored()).fitness.routines[0].id;
  await page.locator('#mementoFitness [data-fit="start"]').first().click();
  await page.locator("#fitnessDialog button[type=submit]").click();
  assert.equal(await page.locator("#mementoFitness .ft-session-track[role=progressbar]").getAttribute("aria-valuenow"),"0");
  await page.locator('#mementoFitness [data-fit="next-open-set"]').click();
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.fit),"toggle-set");
  const active=(await stored()).fitness.active,eid=active.exercises[0].id;
  await page.locator('[data-ex="'+eid+'"][data-field="weight"]').first().fill("40");
  await page.locator('[data-ex="'+eid+'"][data-field="reps"]').first().fill("12");
  await page.locator('[data-fit="toggle-set"][data-ex="'+eid+'"]').first().click();
  assert.equal(await page.locator(".ft-session-track").getAttribute("aria-valuenow"),"1");
  assert.equal((await stored()).fitness.active.exercises[0].logs[0].done,true);
  checks.push("Fitness progressbar, next unfinished set, and original completed-set persistence");
  await page.locator('#mementoFitness [data-fit="finish"]').first().click();
  await page.locator('#mementoFitness .ft-tabs [data-fit="tab"][data-id="plan"]').click();
  await page.locator('#mementoFitness [data-fit="start"][data-id="'+rid+'"]').click();
  await page.locator("#fitnessDialog button[type=submit]").click();
  assert.match(await page.locator(".ft-set-reference").first().innerText(),/40 kg × 12/);
  assert.equal((await stored()).fitness.active.exercises[0].logs[0].weight,40);
  await page.locator('[data-ex="'+eid+'"][data-field="weight"]').first().fill("41");
  await page.locator('[data-fit="toggle-set"][data-ex="'+eid+'"]').first().click();
  await page.locator('#mementoFitness [data-fit="finish"]').first().click();
  await page.locator('#mementoFitness .ft-tabs [data-fit="tab"][data-id="progress"]').click();
  assert.match(await page.locator(".ft-change").first().innerText(),/1 kg/);
  assert.equal((await stored()).fitness.sessions.length,2);
  checks.push("Prior worksets and actual previous-session difference, unchanged history");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  if(process.env.MEMENTO_SCREENSHOT_DIR){fs.mkdirSync(process.env.MEMENTO_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.MEMENTO_SCREENSHOT_DIR,"fitness-"+width+".png"),fullPage:true,animations:"disabled"});}
  await nav("notes");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  if(process.env.MEMENTO_SCREENSHOT_DIR){await page.screenshot({path:path.join(process.env.MEMENTO_SCREENSHOT_DIR,"quicknotes-"+width+".png"),fullPage:true,animations:"disabled"});}
  assert.deepEqual(errors,[]);
  checks.push("No browser errors or horizontal overflow in both updated mobile views");
  console.log(JSON.stringify({width,checks,errors}));
  await context.close();
 }catch(e){console.error(JSON.stringify({width,checks,errors,error:String(e),stack:e.stack}));process.exitCode=1;}
 finally{if(browser)await browser.close();server.close();}
})();