/* Masterplan acceptance: isolated fixture origins, never a personal browser profile. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.MEMENTO_MASTER_OUT||'/tmp/memento-master';
const phase=Number(process.env.MEMENTO_MASTER_PHASE||3);
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.end('<!doctype html><title>Isolated test</title>');return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function nav(page,area,view){
 await page.locator('[data-memento-menu=open]').click();
 if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();
}
(async()=>{
 let browser,failure=null;const checks=[],errors=[];
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
  const data=await require('./helpers/visual-fixture.cjs').fixture();
  data.finance.transactions=[{id:'master-expense',type:'expense',date:'2026-10-28',amount:32.34,description:'Fictieve uitgave',category:'Boodschappen',account:'personal',person:'Jari'}];
  for(const width of [360,393,412]){
   const ctx=await browser.newContext({viewport:{width,height:852},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
   await ctx.route('https://**/*',r=>r.abort());
   const page=await ctx.newPage();page.setDefaultTimeout(10000);page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-28T12:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
   const url='http://127.0.0.1:'+server.address().port;await page.goto(url+'/__seed__');
   await page.evaluate(async d=>{localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));
 const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('memento_knowledge_files_v1',1);req.onupgradeneeded=()=>{const st=req.result.createObjectStore('files',{keyPath:'id'});st.createIndex('noteId','noteId',{unique:false});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
 await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);for(const {base64,...meta} of d.files){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));tx.objectStore('files').put({...meta,blob:new Blob([bytes],{type:meta.type})});}});db.close();},data);
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   const originalPin=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_pin_config_v1'));
   const life=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
   const finance=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('uitgavenkompas_v1')));
   const shot=async name=>{assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');await page.screenshot({path:path.join(out,width+'-'+name+'.jpg'),type:'jpeg',quality:70,fullPage:true,animations:'disabled'});};
   await nav(page,'finance','moneycoach');
   assert.match(await page.locator('#moneyCoachStats').innerText(),/€\s*-32,34/);
   await page.locator('#moneyCoachForm [type=submit]').click();assert.match(await page.locator('#moneyCoachPrompt').inputValue(),/Netto resultaat: € -32,34/);await shot('moneycoach');
   await nav(page,'finance','settings');const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportCSV').click()]);const csv=fs.readFileSync(await download.path(),'utf8');assert(csv.includes('32,34')||csv.includes('32.34'));
   await nav(page,'finance','planning');
   const pay=page.locator('[data-pay-bill="energy"]').first();
   // Find the known payment through its stable bill identity, independent of presentation copy.
   const billSelector=await page.evaluate(()=>{const b=[...document.querySelectorAll('#view-planning button')].find(b=>Object.values(b.dataset).includes('energy'));return b?Object.entries(b.dataset).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+v+'"]').join(''):'';});
   assert(billSelector,'known bill action');await page.locator('#view-planning '+billSelector).first().click();
   await page.locator('[form=txForm][type=submit]').click({clickCount:2});
   let paid=(await finance()).transactions.filter(t=>t.billId==='energy');assert.equal(paid.length,1);const paymentId=paid[0].id;await nav(page,'finance','planning');
   await page.locator('#view-planning '+billSelector).first().click();await page.locator('#txAmount').fill('146.01');await page.locator('[form=txForm][type=submit]').click();
   paid=(await finance()).transactions.filter(t=>t.billId==='energy');assert.equal(paid.length,1);assert.equal(paid[0].id,paymentId);assert.equal(paid[0].amount,146.01);
   await nav(page,'life','notes');
   const noteId=await page.evaluate(()=>{const B=window.MementoKnowledgeBridge,C=window.MementoKnowledgeCore;let id;const assertWrite=B.write(s=>{const n=C.makeNote({title:'Padproef',body:'Een uniek inhoudswoord: maanvaren.',collectionId:s.knowledge.collections.find(c=>c.name==='Woning & inrichting').id},s);s.notes.unshift(n);id=n.id;C.saveJournal(s,{collectionId:'kc2-levenspad-dagboek',date:'2026-10-28',body:'Vandaag geschreven.'});C.saveJournal(s,{collectionId:'kc2-levenspad-dagboek',date:'2026-10-27',body:'Eerder geschreven.'});});if(!assertWrite)throw Error('Fixture write failed');return id;});
   await page.evaluate(id=>window.MementoKnowledge.showNote(id),noteId);const note=(await life()).notes.find(n=>n.id===noteId);
   const names=await page.evaluate(id=>{const s=window.MementoKnowledgeBridge.read(),c=s.knowledge.collections.find(c=>c.id===id);return [c.parentId&&window.MementoKnowledgeCore.collectionName(s,c.parentId),c.name].filter(Boolean);},note.collectionId);
   for(const name of names)assert((await page.locator('.kc-breadcrumbs').innerText()).includes(name));await shot('note-path');
   await nav(page,'life','notes');await page.locator('[data-kc=home]').first().click();await page.locator('[data-kc=collection][data-id=kc2-levenspad]').first().click();await page.locator('[data-kc=collection][data-id=kc2-levenspad-dagboek]').click();
   assert.equal(await page.locator('.kc-diary-history [data-kc=journal-open]').count(),1);assert((await page.locator('.kc-diary-history').innerText()).includes('27'));await shot('journal-history');
   if(phase>=2){
    await nav(page,'life','today');await shot('day');
    await page.locator('[data-life-quick-kind=note]').click();await page.locator('#lifeQuickTitle').fill('Een korte gedachte voor later.');await page.locator('#lifeQuickForm [type=submit]').click();
    const quick=(await life()).notes.find(n=>n.body==='Een korte gedachte voor later.');assert(quick);assert.equal(quick.collectionId,'inbox');
    await nav(page,'life','notes');await page.evaluate(id=>window.MementoKnowledge.showNote(id),quick.id);
    assert.equal(await page.locator('#kc-title').inputValue(),'');assert.equal(await page.locator('#kc-body').inputValue(),quick.body);
    await page.locator('#kc-body').fill('De gedachte direct aangepast.');await page.locator('#kc-collection').selectOption('kc2-huis-wonen-woning');await page.locator('[data-kc=save]').first().click();
    let q=(await life()).notes.find(n=>n.id===quick.id);assert.equal(q.body,'De gedachte direct aangepast.');assert.equal(q.collectionId,'kc2-huis-wonen-woning');assert.equal(q.id,quick.id);assert(q.revisions.length);await shot('direct-note');
    await nav(page,'life','today');await page.locator('[data-life-quick-kind=task]').click();await page.locator('#lifeQuickTitle').fill('Directe taakdetailproef');await page.locator('#lifeQuickForm [type=submit]').click();
    const task=(await life()).tasks.find(t=>t.title==='Directe taakdetailproef');assert(task);await page.locator('[data-life-detail="'+task.id+'"]').click();
    await page.locator('#lifeDetailDate').fill('2026-10-29');await page.locator('#lifeDetailStep').fill('Een eerste stap');await page.locator('#lifeTaskDetailForm [type=submit]').click();
    let t=(await life()).tasks.find(t=>t.id===task.id);assert.equal(t.date,'2026-10-29');assert.equal(t.steps.length,1);await shot('task-details');
    await page.locator('[data-life-detail-complete]').click();assert.equal((await life()).tasks.find(t=>t.id===task.id).done,true);await page.locator('[data-life-detail-complete]').click();assert.equal((await life()).tasks.find(t=>t.id===task.id).done,false);assert.equal((await life()).tasks.filter(t=>t.id===task.id).length,1);await page.locator('#lifeDialog [data-life-close]').first().click();
    await page.locator('[data-life-journal]').click();assert.equal(await page.locator('#kc-body').inputValue(),'Vandaag geschreven.');
    const long='Een lange dagboektekst met ruimte voor mijn eigen verhaal.\n\n'.repeat(45);await page.locator('#kc-body').fill(long);
    await page.setViewportSize({width,height:430});await page.locator('[data-kc=writing-mode]').click();assert(await page.locator('#mementoKnowledge.kc-focus-writing').count()||await page.locator('.kc-focus-writing').count());await shot('diary-short-viewport');await page.locator('[data-kc=save]').first().click();await page.setViewportSize({width,height:852});
    assert.equal((await life()).notes.filter(n=>n.journal?.date==='2026-10-28').length,1);assert.equal((await life()).notes.find(n=>n.journal?.date==='2026-10-28').body,long);
    await nav(page,'life','today');await page.locator('[data-life-journal]').click();await page.evaluate(()=>{window.masterOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw Error('Fictieve quota');return window.masterOriginalSet.call(this,k,v);};});
    const draft='Concept dat een opslagfout én herladen overleeft.';await page.locator('#kc-body').fill(draft);await page.locator('[data-kc=save]').first().click();assert.equal(await page.locator('#kc-body').inputValue(),draft);assert((await page.locator('#kc-save-state').innerText()).includes('mislukt'));assert.equal((await life()).notes.find(n=>n.journal?.date==='2026-10-28').body,long);
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'life','notes');assert.equal(await page.locator('#kc-body').inputValue(),draft);await page.locator('[data-kc=save]').first().click();assert.equal((await life()).notes.find(n=>n.journal?.date==='2026-10-28').body,draft);assert.equal(await page.evaluate(()=>sessionStorage.getItem('memento_note_draft_v1')),null);
    await nav(page,'life','today');await page.locator('[data-life-journal]').click();
    await page.evaluate(()=>{window.masterOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw Error('Fictieve quota');return window.masterOriginalSet.call(this,k,v);};});
    await page.locator('#kc-body').fill('Een ouder herstelconcept');await page.locator('[data-kc=save]').first().click();
    await page.evaluate(()=>{Storage.prototype.setItem=window.masterOriginalSet;window.MementoKnowledgeBridge.write(s=>{const n=window.MementoKnowledgeCore.findJournal(s,'2026-10-28');window.MementoKnowledgeCore.updateNote(s,n.id,{body:'Nieuwere opgeslagen tekst'});});});
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'life','notes');assert.equal(await page.locator('#kc-body').inputValue(),'Een ouder herstelconcept');await page.locator('[data-kc=save]').first().click();assert.equal((await life()).notes.find(n=>n.journal?.date==='2026-10-28').body,'Nieuwere opgeslagen tekst');assert((await page.locator('#kc-save-state').innerText()).includes('nieuwere versie'));await page.locator('[data-kc=discard-draft]').first().click();
    checks.push({width,phase:2,passed:['visible capture destination','direct note edit and move preserving identity/revisions','direct task date/step and reopen','one-action correct diary','long text in short viewport and writing mode','quota draft survives reload and retry','recovered stale draft cannot overwrite newer text']});
   }
   if(phase>=3){
    const passage='De verzekering vergelijken met mijn huidige voorwaarden';
    const full='Een lange notitie.\n'+('Achtergrond en behouden informatie. '.repeat(180))+'\nGranaatvaren. '+passage+'.\n'+('Meer bewaarde tekst. '.repeat(120));
    await page.evaluate(({id,body})=>window.MementoKnowledgeBridge.write(s=>window.MementoKnowledgeCore.updateNote(s,id,{body})),{id:noteId,body:full});
    await nav(page,'life','notes');await page.evaluate(()=>window.MementoKnowledge.open());await page.locator('[data-kc-input=central-search]').fill('granaatvaren');
    assert.equal(await page.locator('.kc-central-result').count(),1);assert((await page.locator('.kc-central-result').innerText()).includes('Granaatvaren'));assert((await page.locator('.kc-central-result').innerText()).includes('Huis & wonen / Woning & inrichting'));
    await page.locator('[data-kc-central=type]').selectOption('task');assert.equal(await page.locator('.kc-central-result').count(),0);await page.locator('[data-kc=central-clear]').click();assert.equal(await page.locator('[data-kc-input=central-search]').inputValue(),'');
    await page.locator('[data-kc-input=central-search]').fill('Directe taakdetailproef');await page.locator('.kc-central-result[data-kind=task]').click();assert.equal(await page.locator('#lifeDialogTitle').innerText(),'Directe taakdetailproef');await page.locator('#lifeDialog [data-life-close]').first().click();
    await nav(page,'life','notes');await page.evaluate(id=>window.MementoKnowledge.showNote(id),noteId);await page.locator('#kc-body').evaluate((field,text)=>{const i=field.value.indexOf(text);field.focus();field.setSelectionRange(i,i+text.length);},passage);await page.locator('[data-kc=selection-task]').click();assert.equal(await page.locator('#lifeTaskTitle').inputValue(),passage);assert((await page.locator('#lifeDialogTitle').innerText()).includes('voorstel'));await page.locator('[form=lifeTaskForm][type=submit]').click();
    const linked=(await life()).tasks.find(t=>t.sourceNoteId===noteId);assert(linked);assert.equal(linked.title,passage);assert.equal(linked.notes,'');assert.equal((await life()).notes.find(n=>n.id===noteId).body,full);assert((await life()).notes.find(n=>n.id===noteId).conversions.some(c=>c.id===linked.id));
    await page.locator('[data-kc=related][data-kind=task][data-id="'+linked.id+'"]').click();await page.locator('[data-life-source-note="'+noteId+'"]').click();assert.equal(await page.locator('#kc-body').inputValue(),full);
    await page.locator('#kc-collection').selectOption('kc2-huis-wonen-onderhoud');await page.locator('[data-kc=save]').first().click();await page.locator('[data-kc=archive-item]').click();assert.equal((await life()).notes.find(n=>n.id===noteId).archived,true);await page.locator('[data-kc=related][data-kind=task]').click();await page.locator('[data-life-detail-complete]').click();await page.locator('[data-life-source-note]').click();assert((await page.locator('.kc-related').innerText()).includes('Afgerond'));await shot('linked-note');await page.locator('[data-kc=archive-item]').click();
    await nav(page,'life','notes');await page.evaluate(()=>window.MementoKnowledge.open());const totalBefore=await page.locator('[data-kc=collection][data-id=kc2-huis-wonen]').innerText();assert(totalBefore.includes('incl. subverzamelingen'));
    await nav(page,'life','wishes');await page.locator('[data-life-research=headphones]').click();assert.equal(await page.locator('#smartBuyProduct').inputValue(),'Comfortabele koptelefoon voor onderweg');assert.equal(await page.locator('#smartBuyBudget').inputValue(),'180');await page.locator('#researchAnswers').fill('Comfort en repareerbaarheid voorop.');await page.locator('#researchResult').fill('Gecontroleerde onderzoeksuitkomst.');await page.locator('#researchSave').click();
    const research=(await finance()).research.find(r=>r.wishId==='headphones'),txCount=(await finance()).transactions.length;assert(research);await page.locator('#researchBackWish').click();await page.locator('#lifeWishStatus').selectOption('bought');await page.locator('[form=lifeWishForm][type=submit]').click();assert.equal((await finance()).transactions.length,txCount);
    await page.locator('[data-life-research=headphones]').click();assert.equal(await page.locator('#researchResult').inputValue(),'Gecontroleerde onderzoeksuitkomst.');assert.equal((await finance()).research.filter(r=>r.wishId==='headphones').length,1);assert.equal((await finance()).research.find(r=>r.wishId==='headphones').id,research.id);
    await page.locator('#researchRegisterExpense').click();assert.equal(await page.locator('#txAmount').inputValue(),'');await page.locator('#cancelTx').click();assert.equal((await finance()).transactions.length,txCount);
    await page.locator('[data-research-delete="'+research.id+'"]').click();await nav(page,'life','wishes');await page.locator('[data-life-research=headphones]').click();assert.equal((await finance()).research.find(r=>r.wishId==='headphones').id,research.id);assert.equal(await page.locator('#researchAnswers').inputValue(),'Comfort en repareerbaarheid voorop.');
    await nav(page,'life','backup');const savedLife=await life(),savedFinance=await finance();const [backup]=await Promise.all([page.waitForEvent('download'),page.locator('#lifeExportBackup').click()]);const bytes=fs.readFileSync(await backup.path());assert.equal(bytes.readUInt32LE(0),0x04034b50);const reload=page.waitForNavigation({waitUntil:'domcontentloaded'});await page.locator('#lifeImportFile').setInputFiles({name:'masterplan-proef.zip',mimeType:'application/zip',buffer:bytes});await reload;await page.waitForFunction(()=>window.MementoStorageGuard?.writable);assert.deepEqual(await life(),savedLife);assert.deepEqual(await finance(),savedFinance);
    await nav(page,'life','notes');await page.evaluate(id=>window.MementoKnowledge.showNote(id),noteId);assert.equal(await page.locator('#kc-body').inputValue(),full);await page.locator('[data-kc=related][data-kind=task]').click();assert.equal(await page.locator('#lifeDialogTitle').innerText(),passage);await page.locator('#lifeDialog [data-life-close]').first().click();
    checks.push({width,phase:3,passed:['middle-content search with type/path/snippet and one-action filter reset','task result opens exact item','selected passage to task and bidirectional status after move/archive','recursive root counts','wish dossier preserves identity/name/budget/result and restores from trash','bought status and financial draft create zero transactions','full ZIP restores links and binary attachment identifiers']});
   }
   assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_pin_config_v1')),originalPin);
   assert.equal(await page.locator('#pinLock').isVisible(),false);checks.push({width,phase,passed:['signed preview and prompt','CSV cents','payment double click and correction','note path from actual collection','today excluded from history','PIN preserved']});
   await ctx.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));
 }catch(e){failure=String(e);console.error(e);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({phase,checks,errors,failure},null,2));if(browser)await browser.close();server.close();}
})();
