/* Memento Kenniscentrum UI. Mounts within the existing Life view; no network access. */
(function(root){
"use strict";
const C=root.MementoKnowledgeCore,S=root.MementoKnowledgeStore;
if(!C)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const icons={recipes:"⚗",inspiration:"✧",documents:"▤",projects:"▦",home:"⌂",research:"◈"};
const kindNames={note:"Notitie",link:"Link",recipe:"Recept",checklist:"Checklist",pdf:"PDF",image:"Afbeelding"};
const readable=d=>{try{return new Date(d).toLocaleDateString("nl-NL",{day:"numeric",month:"short"});}catch{return ""}};
function safeURL(s){try{const u=new URL(s);return ["https:","http:"].includes(u.protocol)?u.href:""}catch{return ""}}
function htmlInline(input){
 let result=esc(input);
 result=result.replace(/\[([^\]]{1,120})\]\((https?:\/\/[^\s)]+)\)/g,(full,title,url)=>safeURL(url)?'<a href="'+esc(safeURL(url))+'" target="_blank" rel="noopener noreferrer">'+title+"</a>":full);
 result=result.replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g,"$1<em>$2</em>").replace(/&#96;([^&\n]+)&#96;/g,"<code>$1</code>");
 return result;
}
function markdown(value){
 const lines=String(value||"").split(/\r?\n/);let inList=false;
 const blocks=[];
 for(const line of lines){
  const t=line.trim();if(!t){if(inList){blocks.push("</ul>");inList=false;}continue;}
  const list=/^[-*]\s+(.+)$/.exec(t);
  if(list){if(!inList){blocks.push("<ul>");inList=true;}blocks.push("<li>"+htmlInline(list[1])+"</li>");continue;}
  if(inList){blocks.push("</ul>");inList=false;}
  const head=/^(#{1,3})\s+(.+)$/.exec(t);
  if(head){blocks.push("<h"+Math.min(4,head[1].length+2)+">"+htmlInline(head[2])+"</h"+Math.min(4,head[1].length+2)+">");continue;}
  if(t.startsWith("> ")){blocks.push("<blockquote>"+htmlInline(t.slice(2))+"</blockquote>");continue;}
  blocks.push("<p>"+htmlInline(line)+"</p>");
 }
 if(inList)blocks.push("</ul>");
 return blocks.join("")||'<p class="kc-muted">Nog geen inhoud</p>';
}
const btn=(text,action,id="",primary=false)=>'<button type="button" class="kc-btn'+(primary?" kc-primary":"")+'" data-kc="'+action+'" data-id="'+esc(id)+'">'+text+"</button>";
let host=null,bridge=null,screen="home",collectionId="inbox",selectedId="",query="",kindFilter="",tagFilter="",sort="recent",listing="active",viewOverride="",editing=null,dirty=false,timer=0,notice="",fileUrl="",fileId="",fileRecord=null,linkQuery="";
const read=()=>bridge.read();
const collections=()=>C.ensure(read()).collections.filter(c=>!c.archived);
function notify(t){notice=t;const n=host?.querySelector("#kc-notice");if(n){n.textContent=t;n.hidden=!t;}}
function counts(id){return read().notes.filter(n=>!n.deletedAt&&!n.archived&&C.collectionOf(read(),n)===id).length;}
function chips(tags){return (tags||[]).slice(0,3).map(tag=>'<span class="kc-tag">#'+esc(tag)+"</span>").join("");}
function collectionIcon(c){return '<span class="kc-collection-icon" aria-hidden="true">'+(icons[c?.id]||"▤")+"</span>";}
function collectionName(id){return C.collectionName(read(),id);}
function itemIcon(n){return {recipe:"⚗",link:"↗",pdf:"▣",image:"▧",checklist:"☑",note:"▤"}[C.typeOf(n)]||"▤";}
function backAction(){return '<button type="button" class="kc-icon-btn" data-kc="back" aria-label="Terug">‹</button>';}
function header(title,back=false,actions=""){
 return '<header class="kc-header">'+(back?backAction():'<span class="kc-mark" aria-hidden="true">✦</span>')+
 '<div class="kc-head-label"><span>MEMENTO · KENNISCENTRUM</span><h2>'+esc(title)+'</h2></div>'+actions+"</header>";
}
function itemRows(items,mode="list"){
 if(!items.length)return '<div class="kc-empty"><strong>Nog geen kennisitems</strong><p>Voeg een item toe of pas de filters aan.</p></div>';
 return '<div class="kc-item-list kc-'+esc(mode)+'">'+items.map(n=>{
  const type=C.typeOf(n);
  return '<button type="button" class="kc-item" data-kc="open" data-id="'+esc(n.id)+'">'+
   '<span class="kc-item-icon" aria-hidden="true">'+itemIcon(n)+'</span><span class="kc-item-main"><strong>'+esc(n.title)+'</strong><small>'+esc(String(n.body||n.sourceUrl||kindNames[type]||"").slice(0,95)||kindNames[type])+'</small>'+
    '<span class="kc-item-tags">'+chips(n.tags)+(n.pinned?'<span class="kc-tag">Vastgezet</span>':"")+'</span></span>'+
   '<span class="kc-item-side">'+(n.updatedAt?readable(n.updatedAt):"")+'<span aria-hidden="true">›</span></span></button>';
 }).join("")+"</div>";
}
function renderHome(){
 const life=read(),items=C.search(life,{sort:"recent"}),pinned=items.filter(n=>n.pinned).slice(0,3);
 return header("Kenniscentrum",false,btn("+ Nieuw","new","",true))+
 '<div class="kc-capture"><button type="button" data-kc="new" class="kc-capture-btn"><strong>Wat wil je bewaren?</strong><span>Een gedachte, link, recept of document toevoegen…</span></button></div>'+
 '<div class="kc-section-head"><h3>Mijn verzamelingen</h3>'+btn("Beheer","collections")+"</div>"+
 '<div class="kc-collections">'+collections().map(c=>'<button type="button" data-kc="collection" data-id="'+esc(c.id)+'" class="kc-collection">'+collectionIcon(c)+'<strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+' items · '+esc(c.view==="gallery"?"Galerij":c.view==="table"?"Tabel":"Lijst")+"</small></button>").join("")+"</div>"+
 (pinned.length?'<div class="kc-section-head"><h3>Vastgezet</h3></div>'+itemRows(pinned):"")+
 '<div class="kc-section-head"><h3>Recent bewaard</h3>'+btn("Bekijk alles","all")+"</div>"+
 itemRows(items.slice(0,6))+
 '<div class="kc-hub-shortcuts">'+btn("Inbox","inbox")+btn("Alle notities","all")+btn("Archief","archive")+btn("Prullenbak","trash")+"</div>";
}
function currentItems(){
 const cid=screen==="collection"?collectionId:screen==="inbox"?"inbox":"";
 const status=screen==="trash"?"trash":screen==="archive"?"archive":screen==="pinned"?"pinned":"active";
 return C.search(read(),{collectionId:cid,query,kind:kindFilter,tag:tagFilter,status,sort});
}
function renderList(){
 const c=collections().find(x=>x.id===collectionId);
 const title=screen==="collection"?c?.name||"Verzameling":{all:"Alle kennisitems",inbox:"Inbox",archive:"Archief",trash:"Prullenbak",pinned:"Vastgezet"}[screen]||"Kennisitems";
 const availableTags=[...new Set(read().notes.flatMap(n=>n.tags||[]))].sort((a,b)=>a.localeCompare(b,"nl"));
 const items=currentItems(),mode=viewOverride||c?.view||"list";
 return header(title,true,screen==="trash"?"":btn("+ Nieuw","new","",true))+
 '<div class="kc-filters"><label class="kc-search"><span class="kc-sr">Zoeken</span><input type="search" data-kc-input="search" placeholder="Zoek in titel, tekst en tags…" value="'+esc(query)+'"></label>'+
 '<div class="kc-filterline"><label>Type<select data-kc-change="kind"><option value="">Alles</option>'+Object.entries(kindNames).map(([v,n])=>'<option value="'+v+'"'+(kindFilter===v?" selected":"")+">"+n+"</option>").join("")+"</select></label>"+
 '<label>Tag<select data-kc-change="tag"><option value="">Alle tags</option>'+availableTags.map(v=>'<option value="'+esc(v)+'"'+(tagFilter===v?" selected":"")+">"+esc(v)+"</option>").join("")+"</select></label>"+
 '<label>Sortering<select data-kc-change="sort"><option value="recent"'+(sort==="recent"?" selected":"")+'>Recent</option><option value="title"'+(sort==="title"?" selected":"")+'>Titel</option><option value="old"'+(sort==="old"?" selected":"")+'>Oudste</option></select></label></div>'+
 '<div class="kc-mode-switch">'+btn("Lijst","mode","list",mode==="list")+btn("Galerij","mode","gallery",mode==="gallery")+btn("Tabel","mode","table",mode==="table")+'</div></div>'+
 '<p class="kc-count">'+items.length+' kennisitems</p>'+
 itemRows(items,mode)+
 (screen==="collection"?'<div class="kc-bottom-actions">'+btn("Verzameling beheren","edit-collection",collectionId)+"</div>":"");
}
function renderCollections(){
 return header("Verzamelingen",true,btn("+ Nieuwe","new-collection","",true))+
 '<p class="kc-muted">Kies een verzameling of pas de naam en standaardweergave aan.</p>'+
 '<div class="kc-manage-collections">'+collections().map(c=>'<div class="kc-manage-row">'+
 '<button type="button" data-kc="collection" data-id="'+esc(c.id)+'">'+collectionIcon(c)+'<span><strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+' items</small></span></button>'+
 btn("Bewerk","edit-collection",c.id)+'</div>').join("")+"</div>";
}
function renderCollectionEditor(){
 const c=collections().find(x=>x.id===collectionId);
 return header(c?"Verzameling bewerken":"Nieuwe verzameling",true)+
 '<div class="kc-editor-fields"><label>Naam<input maxlength="80" id="kc-col-name" value="'+esc(c?.name||"")+'" placeholder="Bijvoorbeeld: Boeken en artikelen"></label>'+
 '<label>Standaardweergave<select id="kc-col-view">'+
 [["list","Lijst"],["gallery","Galerij"],["table","Tabel"]].map(([id,label])=>'<option value="'+id+'"'+((c?.view||"list")===id?" selected":"")+">"+label+"</option>").join("")+"</select></label>"+
 btn("Verzameling opslaan","save-collection","",true)+
 (c?btn("Archiveren","archive-collection",c.id):"")+"</div>";
}
function attachmentsHTML(n){
 if(!(n.attachments||[]).length)return "";
 return '<div class="kc-attachments"><h3>Bijlagen</h3>'+
 n.attachments.map(a=>'<div class="kc-attachment"><span aria-hidden="true">'+(a.type==="application/pdf"?"▣":"▧")+'</span><button type="button" data-kc="file" data-id="'+esc(a.id)+'">'+esc(a.name)+'</button><small>'+Math.round(a.size/1024)+' KB</small></div>').join("")+"</div>";
}
function linkedHTML(n){
 const links=[...(n.links||[]),...(n.conversions||[]).map(l=>({kind:l.kind,id:l.id}))];
 if(!links.length)return "";
 return '<div class="kc-related"><h3>Verbonden met</h3>'+links.map(l=>{
  const other=l.kind==="note"?read().notes.find(x=>x.id===l.id):null;
  return '<button type="button" data-kc="related" data-kind="'+esc(l.kind)+'" data-id="'+esc(l.id)+'">'+esc(other?.title||{task:"Taak",appointment:"Afspraak",wish:"Aankoopwens"}[l.kind]||"Gekoppeld item")+' <span aria-hidden="true">↗</span></button>';
 }).join("")+"</div>";
}
function recipeHTML(r){
 const ingredients=Array.isArray(r?.ingredients)?r.ingredients:[];
 return '<section class="kc-recipe"><div class="kc-recipe-hero"><span>RECEPTKAART</span><strong>'+esc(r?.status||"concept")+' · versie '+esc(r?.version||1)+'</strong></div>'+
 '<h3>Ingrediënten</h3>'+(ingredients.length?'<div class="kc-recipe-table">'+ingredients.map(x=>'<div><span>'+esc(x.name)+'</span><strong>'+esc(x.amount)+' '+esc(x.unit)+'</strong></div>').join("")+"</div>":'<p class="kc-muted">Nog geen ingrediënten vastgelegd.</p>')+
 (r?.notes?'<h3>Testnotities</h3><p>'+esc(r.notes)+'</p>':"")+"</section>";
}
function renderDetail(){
 const n=read().notes.find(x=>x.id===selectedId);
 if(!n)return header("Notitie niet gevonden",true)+"<p>Dit kennisitem is niet meer beschikbaar.</p>";
 const cid=C.collectionOf(read(),n);
 const actions=n.deletedAt?btn("Herstellen","restore",n.id,true):btn("Bewerken","edit",n.id,true);
 const original=safeURL(n.sourceUrl||"");
 const check=C.typeOf(n)==="checklist"?'<div class="kc-checklist">'+C.checklistItems(n).map(item=>'<label class="kc-check"><input data-kc-check="'+esc(item.id)+'" data-note="'+esc(n.id)+'" type="checkbox"'+(item.done?" checked":"")+(n.deletedAt?" disabled":"")+'><span>'+esc(item.text)+'</span></label>').join("")+"</div>":"";
 return header(n.title,true,actions)+
 '<div class="kc-detail-meta"><span>'+esc(collectionName(cid))+"</span><span>·</span><span>"+esc(kindNames[C.typeOf(n)]||"Notitie")+"</span><span>·</span><span>"+readable(n.updatedAt||n.createdAt)+"</span></div>"+
 '<div class="kc-tagline">'+chips(n.tags)+'</div>'+
 (C.typeOf(n)==="recipe"?recipeHTML(n.recipe):"")+
 (check||'<div class="kc-readable">'+markdown(n.body)+"</div>")+
 (original?'<a class="kc-source" href="'+esc(original)+'" target="_blank" rel="noopener noreferrer">Bron openen ↗</a>':"")+
 attachmentsHTML(n)+linkedHTML(n)+
 (n.deletedAt?"":'<div class="kc-detail-actions">'+btn(n.pinned?"Losmaken":"Vastzetten","pin",n.id)+btn(n.archived?"Terug uit archief":"Archiveren","archive-item",n.id)+btn("Koppelen","link",n.id)+btn("Onderzoeken met AI","ai",n.id)+
 '<details><summary>Meer</summary><div>'+btn("Als taak","convert-task",n.id)+btn("Als afspraak","convert-appointment",n.id)+btn("Als aankoopwens","convert-wish",n.id)+btn("Verwijderen","delete",n.id)+'</div></details></div>');
}
function renderEditor(){
 const e=editing;if(!e)return "";
 const type=C.typeOf(e),isRecipe=type==="recipe",isLink=type==="link";
 const tags=(e.tags||[]).join(", ");
 const recipe=e.recipe||{ingredients:[],status:"concept",version:1,notes:""};
 return header(selectedId?"Kennisitem bewerken":"Nieuw kennisitem",true,'<span class="kc-save-state" id="kc-save-state">'+(dirty?"Niet opgeslagen":"Opgeslagen")+"</span>")+
 '<div class="kc-editor-fields">'+
 '<label>Type<select data-kc-edit="kind" id="kc-kind">'+Object.entries(kindNames).filter(([key])=>key!=="pdf"&&key!=="image").map(([key,label])=>'<option value="'+key+'"'+(type===key?" selected":"")+">"+label+"</option>").join("")+"</select></label>"+
 '<label>Verzameling<select data-kc-edit="collectionId" id="kc-collection">'+
 '<option value="inbox"'+(e.collectionId==="inbox"?" selected":"")+'>Inbox</option>'+
 collections().map(c=>'<option value="'+esc(c.id)+'"'+(C.collectionOf(read(),e)===c.id?" selected":"")+">"+esc(c.name)+"</option>").join("")+"</select></label>"+
 '<label>Titel<input id="kc-title" data-kc-edit="title" maxlength="180" placeholder="Titel of onderwerp" value="'+esc(e.title==="Naamloze notitie"&&!selectedId?"":e.title)+'"></label>'+
 (isLink?'<label>Website (https://)<input type="url" id="kc-source" data-kc-edit="sourceUrl" value="'+esc(e.sourceUrl||"")+'" placeholder="https://…"></label>':"")+
 '<label>Inhoud</label>'+
 '<div class="kc-format-bar" role="toolbar" aria-label="Tekst opmaken">'+btn("Kop","format","# ")+btn("Vet","format","**")+btn("Lijst","format","- ")+btn("Citaat","format","> ")+btn("Link","format","[tekst](https://)")+"</div>"+
 '<textarea id="kc-body" data-kc-edit="body" rows="11" maxlength="20000" placeholder="Begin met schrijven…">'+esc(e.body||"")+"</textarea>"+
 (isRecipe?'<div class="kc-recipe-fields"><h3>Receptgegevens</h3><label>Status<select data-kc-edit="recipeStatus"><option value="concept"'+(recipe.status==="concept"?" selected":"")+'>Concept</option><option value="testen"'+(recipe.status==="testen"?" selected":"")+'>Testen</option><option value="definitief"'+(recipe.status==="definitief"?" selected":"")+'>Definitief</option></select></label>'+
 '<label>Ingrediënten (één per regel, met | als scheiding)<textarea data-kc-edit="ingredients" rows="4" placeholder="Ingrediënt | hoeveelheid | eenheid">'+esc((recipe.ingredients||[]).map(x=>[x.name,x.amount,x.unit].join(" | ")).join("\n"))+"</textarea></label>"+
 '<label>Testnotities<textarea data-kc-edit="recipeNotes" rows="3">'+esc(recipe.notes||"")+"</textarea></label></div>":"")+
 '<label>Tags (gescheiden door komma’s)<input data-kc-edit="tags" maxlength="1000" value="'+esc(tags)+'" placeholder="Bijvoorbeeld: Inspiratie, Project"></label>'+
 '<label class="kc-file-upload">PDF of afbeelding toevoegen<input id="kc-file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" multiple></label>'+
 '<p class="kc-muted">Maximaal 25 MB per bestand. PDF’s en afbeeldingen blijven op dit apparaat en worden meegenomen in de volledige ZIP-back-up.</p>'+
 attachmentsHTML(e)+
 '<div class="kc-editor-actions">'+btn("Opslaan","save","",true)+btn("Voorbeeld","preview")+btn("Versiegeschiedenis","versions")+"</div></div>";
}
function renderVersions(){
 const n=read().notes.find(x=>x.id===selectedId);
 return header("Eerdere versies",true)+
 '<p class="kc-muted">Een versie herstellen overschrijft de actuele tekst niet zonder een nieuwe revisie te bewaren.</p>'+
 (n?.revisions?.length?n.revisions.map((r,i)=>'<div class="kc-version"><div><strong>'+esc(r.title)+'</strong><small>'+readable(r.savedAt)+' · Revisie '+esc(r.revision)+'</small></div>'+btn("Herstel","restore-version",i)+"</div>").reverse().join(""):'<div class="kc-empty"><strong>Nog geen oudere versie</strong><p>Eerdere opgeslagen teksten verschijnen hier.</p></div>');
}
function renderLink(){
 const n=read().notes.find(x=>x.id===selectedId);
 const choices=read().notes.filter(x=>!x.deletedAt&&x.id!==selectedId&&x.title.toLowerCase().includes(linkQuery.toLowerCase())).slice(0,50);
 return header("Notitie verbinden",true)+
 '<p class="kc-muted">Leg een verwijzing naar een andere notitie. Er wordt niets gedupliceerd.</p>'+
 '<input type="search" data-kc-input="related-search" placeholder="Zoek een andere notitie…" value="'+esc(linkQuery)+'">'+
 choices.map(x=>'<button class="kc-link-choice" type="button" data-kc="add-link" data-id="'+esc(x.id)+'">'+esc(x.title)+' <span>＋</span></button>').join("")+
 (!choices.length?'<p class="kc-muted">Geen passende notities.</p>':"");
}
function renderFile(){
 const n=read().notes.find(x=>(x.attachments||[]).some(a=>a.id===fileId));
 const a=n?.attachments.find(x=>x.id===fileId);
 const link=fileUrl?'<a href="'+esc(fileUrl)+'" download="'+esc(a?.name||"bijlage")+'" class="kc-source">Download origineel</a>':"";
 return header(a?.name||"Bijlage",true)+
 '<p class="kc-muted">Bestand wordt lokaal gelezen; er wordt niets geüpload.</p>'+
 (fileRecord?.type==="application/pdf"&&fileUrl?'<iframe class="kc-pdf-frame" title="PDF-lezer" src="'+esc(fileUrl)+'#toolbar=1" loading="lazy"></iframe>'+
 '<p class="kc-muted">Werkt de PDF-lezer niet in jouw Android-browser? Gebruik ‘Open origineel’ om de ingebouwde documentviewer te openen.</p>'+
 '<a class="kc-source" href="'+esc(fileUrl)+'" target="_blank" rel="noopener noreferrer">Open origineel ↗</a>':
 fileRecord?.type?.startsWith("image/")&&fileUrl?'<img class="kc-image" src="'+esc(fileUrl)+'" alt="'+esc(a?.name||"Bijlage")+'">':
 '<div class="kc-empty">Bestand wordt geladen of is niet beschikbaar.</div>')+link;
}
function render(){
 if(!host)return;
 const life=read();try{C.ensure(life)}catch(e){host.textContent=e.message;return;}
 let output="";
 if(screen==="home")output=renderHome();
 else if(screen==="collections")output=renderCollections();
 else if(screen==="collection-editor")output=renderCollectionEditor();
 else if(["collection","all","inbox","archive","trash","pinned"].includes(screen))output=renderList();
 else if(screen==="detail")output=renderDetail();
 else if(screen==="edit")output=renderEditor();
 else if(screen==="versions")output=renderVersions();
 else if(screen==="link")output=renderLink();
 else if(screen==="file")output=renderFile();
 host.innerHTML='<div class="kc-app"><div id="kc-notice" role="status"'+(notice?"":" hidden")+">"+esc(notice)+"</div>"+output+"</div>";
}
function write(mutator){
 try{return bridge.write(life=>{C.ensure(life);mutator(life);C.validate(life);});}catch(e){notify(e.message);return false;}
}
function flush(){
 if(!editing||!dirty)return true;
 const draft=C.clone(editing),life=read();
 if(!draft.title.trim())draft.title=String(draft.body||"").trim().split("\n")[0].slice(0,85)||"Naamloze notitie";
 if(!draft.body.trim()&&draft.title==="Naamloze notitie"&&!draft.attachments?.length&&!selectedId){dirty=false;return true;}
 if(draft.sourceUrl&&!safeURL(draft.sourceUrl)){notify("Gebruik een geldige http- of https-link.");setSaveIndicator("Controleer de bronlink");return false;}
 const changed=write(state=>{
  if(selectedId){C.updateNote(state,selectedId,{title:draft.title,body:draft.body,kind:draft.kind,collectionId:draft.collectionId,tags:draft.tags,sourceUrl:draft.sourceUrl,recipe:draft.recipe||null});}
  else {draft.revision=1;state.notes.unshift(draft);}
 });
 if(!changed){setSaveIndicator("Opslaan mislukt · invoer bewaard");return false;}
 selectedId=draft.id;editing=C.clone(read().notes.find(n=>n.id===draft.id));dirty=false;notice="";
 setSaveIndicator("Opgeslagen");return true;
}
function setSaveIndicator(label){const el=host?.querySelector("#kc-save-state");if(el)el.textContent=label;}
function schedule(){dirty=true;setSaveIndicator("Bezig met opslaan…");clearTimeout(timer);timer=setTimeout(()=>flush(),850);}
function leave(next,id=""){
 clearTimeout(timer);if(!flush())return false;
 editing=null;screen=next;if(id)collectionId=id;notice="";render();return true;
}
function beginNew(cid){
 selectedId="";const state=read();editing=C.makeNote({title:"",body:"",collectionId:cid||"inbox",kind:"note"},state);dirty=false;screen="edit";render();
}
function startEdit(id){
 const note=read().notes.find(x=>x.id===id);if(!note)return;
 selectedId=id;editing=C.clone(note);editing.kind=C.typeOf(note);editing.collectionId=C.collectionOf(read(),note);
 if(!editing.tags)editing.tags=[];
 if(!editing.attachments)editing.attachments=[];
 if(!editing.recipe&&editing.kind==="recipe")editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
 dirty=false;screen="edit";render();
}
function back(){
 if(screen==="edit"){if(!leave(selectedId?"detail":"home"))return;return}
 if(screen==="file"){if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl="";fileRecord=null;screen="detail";}
 else if(screen==="versions"||screen==="link")screen="detail";
 else if(screen==="detail"){const note=read().notes.find(x=>x.id===selectedId);collectionId=C.collectionOf(read(),note||{});screen=collectionId==="inbox"?"inbox":"collection";}
 else if(screen==="collection-editor")screen="collections";
 else screen="home";
 notice="";render();
}
async function attach(files){
 if(!S){notify("De bestandsopslag is niet beschikbaar.");return}
 if(!files?.length)return;
 if(!flush()){notify("Sla de notitie eerst op voordat je een bijlage toevoegt.");return}
 setSaveIndicator("Bijlagen worden opgeslagen…");
 for(const file of files){
  let saved=null;
  try{
   saved=await S.save(selectedId,file);
   const success=write(state=>{const n=state.notes.find(x=>x.id===selectedId);C.updateNote(state,n.id,{attachments:[...(n.attachments||[]),saved]});});
   if(!success){await S.remove(saved.id);throw Error("De bijlage kon niet aan de notitie worden gekoppeld.");}
  }catch(e){notify(e.message||"Bijlage kon niet worden opgeslagen.");}
 }
 startEdit(selectedId);
}
async function openFile(id){
 if(!S){notify("Bestandsopslag ontbreekt");return}
 const record=await S.get(id);
 if(!record){notify("Bestand ontbreekt. Probeer een volledige back-up te herstellen.");return;}
 if(fileUrl)URL.revokeObjectURL(fileUrl);
 fileUrl=S.preview(record);fileRecord=record;fileId=id;screen="file";render();
}
function click(event){
 const el=event.target.closest("[data-kc]");if(!el||!host?.contains(el))return;
 const op=el.dataset.kc,id=el.dataset.id||"";
 if(op==="back"){back();return}
 if(op==="new"){beginNew(screen==="collection"?collectionId:"inbox");return}
 if(op==="collection"){collectionId=id;viewOverride="";sort="recent";query="";kindFilter="";tagFilter="";screen="collection";render();return}
 if(op==="collections"){screen="collections";render();return}
 if(op==="new-collection"){collectionId="";screen="collection-editor";render();return}
 if(op==="edit-collection"){collectionId=id;screen="collection-editor";render();return}
 if(op==="save-collection"){
  const name=host.querySelector("#kc-col-name")?.value||"",view=host.querySelector("#kc-col-view")?.value||"list";
  const success=write(state=>{if(collectionId){const c=C.renameCollection(state,collectionId,name);c.view=view;}else{const c=C.addCollection(state,name);c.view=view;}});
  if(success){screen="collections";render();}return;
 }
 if(op==="archive-collection"){
  if(!confirm("Verzameling archiveren? De inhoud blijft bewaard en wordt niet verwijderd."))return;
  if(write(s=>{const c=s.knowledge.collections.find(x=>x.id===id);if(c){c.archived=true;c.updatedAt=C.timestamp();c.revision++;}})){screen="collections";render();}return;
 }
 if(["all","inbox","archive","trash","pinned"].includes(op)){screen=op;query="";kindFilter="";tagFilter="";viewOverride="";render();return}
 if(op==="mode"){viewOverride=id;render();return}
 if(op==="open"){selectedId=id;screen="detail";render();return}
 if(op==="edit"){startEdit(id);return}
 if(op==="save"){clearTimeout(timer);if(flush()){screen="detail";editing=null;render();}return}
 if(op==="preview"){clearTimeout(timer);if(flush()){screen="detail";editing=null;render();}return}
 if(op==="versions"){if(flush()){screen="versions";render();}return}
 if(op==="restore-version"){
  if(!confirm("Deze eerdere versie herstellen? De actuele inhoud blijft beschikbaar in de geschiedenis."))return;
  if(write(s=>C.restoreRevision(s,selectedId,Number(id)))){screen="detail";render();}return;
 }
 if(op==="format"){
  const field=host.querySelector("#kc-body");if(!field)return;
  const a=field.selectionStart,b=field.selectionEnd,selection=field.value.slice(a,b);
  const next=id==="**"?"**"+(selection||"tekst")+"**":id.startsWith("[")?id:id+(selection||"");
  field.setRangeText(next,a,b,"end");editing.body=field.value;field.focus();schedule();return;
 }
 if(op==="file"){openFile(id).catch(e=>notify(e.message));return}
 if(op==="pin"||op==="archive-item"||op==="delete"||op==="restore"){
  if(op==="delete"&&!confirm("Notitie naar de prullenbak verplaatsen? Je kunt haar later herstellen."))return;
  if(write(s=>{const n=s.notes.find(x=>x.id===id);if(!n)return;
   if(op==="delete")n.deletedAt=C.timestamp();
   if(op==="restore")n.deletedAt="";
   if(op==="pin")n.pinned=!n.pinned;
   if(op==="archive-item")n.archived=!n.archived;
   n.updatedAt=C.timestamp();n.revision=(n.revision||0)+1;
  })){screen=op==="delete"?"trash":"detail";render();}return;
 }
 if(op==="link"){selectedId=id;linkQuery="";screen="link";render();return}
 if(op==="add-link"){
  const noteId=selectedId;
  if(write(s=>{const n=s.notes.find(x=>x.id===noteId);if(!(n.links||[]).some(x=>x.kind==="note"&&x.id===id))C.updateNote(s,n.id,{links:[...(n.links||[]),{kind:"note",id}]});})){screen="detail";render();}return;
 }
 if(op==="related"){if(el.dataset.kind==="note"){selectedId=id;screen="detail";render();}else bridge.openRelated?.(el.dataset.kind,id);return}
 if(op==="ai"){bridge.openAI?.(id);return}
 if(op.startsWith("convert-")){bridge.convert?.(id,op.slice(8));return}
}
function onInput(event){
 const field=event.target,change=field.dataset.kcEdit;
 if(field.dataset.kcInput==="search"){query=field.value;const cursor=field.selectionStart;render();const input=host.querySelector('[data-kc-input="search"]');if(input){input.focus();input.setSelectionRange(cursor,cursor);}return;}
 if(field.dataset.kcInput==="related-search"){linkQuery=field.value;render();host.querySelector('[data-kc-input="related-search"]')?.focus();return}
 if(!editing||!change)return;
 if(change==="tags")editing.tags=[...new Set(field.value.split(",").map(x=>x.trim().slice(0,60)).filter(Boolean))].slice(0,30);
 else if(change==="recipeStatus"||change==="ingredients"||change==="recipeNotes"){
  editing.recipe ||= {ingredients:[],status:"concept",rating:0,version:1,notes:""};
  if(change==="recipeStatus")editing.recipe.status=field.value;
  if(change==="recipeNotes")editing.recipe.notes=field.value;
  if(change==="ingredients")editing.recipe.ingredients=field.value.split(/\r?\n/).filter(s=>s.trim()).map(s=>{
    const [name="",amount="",unit=""]=s.split("|").map(x=>x.trim());
    return {name:name.slice(0,120),amount:amount.slice(0,40),unit:unit.slice(0,40)};
  });
 }else editing[change]=field.value;
 if(change==="kind"){
  if(field.value==="recipe"&&!editing.recipe)editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
  schedule();render();return;
 }
 schedule();
}
function onChange(event){
 const el=event.target;
 if(el.dataset.kcChange){const val=el.value;if(el.dataset.kcChange==="kind")kindFilter=val;if(el.dataset.kcChange==="sort")sort=val;if(el.dataset.kcChange==="tag")tagFilter=val;render();return}
 if(el.dataset.kcCheck){
  if(write(s=>C.toggleItem(s,el.dataset.note,el.dataset.kcCheck)))render();else el.checked=!el.checked;
  return;
 }
 if(el.id==="kc-file-input"){attach(Array.from(el.files||[]));}
}
function mount(container,b){
 host=container;bridge=b;
 if(!bridge?.read||!bridge?.write){host.innerHTML='<p>Kenniscentrum kan niet met Leven verbinden.</p>';return;}
 if(editing&&dirty&&screen==="edit"&&host.querySelector("#kc-body"))return;
 render();
}
function hasPending(){return Boolean(editing&&dirty);}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&hasPending())flush();});
window.addEventListener("beforeunload",e=>{if(hasPending()&&!flush()){e.preventDefault();e.returnValue="";}});
document.addEventListener("click",e=>{if(host?.contains(e.target))click(e);});
document.addEventListener("input",e=>{if(host?.contains(e.target))onInput(e);});
document.addEventListener("change",e=>{if(host?.contains(e.target))onChange(e);});
root.MementoKnowledge={mount,hasPending,open:()=>{screen="home";editing=null;notice="";render();},newNote:()=>beginNew("inbox"),showNote:id=>{selectedId=id;screen="detail";render();}};
})(window);
