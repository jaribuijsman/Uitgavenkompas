/* Shared Memento illustration picker for root and child collections. */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoKnowledgeCoverUI=api;})(globalThis,root=>{
"use strict";
const A=root.MementoKnowledgeArt;let mode="auto",picked="",focus=50,variant=0,editedPrompt="",pending=null,pendingUrl="",nonce=0,saving=false;
const urls=new Map();
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function start(c){clearPending();mode=c?.coverFile?"custom":c?.coverId?"library":"auto";picked=c?.coverId||"";focus=c?.coverFocus??50;variant=0;editedPrompt="";}
function clearPending(){nonce++;pending=null;if(pendingUrl){URL.revokeObjectURL(pendingUrl);pendingUrl="";}}
function hasDraft(){return !!pending;}
function artId(c,parent=""){return A?.valid(c?.coverId)?c.coverId:A?.choose(c?.name,c?.icon,parent)||"natuur";}
function scene(c,parent=""){
 if(!A)return "";
 const id=artId(c,parent);
 return '<span class="kc-art-wrap" aria-hidden="true"><img class="kc-cover-image" src="'+esc(A.url(id))+'" alt="" decoding="async" loading="lazy">'+
 (c?.coverFile?.id?'<img class="kc-cover-image kc-cover-custom" data-kc-cover-file="'+esc(c.coverFile.id)+'" alt="" decoding="async" loading="lazy" style="object-position:'+(Number.isInteger(c.coverFocus)?c.coverFocus:50)+'% center">':"")+"</span>";
}
function cards(c,parent=''){return scene(c,parent);}
async function hydrate(host,store){if(!host||!store)return;
 const needed=new Set([...host.querySelectorAll('[data-kc-cover-file]')].map(el=>el.dataset.kcCoverFile));
 for(const [id,url] of urls)if(!needed.has(id)){URL.revokeObjectURL(url);urls.delete(id);}
 for(const el of host.querySelectorAll("[data-kc-cover-file]")){
 const id=el.dataset.kcCoverFile;if(!id||!el.isConnected)continue;try{
  let url=urls.get(id);if(!url){const rec=await store.get(id);if(!rec?.blob||!["image/png","image/jpeg","image/webp"].includes(rec.type))continue;url=URL.createObjectURL(rec.blob);urls.set(id,url);}
  if(el.isConnected&&el.dataset.kcCoverFile===id)el.src=url;
 }catch(e){/* fallback scene remains visible */}}
}
function render(d,parent=""){
 if(!A)return "";const automatic=A.choose(d.name,d.icon,parent),id=mode==="library"&&A.valid(picked)?picked:automatic;
 const image=mode==="custom"&&pendingUrl?'<img class="kc-cover-pending" alt="" src="'+esc(pendingUrl)+'">':scene({coverId:id,coverFile:mode==="custom"?d.coverFile:null,coverFocus:focus});
 const prompt=editedPrompt||A.prompt({name:d.name||"Nieuwe verzameling",parent,scene:id,variant});
 return '<section class="kc-cover-editor"><h3>Illustratie op de kaart</h3>'+
 '<div class="kc-cover-preview">'+image+'<small>VOORBEELD</small><strong>'+esc(d.name||"Nieuwe verzameling")+'</strong></div>'+
 '<div class="kc-cover-modes" role="group" aria-label="Afbeeldingsbron">'+[["auto","Automatisch"],["library","Bibliotheek"],["custom","Eigen afbeelding"]].map(([id,label])=>'<button type="button" class="kc-btn" data-kc="cover-mode" data-id="'+id+'" aria-pressed="'+(mode===id)+'">'+label+'</button>').join("")+'</div>'+
 (mode==="auto"?'<p class="kc-muted">Een gratis passend landschap, automatisch geselecteerd op basis van de naam en het pictogram.</p>':"")+
 (mode==="library"?'<details class="kc-cover-library" open><summary>Kies uit '+A.SCENES.length+' pixel-artlandschappen</summary><div class="kc-cover-grid">'+A.SCENES.map(x=>'<button type="button" class="kc-cover-tile" data-kc="cover-select" data-id="'+esc(x.id)+'" aria-pressed="'+(picked===x.id)+'" aria-label="'+esc(x.title)+'"><img src="'+esc(A.url(x.id))+'" alt="" loading="lazy"><span>'+esc(x.title.split(" · ").at(-1))+'</span></button>').join("")+'</div></details>':"")+
 (mode==="custom"?'<label class="kc-cover-file-label">Afbeelding kiezen · PNG, JPG of WebP (maximaal 8 MB)<input type="file" id="kc-cover-file-input" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"></label>'+
 '<p class="kc-muted">'+(pending?esc(pending.name)+" · nog niet opgeslagen":d.coverFile?"Bestaande eigen afbeelding.":"Kies een bestand op je telefoon.")+'</p>'+
 '<label class="kc-cover-focus">Uitsnede <input type="range" min="0" max="100" step="5" id="kc-cover-focus" value="'+focus+'"></label>':"")+
 '<details class="kc-cover-ai"><summary>Maak nieuwe pixel art met ChatGPT</summary><p class="kc-muted">Kopieer de prompt, open de ChatGPT-app, maak een afbeelding en voeg die vervolgens hierboven toe. Geen betaalde API of automatische overdracht.</p>'+
 '<textarea id="kc-cover-prompt" rows="7" maxlength="4000" aria-label="Aanpasbare prompt voor pixel art">'+esc(prompt)+'</textarea>'+
 '<div class="kc-cover-ai-actions"><button type="button" class="kc-btn" data-kc="cover-variant">Andere sfeer</button><button type="button" class="kc-btn kc-primary" data-kc="cover-copy">Kopieer prompt</button>'+
 '<a class="kc-btn kc-primary" href="'+(navigator.userAgent.includes("Android")?"intent://chatgpt.com/#Intent;scheme=https;package=com.openai.chatgpt;end":"https://chatgpt.com/")+'" rel="noopener noreferrer">Open ChatGPT'+(navigator.userAgent.includes("Android")?"-app":"")+'</a></div><p role="status" id="kc-cover-status"></p></details></section>';
}
function interact(op,id,d,host,rerender,notify){
 if(op==="cover-copy"){const text=host.querySelector("#kc-cover-prompt")?.value||"",status=host.querySelector("#kc-cover-status");
  const done=()=>{if(status)status.textContent="Gekopieerd. Maak de afbeelding in ChatGPT en voeg haar daarna toe."};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(()=>{if(status)status.textContent="Selecteer en kopieer de prompt handmatig."});
  else{const input=host.querySelector("#kc-cover-prompt");input?.focus();input?.select();if(document.execCommand?.("copy"))done();else if(status)status.textContent="Kopieer de tekst handmatig.";}return true;
 }
 if(op==="cover-variant"){variant=(variant+1)%6;editedPrompt="";rerender();host.querySelector(".kc-cover-ai")?.setAttribute("open","");return true;}
 if(op==="cover-mode"&&["auto","library","custom"].includes(id)){mode=id;d.dirty=true;editedPrompt="";rerender();return true;}
 if(op==="cover-select"&&A.valid(id)){picked=id;mode="library";d.dirty=true;editedPrompt="";rerender();return true;}
 return false;
}
async function fileChanged(file,d,store,rerender,notify){
 if(!file||!d)return;const serial=++nonce;
 try{
  if(file.size>8*1024*1024)throw Error("Een afbeelding mag maximaal 8 MB zijn.");
  if(!store)throw Error("Bestandsopslag ontbreekt.");
  const type=await store.inspect(file);if(!["image/png","image/jpeg","image/webp"].includes(type))throw Error("Gebruik PNG, JPG of WebP.");
  if(serial!==nonce)return;
  if(pendingUrl)URL.revokeObjectURL(pendingUrl);
  pendingUrl=URL.createObjectURL(file);pending=file;mode="custom";d.dirty=true;rerender();
 }catch(e){notify(e.message||"Afbeelding kan niet worden geopend.");}
}
function changed(el,host){if(el.id==="kc-cover-prompt"){editedPrompt=el.value;return true;}if(el.id==="kc-cover-focus"){focus=Number(el.value);host.querySelectorAll(".kc-cover-custom,.kc-cover-pending").forEach(img=>img.style.objectPosition=focus+"% center");return true;}return false;}
async function save(d,{store,core,guard,write,onSaved,notify}){
 if(saving||!d)return;
 if(mode==="custom"&&!pending&&!d.coverFile){notify("Selecteer een eigen afbeelding of kies een van de landschappen.");return;}
 let token,meta=null,id="";saving=true;
 try{
  if(!guard?.writable)throw Error("Opslag is tijdelijk alleen-lezen.");
  if(mode==="custom"&&pending){token=guard.beginOperation();meta=await store.save("collection-cover-"+core.uid(),pending,token);}
  const data={...d,coverId:mode==="library"?(A.valid(picked)?picked:A.choose(d.name,d.icon)):"",coverFile:mode==="custom"?(meta||d.coverFile):null,coverFocus:focus};
  if(!write(state=>{id=core.saveCollection(state,data).id;},token))throw Error("Opslaan mislukt. Je invoer is behouden.");
  clearPending();onSaved(id);
 }catch(e){if(meta&&token)try{await store.remove(meta.id,token)}catch{}notify(e.message||"Afbeelding is niet opgeslagen.");}
 finally{saving=false;if(token)guard.endOperation(token);}
}
return {start,clearPending,hasDraft,artId,cards,hydrate,render,interact,changed,fileChanged,save};
});
