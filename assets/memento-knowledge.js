/* Memento Notities UI. Mounts within the existing Life view; no network access. */
(function(root){
"use strict";
const C=root.MementoKnowledgeCore,S=root.MementoKnowledgeStore,ArtUI=root.MementoKnowledgeCoverUI;
if(!C)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iconPaths={
 folder:'M3 7h7l2 2h9v11H3z M3 7V4h7l2 3',route:'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M7 17h8a4 4 0 0 0 0-8h-6a3 3 0 0 1 0-6h8',
 journal:'M5 3h14v18H5z M3 7h4 M3 12h4 M3 17h4 M10 8h5 M10 12h5',house:'M3 11 12 3l9 8 M5 10v11h5v-7h4v7h5V10',
 'book-open':'M12 5v16 M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1z',heart:'M20 5c-3-3-6 0-8 2-2-2-5-5-8-2-5 5 2 10 8 15 6-5 13-10 8-15',
 person:'M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0 M4 21v-3c0-7 16-7 16 0v3',lightbulb:'M9 18h6 M9 21h6 M8 15c-7-7 0-15 7-11 5 3 3 8 1 11l-1 3H9z',
 'folder-kanban':'M3 6h7l2 2h9v13H3z M7 11v6 M12 11v3 M17 11v8',tools:'M14 4a5 5 0 0 0-6 6L3 18l3 3 8-7a5 5 0 0 0 6-6l-4 3-3-3z',
 devices:'M3 4h18v12H3z M8 21h8 M12 16v5',pet:'M7 11 4 4l7 3h2l7-3-3 7c5 12-15 12-10 0 M9 14h.01 M15 14h.01 M11 17h2',
 recipe:'M4 5h16v16H4z M8 9h8 M8 13h8 M8 17h5',drink:'M4 3h16l-8 9z M12 12v9 M8 21h8',travel:'M4 7h16v14H4z M9 7V3h6v4 M8 11v6 M16 11v6',
 document:'M5 3h9l5 5v13H5z M14 3v6h5 M9 13h6 M9 17h6',search:'M15 9a6 6 0 1 0-12 0 6 6 0 0 0 12 0 M14 14l7 7',
 music:'M9 18V5l12-2v13 M3 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M15 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0',camera:'M3 7h5l2-3h4l2 3h5v14H3z M16 14a4 4 0 1 0-8 0 4 4 0 0 0 8 0',
 fitness:'M3 8v8 M6 5v14 M6 12h12 M18 5v14 M21 8v8',leaf:'M4 20C-2 5 10 3 21 3c0 12-3 19-15 15 M4 20 16 8'
};
const iconLabels={folder:'Map',route:'Route',journal:'Dagboek',house:'Huis','book-open':'Boek',heart:'Hart',person:'Persoon',lightbulb:'Lampje','folder-kanban':'Projecten',tools:'Gereedschap',devices:'Apparaten',pet:'Huisdier',recipe:'Recept',drink:'Dranken',travel:'Reizen',document:'Document',search:'Onderzoek',music:'Muziek',camera:'Camera',fitness:'Fitness',leaf:'Natuur',lantern:'Lantaarn',compass:'Kompas',archive:'Archiefkast',sofa:'Zitbank',chef:'Koksmuts',herbs:'Kruiden',project:'Ontwerpkaart',scroll:'Documentenrol',reference:'Naslagwerk',palette:'Palet',notebook:'Notitieboek',books:'Boekenstapel',sun:'Zon',tasks:'Checklist',agenda:'Kalender',groceries:'Mand',star:'Ster',image:'Landschap'};
const iconAliases={'flask-conical':'recipe',sparkles:'lightbulb','file-text':'document','panels-top-left':'folder-kanban'};
function symbol(id){const key=iconAliases[id]||id;return root.MementoIllustratedIcons?.svg(key)||'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(iconPaths[key]||iconPaths.folder)+'"/></svg>';}

function collectionIconChoices(d){
 const I=root.MementoIllustratedIcons,source=I?.sourceDefaults[d.id],preferred=I?.categoryDefaults[d.id];
 const entries=Object.entries(iconLabels).filter(([id])=>id!==source||!preferred);
 if(preferred&&source)entries.unshift([source,iconLabels[preferred]||iconLabels[source]]);
 return entries.map(([id,label])=>{
  const art=preferred&&id===source?I.svg(preferred):symbol(id);
  return '<button type="button" data-kc="choose-icon" data-id="'+id+'" aria-label="'+label+'" aria-pressed="'+(d.icon===id)+'">'+art+'<span>'+label+'</span></button>';
 }).join('');
}

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
let centralQuery="",centralType="",centralCollection="",centralStatus="active",searchReturn=null;
let focusWriting=false,journalSearch="",recipeFactor=1;
const recipeChecks=new Map();
let colDraft=null,sortState=null,journalFilter="",migrationBusy=false,filtersExpanded=false;
let quickDraft="",quickListening=false;
let diaryDictating=false;
let diaryKeyboardBase=0;
let host=null,bridge=null,screen="home",collectionId="inbox",selectedId="",query="",kindFilter="",tagFilter="",sort="recent",listing="active",viewOverride="",editing=null,dirty=false,timer=0,notice="",fileUrl="",fileId="",fileRecord=null,linkQuery="";
let newNoteReturn=null,lastRenderedRoute="";
// Browser history contains only view identifiers, never note bodies or stored data.
const historySession=String(Date.now()),notesTrail=[];
let notesIndex=-1,restoreTransientBack=0;
const historyScreens=new Set(['home','collection','detail','all','inbox','archive','trash','pinned','search','collections']);
function resetListFilters(){filtersExpanded=false;query="";kindFilter="";tagFilter="";viewOverride="";sort="recent";}
function routeKey(s=screen,cid=collectionId,nid=selectedId){return s+(s==='collection'?':'+cid:s==='detail'?':'+nid:'');}
function listContext(s,cid,nid){return s==='detail'?C.collectionOf(read(),read().notes.find(n=>n.id===nid)||{}):s==='collection'?cid:s;}
function syncNotesHistory(){
 if(!root.history?.pushState||!historyScreens.has(screen)||restoreTransientBack)return;
 const next={screen,collectionId,selectedId,key:routeKey()};
 if(notesTrail[notesIndex]?.key===next.key)return;
 notesTrail.splice(notesIndex+1);notesTrail.push(next);notesIndex=notesTrail.length-1;
 const state={...root.history.state,mementoNotes:{session:historySession,index:notesIndex}};
 root.history[notesIndex===0?'replaceState':'pushState'](state,'');
}
function historyBackTo(next,id=''){
 if(!historyScreens.has(screen))return false;
 const key=routeKey(next,id),index=notesTrail.findLastIndex((r,i)=>i<notesIndex&&r.key===key);
 if(index<0)return false;
 root.history.go(index-notesIndex);return true;
}
root.addEventListener('popstate',event=>{
 if(!host||document.querySelector('#lifeApp')?.dataset.lifeView!=='notes')return;
 if(restoreTransientBack){const useAppBack=restoreTransientBack===1;restoreTransientBack=0;if(useAppBack)back();return;}
 const target=event.state?.mementoNotes;
 if(target?.session!==historySession||!notesTrail[target.index])return;
 // A hardware Back in an editor must use the same save/cancel guard as app Back.
 if(!historyScreens.has(screen)){
  restoreTransientBack=1;root.history.go(notesIndex-target.index);return;
 }
 if(dirty&&!flush()){restoreTransientBack=2;root.history.go(notesIndex-target.index);return;}
 const next=notesTrail[target.index];
 if(listContext(screen,collectionId,selectedId)!==listContext(next.screen,next.collectionId,next.selectedId))resetListFilters();
 notesIndex=target.index;screen=next.screen;collectionId=next.collectionId;selectedId=next.selectedId;
 notice="";render();
});
const read=()=>bridge.read();
const allCollections=()=>C.ensure(read()).collections;
const collections=()=>allCollections().filter(c=>C.activeCollection(read(),c.id));
const children=parent=>collections().filter(c=>parent===null?c.parentId===null:c.parentId===parent).sort((a,b)=>(a.order||0)-(b.order||0));
const rootCollections=()=>children(null);
const legacyCollections=()=>collections().filter(c=>c.parentId===undefined);
const pathName=c=>C.collectionPath(read(),c.id);
function tryMigration(){
 if(migrationBusy||read().knowledge?.hierarchyVersion===1)return;
 if(!root.MementoStorageGuard?.writable)return;
 migrationBusy=true;const ok=write(s=>C.migrateHierarchy(s));migrationBusy=false;
 if(!ok)notice='De nieuwe indeling kon niet worden opgeslagen. Bestaande verzamelingen blijven beschikbaar. Probeer opnieuw.';
}
function notify(t){notice=t;const n=host?.querySelector("#kc-notice");if(n){n.textContent=t;n.hidden=!t;}}
function counts(id){return C.collectionCounts(read(),id).total;}
function chips(tags){return (tags||[]).slice(0,3).map(tag=>'<span class="kc-tag">#'+esc(tag)+"</span>").join("");}
function collectionIcon(c){return '<span class="kc-collection-icon" aria-hidden="true">'+(root.MementoIllustratedIcons?.forCollection(c)||symbol(c?.icon))+"</span>";}
function collectionName(id){return C.collectionName(read(),id);}
function itemIcon(n){const type=C.typeOf(n),names={recipe:"recipe",link:"link",pdf:"document",image:"image",checklist:"tasks",note:"journal"};return root.MementoIllustratedIcons?.svg(names[type]||"journal")||({recipe:"⚗",link:"↗",pdf:"▣",image:"▧",checklist:"☑",note:"▤"}[type]||"▤");}
function backAction(){return '<button type="button" class="kc-icon-btn" data-kc="back" aria-label="Terug">'+(root.MementoIllustratedIcons?.svg("arrow-left",{quiet:true})||"‹")+"</button>";}
function header(title,back=false,actions=""){
 return '<header class="kc-header">'+(back?backAction():'<span class="kc-mark" aria-hidden="true">✦</span>')+
 '<div class="kc-head-label"><span>MEMENTO · NOTITIES</span><h2 tabindex="-1">'+esc(title)+'</h2></div>'+actions+"</header>";
}
function itemRows(items,mode="list",{filtered=false,create=false}={}){
 if(!items.length)return '<div class="kc-empty"><strong>'+(filtered?'Geen resultaten':'Hier staan nog geen notities')+'</strong>'+(filtered?btn('Wis filters','clear-filters'):create?btn('+ Nieuwe notitie','new','',true):'')+'</div>';
 return '<div class="kc-item-list kc-'+esc(mode)+'"'+(screen==='collection'&&sort==='manual'?' data-manual-sort="true"':'')+'>'+items.map(n=>{
  const type=C.typeOf(n);
  return '<button type="button" class="kc-item" data-kc="open" data-id="'+esc(n.id)+'" data-order-id="'+esc(n.id)+'"'+(screen==='collection'&&sort==='manual'?' aria-label="'+esc(n.title)+' · houd vast om te verslepen; Alt + pijltjes om te verplaatsen"':'')+'>'+
   (screen==='collection'&&sort==='manual'?'<span class="memento-note-grip" aria-hidden="true">⠿</span>':'')+'<span class="kc-item-icon" aria-hidden="true">'+itemIcon(n)+'</span><span class="kc-item-main"><strong>'+esc(n.title)+'</strong><small>'+esc(n.body?.trim()===n.title.trim()?kindNames[type]:String(n.body||n.sourceUrl||kindNames[type]||"").slice(0,95)||kindNames[type])+'</small>'+
    '<span class="kc-item-tags">'+chips(n.tags)+(n.pinned?'<span class="kc-tag">Vastgezet</span>':"")+'</span></span>'+
   '<span class="kc-item-side">'+(n.updatedAt?readable(n.updatedAt):"")+'<span aria-hidden="true">›</span></span></button>';
 }).join("")+"</div>";
}
function collectionRows(items,covers=false){
 return '<div class="kc-collection-rows">'+items.map(c=>'<button type="button" data-kc="collection" data-id="'+esc(c.id)+'" class="kc-collection-row '+(covers?'kc-art-row':'kc-folder-row')+'">'+collectionIcon(c)+'<span><strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+' notities</small></span><span class="kc-card-arrow" aria-hidden="true">›</span>'+(covers?ArtUI?.cards(c)||'':'')+'</button>').join('')+'</div>';
}
function quickBox(){
 return '<section class="kc-quick" aria-label="Snelle notitie"><div class="kc-quick-head"><strong>Snel vastleggen</strong><small>Inbox</small></div>'+
 '<label class="kc-sr" for="kc-quick-text">Snelle notitie</label><textarea id="kc-quick-text" data-kc-input="quick" rows="2" maxlength="20000" placeholder="Wat wil je onthouden?">'+esc(quickDraft)+'</textarea>'+
 '<div class="kc-quick-actions"><button id="kc-quick-mic" type="button" data-kc="quick-speech" aria-label="'+(quickListening?'Stop inspreken':'Spraak transcriberen')+'" aria-pressed="'+quickListening+'" class="kc-quick-mic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg></button>'+
 btn("Uitwerken","quick-expand")+btn("Bewaar notitie","quick-save","",true)+'</div><p role="status" aria-live="polite" id="kc-quick-status">Controleer de transcriptie voordat je bewaart.</p></section>';
}
function quickMsg(t){const el=host?.querySelector("#kc-quick-status");if(el)el.textContent=t;}
function quickPaint(){const el=host?.querySelector("#kc-quick-mic");if(!el)return;el.classList.toggle("kc-listening",quickListening);el.setAttribute("aria-pressed",String(quickListening));el.setAttribute("aria-label",quickListening?"Stop inspreken":"Spraak transcriberen");}
function quickStop(){
 const field=host?.querySelector("#kc-quick-text");
 if(root.MementoDictation?.isActive(field))root.MementoDictation.stop();
 quickListening=false;quickPaint();
}
function quickToggleSpeech(){
 const field=host?.querySelector("#kc-quick-text"),button=host?.querySelector("#kc-quick-mic");
 if(!field)return;
 root.MementoDictation?.start?.(field,{button,onState:on=>{quickListening=on;quickPaint();},onStatus:quickMsg});
}
function quickSave(){
 quickStop();const body=quickDraft.trim();
 if(!body){quickMsg("Schrijf of spreek eerst iets in.");host?.querySelector("#kc-quick-text")?.focus();return;}
 if(!write(s=>s.notes.unshift(C.makeNote({body,kind:"note",collectionId:"inbox"},s)))){quickMsg("Opslaan mislukt; je tekst is nog aanwezig. Probeer opnieuw.");return;}
 quickDraft="";notice="Snelle notitie opgeslagen in Inbox.";render();
}
function quickExpand(){
 quickStop();if(!quickDraft.trim()){quickMsg("Schrijf of spreek eerst iets in.");return;}
 selectedId="";editing=C.makeNote({body:quickDraft,kind:"note",collectionId:"inbox"},read());dirty=true;quickDraft="";screen="edit";render();setSaveIndicator("Nog niet opgeslagen");
}
function renderHome(){
 const items=C.search(read(),{sort:'recent'}),pinned=items.filter(n=>n.pinned).slice(0,3);
 return header('Notities',false,btn('+ Nieuw','new','',true))+
 centralSearchBox()+
 '<button type="button" class="kc-inbox" data-kc="inbox">'+symbol('folder')+'<strong>Inbox</strong><span>'+counts('inbox')+' items</span><span aria-hidden="true">›</span></button>'+
 (read().knowledge?.hierarchyVersion!==1?'<p class="kc-muted">Je bestaande verzamelingen zijn behouden.</p>'+btn('Nieuwe indeling toevoegen','migrate'):'')+
 '<div class="kc-section-head"><h3>Verzamelingen</h3><details class="kc-tools"><summary aria-label="Verzamelingen beheren">⋯</summary><div>'+btn('Hoofdverzameling toevoegen','new-collection')+btn('Volgorde wijzigen','sort-roots')+btn('Alle verzamelingen beheren','collections')+'</div></details></div>'+collectionRows(rootCollections(),true)+'<div class="kc-collection-rows"><a class="kc-collection-row kc-art-row" href="https://www.notion.so/02f6147c45b14e00b240b02e69536903" aria-label="Recepten openen in Notion"><span class="kc-collection-icon" aria-hidden="true">'+symbol('book-open')+'</span><span><strong>Recepten</strong><small>Open je recepten in Notion</small></span><span class="kc-card-arrow" aria-hidden="true">↗</span>'+(ArtUI?.cards({name:'Recepten',icon:'book-open',coverId:'recepten'})||'')+'</a></div>'+'<details class="mg-fold kc-quick-optional"'+(quickDraft?' open':'')+'><summary>Snelle notitie</summary><div class="mg-fold-body">'+quickBox()+'</div></details>'+
 (pinned.length?'<div class="kc-section-head"><h3>Vastgezet</h3></div>'+itemRows(pinned):'')+
 '<div class="kc-section-head"><h3>Recent bewaard</h3>'+btn('Alle items','all')+'</div>'+itemRows(items.filter(n=>!pinned.some(p=>p.id===n.id)).slice(0,4))+
 (legacyCollections().length?'<details class="kc-legacy"><summary>Bestaande verzamelingen · '+legacyCollections().length+'</summary><p class="kc-muted">Behouden zonder automatische herindeling. Via Bewerken kies je zelf een bovenliggende verzameling.</p>'+collectionRows(legacyCollections())+'</details>':'')+
 '<details class="mg-fold kc-hub-shortcuts"><summary>Beheer</summary><div class="mg-fold-body">'+btn('Alle items','all')+btn('Archief','archive')+btn('Prullenbak','trash')+btn('Verzamelingen beheren','collections')+'</div></details>';
}
function centralSearchBox(){return '<label class="kc-central-search">Zoek in notities en taken<input type="search" data-kc-input="central-search" value="'+esc(centralQuery)+'" placeholder="Titel, inhoud of tags…" autocomplete="off"></label>';}
function highlight(value,query){const text=String(value||""),word=String(query||"").trim();if(!word)return esc(text);const lower=text.toLocaleLowerCase('nl-NL'),q=word.toLocaleLowerCase('nl-NL');let start=0,out='',i;while((i=lower.indexOf(q,start))!==-1){out+=esc(text.slice(start,i))+'<mark>'+esc(text.slice(i,i+word.length))+'</mark>';start=i+word.length;}return out+esc(text.slice(start));}
function renderCentralSearch(){
 const rows=C.centralSearch(read(),{query:centralQuery,type:centralType,collectionId:centralCollection,status:centralStatus});
 return header('Zoeken',true)+centralSearchBox()+'<div class="kc-central-filters">'+
 '<label>Type<select data-kc-central="type">'+[['','Notities en taken'],['note','Notities'],['task','Taken']].map(([v,l])=>'<option value="'+v+'"'+(centralType===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
 '<label>Status<select data-kc-central="status">'+[['active','Actief / open'],['all','Alle bewaarde items'],['done','Afgeronde taken'],['archive','Archief']].map(([v,l])=>'<option value="'+v+'"'+(centralStatus===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
 '<label>Verzameling<select data-kc-central="collection"><option value="">Alle bestemmingen</option><option value="inbox"'+(centralCollection==='inbox'?' selected':'')+'>Inbox</option>'+allCollections().map(c=>'<option value="'+esc(c.id)+'"'+(centralCollection===c.id?' selected':'')+'>'+esc(pathName(c))+'</option>').join('')+'</select></label></div>'+
 '<div class="kc-filter-status" role="status">'+rows.length+' resultaten · '+esc(centralQuery?'“'+centralQuery+'” · ':'')+esc(centralType==='task'?'Taken':centralType==='note'?'Notities':'Notities en taken')+' · '+esc({active:'Actief / open',all:'Alle bewaarde items',done:'Afgeronde taken',archive:'Archief'}[centralStatus])+(centralCollection?' · '+esc(C.collectionPath(read(),centralCollection)):'')+btn('Filters wissen','central-clear')+'</div>'+
 '<div class="kc-central-results">'+(rows.length?rows.map(x=>'<button class="kc-central-result" type="button" data-kc="search-result" data-kind="'+x.type+'" data-id="'+esc(x.id)+'"><small>'+esc(x.type==='task'?'Taak':'Notitie')+' · '+esc(x.context)+'</small><strong>'+esc(x.title)+'</strong><span>'+highlight(x.snippet===x.title?'':x.snippet,centralQuery)+'</span></button>').join(''):'<p>Geen passende notities of taken.</p>')+'</div><p class="kc-muted">Zoekt lokaal in notities en taken. PDF-inhoud en financiële transacties hebben geen centrale zoekindex.</p>';
}
function breadcrumbs(){
 if(['home','edit','collection-editor','sort'].includes(screen))return '';
 const note=['detail','file','versions'].includes(screen)?read().notes.find(n=>n.id===selectedId):null;
 const cid=note?C.collectionOf(read(),note):collectionId;
 const c=allCollections().find(c=>c.id===cid),parent=c?.parentId?allCollections().find(x=>x.id===c.parentId):null;
 return '<nav class="kc-breadcrumbs" aria-label="Kruimelpad">'+btn('Notities','home')+(parent?'<span>›</span>'+btn(esc(parent.name),'collection',parent.id):'')+(c&&['detail','file','versions'].includes(screen)?'<span>›</span>'+btn(esc(c.name),'collection',c.id):'')+'</nav>';
}
function currentItems(){
 const cid=screen==="collection"?collectionId:screen==="inbox"?"inbox":"";
 const status=screen==="trash"?"trash":screen==="archive"?"archive":screen==="pinned"?"pinned":"active";
 return C.search(read(),{collectionId:cid,query,kind:kindFilter,tag:tagFilter,status,sort:sort==='manual'&&screen!=='collection'?'recent':sort});
}
function renderList(){
 const c=collections().find(x=>x.id===collectionId);
 const title=screen==="collection"?c?.name||"Verzameling":{all:"Alle notities",inbox:"Inbox",archive:"Archief",trash:"Prullenbak",pinned:"Vastgezet"}[screen]||"Notities";
 const availableTags=[...new Set(read().notes.flatMap(n=>n.tags||[]))].sort((a,b)=>a.localeCompare(b,"nl"));
 const items=currentItems(),mode=viewOverride||c?.view||"list";
 if(screen==='collection'&&c?.special==='journal')return renderJournal(c);
 const subs=screen==='collection'?children(collectionId):[];
 const filtered=Boolean(query||kindFilter||tagFilter),direct=screen==='collection'?C.collectionCounts(read(),collectionId).direct:items.length;
 const tools=screen==='collection'?'<div class="kc-collection-actions"><details class="kc-tools"><summary aria-label="Instellingen van deze verzameling">⋯</summary><div>'+btn('Bewerken','edit-collection',collectionId)+(C.collectionPath(read(),collectionId).split(' / ').length<3?btn('Submap toevoegen','new-sub',collectionId)+btn('Volgorde wijzigen','sort-children',collectionId):'')+(workspaceReady()?btn('Standaardsjabloon','ws-map-template')+btn('Map verwijderen','ws-delete-folder'):'')+'</div></details></div>':'';
 const searchTools='<div class="kc-search-tools"><label class="kc-search"><span class="kc-sr">Zoek in deze notities</span><input type="search" data-kc-input="search" placeholder="Zoek in deze notities…" value="'+esc(query)+'"></label>'+
 '<details id="kc-filter-drawer" class="kc-filter-drawer"'+(filtersExpanded?' open':'')+'><summary>Filters'+(kindFilter||tagFilter?' · actief':'')+'</summary><div class="kc-filters">'+
 '<div class="kc-filterline"><label>Type<select data-kc-change="kind"><option value="">Alles</option>'+Object.entries(kindNames).map(([v,n])=>'<option value="'+v+'"'+(kindFilter===v?" selected":"")+">"+n+"</option>").join("")+"</select></label>"+
 '<label>Tag<select data-kc-change="tag"><option value="">Alle tags</option>'+availableTags.map(v=>'<option value="'+esc(v)+'"'+(tagFilter===v?" selected":"")+">"+esc(v)+"</option>").join("")+"</select></label>"+
 '<label>Sortering<select data-kc-change="sort"><option value="recent"'+(sort==="recent"?" selected":"")+'>Recent</option><option value="title"'+(sort==="title"?" selected":"")+'>Titel</option><option value="old"'+(sort==="old"?" selected":"")+'>Oudste</option>'+(screen==='collection'?'<option value="manual"'+(sort==='manual'?' selected':'')+'>Handmatig</option>':'')+'</select></label></div>'+
 '<div class="kc-mode-switch" role="group" aria-label="Weergave">'+btn("Lijst","mode","list",mode==="list")+btn("Galerij","mode","gallery",mode==="gallery")+btn("Tabel","mode","table",mode==="table")+'</div>'+btn('Wis filters','clear-filters')+'</div></details></div>';
 const summary=screen==='collection'?counts(collectionId)+' notities'+(subs.length?' · '+subs.length+' subverzamelingen':''):items.length+' notities';
 return header(title,true,tools)+
 '<div class="kc-list-summary"><p class="kc-count">'+summary+'</p>'+(screen==='trash'?btn('Definitief leegmaken','purge-trash'):direct||subs.length||filtered||['archive','pinned'].includes(screen)?btn('+ Nieuw','new','',true):'')+'</div>'+
 (subs.length?'<details class="kc-compact-fold"><summary>Submappen · '+subs.length+'</summary>'+collectionRows(subs)+'</details>':'')+
 (direct||!subs.length?(subs.length?'<h3 class="kc-content-caption">Rechtstreekse notities</h3>':'')+searchTools+itemRows(items.slice(0,100),mode,{filtered,create:!['archive','trash','pinned'].includes(screen)})+(items.length>100?'<p class="kc-muted">Eerste 100 van '+items.length+' notities. Zoek of filter om te verfijnen.</p>':''):'')+(workspaceReady()&&screen==='collection'?renderWorkspaceWidgets(collectionId):'');
}
function renderCollections(){
 return header('Verzamelingen beheren',true,btn('+ Nieuwe','new-collection','',true))+
 '<p class="kc-muted">Archiveren verbergt een verzameling; alle inhoud en subverzamelingen blijven bewaard. Er worden geen verzamelingen definitief verwijderd.</p><div class="kc-manage-collections">'+allCollections().map(c=>'<div class="kc-manage-row"><span class="kc-manage-name">'+collectionIcon(c)+'<span><strong>'+esc(pathName(c))+'</strong><small>'+(c.archived?'Gearchiveerd':c.parentId?'Subverzameling':c.parentId===null?'Hoofdverzameling':'Nog in te delen')+'</small></span></span>'+btn(c.archived?'Herstellen':'Bewerk',c.archived?'restore-collection':'edit-collection',c.id)+'</div>').join('')+'</div>';
}
function openCollectionEditor(id='',parentId=null){
 const c=allCollections().find(c=>c.id===id);collectionId=id;ArtUI?.start(c);colDraft={id,name:c?.name||'',icon:iconAliases[c?.icon]||c?.icon||'folder',view:c?.view||'list',parentId:c?.parentId||parentId||'',coverFile:c?.coverFile||null,dirty:false};screen='collection-editor';render();
}
function renderCollectionEditor(){
 const d=colDraft;if(!d)return '';const c=allCollections().find(c=>c.id===d.id);
 return '<div class="kc-editor-head">'+header(c?'Verzameling bewerken':'Nieuwe verzameling',true,btn('Opslaan','save-collection','',true))+'</div>'+
 '<form id="kc-collection-form" class="kc-editor-fields"><label>Naam<input maxlength="80" id="kc-col-name" data-kc-col="name" value="'+esc(d.name)+'" required></label>'+
 '<label>Bovenliggende verzameling<select id="kc-col-parent" data-kc-col="parentId"><option value="">Geen · hoofdverzameling</option>'+collections().filter(x=>x.id!==d.id&&C.collectionPath(read(),x.id).split(' / ').length<3&&(!d.id||!C.descendants(read(),d.id).has(x.id))).map(x=>'<option value="'+esc(x.id)+'"'+(d.parentId===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></label>'+
 '<label>Standaardweergave<select id="kc-col-view" data-kc-col="view">'+[['list','Lijst'],['gallery','Galerij'],['table','Tabel']].map(([id,label])=>'<option value="'+id+'"'+(d.view===id?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
 '<fieldset class="kc-icon-picker"><legend>Pictogram</legend><div role="group" aria-label="Kies een pictogram">'+collectionIconChoices(d)+'</div></fieldset>'+(ArtUI?.render(d,allCollections().find(x=>x.id===d.parentId)?.name||'')||'')+
 '<div class="kc-editor-actions">'+btn('Annuleren','cancel-collection')+(c?btn('Archiveren','archive-collection',c.id):'')+'</div></form>';
}

const diaryScenes=["schemermeer.webp","zonnestralen.webp","maanmeer.webp","ochtendmist.webp","herfstbrug.webp","bosruines.webp"];
const diaryQuestions=["Wat ging er vandaag goed?","Wat kostte je vandaag energie?","Waar ben je dankbaar voor?","Wat heb je geleerd?","Wat heeft je verrast?","Wat gaf je rust?","Wat wil je onthouden?","Wat wil je morgen anders doen?","Waar was je trots op?"];
function diaryOffset(day,delta){const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10);}
function diaryScene(day){const n=Math.floor(Date.parse(day+"T12:00:00Z")/86400000);return diaryScenes[((n%6)+6)%6];}
function journalLabel(date){return new Date(date+"T12:00:00Z").toLocaleDateString("nl-NL",{timeZone:"Europe/Amsterdam",weekday:"long",day:"numeric",month:"long",year:"numeric"});}
function diaryHero(date){return '<div class="kc-diary-hero"><img src="./assets/pin-forests/'+diaryScene(date)+'" alt="" decoding="async"><div><span>MEMENTO · LEVENSPAD</span><strong>Een moment voor jezelf</strong></div></div>';}
function diaryWeek(date){
 const marked=new Set(read().notes.filter(n=>!n.deletedAt&&n.journal).map(n=>n.journal.date));
 return '<nav class="kc-diary-week" aria-label="Dagboekdagen"><button type="button" data-kc="journal-move" data-id="-7" aria-label="Vorige week">‹</button><div class="kc-diary-days">'+
 Array.from({length:7},(_,i)=>{const d=diaryOffset(date,i-3),t=new Date(d+"T12:00:00Z");return '<button type="button" data-kc="journal-jump" data-id="'+d+'" aria-label="'+esc(journalLabel(d))+'" aria-current="'+(d===date?"date":"false")+'" class="'+(d===date?"selected":"")+'"><small>'+t.toLocaleDateString("nl-NL",{timeZone:"UTC",weekday:"short"}).replace(".","")+'</small><strong>'+t.getUTCDate()+'</strong><i class="'+(marked.has(d)?"written":"")+'"></i></button>';}).join("")+'</div><button type="button" data-kc="journal-move" data-id="7" aria-label="Volgende week">›</button></nav>';
}
function diarySummary(j){
 const m=j?.manualHealth||{},h=j?.health||{},parts=[],sleep=m.sleepMinutes??h.sleepMinutes,steps=m.steps??h.steps;
 if(sleep!==undefined)parts.push("Slaap "+Math.floor(sleep/60)+"u "+String(sleep%60).padStart(2,"0")+"m");
 if(steps!==undefined)parts.push(steps.toLocaleString("nl-NL")+" stappen");
 if(!parts.length&&m.sleepScore!==undefined)parts.push("Slaapscore "+m.sleepScore);
 if(!parts.length&&(m.exerciseMinutes??h.exerciseMinutes)!==undefined)parts.push("Training "+(m.exerciseMinutes??h.exerciseMinutes)+" min");
 if(!parts.length&&(m.restingHeartRateBpm??h.restingHeartRateBpm)!==undefined)parts.push("Rusthartslag "+(m.restingHeartRateBpm??h.restingHeartRateBpm)+" bpm");
 return parts.join(" · ")||"Samsung Health";
}
function diaryHealth(j){
 const m=j.manualHealth||{},h=j.health,android=/Android/i.test(navigator.userAgent);
 const healthAppLink="https://shealth.samsung.com/deepLink?sc_id=app.main";
 const openLink=android?"intent://shealth.samsung.com/deepLink?sc_id=app.main#Intent;scheme=https;action=android.intent.action.VIEW;package=com.sec.android.app.shealth;end":healthAppLink;
 const numeric=(key,title,max,min=0,wide=false)=>'<label'+(wide?' class="kc-diary-health-wide"':'')+'>'+title+'<input type="number" inputmode="numeric" min="'+min+'" max="'+max+'" step="1" data-kc-manual-health="'+key+'" value="'+esc(m[key]??"")+'" placeholder="—"></label>';
 const sleep=m.sleepMinutes===undefined?null:m.sleepMinutes;
 const sleepField=(key,label,value,max)=>'<label>'+label+'<input type="number" inputmode="numeric" min="0" max="'+max+'" step="1" data-kc-manual-health="'+key+'" value="'+esc(value??"")+'" placeholder="—"></label>';
 const imported=[["steps","Stappen",v=>v.toLocaleString("nl-NL")],["sleepMinutes","Slaap",v=>Math.floor(v/60)+"u "+String(v%60).padStart(2,"0")+"m"],["restingHeartRateBpm","Rusthartslag",v=>v+" bpm"],["exerciseMinutes","Training",v=>v+" min"]];
 return '<details class="kc-diary-health"><summary><span class="kc-diary-health-icon" aria-hidden="true">♡</span><span><strong>Gezondheid & welzijn</strong><small id="kc-diary-summary">'+esc(diarySummary(j))+'</small></span><b aria-hidden="true">⌄</b></summary><div class="kc-diary-health-body">'+
 '<div class="kc-diary-health-source"><span>Samsung Health</span><a class="kc-diary-health-link" data-kc="journal-health-open" href="'+esc(openLink)+'" rel="noopener noreferrer">Open Samsung Health <span aria-hidden="true">↗</span></a></div>'+
 '<section class="kc-diary-health-section"><h4>Slaap</h4><div class="kc-diary-health-grid">'+
 sleepField("sleepHours","Uren geslapen",sleep===null?null:Math.floor(sleep/60),35)+
 sleepField("sleepRestMinutes","Minuten",sleep===null?null:sleep%60,59)+
 numeric("sleepScore","Slaapscore",100,0,true)+
 '</div></section>'+
 '<section class="kc-diary-health-section"><h4>Activiteit</h4><div class="kc-diary-health-grid">'+
 numeric("steps","Stappen",200000)+numeric("exerciseMinutes","Training · min",1440)+
 '</div></section>'+
 '<section class="kc-diary-health-section"><h4>Hart</h4><div class="kc-diary-health-grid">'+
 numeric("restingHeartRateBpm","Rusthartslag · bpm",250,20,true)+
 '</div></section>'+
 (h?'<details class="kc-diary-health-import"><summary>Eerdere import</summary><div>'+imported.filter(([key])=>h[key]!==undefined).map(([key,label,format])=>'<div class="kc-diary-health-metric"><span>'+label+'</span><strong>'+esc(format(h[key]))+'</strong></div>').join("")+'<small>'+esc(h.source==="samsung-health"?"Samsung Health":"Health Connect")+' · '+esc(new Date(h.importedAt).toLocaleString("nl-NL"))+'</small></div></details>':'')+
 '</div></details>';
}
function diaryPrompts(date){const seed=Math.floor(Date.parse(date+"T12:00:00Z")/86400000);return '<div class="kc-diary-prompts"><div class="kc-diary-heading"><strong>✧ Reflectievragen</strong><small>optioneel</small></div>'+[0,1,2].map(i=>{const q=diaryQuestions[((seed+i*3)%9+9)%9];return '<button type="button" data-kc="journal-prompt" data-id="'+esc(q)+'"><span>'+esc(q)+'</span><b>＋</b></button>';}).join("")+'</div>';}
function diaryDictationUI(){
 return '<div class="kc-diary-dictation"><button class="kc-btn'+(diaryDictating?' kc-dictating':'')+'" type="button" data-kc="journal-speech" aria-pressed="'+diaryDictating+'" aria-label="'+(diaryDictating?'Stop transcriberen':'Start transcriberen')+'">'+(diaryDictating?'■ Stop':'◉ Transcriberen')+'</button><span id="kc-diary-speech-status" role="status" aria-live="polite"></span></div>';
}
function diarySpeechStatus(message){
 const el=host?.querySelector("#kc-diary-speech-status");if(el)el.textContent=message;
}
function paintDiarySpeech(){
 const el=host?.querySelector('[data-kc="journal-speech"]');if(!el)return;
 el.classList.toggle("kc-dictating",diaryDictating);
 el.setAttribute("aria-pressed",String(diaryDictating));
 el.setAttribute("aria-label",diaryDictating?"Stop transcriberen":"Start transcriberen");
 el.textContent=diaryDictating?"■ Stop":"◉ Transcriberen";
}
function diarySpeechEditor(){
 return screen==="edit"&&Boolean(editing?.journal)&&root.MementoDictation?.isActive(host?.querySelector("#kc-body"));
}
function stopDiaryDictation(message="",keepPreview=true){
 if(diaryDictating)root.MementoDictation?.stop?.({discardPreview:!keepPreview,message});
 diaryDictating=false;paintDiarySpeech();
}
function toggleDiaryDictation(){
 const field=host?.querySelector("#kc-body"),button=host?.querySelector('[data-kc="journal-speech"]');
 if(!editing?.journal||!field)return;
 root.MementoDictation.start(field,{button,onState:on=>{diaryDictating=on;paintDiarySpeech();},onStatus:diarySpeechStatus});
}
function diaryAI(){
 const android=/Android/i.test(navigator.userAgent);
 return '<section class="kc-diary-ai"><div class="kc-diary-heading"><strong>✧ AI-schrijfhulp</strong><small>Gratis kopiëren</small></div><p>Kopieer de opdracht, open ChatGPT en plak hem daar. Het resultaat kun je na controle terugplakken in Memento.</p><div>'+btn("1. Kopieer opdracht","journal-ai-copy")+
 '<a class="kc-btn kc-primary" href="'+(android?"intent://chatgpt.com/#Intent;scheme=https;package=com.openai.chatgpt;end":"https://chatgpt.com/")+'" rel="noopener noreferrer">2. Open ChatGPT'+(android?"-app":"")+'</a></div><small id="kc-ai-status" role="status">Niets wordt automatisch verzonden of vervangen.</small></section>';
}
function renderJournal(c){
 const today=C.journalDate(),day=journalFilter||today,days=read().notes.filter(n=>!n.deletedAt&&!n.archived&&n.journal?.version===1&&C.collectionOf(read(),n)===c.id&&n.journal.date<today&&(!journalSearch||[n.title,n.body,(n.tags||[]).join(' '),n.journal.date].join(' ').toLocaleLowerCase('nl-NL').includes(journalSearch.toLocaleLowerCase('nl-NL')))).sort((a,b)=>b.journal.date.localeCompare(a.journal.date)),note=C.findJournal(read(),day);
 return header("Mijn dagboek",true,btn("Vandaag","journal-today",c.id))+
 diaryHero(day)+diaryWeek(day)+
 '<div class="kc-diary-selected"><div><small>'+(day===today?"VANDAAG":"GEKOZEN DAG")+'</small><h3>'+esc(journalLabel(day))+'</h3></div>'+btn(note?"Open dag":"Schrijf","journal-date-open",day,true)+'</div>'+
 (note?'<button class="kc-diary-daypreview" type="button" data-kc="journal-date-open" data-id="'+day+'"><strong>'+esc(note.title===day?"Dagboek":note.title)+'</strong><small>'+esc(diarySummary(note.journal))+'</small><span>'+esc(note.body.slice(0,160)||"Check-in of opname bekijken")+'</span></button>':'<p class="kc-diary-empty">Nog niets vastgelegd voor deze dag. Een gemiste dag is geen probleem.</p>')+
 '<label class="kc-journal-search">Zoek in eerdere dagen<input type="search" data-kc-input="journal-search" value="'+esc(journalSearch)+'" placeholder="Tekst, tag of datum…"></label><div class="kc-diary-heading kc-diary-history-title"><strong>Eerdere dagen</strong>'+btn("Beheer","edit-collection",c.id)+'</div>'+
 (days.length?'<div class="kc-diary-history">'+days.slice(0,20).map(n=>'<button type="button" data-kc="journal-open" data-id="'+esc(n.id)+'"><span style="background-image:url(./assets/pin-forests/'+diaryScene(n.journal.date)+')"></span><span><strong>'+esc(journalLabel(n.journal.date))+'</strong><small>'+esc(diarySummary(n.journal))+'</small><small>'+esc((n.body||'').slice(0,90))+'</small></span><b>›</b></button>').join("")+'</div>':'<p class="kc-diary-empty">Je eerdere dagboekdagen verschijnen hier.</p>');
}
function openJournal(day){
 stopDiaryDictation();const existing=C.findJournal(read(),day);if(existing){collectionId=C.collectionOf(read(),existing);startEdit(existing.id);return;}
 const target=allCollections().find(c=>c.id===collectionId&&c.special==="journal")||collections().find(c=>c.special==="journal");
 if(!target){notify("Open eerst je dagboekverzameling.");return;}
 beginNew(target.id);editing.journal={version:1,date:day,mood:""};editing.title="";dirty=false;render();
}
function renderJournalEditor(){
 const e=editing,j=e.journal;
 return '<div class="kc-editor-head">'+header("Mijn dagboek",true,btn(focusWriting?"Normaal":"Schrijfstand","writing-mode")+btn("Sluiten","save","",true))+'</div>'+
 '<p id="kc-save-state" class="kc-save-state" role="status">'+(dirty?"Niet opgeslagen":selectedId?"Opgeslagen":"Concept · nog niet opgeslagen")+'</p>'+
 diaryWeek(j.date)+'<div class="kc-diary-selected"><div><small>DAGBOEK</small><h3>'+esc(journalLabel(j.date))+'</h3></div></div>'+

 '<section class="kc-diary-write"><div class="kc-diary-heading"><strong>✎ Mijn verhaal</strong><small>Vrij schrijven</small></div><label for="kc-body" class="kc-sr">Dagboektekst</label><textarea id="kc-body" data-kc-edit="body" maxlength="20000" rows="9" placeholder="Wat heb je vandaag meegemaakt?">'+esc(e.body)+'</textarea>'+diaryDictationUI()+'<label>Titel · optioneel<input id="kc-title" data-kc-edit="title" maxlength="180" value="'+esc(e.title===j.date?"":e.title)+'" placeholder="Titel van deze dag"></label><label>Tags · optioneel<input data-kc-edit="tags" maxlength="1000" value="'+esc((e.tags||[]).join(", "))+'"></label><div class="kc-diary-actions">'+btn("Versiegeschiedenis","versions")+'</div></section>'+
 diaryHealth(j)+'<details class="kc-diary-optional"><summary>Reflectievragen · optioneel</summary>'+diaryPrompts(j.date)+'</details>'+diaryAI()+attachmentsHTML(e)+'<div class="kc-editor-actions">'+btn("Sluiten","cancel-journal")+btn("Concept verwerpen","discard-draft")+'</div>';
}
function renderSort(){
 const list=sortState?.ids||[];
 return header('Volgorde wijzigen',true,btn('Klaar','sort-done','',true))+'<p class="kc-muted">Houd de sleepgreep even vast en versleep. Alleen de volgorde in deze verzameling verandert. Je kunt ook de pijlen gebruiken.</p><div class="kc-sort-list" role="list">'+list.map((id,i)=>{const c=allCollections().find(c=>c.id===id);return '<div class="kc-sort-row" role="listitem" data-sort-id="'+esc(id)+'"><button type="button" class="kc-drag-handle" data-drag-id="'+esc(id)+'" aria-label="Versleep '+esc(c.name)+'">⠿</button>'+collectionIcon(c)+'<strong>'+esc(c.name)+'</strong><div><button type="button" class="kc-btn" data-kc="sort-up" data-id="'+esc(id)+'" aria-label="'+esc(c.name)+' omhoog"'+(i===0?' disabled':'')+'>↑</button><button type="button" class="kc-btn" data-kc="sort-down" data-id="'+esc(id)+'" aria-label="'+esc(c.name)+' omlaag"'+(i===list.length-1?' disabled':'')+'>↓</button></div></div>';}).join('')+'</div>';
}
function attachmentsHTML(n){
 if(!(n.attachments||[]).length)return "";
 return '<div class="kc-attachments"><h3>Bijlagen</h3>'+
 n.attachments.map(a=>'<div class="kc-attachment"><span aria-hidden="true">'+(a.type==="application/pdf"?"▣":String(a.type).startsWith("audio/")?"♫":"▧")+'</span><button type="button" data-kc="file" data-id="'+esc(a.id)+'">'+esc(a.name)+'</button><small>'+Math.round(a.size/1024)+' KB</small>'+
 (screen==="edit"?'<button type="button" data-kc="remove-file" data-id="'+esc(a.id)+'" aria-label="Bijlage loskoppelen">×</button>':"")+'</div>').join("")+"</div>";
}
function linkedHTML(n){
 const links=[...(n.links||[]),...(n.conversions||[]).map(l=>({kind:l.kind,id:l.id}))];
 if(!links.length)return "";
 return '<div class="kc-related"><h3>Verbonden met</h3>'+links.map(l=>{
  const other=l.kind==="note"?read().notes.find(x=>x.id===l.id):l.kind==="task"?read().tasks.find(x=>x.id===l.id):null;
  const state=l.kind==="task"?(other?.deletedAt?"Verwijderd · herstelbaar":other?.archived?"Archief":other?.done?"Afgerond":"Open"):"";
  return '<button type="button" data-kc="related" data-kind="'+esc(l.kind)+'" data-id="'+esc(l.id)+'">'+esc((state?"Taak · "+state+" · ":"")+(other?.title||{task:"Taak",appointment:"Afspraak",wish:"Aankoopwens"}[l.kind]||"Gekoppeld item"))+' <span aria-hidden="true">↗</span></button>';
 }).join("")+"</div>";
}
function ingredientRows(recipe){return (Array.isArray(recipe?.ingredients)?recipe.ingredients:[]).map(x=>({...x,amount:root.MementoReviewCore.scale(x.amount,recipeFactor)}));}
function recipeHTML(r){
 const ingredients=ingredientRows(r),checked=recipeChecks.get(selectedId)||new Set();
 return '<section class="kc-recipe"><div class="kc-recipe-hero"><span>RECEPTKAART</span><strong>'+esc(r?.status||"concept")+' · versie '+esc(r?.version||1)+'</strong></div><div class="mg-recipe-tools"><label>Hoeveelheid<select data-mg-recipe-scale>'+[[1,'Origineel · ×1'],[.5,'Halve hoeveelheid'],[2,'Dubbele hoeveelheid'],[3,'Drievoudige hoeveelheid']].map(([v,label])=>'<option value="'+v+'"'+(recipeFactor===v?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+btn('Kies voor boodschappen','recipe-shop')+'</div><h3>Ingrediënten</h3>'+
 (ingredients.length?ingredients.map((x,i)=>'<label class="mg-recipe-check"><input type="checkbox" data-mg-cook="'+i+'"'+(checked.has(i)?' checked':'')+'><span>'+esc(x.name)+' · '+esc(x.amount)+' '+esc(x.unit)+'</span></label>').join(''):'<p class="kc-muted">Nog geen ingrediënten vastgelegd.</p>')+
 (r?.notes?'<details class="mg-fold"><summary>Testnotities</summary><p class="mg-fold-body">'+esc(r.notes)+'</p></details>':'')+'</section>';
}
function renderRecipeShop(){const note=read().notes.find(n=>n.id===selectedId);if(!note)return header('Recept niet gevonden',true);const rows=ingredientRows(note.recipe);return header('Ingrediënten kiezen',true,btn('Op boodschappenlijst','recipe-shop-confirm','',true))+'<div class="life-panel">'+rows.map((x,i)=>'<label class="mg-recipe-check"><input data-mg-shop="'+i+'" type="checkbox" checked><span>'+esc(x.name)+' · '+esc(x.amount)+' '+esc(x.unit)+'</span></label>').join('')+'</div>';}
function recipeEditRows(recipe){return '<div id="mg-recipe-rows">'+(recipe.ingredients||[]).map((x,i)=>'<div class="mg-recipe-row">'+[['name','Ingrediënt',120],['amount','Hoeveelheid',40],['unit','Eenheid',40]].map(([key,label,max])=>'<label>'+label+'<input data-mg-ingredient="'+i+'" data-key="'+key+'" maxlength="'+max+'" value="'+esc(x[key])+'"></label>').join('')+btn('×','recipe-remove',i)+'</div>').join('')+'</div>'+btn('+ Ingrediënt','recipe-add');}

function followupLinksForNote(n,skipDisplayedOrigin=false){
 const origin=skipDisplayedOrigin?null:n.mementoFlow?.origin;
 const next=[['note',read().notes],['task',read().tasks],['appointment',read().appointments||[]]]
  .flatMap(([kind,items])=>items.filter(x=>!x.deletedAt&&x.mementoFlow?.origin?.kind==='note'&&x.mementoFlow.origin.id===n.id)
   .map(x=>({kind,id:x.id,title:x.title})));
 if(!origin&&!next.length)return '';
 const link=(kind,id,label)=>btn(esc(label),'followup-open',kind+'|'+id);
 return '<section class="kc-detail-actions"><strong>Opvolging</strong>'+
  (origin?link(origin.kind,origin.id,'Bron: '+origin.title):'')+
  next.map(x=>link(x.kind,x.id,'Vervolg: '+x.title)).join('')+'</section>';
}
function renderDetail(){
 const n=read().notes.find(x=>x.id===selectedId);
 if(!n)return header("Notitie niet gevonden",true)+"<p>Dit kennisitem is niet meer beschikbaar.</p>";
 const cid=C.collectionOf(read(),n);
 const actions=n.deletedAt?btn("Herstellen","restore",n.id,true):btn("Meer opties","edit",n.id,true);
 const direct=!n.deletedAt&&!n.journal&&C.typeOf(n)==="note"&&!workspaceReady();
 if(workspaceReady()&&n.document&&!n.deletedAt&&!n.journal){if(!editing||editing.id!==n.id||!dirty){editing=C.clone(n);dirty=false;rememberBase();}return renderEditor();}
 if(direct&&(!editing||editing.id!==n.id||!dirty)){editing=C.clone(n);editing.collectionId=cid;dirty=false;rememberBase();}
 const original=safeURL(n.sourceUrl||"");
 const check=C.typeOf(n)==="checklist"?'<p class="mg-chip">'+C.checklistItems(n).filter(x=>x.done).length+' van '+C.checklistItems(n).length+' afgevinkt</p><div class="kc-checklist">'+C.checklistItems(n).slice().sort((a,b)=>Number(a.done)-Number(b.done)).map(item=>'<label class="kc-check"><input data-kc-check="'+esc(item.id)+'" data-note="'+esc(n.id)+'" type="checkbox"'+(item.done?" checked":"")+(n.deletedAt?" disabled":"")+'><span>'+esc(item.text)+'</span></label>').join("")+"</div>":"";
 return header(n.journal?journalLabel(n.journal.date):n.body?.trim()===n.title.trim()?"Notitie":n.title,true,actions)+
 (n.journal?'<p class="kc-muted">'+esc(n.journal.mood||'Geen stemming')+'</p>':'')+
 '<div class="kc-detail-meta"><span>'+esc(collectionName(cid))+"</span><span>·</span><span>"+esc(kindNames[C.typeOf(n)]||"Notitie")+"</span><span>·</span><span>"+readable(n.updatedAt||n.createdAt)+"</span></div>"+
 '<div class="kc-tagline">'+chips(n.tags)+'</div>'+
 (C.typeOf(n)==="recipe"?recipeHTML(n.recipe):"")+
 (direct?'<div class="kc-editor-fields kc-direct-editor"><label>Titel · optioneel<input id="kc-title" data-kc-edit="title" maxlength="180" value="'+esc(n.body?.trim()===n.title.trim()?"":editing.title)+'"></label><label>Verzameling<select id="kc-collection" data-kc-edit="collectionId"><option value="inbox"'+(editing.collectionId==="inbox"?' selected':'')+'>Inbox</option>'+collections().map(c=>'<option value="'+esc(c.id)+'"'+(editing.collectionId===c.id?' selected':'')+'>'+esc(pathName(c))+'</option>').join('')+'</select></label><label for="kc-body">Inhoud</label><textarea id="kc-body" data-kc-edit="body" maxlength="20000">'+esc(editing.body)+'</textarea><p id="kc-save-state" class="kc-save-state" role="status">'+(dirty?'Concept':'Opgeslagen')+'</p>'+btn('Opslaan','save','',true)+'</div>':check||'<div class="kc-readable">'+markdown(n.body)+"</div>")+
 (original?'<a class="kc-source" href="'+esc(original)+'" target="_blank" rel="noopener noreferrer">Bron openen ↗</a>':"")+
 attachmentsHTML(n)+(workspaceReady()&&n.document?renderDocumentRead(n.document):"")+linkedHTML(n)+followupLinksForNote(n)+(n.deletedAt?'':passageActions())+
 (n.deletedAt?"":'<div class="kc-detail-actions">'+(workspaceReady()?btn("Visueel bewerken","ws-convert",n.id)+btn("Mappen koppelen","ws-locations"):"")+btn(n.pinned?"Losmaken":"Vastzetten","pin",n.id)+btn(n.archived?"Terug uit archief":"Archiveren","archive-item",n.id)+btn("Koppelen","link",n.id)+(n.journal?"":btn("Onderzoeken met AI","ai",n.id))+
 '<details class="kc-note-menu"><summary aria-label="Notitie beheren">⋯</summary><div>'+btn("Versiegeschiedenis","versions")+btn("Concept verwerpen","discard-draft")+btn("Slim opvolgen","followup-start",n.id)+btn("Als taak","convert-task",n.id)+btn("Als afspraak","convert-appointment",n.id)+btn("Als aankoopwens","convert-wish",n.id)+btn("Verwijderen","delete",n.id)+'</div></details></div>');
}
function kcV3Icon(name){
 const icons={
  folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/>',
  branch:'<circle cx="6" cy="4" r="2"/><path d="M6 6v12"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="6" r="2"/><path d="M18 8a6 6 0 0 1-6 6H6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.4l3-3a5 5 0 0 0-7-7l-2 2"/><path d="M14 11a5 5 0 0 0-7.5-.4l-3 3a5 5 0 0 0 7 7l2-2"/>',
  file:'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5"/>',
  paperclip:'<path d="m19 12-7 7a5 5 0 0 1-7-7L13 4a3 3 0 0 1 4 4l-8 8a1 1 0 0 1-2-2l7-7"/>',
  task:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>',
  more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  right:'<path d="m9 6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
 };
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.file)+'</svg>';
}
function kcV3Sheet(id,title,body){
 return '<dialog id="'+id+'" class="kc-v3-sheet" aria-label="'+esc(title)+'"><div class="kc-v3-sheet-handle" aria-hidden="true"></div><div class="kc-v3-sheet-head"><h3>'+esc(title)+'</h3><button type="button" class="kc-v3-sheet-close" data-kc="editor-sheet-close" aria-label="Sluiten">×</button></div>'+body+'</dialog>';
}
function kcV3SingleTextDocument(note){
 const blocks=note?.document?.blocks;
 return Array.isArray(blocks)&&blocks.length===1&&blocks[0]?.type==='text'&&!(blocks[0].marks||[]).length;
}
function renderEditor(){
 const e=editing;if(!e)return "";if(e.journal)return renderJournalEditor();
 const type=C.typeOf(e),isRecipe=type==="recipe",isLink=type==="link",life=read();
 const tags=(e.tags||[]).join(", "),cid=C.collectionOf(life,e);
 const recipe=e.recipe||{ingredients:[],status:"concept",version:1,notes:""};
 const more='<button type="button" class="kc-v3-more-trigger" data-kc="editor-menu" aria-label="Meer kennisitemacties" aria-haspopup="dialog">'+kcV3Icon('more')+'</button>';
 const title='<label class="kc-v3-field-group">Titel<input id="kc-title" data-kc-edit="title" maxlength="180" placeholder="Titel of onderwerp" value="'+esc(e.title==="Naamloze notitie"&&!selectedId?"":e.title)+'"></label>';
 const kind='<label class="kc-v3-field-group">Type<select data-kc-edit="kind" id="kc-kind">'+Object.entries(kindNames).filter(([key])=>key!=="pdf"&&key!=="image").map(([key,label])=>'<option value="'+key+'"'+(type===key?" selected":"")+">"+label+"</option>").join("")+"</select></label>";
 const collection='<label class="kc-v3-field-group">Verzameling<select data-kc-edit="collectionId" id="kc-collection">'+
 '<option value="inbox"'+(cid==="inbox"?" selected":"")+'>Inbox</option>'+
 collections().map(c=>'<option value="'+esc(c.id)+'"'+(cid===c.id?" selected":"")+">"+esc(pathName(c))+"</option>").join("")+"</select></label>";
 const toolbar='<div class="kc-v3-format" role="toolbar" aria-label="Tekst bewerken">'+
 '<button type="button" data-kc="format" data-id="# " title="Kop">H1</button>'+
 '<button type="button" data-kc="format" data-id="**" title="Vet"><strong>Vet</strong></button>'+
 '<button type="button" data-kc="format" data-id="- " title="Lijst">☷ Lijst</button>'+
 '<button type="button" data-kc="format" data-id="[tekst](https://)" title="Link">'+kcV3Icon('link')+' Link</button>'+
 '<button type="button" class="kc-v3-text-task" data-kc="selection-task" title="Taak van geselecteerde tekst">'+kcV3Icon('task')+' Taak</button></div>';
 const body=e.document&&!kcV3SingleTextDocument(e)
  ?'<span class="kc-v3-content-label">Inhoud</span><div class="kc-v3-editor-pane kc-v3-block-pane">'+renderVisualDocument()+'</div>'+renderTemplateFields(e)
  :'<label class="kc-v3-content-label" for="kc-body">Inhoud</label><div class="kc-v3-editor-pane">'+toolbar+
    '<textarea id="kc-body" data-kc-edit="body" maxlength="20000" rows="11" placeholder="Schrijf je notitie…">'+esc(e.body||"")+'</textarea></div>'+
    '<div class="kc-v3-helper-bar"><span>Selecteer tekst en kies Taak om die te verwerken.</span>'+(root.MementoDictation?.button?.("kc-body")||"")+btn("Voorbeeld","preview")+'</div>'+(e.document?renderTemplateFields(e):'');
 const recipeFields=isRecipe?'<div class="kc-recipe-fields"><h3>Receptgegevens</h3><label>Status<select data-kc-edit="recipeStatus"><option value="concept"'+(recipe.status==="concept"?" selected":"")+'>Concept</option><option value="testen"'+(recipe.status==="testen"?" selected":"")+'>Testen</option><option value="definitief"'+(recipe.status==="definitief"?" selected":"")+'>Definitief</option></select></label>'+recipeEditRows(recipe)+
  '<details class="mg-fold"><summary>Tekstinvoer ingrediënten</summary><label>Ingrediënten (één per regel, met | als scheiding)<textarea data-kc-edit="ingredients" rows="4">'+esc((recipe.ingredients||[]).map(x=>[x.name,x.amount,x.unit].join(" | ")).join("\n"))+'</textarea></label></details>'+
  '<label>Testnotities<textarea data-kc-edit="recipeNotes" rows="3">'+esc(recipe.notes||"")+'</textarea></label></div>':"";
 const tagsHTML=e.tags?.length?e.tags.map(t=>'<span class="kc-v3-chip">#'+esc(t)+'</span>').join(""):'Geen labels';
 const origin=e.mementoFlow?.origin,source=origin?.title||"";
 const originHTML=source?'<button type="button" class="kc-v3-related" data-kc="followup-open" data-id="'+esc(origin.kind+'|'+origin.id)+'">'+kcV3Icon(origin.kind==="appointment"?"calendar":"link")+'<span><strong>Bron: '+esc(source)+'</strong><small>De oorspronkelijke '+(origin.kind==="appointment"?"afspraak":"informatie")+' blijft apart bestaan.</small></span></button>':"";
 const actionButtons='<div class="kc-v3-row-actions">'+
 '<button class="kc-v3-primary-action" type="button" data-kc="editor-followup">'+kcV3Icon('plus')+' Nieuw vervolg</button>'+
 '<button type="button" class="kc-v3-secondary-action" data-kc="editor-relations" aria-label="Koppelingen en vervolgacties">'+kcV3Icon('more')+'</button></div>';
 const folderChoices='<button type="button" class="kc-v3-sheet-item" data-kc="editor-folder-select" data-id="inbox">Inbox</button>'+collections().map(c=>'<button type="button" class="kc-v3-sheet-item" data-kc="editor-folder-select" data-id="'+esc(c.id)+'">'+esc(pathName(c))+'</button>').join("");
 const locationIds=C.memberships(life,e);
 const linkedChoices=['inbox',...allCollections().filter(c=>!c.archived).map(c=>c.id)].map(id=>'<label class="kc-v3-sheet-check"><input type="checkbox" data-kc-location="'+esc(id)+'"'+(locationIds.includes(id)?' checked':'')+'><span>'+esc(C.collectionPath(life,id))+'</span></label>').join("");
 const linksBody='<div class="kc-v3-sheet-group">KOPPELINGEN</div>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-link-note">'+kcV3Icon('link')+'<span>Notitie koppelen<small>Voeg een verwijzing toe, geen kopie</small></span></button>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-linked-folders">'+kcV3Icon('folder')+'<span>Mappen koppelen<small>Dezelfde notitie op meerdere plekken</small></span></button>'+
 '<button class="kc-v3-sheet-item" data-kc="selection-task">'+kcV3Icon('task')+'<span>Taak uit geselecteerde tekst<small>Selecteer eerst tekst in de editor</small></span></button>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-manual-passage">'+kcV3Icon('file')+'<span>Passage handmatig invoeren<small>Maak een taak uit een passage</small></span></button>';
 const fileCount=(e.attachments||[]).length;
 return '<div class="kc-v3-prototype-editor">'+
 '<div class="kc-v3-eyebrow">Leven <span>›</span> <strong>Notities</strong> <span>›</span> Kenniscentrum</div>'+
 '<div class="kc-editor-head kc-v3-editor-head">'+header(selectedId?"Kennisitem bewerken":"Nieuw kennisitem",true,more+'<button type="button" class="kc-v3-save-btn" data-kc="save">Opslaan</button>')+'</div>'+
 '<p class="kc-save-state kc-v3-save-state" id="kc-save-state" role="status">'+(dirty?"Niet opgeslagen wijzigingen":selectedId?"Opgeslagen":"Concept · nog niet opgeslagen")+'</p>'+
 '<section class="kc-v3-writing-card" aria-label="Kennisitem schrijven">'+title+
 '<div class="kc-v3-meta-two">'+kind+collection+'</div>'+
 (isLink?'<label class="kc-v3-field-group">Website<input type="url" id="kc-source" data-kc-edit="sourceUrl" value="'+esc(e.sourceUrl||"")+'" placeholder="https://…"></label>':"")+
 body+recipeFields+'</section>'+
 '<section class="kc-v3-organization" aria-label="Organiseren"><div class="kc-v3-section-title">'+
 '<span class="kc-v3-section-icon">'+kcV3Icon('folder')+'</span><span><h3>Organiseren</h3><small>Waar hoort deze notitie thuis?</small></span></div>'+
 '<div class="kc-v3-compact-line"><span>Verzameling</span><strong>'+esc(C.collectionPath(life,cid))+'</strong><button type="button" data-kc="editor-folder" aria-label="Verzameling wijzigen">'+kcV3Icon('right')+'</button></div>'+
 '<div class="kc-v3-compact-line"><span>Labels</span><strong class="kc-v3-chip-row">'+tagsHTML+'</strong><button type="button" data-kc="editor-tags" aria-label="Labels beheren">'+kcV3Icon('right')+'</button></div>'+
 '<button type="button" class="kc-v3-management" data-kc="editor-linked-folders">'+kcV3Icon('folder')+' Ook tonen in andere mappen <small>Optioneel</small>'+kcV3Icon('right')+'</button></section>'+
 '<section class="kc-v3-followups" aria-label="Opvolging en koppelingen"><div class="kc-v3-section-title">'+
 '<span class="kc-v3-section-icon">'+kcV3Icon('branch')+'</span><span><h3>Opvolging &amp; koppelingen</h3><small>Maak een vervolg zonder informatie kwijt te raken.</small></span></div>'+
 originHTML+(selectedId?followupLinksForNote(e,true):"")+actionButtons+'</section>'+
 '<section class="kc-v3-extras" aria-label="Extra mogelijkheden">'+
 '<button type="button" class="kc-v3-management" data-kc="editor-attachments">'+kcV3Icon('paperclip')+' Bijlagen <small>'+(fileCount?fileCount+' bestand(en)':'Toevoegen')+'</small>'+kcV3Icon('right')+'</button>'+
 '<button type="button" class="kc-v3-management" data-kc="editor-menu">'+kcV3Icon('more')+' Alle overige acties <small>Beheer en historie</small>'+kcV3Icon('right')+'</button></section>'+
 kcV3Sheet('kc-v3-folder-sheet','Verzameling kiezen','<p class="kc-v3-sheet-help">Kies de hoofdverzameling van dit item. Andere mapkoppelingen blijven apart.</p>'+folderChoices)+
 kcV3Sheet('kc-v3-tags-sheet','Labels beheren','<p class="kc-v3-sheet-help">Labels helpen bij zoeken en terugvinden.</p><label class="kc-v3-sheet-label">Labels, gescheiden door komma’s<input id="kc-v3-tags-input" maxlength="1000" value="'+esc(tags)+'"></label>'+btn('Labels toepassen','editor-tags-apply','',true)+(workspaceReady()?'<div class="kc-v3-tag-suggestions">'+W.suggestions(life,e).map(t=>btn('+ #'+esc(t),'ws-tag',t)).join('')+'</div>':""))+
 kcV3Sheet('kc-v3-locations-sheet','Mappen koppelen','<p class="kc-v3-sheet-help">Eén notitie, dezelfde inhoud op iedere plek.</p>'+linkedChoices+btn('Koppelingen bewaren','editor-locations-save','',true))+
 kcV3Sheet('kc-v3-followup-sheet','Nieuw vervolg','<p class="kc-v3-sheet-help">De oorspronkelijke notitie blijft bewaard. Kies wat je wilt maken.</p>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-followup-kind" data-id="task">'+kcV3Icon('task')+'<span>Vervolgtaak<small>Een concrete actie voor later</small></span></button>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-followup-kind" data-id="appointment">'+kcV3Icon('calendar')+'<span>Vervolgafspraak<small>Een nieuw moment met datum en tijd</small></span></button>'+
 '<button class="kc-v3-sheet-item" data-kc="editor-followup-kind" data-id="note">'+kcV3Icon('file')+'<span>Vervolgnotitie<small>Schrijf verder in een aparte notitie</small></span></button>')+
 kcV3Sheet('kc-v3-relations-sheet','Koppelingen',linksBody)+
 kcV3Sheet('kc-v3-manual-sheet','Passage invoeren','<p class="kc-v3-sheet-help">Neem een passage over of typ zelf een actie. De brontekst blijft staan.</p><label class="kc-v3-sheet-label">Passage<textarea id="kc-task-passage" maxlength="2500" rows="4" placeholder="Welke actie moet hieruit ontstaan?"></textarea></label>'+btn('Taakvoorstel controleren','passage-task','',true))+
 kcV3Sheet('kc-v3-block-tools-sheet','Meer tekstopmaak','<button class="kc-v3-sheet-item" data-kc="ws-block" data-id="heading">Kop toevoegen</button><button class="kc-v3-sheet-item" data-kc="ws-block" data-id="text">Tekstblok toevoegen</button><button class="kc-v3-sheet-item" data-kc="ws-block" data-id="quote">Citaat toevoegen</button><button class="kc-v3-sheet-item" data-kc="ws-block" data-id="check">Checklistpunt toevoegen</button><button class="kc-v3-sheet-item" data-kc="ws-mark" data-id="italic">Cursief</button><button class="kc-v3-sheet-item" data-kc="ws-editor-design">Blokken aanpassen en verplaatsen</button>')+
 kcV3Sheet('kc-v3-attachments-sheet','Bijlagen','<p class="kc-v3-sheet-help">PDF’s en afbeeldingen worden lokaal bewaard en meegenomen in de ZIP-back-up.</p><label class="kc-v3-sheet-label">PDF of afbeelding toevoegen<input id="kc-file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" multiple aria-label="PDF of afbeelding toevoegen"></label><p class="kc-v3-sheet-help">Maximaal 25 MB per bestand.</p>'+attachmentsHTML(e))+
 '<dialog id="kc-editor-menu" class="kc-v3-editor-dialog kc-v3-sheet" aria-label="Meer acties voor dit kennisitem"><div class="kc-v3-sheet-handle" aria-hidden="true"></div><div class="kc-v3-sheet-head"><h3>Meer acties</h3><button type="button" data-kc="editor-menu-close" aria-label="Sluiten">×</button></div>'+
 (selectedId?'<div class="kc-v3-dialog-group"><span>Notitie</span>'+btn(e.pinned?"Losmaken":"Vastzetten","pin",selectedId)+btn(e.archived?"Uit archief":"Archiveren","archive-item",selectedId)+'</div>':"")+
 '<div class="kc-v3-dialog-group"><span>Weergave en geschiedenis</span>'+(e.document?btn("Tekstblokken toevoegen","editor-block-options"):"")+btn("Voorbeeld","preview")+btn("Versiegeschiedenis","versions")+'</div>'+
 '<div class="kc-v3-dialog-group kc-v3-dialog-danger"><span>Concept en gegevens</span>'+btn("Concept verwerpen","discard-draft")+(selectedId?btn("Notitie verwijderen","delete",selectedId):"")+'</div></dialog>'+
 '</div>';
}
function passageActions(includeSelection=true){return (includeSelection?btn('Taak uit selectie','selection-task'):'')+'<details class="kc-v3-passage"><summary>Passage handmatig invoeren</summary><div><label>Passage uit deze notitie<textarea id="kc-task-passage" maxlength="2500" rows="3" placeholder="Plak of typ een passage uit de notitie"></textarea></label>'+btn('Taakvoorstel controleren','passage-task')+'</div></details>';}
function renderVersions(){
 const n=read().notes.find(x=>x.id===selectedId);
 return header("Eerdere versies",true)+
 '<p class="kc-muted">Een versie herstellen overschrijft de actuele tekst niet zonder een nieuwe revisie te bewaren.</p>'+
 (n?.revisions?.length?n.revisions.map((r,i)=>'<div class="kc-version"><div><strong>'+esc(r.title)+'</strong><small>'+readable(r.savedAt)+' · Revisie '+esc(r.revision)+'</small></div>'+btn("Vergelijken",workspaceReady()?"ws-compare":"restore-version",i)+"</div>").reverse().join(""):'<div class="kc-empty"><strong>Nog geen oudere versie</strong><p>Eerdere opgeslagen teksten verschijnen hier.</p></div>');
}
function renderLink(){
 const n=read().notes.find(x=>x.id===selectedId);
 const choices=read().notes.filter(x=>!x.deletedAt&&x.id!==selectedId&&x.title.toLowerCase().includes(linkQuery.toLowerCase())).slice(0,50);
 return header("Notitie verbinden",true)+(workspaceReady()?'<div class="kc-suggested-relations"><h3>Voorgesteld · nog niet gekoppeld</h3>'+W.related(read(),n).map(x=>btn(esc(x.title)+" · koppelen","ws-related",x.id)).join("")+"</div>":"")+
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
 fileRecord?.type?.startsWith("audio/")&&fileUrl?'<audio controls class="kc-diary-audio-player" src="'+esc(fileUrl)+'"></audio>':
  fileRecord?.type?.startsWith("image/")&&fileUrl?'<img class="kc-image" src="'+esc(fileUrl)+'" alt="'+esc(a?.name||"Bijlage")+'">':
 '<div class="kc-empty">Bestand wordt geladen of is niet beschikbaar.</div>')+link;
}
function render(){
 if(!host)return;
 const life=read();try{C.ensure(life)}catch(e){host.textContent=e.message;return;}
 let output="";
 if(screen==="home")workspaceContext="overview";else if(screen==="collection")workspaceContext=collectionId;
 if(screen==="recipe-groceries")output=renderRecipeShop();
 else if(screen==="search")output=renderCentralSearch();
 else if(screen==="home")output=workspaceReady()?renderWorkspaceHome():renderHome();
 else if(screen==="sort")output=renderSort();
 else if(screen==="collections")output=workspaceReady()?renderWorkspaceCollections():renderCollections();
 else if(screen==="workspace")output=workspacePanel==="map-template"?header("Standaardsjabloon",true)+templateCards("ws-map-template-set"):workspacePanel==="widget-image"?header("Widgetafbeelding",true)+'<label>Eigen afbeelding<input id="kc-ws-widget-file" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Onderschrift<input id="kc-ws-widget-caption" maxlength="300"></label><label>Uitsnede<input id="kc-ws-widget-focus" type="range" min="0" max="100" value="50"></label>'+btn('Instellingen bewaren','ws-widget-image-settings'):renderWorkspacePanel();
 else if(screen==="collection-editor")output=renderCollectionEditor();
 else if(["collection","all","inbox","archive","trash","pinned"].includes(screen))output=renderList();
 else if(screen==="detail")output=renderDetail();
 else if(screen==="edit")output=renderEditor();
 else if(screen==="versions")output=renderVersions();
 else if(screen==="link")output=renderLink();
 else if(screen==="file")output=renderFile();
 root.MementoSortableUI?.clear(host);
 const prototypeEditorVisible=output.includes('class="kc-v3-prototype-editor"');
 host.innerHTML='<div class="kc-app"><div id="kc-notice" role="status"'+(notice?"":" hidden")+">"+esc(notice)+"</div>"+(workspaceReady()&&!["edit","collection-editor"].includes(screen)&&!prototypeEditorVisible?workspaceNavigation():"")+(prototypeEditorVisible?"":breadcrumbs())+output+(workspaceUndo&&JSON.stringify(read())===workspaceUndoAfter?btn("Ongedaan maken","ws-undo"):"")+"</div>";
 // Handle list search on the current field, before any parent-level listeners
 // can replace the input during bubbling. Native search clear also fires
 // a non-bubbling "search" event in some browsers.
 const sorter=root.MementoSortableUI;
 if(sorter){
  const setups=[];
  if(screen==='sort'&&sortState){
   setups.push({element:host.querySelector('.kc-sort-list'),itemSelector:'.kc-sort-row[data-sort-id]',idAttr:'data-sort-id',handleSelector:'.kc-drag-handle',injectHandle:false,onOrder:ids=>persistSort(ids)});
  }
  if(screen==='collection'&&sort==='manual'&&!query&&!kindFilter&&!tagFilter){
   const currentIds=currentItems().map(n=>n.id);
   setups.push({element:host.querySelector('.kc-item-list[data-manual-sort]'),itemSelector:'.kc-item[data-order-id]',handleSelector:'.memento-note-grip',keyboardSelector:'.kc-item',injectHandle:false,onOrder:ids=>{
    const visible=new Set(currentIds),ok=write(s=>sorter.rankByIds(s.notes.filter(n=>visible.has(n.id)),ids));
    if(ok){notice='Notitievolgorde opgeslagen.';render();}
    return ok;
   }});
  }
  if(workspaceReady()&&workspaceDesign&&['home','collection'].includes(screen))setups.push({element:host.querySelector('.kc-widget-grid'),itemSelector:'.kc-widget[data-ws-widget]',idAttr:'data-ws-widget',handleSelector:'.kc-widget-grip',injectHandle:false,onOrder:ids=>{const ok=workspaceWrite(life=>{const w=W.workspace(life),old=W.widgets(life,workspaceContext);if(ids.length!==old.length||new Set(ids).size!==old.length||ids.some(id=>!old.some(x=>x.id===id)))throw Error('Ongeldige widgetvolgorde');w.dashboards[workspaceContext]=ids.map(id=>old.find(x=>x.id===id));});if(ok)render();return ok;}});
  sorter.mountAll(host,setups);
 }
 const listSearch=host.querySelector('[data-kc-input="search"]');
 if(listSearch){
  listSearch.addEventListener("input",onInput);
  listSearch.addEventListener("search",onInput);
 }
 hydrateWorkspace();
 ArtUI?.hydrate(host,S);
 host.classList.toggle("kc-focus-writing",focusWriting&&Boolean(editing?.journal));
 if(diaryDictating&&!diarySpeechEditor())stopDiaryDictation();
 paintDiarySpeech();growText();updateDiaryKeyboard();
 syncNotesHistory();
 const route=routeKey();
 if(route!==lastRenderedRoute){
  lastRenderedRoute=route;
  root.requestAnimationFrame?.(()=>{root.scrollTo?.({top:0,behavior:'instant'});host?.querySelector('.kc-header h2')?.focus?.({preventScroll:true});});
 }
}
// Kenniscentrum Visueel workspace: the existing guarded bridge remains the only writer.
let workspaceEditorDesign=false,workspaceBusy=false,workspacePanel='',workspacePage=0,workspaceUndo=null,workspaceUndoAfter='',workspaceContext='overview',workspaceDesign=false,workspaceBlock='',workspaceConvert=null,workspacePendingImport=null;
const W=root.MementoKnowledgeWorkspace,KB=root.MementoKnowledgeBackup;
const ws=()=>W?.workspace(read());
function workspaceReady(){return read().knowledge?.workspace?.version===2;}
async function activateWorkspace(){
 if(workspaceBusy||workspaceReady()||!W||!S||!root.MementoStorageGuard?.writable)return;
 workspaceBusy=true;let token;
 try{
  const guard=root.MementoStorageGuard;token=guard.beginOperation();
  const before=C.clone(read()),next=C.clone(before);W.migrate(next);
  const records=await S.all(),byId=new Map(records.map(r=>[r.id,r]));
  for(const [id,meta] of W.fileReferences(before)){const r=byId.get(id);if(!r?.blob||meta.hash&&await S.sha256(r.blob)!==meta.hash)throw Error('Bestaand bestand ontbreekt of is beschadigd: '+meta.name);}
  const raw=new Blob([JSON.stringify(before)],{type:'application/json'});
  // Independent immutable old metadata + blobs are captured before activation.
  const snapshot={id:'kc-workspace-before-v2',noteId:'kc-system-snapshot',name:'Kenniscentrum voor V2',type:'application/json',size:raw.size,hash:await S.sha256(raw),blob:raw,files:[...W.fileReferences(before).keys()].map(id=>byId.get(id)),createdAt:C.timestamp()};
  await S.putRecord(snapshot,token);
  if(!write(life=>{life.knowledge=next.knowledge;W.validate(life);},token))throw Error('V2 kon niet worden geactiveerd. De eerdere gegevens blijven behouden.');
  workspacePage=0;
 }catch(e){notify('Kenniscentrum V2 niet geactiveerd: '+e.message);}
 finally{if(token)root.MementoStorageGuard.endOperation(token);workspaceBusy=false;render();}
}
function workspaceWrite(fn,{undo=false}={}){
 const before=undo?C.clone(read()):null;
 const ok=write(life=>{fn(life);W.validate(life);});
 if(ok&&undo){workspaceUndo=before;workspaceUndoAfter=JSON.stringify(read());}
 return ok;
}
function workspaceNavigation(){const active=screen==='home'?'home':screen==='collections'?'collections':'all';return '<nav class="kc-local-tabs" aria-label="Kenniscentrum">'+[['home','Overzicht'],['collections','Mappen'],['all','Notities']].map(([id,label])=>'<button class="kc-btn" data-kc="'+id+'" aria-current="'+(active===id?'page':'false')+'">'+label+'</button>').join('')+'</nav>';}
function workspaceCompact(items){return '<div class="kc-compact-list">'+items.map(n=>'<button class="kc-compact-row" type="button" data-kc="open" data-id="'+esc(n.id)+'"><strong>'+esc(n.title)+'</strong><small>'+esc(C.collectionName(read(),C.collectionOf(read(),n)))+'</small><span>›</span></button>').join('')+'</div>';}
function topicCarousel(){
 const roots=[{id:'notion-recipes',name:'Recepten',icon:'book-open',coverId:'recepten',externalUrl:'https://www.notion.so/02f6147c45b14e00b240b02e69536903'},...rootCollections(),...legacyCollections()],pages=Math.max(1,Math.ceil(roots.length/4));workspacePage=Math.min(workspacePage,pages-1);
 return '<section class="kc-topics"><div class="kc-section-head"><h3>Jouw onderwerpen</h3>'+btn('Alle mappen','collections')+'</div><div class="kc-topic-viewport" tabindex="0" aria-label="Onderwerpen: swipe rechts voor de volgende vier mappen" aria-roledescription="carrousel"><div class="kc-topic-track" style="transform:translateX('+workspacePage*100+'%)">'+Array.from({length:pages},(_,page)=>'<div class="kc-topic-page"'+(page!==workspacePage?' inert aria-hidden="true"':'')+'>'+roots.slice(page*4,page*4+4).map(c=>c.externalUrl?'<a class="kc-topic-card" href="'+esc(c.externalUrl)+'" aria-label="Recepten openen in de Notion-app"><span class="kc-topic-scene">'+(ArtUI?.cards(c)||collectionIcon(c))+'</span><span class="kc-topic-title"><span><strong>'+esc(c.name)+'</strong><small>Open in Notion</small></span><span>↗</span></span></a>':'<button class="kc-topic-card" data-kc="collection" data-id="'+esc(c.id)+'"><span class="kc-topic-scene">'+(ArtUI?.cards(c)||collectionIcon(c))+'</span><span class="kc-topic-title"><span><strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+' notities</small></span><span>↗</span></span></button>').join('')+'</div>').join('')+'</div></div><div class="kc-topic-controls">'+btn('←','ws-page',String(Math.max(0,workspacePage-1)))+'<div class="kc-topic-dots">'+Array.from({length:pages},(_,i)=>'<button type="button" data-kc="ws-page" data-id="'+i+'" aria-label="Onderwerppagina '+(i+1)+'" aria-current="'+(workspacePage===i)+'"><span></span></button>').join('')+'</div>'+btn('→','ws-page',String(Math.min(pages-1,workspacePage+1)))+'</div><p class="kc-topic-status" role="status">Pagina '+(workspacePage+1)+' van '+pages+' · swipe naar rechts voor meer</p></section>';
}
function renderWorkspaceHome(){
 const items=C.search(read()),pinned=items.filter(n=>n.pinned);
 return header('Kenniscentrum',false,btn('+ Nieuwe notitie','new','',true))+centralSearchBox()+
 '<form class="kc-capture" id="kc-capture-form"><label class="kc-sr" for="kc-capture">Een gedachte voor Inbox</label><input id="kc-capture" value="'+esc(quickDraft)+'" data-kc-input="quick" maxlength="20000" placeholder="Een gedachte voor later…"><button type="submit" class="kc-btn" aria-label="Bewaar in Inbox">＋</button></form>'+topicCarousel()+
 '<button class="kc-inbox" data-kc="ws-process"><strong>Inbox</strong><span>'+counts('inbox')+' gedachten om een plek te geven</span><b>›</b></button>'+
 '<div class="kc-workspace-shortcuts">'+btn('Alle notities · '+items.length,'all')+btn('☆ Belangrijk · '+pinned.length,'pinned')+btn('Sjablonen','ws-templates')+'</div>'+
 '<details class="kc-compact-fold"><summary>Recent · '+Math.min(3,items.length)+'</summary>'+workspaceCompact(items.slice(0,3))+'</details>'+
 '<details class="kc-compact-fold"><summary>Vastgezet · '+pinned.length+'</summary>'+workspaceCompact(pinned.slice(0,5))+'</details>'+renderWorkspaceWidgets('overview')+
 '<details class="kc-compact-fold"><summary>Instellingen & back-up</summary><div class="kc-ws-tools">'+btn('Overzicht aanpassen','ws-design')+btn('Achtergrond kiezen','ws-background')+btn('Kenniscentrum-back-up','ws-backup')+btn('Opslaggebruik','ws-storage')+'</div></details>';
}
function renderFolderTree(parent=null,seen=new Set()){
 return allCollections().filter(c=>C.activeCollection(read(),c.id)&&(c.parentId||null)===parent).sort((a,b)=>(a.order||0)-(b.order||0)).map(c=>{
 if(seen.has(c.id))return '';const next=new Set([...seen,c.id]),has=allCollections().some(x=>x.parentId===c.id),open=ws().expanded.includes(c.id);
 const row='<div class="kc-tree-row">'+(has?'<button type="button" class="kc-tree-toggle" data-kc="ws-fold" data-id="'+esc(c.id)+'" aria-expanded="'+open+'" aria-label="Submappen van '+esc(c.name)+'">'+(open?'⌄':'›')+'</button>':'<span class="kc-tree-spacer"></span>')+'<button class="kc-tree-open" data-kc="collection" data-id="'+esc(c.id)+'">'+collectionIcon(c)+'<span><strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+' notities'+(c.archived?' · Archief':'')+'</small></span></button>'+btn('⋯','edit-collection',c.id)+'</div>';
 return row+(has&&open?'<div class="kc-tree-children">'+renderFolderTree(c.id,next)+'</div>':'');
 }).join('');
}
function renderWorkspaceCollections(){return header('Mappen',false,btn('+ Nieuwe map','new-collection','',true))+'<div class="kc-tree">'+renderFolderTree()+'</div><details class="kc-compact-fold"><summary>Gearchiveerde mappen</summary>'+allCollections().filter(c=>!C.activeCollection(read(),c.id)).map(c=>'<div class="kc-tree-row"><span>'+esc(pathName(c))+'</span>'+btn('Herstellen','restore-collection',c.id)+'</div>').join('')+'</details><div class="kc-workspace-shortcuts">'+btn('Inbox','inbox')+btn('Archief','archive')+btn('Volgorde wijzigen','sort-roots')+'</div>';}
function preferenceLoad(id){const p=ws()?.preferences?.[id]||{};viewOverride=p.view||'';sort=p.sort||'recent';kindFilter=p.kind||'';tagFilter=p.tag||'';}
function preferenceSave(){if(!workspaceReady()||screen!=='collection')return;workspaceWrite(life=>{W.workspace(life).preferences[collectionId]={...W.workspace(life).preferences[collectionId],view:viewOverride||'list',sort,kind:kindFilter,tag:tagFilter};});}
function renderWorkspaceWidgets(context){
 const items=W.widgets(read(),context);return '<section class="kc-workspace-widgets"><div class="kc-section-head"><h3>'+(context==='overview'?'Mijn overzicht':'Mapdashboard')+'</h3>'+btn(workspaceDesign?'Gereed':'Aanpassen','ws-design')+'</div><div class="kc-widget-grid">'+items.map((w,i)=>{
 const actions=workspaceDesign?'<div class="kc-widget-controls"><button type="button" class="kc-widget-grip kc-btn" aria-label="Widget verplaatsen">⠿</button>'+btn('↑','ws-widget-up',String(i))+btn('↓','ws-widget-down',String(i))+btn(w.size==='wide'?'Compact':'Breed','ws-widget-size',w.id)+btn('Verbergen','ws-widget-hide',w.id)+ (w.source!=='knowledge'?btn(w.granted?'Toegang intrekken':'Toegang verlenen','ws-widget-permission',w.id):'')+btn('Positie','ws-widget-position',w.id)+'</div>':'';
 const title={recent:'Recent',pinned:'Vastgezet',journal:'Dagboek',image:w.name||'Afbeelding',collection:'Mapnotities',tasks:'Taken',appointments:'Afspraken',finance:'Recente transacties'}[w.type];
 const projection=W.projectWidget(read(),w,context,w.source==='finance'&&w.granted?root.MementoFinanceBridgeV9?.state?.():null);
 const content=w.source!=='knowledge'?(!w.granted?'<p>Brontoegang is ingetrokken.</p>':projection.map(r=>'<div class="kc-compact-row"><strong>'+esc(r.title)+'</strong><small>'+esc(r.date||'')+(r.amount!==undefined?' · '+esc(Number(r.amount).toLocaleString('nl-NL',{style:'currency',currency:'EUR'})):'')+'</small></div>').join('')):w.type==='image'?(w.image?'<figure><img data-kc-cover-file="'+esc(w.image.id)+'" alt="'+esc(w.name||'Eigen afbeelding')+'" style="object-position:'+(w.focus||50)+'% center"><figcaption>'+esc(w.caption||'')+'</figcaption></figure>':'<p>Kies een afbeelding via Aanpassen.</p>'):w.type==='journal'?btn('Dagboek openen','ws-journal'):workspaceCompact(projection);
 return '<div class="kc-widget '+(w.size==='wide'?'kc-widget-wide':'')+'" data-ws-widget="'+esc(w.id)+'" style="'+(w.column&&w.size!=='wide'?'grid-column:'+w.column+';':'')+(w.row?'grid-row:'+w.row+';':'')+'">'+actions+'<details'+(w.type==='image'?' open':'')+'><summary>'+esc(title)+'</summary>'+content+'</details>'+(workspaceDesign&&w.type==='image'?btn('Afbeelding kiezen','ws-widget-image',w.id):'')+'</div>';
 }).join('')+(workspaceDesign?btn('+ Widget toevoegen','ws-widget-add'):'')+'</div></section>';
}
function templateCards(mode='ws-template-use'){return ws().templates.map(t=>'<button type="button" class="kc-template-card" data-kc="'+mode+'" data-id="'+esc(t.id)+'"><strong>'+esc(t.name)+'</strong><small>'+t.document.blocks.filter(b=>b.type==='heading').map(b=>esc(b.text)).join(' · ')+'</small></button>').join('');}
function renderWorkspacePanel(){
 if(workspacePanel==='conflict'){let actual=null;try{actual=JSON.parse(localStorage.getItem('compass_life_preview_v1'))?.notes?.find(n=>n.id===selectedId);}catch{}return header('Bewerkingsconflict',true)+'<p>Je concept is behouden. De opgeslagen versie wordt niet overschreven.</p><div class="kc-compare"><div><h3>Jouw concept</h3><pre>'+esc(editing?.body||'')+'</pre></div><div><h3>Actueel opgeslagen</h3><pre>'+esc(actual?.body||'Niet beschikbaar')+'</pre></div></div>'+btn('Concept kopiëren','ws-copy');}
 if(workspacePanel==='templates')return header('Sjablonen',true)+templateCards()+btn('Meegeleverde sjablonen ophalen','ws-template-catalog')+'<label class="kc-file-upload">Sjabloonbestand importeren<input type="file" id="kc-ws-template-file" accept=".json,application/json"></label><p class="kc-muted">JSON met toegestane inhoudsblokken. Je ziet eerst een voorbeeld. Bestaande notities veranderen niet.</p>';
 if(workspacePanel==='template-preview')return header('Sjabloonvoorbeeld',true)+'<label>Toevoegen of bestaand sjabloon bijwerken<select id="kc-ws-template-target"><option value="">Nieuw sjabloon</option>'+ws().templates.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select></label><h3>'+esc(workspacePendingImport?.template?.name)+'</h3><div class="kc-readable">'+renderDocumentRead(workspacePendingImport?.template?.document)+'</div>'+btn('Sjabloon toevoegen','ws-template-confirm','',true);
 if(workspacePanel==='conversion')return header('Visueel bewerken',true)+'<p>Je Markdown wordt als letterlijke tekst omgezet; opmaaktekens blijven zichtbaar. Gebruik de oorspronkelijke editor als je de bestaande opmaak wilt blijven bewerken.</p><p>Je oorspronkelijke tekst wordt behouden in de versiegeschiedenis. Controleer de omzetting hieronder.</p><div class="kc-compare"><pre>'+esc(editing?.body)+'</pre><div>'+renderDocumentRead(workspaceConvert)+'</div></div>'+btn('Omzetten & bewerken','ws-convert-confirm','',true)+btn('Oorspronkelijke editor','ws-original');
 if(workspacePanel==='locations'){const n=editing||read().notes.find(n=>n.id===selectedId),ids=C.memberships(read(),n);return header('Mappen koppelen',true)+'<p>Eén notitie, dezelfde inhoud op iedere plek.</p>'+['inbox',...allCollections().map(c=>c.id)].map(id=>'<label class="kc-location-check"><input type="checkbox" data-ws-location="'+esc(id)+'"'+(ids.includes(id)?' checked':'')+'>'+esc(C.collectionPath(read(),id))+'</label>').join('')+btn('Koppelingen bewaren','ws-locations-save','',true);}
 if(workspacePanel==='delete-folder'){const p=W.deletionPreview(read(),collectionId);return header('Map verwijderen — voorbeeld',true)+'<p>'+p.ids.length+' mappen en '+p.notes.length+' notities en '+p.widgets.length+' widgetverwijzingen geraakt. Notities blijven behouden; overige koppelingen blijven actief. Zonder andere map wordt Inbox gebruikt.</p><ul>'+p.notes.map(n=>'<li>'+esc(n.title)+' → '+esc(n.remaining.length?n.remaining.map(id=>C.collectionName(read(),id)).join(', '):'Inbox')+'</li>').join('')+'</ul>'+btn('Verwijderen & verplaatsen','ws-delete-confirm','',true);}
 if(workspacePanel==='process'){const notes=C.search(read(),{collectionId:'inbox'}),n=notes[0];return header('Inbox verwerken · '+notes.length,true)+(n?'<h3>'+esc(n.title)+'</h3><p>'+esc(n.body.slice(0,500))+'</p><label>Geef een plek<select id="kc-ws-destination">'+collections().map(c=>'<option value="'+esc(c.id)+'">'+esc(pathName(c))+'</option>').join('')+'</select></label><div class="kc-tag-suggestions">'+W.suggestions(read(),n).map(t=>btn('+ '+esc(t),'ws-inbox-tag',t)).join('')+'</div>'+btn('Bewaren & volgende','ws-process-next',n.id,true):'<p>Je Inbox is opgeruimd.</p>');}
 if(workspacePanel==='widget-add')return header('Widget samenstellen',true)+'<label>Inhoud<select id="kc-ws-widget-type">'+[['recent','Recent'],['pinned','Vastgezet'],['collection','Mapnotities'],['journal','Dagboek'],['image','Eigen afbeelding'],['tasks','Taken uit Leven'],['appointments','Afspraken'],['finance','Recente financiële transacties']].map(([v,n])=>'<option value="'+v+'">'+n+'</option>').join('')+'</select></label><label>Map<select id="kc-ws-widget-map"><option value="">Huidige context</option>'+collections().map(c=>'<option value="'+esc(c.id)+'">'+esc(pathName(c))+'</option>').join('')+'</select></label><label>Formaat<select id="kc-ws-widget-size"><option value="small">Compact</option><option value="wide">Breed</option></select></label><label class="kc-location-check"><input type="checkbox" id="kc-ws-widget-consent">Deze widget mag uitsluitend de geselecteerde bron lezen</label><p>Financiën toont alleen datum, omschrijving en bedrag van drie recente transacties. Je kunt toestemming per widget intrekken.</p>'+btn('Widget toevoegen','ws-widget-confirm','',true);
 if(workspacePanel==='background')return header('Achtergrond van Overzicht',true)+'<label>Eigen afbeelding<input type="file" id="kc-ws-background-file" accept="image/png,image/jpeg,image/webp"></label><label>Donkere laag<input type="range" id="kc-ws-dim" min="55" max="90" value="'+(ws().background?.dim||75)+'"></label><label>Uitsnede<input type="range" id="kc-ws-focus" min="0" max="100" value="'+(ws().background?.focus??50)+'"></label>'+btn('Weergave bewaren','ws-background-save','',true)+btn('Standaardachtergrond','ws-background-clear');
 if(workspacePanel==='backup')return header('Kenniscentrum-back-up',true)+'<p>Alleen notities, mappen, sjablonen, dashboards en bijbehorende bestanden. Financiën en andere Leven-inhoud worden niet geëxporteerd.</p><label>Optioneel wachtwoord (minimaal 12 tekens)<input id="kc-ws-password" type="password" autocomplete="new-password"></label><label>Wachtwoord herhalen<input id="kc-ws-password-repeat" type="password" autocomplete="new-password"></label><p>Verlies je het wachtwoord, dan kan deze back-up niet worden hersteld.</p>'+btn('Exporteren','ws-export','',true)+'<label>Back-up terugzetten<input type="file" id="kc-ws-backup-file" accept=".zip,.mkc"></label><p class="kc-muted">Vul voor een versleuteld bestand eerst het wachtwoord in. Voor herstel verschijnt een voorbeeld en wordt een herstelkopie gemaakt.</p>';
 if(workspacePanel==='restore-preview')return header('Herstelvoorbeeld',true)+'<p>'+workspacePendingImport.incoming.notes.length+' notities, '+workspacePendingImport.incoming.knowledge.collections.length+' mappen en '+workspacePendingImport.files.length+' bestanden.</p><p>Je huidige Kenniscentrum wordt vervangen. Taken, agenda, fitness en financiën blijven behouden. Eerst wordt een veiligheidskopie opgeslagen.</p>'+btn('Kenniscentrum vervangen','ws-restore-confirm','',true);
 if(workspacePanel==='versions-compare'){const n=read().notes.find(n=>n.id===selectedId),r=n?.revisions?.[Number(workspaceBlock)];return header('Tekstversies vergelijken',true)+(r?'<p>Herstel verandert uitsluitend titel en inhoud. Actuele tags, mappen, receptvelden en bijlagen blijven behouden.</p><div class="kc-compare"><div><h3>Eerder: '+esc(r.title)+'</h3><pre>'+esc(r.body)+'</pre></div><div><h3>Nu: '+esc(n.title)+'</h3><pre>'+esc(n.body)+'</pre></div></div>'+btn('Herstel titel & inhoud','restore-version',workspaceBlock,true):'<p>Versie niet gevonden</p>');}
 return header('Kenniscentrum',true);
}
function renderDocumentRead(doc){if(!doc?.blocks)return '';return doc.blocks.map(b=>{
 if(['image','pdf'].includes(b.type)){const n=editing||read().notes.find(n=>n.id===selectedId),meta=n?.attachments?.find(a=>a.id===b.fileId);return meta?(b.type==='image'?'<figure><img class="kc-inline-image" data-kc-cover-file="'+esc(b.fileId)+'" alt="'+esc(b.text)+'"><figcaption>'+esc(b.text)+'</figcaption></figure>':btn(esc(meta.name),'file',meta.id)):'<p class="kc-missing-image">Bestand ontbreekt · '+esc(b.text)+'</p>';}
 const tag=b.type==='heading'?'h3':b.type==='quote'?'blockquote':'p',text=esc(b.text);return '<'+tag+'>'+ (b.type==='check'?(b.checked?'☑ ':'☐ '):'')+(b.marks?.includes('bold')?'<b>':'')+(b.marks?.includes('italic')?'<i>':'')+text+(b.marks?.includes('italic')?'</i>':'')+(b.marks?.includes('bold')?'</b>':'')+'</'+tag+'>';
 }).join('');}
function renderVisualDocument(){return '<div class="kc-visual-toolbar" role="toolbar" aria-label="Visuele teksteditor">'+
 btn('H1','ws-block','heading')+btn('Vet','ws-mark','bold')+btn('☷ Lijst','ws-bullets')+btn('Link','ws-insert-link')+btn('Taak','selection-task')+
 btn('Meer','editor-block-options')+'</div><div class="kc-visual-document">'+editing.document.blocks.map(b=>['image','pdf'].includes(b.type)?renderDocumentRead({blocks:[b]}):'<div class="kc-visual-block kc-block-'+b.type+' '+(b.marks||[]).join(' ')+'"><'+(b.type==='check'?'label':'div')+'>'+(b.type==='check'?'<input type="checkbox" data-ws-block-check="'+esc(b.id)+'"'+(b.checked?' checked':'')+'>':'')+'<div contenteditable="true" role="textbox" aria-label="'+({heading:'Kop',quote:'Citaat',check:'Checklistpunt',text:'Tekstblok'}[b.type])+'" data-ws-block="'+esc(b.id)+'">'+esc(b.text)+'</div></'+(b.type==='check'?'label':'div')+'>'+(workspaceEditorDesign?'<div class="kc-block-tools">'+btn('↑','ws-block-up',b.id)+btn('↓','ws-block-down',b.id)+btn('Verwijderen','ws-block-remove',b.id)+'</div>':'')+'</div>').join('')+'</div>'+(workspaceEditorDesign?btn('+ Tekstblok','ws-block','text'):'')+(workspaceEditorDesign?'<div class="kc-ws-tools">'+btn('Als sjabloon bewaren','ws-template-save')+btn('Afbeelding uit bijlagen invoegen','ws-inline-image')+btn('PDF-kaart invoegen','ws-inline-pdf')+'</div>':'');}
function renderTemplateFields(n){const t=ws().templates.find(t=>t.id===n.templateId);if(!t)return '';const missing=selectedId?W.missingFields(read(),selectedId):[];if(!(t.fields||[]).length&&!missing.length)return '';return '<details class="kc-compact-fold"><summary>Eigenschappen · '+esc(t.name)+'</summary>'+ (t.fields||[]).filter(f=>Object.hasOwn(n.properties||{},f.key)).map(f=>'<label>'+esc(f.label)+'<input type="'+esc(f.type)+'" data-ws-property="'+esc(f.key)+'" maxlength="2000" value="'+esc(n.properties[f.key])+'"></label>').join('')+(missing.length?'<p>'+missing.length+' nieuwe velden beschikbaar: '+missing.map(f=>esc(f.label)).join(', ')+'</p>'+btn('Nieuwe velden toevoegen','ws-template-fields'):'')+'</details>';}
function workspacePanelOpen(panel){if(!flush())return;workspacePanel=panel;screen='workspace';render();}
function workspaceAction(op,id,el){
 if(op==='ws-conflict'){clearTimeout(timer);workspacePanel='conflict';screen='workspace';render();return true;}
 if(op==='ws-copy'){const text=editing?.body||'';if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>notify('Tekst gekopieerd')).catch(()=>notify('Selecteer en kopieer de tekst handmatig.'));return true;}
 if(!workspaceReady())return false;
 if(op==='ws-page'){workspacePage=Number(id);render();return true;}
 if(op==='ws-fold'){workspaceWrite(life=>{const w=W.workspace(life);w.expanded=w.expanded.includes(id)?w.expanded.filter(x=>x!==id):[...w.expanded,id];});render();return true;}
 if(op==='ws-undo'){if(!workspaceUndo||JSON.stringify(read())!==workspaceUndoAfter){notify('Ongedaan maken kan niet na een nieuwere wijziging.');return true;}const prior=workspaceUndo;workspaceUndo=null;if(write(life=>{life.notes=prior.notes;life.knowledge=prior.knowledge;})){notice='Wijziging teruggedraaid.';render();}return true;}
 if(op==='ws-templates'){workspacePanelOpen('templates');return true;}
 if(op==='ws-template-use'){const old=screen==='collection'?collectionId:workspaceContext==='overview'?'inbox':workspaceContext;newNoteReturn={screen:'collection',collectionId:old};selectedId='';editing=W.newFromTemplate(read(),id,old);editing.title='';screen='edit';workspacePanel='';dirty=true;rememberBase();render();return true;}
 if(op==='ws-template-catalog'){fetch('./assets/memento-knowledge-templates.json?v=20261101-workspace-v2').then(r=>{if(!r.ok)throw Error('Sjabloonbestand niet beschikbaar');return r.json();}).then(data=>{if(data.format!=='memento-template-catalog'||data.version!==1||!Array.isArray(data.templates)||data.templates.length>100)throw Error('Onbekende sjabloonverzameling');let count=0;workspaceWrite(life=>{for(const t of data.templates)if(!W.workspace(life).templates.some(x=>x.name===t.template?.name)){W.importTemplate(life,t);count++;}});render();notify(count+' nieuwe sjablonen toegevoegd. Bestaande sjablonen en notities zijn behouden.');}).catch(e=>notify(e.message));return true;}
 if(op==='ws-template-confirm'){const target=host.querySelector('#kc-ws-template-target')?.value||'';if(workspaceWrite(life=>W.importTemplate(life,workspacePendingImport,target))){workspacePendingImport=null;workspacePanel='templates';render();notice='Sjabloon toegevoegd.';}return true;}
 if(op==='ws-map-template'){workspacePanel='map-template';screen='workspace';render();return true;}
 if(op==='ws-map-template-set'){workspaceWrite(life=>{W.workspace(life).preferences[collectionId]||={};W.workspace(life).preferences[collectionId].template=id;});workspacePanel='';screen='collection';render();return true;}
 if(op==='ws-template-fields'){if(flush()&&confirm('Alleen de ontbrekende velden toevoegen? Je ingevulde waarden blijven behouden.')){workspaceWrite(life=>W.addTemplateFields(life,selectedId));startEdit(selectedId);}return true;}
 if(op==='ws-template-save'){const name=prompt('Naam van je sjabloon');if(!name)return true;const payload={format:'memento-template',version:1,template:{name,kind:editing.kind==='recipe'?'recipe':'note',document:editing.document}};if(workspaceWrite(life=>W.importTemplate(life,payload)))notify('Sjabloon bewaard. Bestaande notities blijven gelijk.');return true;}
 if(op==='ws-convert'){startEdit(id||selectedId);workspaceConvert=W.document([{type:'text',text:editing.body}]);workspacePanel='conversion';screen='workspace';render();return true;}
 if(op==='ws-convert-confirm'){editing.document=workspaceConvert;dirty=true;screen='edit';workspacePanel='';schedule();render();return true;}
 if(op==='ws-original'){workspacePanel='';screen='edit';render();return true;}
 if(op==='ws-block'){if(!editing?.document)return true;editing.document.blocks.push({id:C.uid(),type:id,text:''});editing.body=C.documentText(editing.document);schedule();render();host.querySelector('[data-ws-block="'+editing.document.blocks.at(-1).id+'"]')?.focus();return true;}
 if(op==='ws-mark'){const b=editing?.document?.blocks.find(b=>b.id===workspaceBlock);if(!b){notify('Tik eerst in het tekstblok dat je wilt opmaken.');return true;}b.marks=b.marks||[];b.marks=b.marks.includes(id)?b.marks.filter(m=>m!==id):[...b.marks,id];schedule();render();return true;}
 if(op==='ws-block-up'||op==='ws-block-down'||op==='ws-block-remove'){const blocks=editing?.document?.blocks;if(!blocks)return true;const at=blocks.findIndex(b=>b.id===id);if(at<0)return true;if(op==='ws-block-remove')blocks.splice(at,1);else{const to=at+(op==='ws-block-up'?-1:1);if(to>=0&&to<blocks.length)[blocks[at],blocks[to]]=[blocks[to],blocks[at]];}editing.body=C.documentText(editing.document);schedule();render();return true;}
 if(op==='ws-editor-design'){workspaceEditorDesign=!workspaceEditorDesign;render();return true;}
 if(op==='ws-inline-image'||op==='ws-inline-pdf'){const wanted=op==='ws-inline-image'?'image/':'application/pdf',items=(editing.attachments||[]).filter(a=>a.type.startsWith(wanted));if(!items.length){notify('Voeg eerst een passende bijlage toe via het bestandsveld.');return true;}const input=prompt('Kies het nummer van een bijlage:\n'+items.map((a,i)=>(i+1)+'. '+a.name).join('\n'),'1'),f=items[Number(input)-1];if(!f)return true;editing.document.blocks.push({id:C.uid(),type:op==='ws-inline-image'?'image':'pdf',fileId:f.id,text:f.name});editing.body=C.documentText(editing.document);schedule();render();return true;}
 if(op==='ws-locations'){workspacePanelOpen('locations');return true;}
 if(op==='ws-locations-save'){const ids=[...host.querySelectorAll('[data-ws-location]:checked')].map(x=>x.dataset.wsLocation);if(workspaceWrite(life=>W.setLocations(life,selectedId,ids,C.collectionOf(life,life.notes.find(n=>n.id===selectedId))),{undo:true})){editing=null;workspacePanel='';screen='detail';notice='Mapkoppelingen bewaard.';render();}return true;}
 if(op==='ws-delete-folder'){workspacePanelOpen('delete-folder');return true;}
 if(op==='ws-delete-confirm'){if(workspaceWrite(life=>W.deleteFolder(life,collectionId),{undo:true})){colDraft=null;workspacePanel='';screen='collections';notice='Mappen verwijderd. Notities behouden.';render();}return true;}
 if(op==='ws-process'){workspacePanelOpen('process');return true;}
 if(op==='ws-process-next'){const destination=host.querySelector('#kc-ws-destination')?.value;if(!destination){notify('Maak eerst een map aan.');return true;}if(workspaceWrite(life=>W.setLocations(life,id,[destination],destination),{undo:true}))render();return true;}
 if(op==='ws-inbox-tag'){const n=C.search(read(),{collectionId:'inbox'})[0];if(n&&workspaceWrite(life=>{const target=life.notes.find(x=>x.id===n.id);C.updateNote(life,n.id,{tags:[...new Set([...(target.tags||[]),id])]});}))render();return true;}
 if(op==='ws-tag'){if(editing){editing.tags=[...new Set([...(editing.tags||[]),id])];schedule();render();}return true;}
 if(op==='ws-related'){if(workspaceWrite(life=>{const n=life.notes.find(n=>n.id===selectedId);C.updateNote(life,n.id,{links:[...(n.links||[]),{kind:'note',id}]});})){editing=null;render();}return true;}
 if(op==='ws-design'){workspaceDesign=!workspaceDesign;render();return true;}
 if(op==='ws-widget-permission'){workspaceWrite(life=>{const widget=W.workspace(life).dashboards[workspaceContext]?.find(w=>w.id===id);if(widget){if(widget.granted)widget.granted=false;else if(confirm('Deze widget toegang tot '+widget.source+' verlenen?'))widget.granted=true;}});render();return true;}
 if(op==='ws-widget-position'){const col=Number(prompt('Desktopkolom (1 of 2)','1')),row=Number(prompt('Desktoprij (1 t/m 20)','1'));if([1,2].includes(col)&&Number.isInteger(row)&&row>=1&&row<=20){workspaceWrite(life=>{const widget=W.workspace(life).dashboards[workspaceContext]?.find(w=>w.id===id);if(widget)Object.assign(widget,{column:col,row});});render();}return true;}
 if(op==='ws-widget-add'){workspacePanelOpen('widget-add');return true;}
 if(op==='ws-widget-confirm'){if(!host.querySelector('#kc-ws-widget-consent')?.checked){notify('Bevestig toegang tot de gekozen bron.');return true;}const type=host.querySelector('#kc-ws-widget-type').value,source=['tasks','appointments','finance'].includes(type)?type:'knowledge';const widget={id:C.uid(),type,size:host.querySelector('#kc-ws-widget-size').value,source,granted:true,collectionId:source==='knowledge'?host.querySelector('#kc-ws-widget-map').value:''};if(workspaceWrite(life=>{const w=W.workspace(life);w.dashboards[workspaceContext]=[...W.widgets(life,workspaceContext),widget];})){workspacePanel='';screen=workspaceContext==='overview'?'home':'collection';render();}return true;}
 if(['ws-widget-up','ws-widget-down','ws-widget-size','ws-widget-hide'].includes(op)){workspaceWrite(life=>{const w=W.workspace(life),items=C.clone(W.widgets(life,workspaceContext));if(op==='ws-widget-up'||op==='ws-widget-down'){const at=Number(id),to=at+(op==='ws-widget-up'?-1:1);if(to>=0&&to<items.length)[items[at],items[to]]=[items[to],items[at]];}else{const at=items.findIndex(w=>w.id===id);if(at<0)return;if(op==='ws-widget-hide')items.splice(at,1);else items[at].size=items[at].size==='wide'?'small':'wide';}w.dashboards[workspaceContext]=items;});render();return true;}
 if(op==='ws-widget-image-settings'){const caption=host.querySelector('#kc-ws-widget-caption').value,focus=Number(host.querySelector('#kc-ws-widget-focus').value);workspaceWrite(life=>{const widget=W.workspace(life).dashboards[workspaceContext]?.find(w=>w.id===workspaceBlock);if(widget)Object.assign(widget,{caption,focus});});workspacePanel='';screen=workspaceContext==='overview'?'home':'collection';render();return true;}
 if(op==='ws-widget-image'){workspaceBlock=id;workspacePanelOpen('widget-image');return true;}
 if(op==='ws-background'){workspacePanelOpen('background');return true;}
 if(op==='ws-background-save'){const dim=Number(host.querySelector('#kc-ws-dim').value),focus=Number(host.querySelector('#kc-ws-focus').value);workspaceWrite(life=>{const w=W.workspace(life);if(w.background)Object.assign(w.background,{dim,focus});});screen='home';workspacePanel='';render();return true;}
 if(op==='ws-background-clear'){workspaceWrite(life=>{W.workspace(life).background=null;});screen='home';workspacePanel='';render();return true;}
 if(op==='ws-backup'){workspacePanelOpen('backup');return true;}
 if(op==='ws-export'){workspaceExport();return true;}
 if(op==='ws-restore-confirm'){workspaceRestore();return true;}
 if(op==='ws-storage'){S.storageInfo().then(info=>notify(info?'Opslag: '+Math.round(info.used/1048576)+' MB / '+Math.round(info.quota/1048576)+' MB. '+(info.quota-info.used<50*1048576?'Weinig ruimte. Maak een back-up.':'Maak regelmatig een externe back-up.'):'Opslaginformatie niet beschikbaar.'));return true;}
 if(op==='ws-journal'){const c=collections().find(c=>c.special==='journal');if(c){collectionId=c.id;openJournal(C.journalDate());}return true;}
 if(op==='ws-compare'){workspaceBlock=id;workspacePanelOpen('versions-compare');return true;}
 return false;
}
async function workspaceExport(){
 if(workspaceBusy)return;const pass=host.querySelector('#kc-ws-password')?.value||'',repeat=host.querySelector('#kc-ws-password-repeat')?.value||'';if(pass!==repeat){notify('De wachtwoorden komen niet overeen.');return;}
 workspaceBusy=true;let token;try{token=root.MementoStorageGuard.beginOperation();const result=await KB.create(C.clone(read()),S,pass);root.MementoCompleteBackup.download(result.blob,'memento-kenniscentrum-'+C.journalDate()+(pass?'.mkc':'.zip'));notify('Kenniscentrum-back-up gemaakt.');}catch(e){notify(e.message);}finally{if(token)root.MementoStorageGuard.endOperation(token);workspaceBusy=false;}
}
async function workspaceRestore(){
 if(workspaceBusy||!workspacePendingImport?.incoming)return;workspaceBusy=true;let token;const added=[];
 try{const g=root.MementoStorageGuard;token=g.beginOperation();const plan=workspacePendingImport;const old=await KB.create(C.clone(read()),S);const raw=old.blob;await S.putRecord({id:'kc-before-restore-v2',noteId:'kc-system-snapshot',name:'Kenniscentrum herstelkopie',type:'application/zip',blob:raw,size:raw.size,hash:await S.sha256(raw),createdAt:C.timestamp()},token);
 const existing=new Map((await S.all()).map(r=>[r.id,r]));for(const r of plan.files){const prev=existing.get(r.id);if(prev&&await S.sha256(prev.blob)!==r.hash)throw Error('Bestands-ID bestaat met andere inhoud. Herstel geannuleerd.');}
 for(const r of plan.files)if(!existing.has(r.id)){await S.putRecord(r,token);added.push(r.id);}
 if(!write(life=>W.replaceProjection(life,plan.incoming),token))throw Error('Herstel niet opgeslagen. De bestaande gegevens blijven behouden.');
 workspacePendingImport=null;editing=null;workspacePanel='';screen='home';notice='Kenniscentrum hersteld; overige Memento-inhoud behouden.';render();
 }catch(e){for(const id of added)try{await S.remove(id,token)}catch{}notify(e.message);}finally{if(token)root.MementoStorageGuard.endOperation(token);workspaceBusy=false;}
}
async function workspaceImage(file,target){
 if(!file||workspaceBusy)return;workspaceBusy=true;let token,meta;
 try{if(file.size>8*1024*1024||!(await S.inspect(file)).startsWith('image/'))throw Error('Kies PNG, JPG of WebP van maximaal 8 MB.');token=root.MementoStorageGuard.beginOperation();meta=await S.save('kc-workspace-image-'+C.uid(),file,token);
 if(!write(life=>{const w=W.workspace(life);if(target==='background')w.background={file:meta,dim:75,focus:50};else{const widget=w.dashboards[workspaceContext]?.find(w=>w.id===workspaceBlock);if(!widget)throw Error('Widget ontbreekt');widget.image=meta;widget.name=file.name.slice(0,80);}W.validate(life);},token))throw Error('Afbeelding niet gekoppeld.');
 render();notify('Afbeelding opgeslagen en opgenomen in de back-up.');
 }catch(e){if(meta&&token)try{await S.remove(meta.id,token)}catch{}notify(e.message);}finally{if(token)root.MementoStorageGuard.endOperation(token);workspaceBusy=false;}
}
function hydrateWorkspace(){
 if(!workspaceReady())return;
 const app=host.querySelector('.kc-app'),bg=ws().background;
 if(screen==='home'&&bg?.file){const img=document.createElement('img');img.className='kc-workspace-bg';img.dataset.kcCoverFile=bg.file.id;img.alt='';img.style.objectPosition=(bg.focus??50)+'% center';app.prepend(img);app.style.setProperty('--kc-background-opacity',String(1-(bg.dim||75)/100));}
 const vp=host.querySelector('.kc-topic-viewport');if(!vp)return;let start=null,suppress=false;
 vp.addEventListener('pointerdown',e=>{if(e.button===0)start={x:e.clientX,y:e.clientY,id:e.pointerId};});
 vp.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dy)>20&&Math.abs(dy)>Math.abs(dx)){start=null;return;}if(Math.abs(dx)>15&&Math.abs(dx)>Math.abs(dy)*1.3)vp.setPointerCapture(e.pointerId);});
 vp.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){suppress=true;setTimeout(()=>{suppress=false},400);const pages=Math.max(1,Math.ceil((rootCollections().length+legacyCollections().length+1)/4));workspacePage=Math.max(0,Math.min(pages-1,workspacePage+(dx>0?1:-1)));render();}});
 vp.addEventListener('pointercancel',()=>{start=null});vp.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopPropagation();}},true);
 vp.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const pages=Math.max(1,Math.ceil((rootCollections().length+legacyCollections().length+1)/4));workspacePage=Math.max(0,Math.min(pages-1,workspacePage+(e.key==='ArrowRight'?1:-1)));render();host.querySelector('.kc-topic-viewport')?.focus();}});
}

const DRAFT_KEY="memento_note_draft_v1";
let editingBase="",recoveryChecked=false;
function rememberBase(){editingBase=selectedId?JSON.stringify(read().notes.find(n=>n.id===selectedId)||null):"";}
function rememberDraft(){
 if(!editing||!dirty)return;
 try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify({version:1,id:selectedId,base:editingBase,draft:editing,screen,collectionId}));}catch{}
}
function forgetDraft(){try{sessionStorage.removeItem(DRAFT_KEY);}catch{}}
function recoverDraft(){
 let rec;try{rec=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||"null");}catch{return;}
 if(!rec||rec.version!==1||!rec.draft||typeof rec.draft.body!=="string")return;
 if(!confirm("Er is een niet opgeslagen notitieconcept in dit tabblad. Concept hervatten?"))return;
 selectedId=rec.id||"";editing=C.clone(rec.draft);editingBase=rec.base||"";collectionId=rec.collectionId||editing.collectionId||"inbox";dirty=true;screen="edit";render();
 if(selectedId&&JSON.stringify(read().notes.find(n=>n.id===selectedId)||null)!==editingBase){notify("Deze notitie heeft inmiddels een nieuwere versie. Je concept blijft zichtbaar om te kopiëren; het overschrijft die versie niet.");setSaveIndicator("Conflict · nieuwere versie");}
}
function write(mutator,token){
 try{const ok=bridge.write(life=>{C.ensure(life);try{mutator(life);C.validate(life);if(life.knowledge?.workspace)W.validate(life);}catch(e){notify(e.message);throw e;}},token);if(!ok&&!notice)notify("Opslaan mislukt. Je invoer is behouden; sluit de melding en probeer opnieuw.");return ok;}catch(e){notify(e.message);return false;}
}
function flush(){
 if(!editing)return true;
 if(editing.journal&&host?.querySelector("[data-kc-manual-health]:invalid")){setSaveIndicator("Controleer de gezondheidswaarden");notify("Controleer de ingevulde gezondheidswaarden.");return false;}
 if(!dirty)return true;
 rememberDraft();
 if(selectedId&&editingBase&&JSON.stringify(read().notes.find(n=>n.id===selectedId)||null)!==editingBase){notify("Deze notitie is inmiddels gewijzigd. Kopieer je concept; de nieuwere versie blijft behouden.");setSaveIndicator("Conflict · nieuwere versie");return false;}
 const draft=C.clone(editing),life=read();
 setSaveIndicator("Opslaan…");
 if(!draft.title.trim())draft.title=draft.journal?draft.journal.date:String(draft.body||"").trim().split("\n")[0].slice(0,85)||"Naamloze notitie";
 if(!draft.body.trim()&&draft.title==="Naamloze notitie"&&!draft.attachments?.length&&!selectedId){dirty=false;return true;}
 if(draft.sourceUrl&&!safeURL(draft.sourceUrl)){notify("Gebruik een geldige http- of https-link.");setSaveIndicator("Controleer de bronlink");return false;}
 if(draft.journal&&!C.journalHasContent(draft.body,draft.journal)){setSaveIndicator("Leeg concept · niet opgeslagen");if(!selectedId){dirty=false;forgetDraft();return true;}notify("Vul eerst iets in voordat je je dagboek leegmaakt.");return false;}
 const changed=write(state=>{
  if(draft.journal){const saved=C.saveJournal(state,{id:selectedId||undefined,date:draft.journal.date,mood:draft.journal.mood,checkin:draft.journal.checkin,audioOnly:draft.journal.audioOnly,selfCare:draft.journal.selfCare,health:draft.journal.health,manualHealth:draft.journal.manualHealth??null,title:draft.title,body:draft.body,tags:draft.tags,collectionId:draft.collectionId});draft.id=saved.id;return;}
  if(selectedId){C.updateNote(state,selectedId,{title:draft.title,body:draft.body,kind:draft.kind,collectionId:draft.collectionId,tags:draft.tags,sourceUrl:draft.sourceUrl,recipe:draft.recipe||null,...(draft.document?{document:draft.document}:{}),...(draft.properties?{properties:draft.properties}:{}),...(draft.collectionIds?{collectionIds:draft.collectionIds}:{})});}
  else {draft.revision=1;state.notes.unshift(draft);}
 });
 if(!changed){setSaveIndicator("Opslaan mislukt · invoer bewaard");return false;}
 selectedId=draft.id;editing=C.clone(read().notes.find(n=>n.id===draft.id));dirty=false;notice="";rememberBase();forgetDraft();
 setSaveIndicator("Opgeslagen");root.MementoFeedback?.success(host?.querySelector("#kc-save-state"));return true;
}
function setSaveIndicator(label){const el=host?.querySelector("#kc-save-state");if(el){el.textContent=label;if(/mislukt|nieuwere versie/i.test(label)){el.insertAdjacentHTML?.('beforeend',btn('Opnieuw proberen','save')+btn('Tekst kopiëren','ws-copy')+btn('Versies vergelijken','ws-conflict'));}}}
function schedule(){dirty=true;rememberDraft();setSaveIndicator("Concept");clearTimeout(timer);timer=setTimeout(()=>flush(),850);}
function leave(next,id=""){
 stopDiaryDictation();
 clearTimeout(timer);if(!flush())return false;
 editing=null;screen=next;if(id)collectionId=id;notice="";render();return true;
}
function beginNew(cid){
 if(workspaceReady()){newNoteReturn={screen,collectionId};selectedId='';editing=W.newFromTemplate(read(),ws().preferences[cid]?.template||'blank',cid||'inbox');editing.title='';dirty=false;screen='edit';rememberBase();render();return;}
 newNoteReturn={screen,collectionId};
 stopDiaryDictation();selectedId="";const state=read();editing=C.makeNote({title:"",body:"",collectionId:cid||"inbox",kind:"note"},state);dirty=false;screen="edit";rememberBase();render();
}
function startEdit(id){
 stopDiaryDictation();const note=read().notes.find(x=>x.id===id);if(!note)return;
 selectedId=id;editing=C.clone(note);editing.kind=C.typeOf(note);editing.collectionId=C.collectionOf(read(),note);
 if(!editing.tags)editing.tags=[];
 if(!editing.attachments)editing.attachments=[];
 if(!editing.recipe&&editing.kind==="recipe")editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
 dirty=false;screen="edit";rememberBase();render();
}
function back(){
 if(screen==="detail"&&searchReturn){const y=searchReturn.y;searchReturn=null;screen="search";render();requestAnimationFrame(()=>window.scrollTo(0,y));return;}
 if(screen==='sort'){screen=sortState.parentId?'collection':'home';if(sortState.parentId)collectionId=sortState.parentId;sortState=null;render();return;}
 if(screen==='collection-editor'){cancelCollection();return;}
 if(screen==='collection'){const c=allCollections().find(c=>c.id===collectionId),next=c?.parentId?'collection':'home';if(historyBackTo(next,c?.parentId))return;resetListFilters();collectionId=c?.parentId||collectionId;screen=next;render();return;}
 if(screen==="edit"){const next=selectedId?{screen:'detail'}:editing?.journal?{screen:'collection'}:newNoteReturn||{screen:'home'};if(!leave(next.screen,next.collectionId))return;newNoteReturn=null;return}
 if(screen==="file"){if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl="";fileRecord=null;screen="detail";}
 else if(screen==="versions"||screen==="link")screen="detail";
 else if(screen==="detail"){const note=read().notes.find(x=>x.id===selectedId),cid=C.collectionOf(read(),note||{}),next=cid==='inbox'?'inbox':'collection';if(historyBackTo(next,cid))return;collectionId=cid;screen=next;}
 else if(screen==="collection-editor")screen="collections";
 else screen="home";
 notice="";render();
}
async function attach(files){
 if(!S){notify("De bestandsopslag is niet beschikbaar.");return}
 if(!files?.length)return;
 if(!selectedId&&editing&&!editing.body.trim()){
  editing.title=editing.title==="Naamloze notitie"?String(files[0].name||"Bijlage").slice(0,180):editing.title;
  editing.kind=String(files[0].type).includes("pdf")?"pdf":"image";
  dirty=true;
 }
 if(!flush()){notify("Sla de notitie eerst op voordat je een bijlage toevoegt.");return}
 const guard=root.MementoStorageGuard;let token;
 try{
  if(!guard)throw Error("Veilige opslag ontbreekt. Vernieuw Memento.");
  token=guard.beginOperation();
  setSaveIndicator("Bijlagen worden opgeslagen…");
 for(const file of files){
  let saved=null;
  try{
   saved=await S.save(selectedId,file,token);
   const success=write(state=>{const n=state.notes.find(x=>x.id===selectedId);C.updateNote(state,n.id,{attachments:[...(n.attachments||[]),saved]});},token);
   if(!success){await S.remove(saved.id,token);throw Error("De bijlage kon niet aan de notitie worden gekoppeld.");}
  }catch(e){notify(e.message||"Bijlage kon niet worden opgeslagen.");}
 }
  startEdit(selectedId);
 }catch(e){notify(e.message||"Bijlage kon niet worden opgeslagen.");}
 finally{if(token)guard.endOperation(token)}
}
async function openFile(id){
 if(!S){notify("Bestandsopslag ontbreekt");return}
 const record=await S.get(id);
 if(!record){notify("Bestand ontbreekt. Probeer een volledige back-up te herstellen.");return;}
 if(fileUrl)URL.revokeObjectURL(fileUrl);
 fileUrl=S.preview(record);fileRecord=record;fileId=id;screen="file";render();
}

function diaryRefresh(){
 const sum=host?.querySelector("#kc-diary-summary");
 if(sum&&editing?.journal)sum.textContent=diarySummary(editing.journal);
}
function copyDiaryAI(){
 const t=String(editing?.body||"").trim(),el=host?.querySelector("#kc-ai-status");
 if(!t){if(el)el.textContent="Schrijf eerst tekst. Audio wordt zonder transcriptiedienst niet automatisch tekst.";return;}
 const prompt="Corrigeer spelling, interpunctie en zinsopbouw van deze Nederlandse dagboektekst. Behoud mijn ik-vorm, bedoeling en feiten. Verzin niets. Geef alleen de verbeterde versie en een optionele korte titel.\n\n"+t;
 if(!navigator.clipboard?.writeText){if(el)el.textContent="Klembord niet beschikbaar.";return;}
 navigator.clipboard.writeText(prompt).then(()=>{if(el)el.textContent="Opdracht gekopieerd. Open de ChatGPT-app en plak de opdracht.";}).catch(()=>{if(el)el.textContent="Kopiëren mislukt; controleer de klembordrechten.";});
}
function click(event){
 const el=event.target.closest("[data-kc]");if(!el||!host?.contains(el))return;
 const op=el.dataset.kc,id=el.dataset.id||"";
 const editorMenu=host.querySelector("#kc-editor-menu");
 const editorSheet=id=>host.querySelector('#'+id);
 const showEditorSheet=id=>{const dialog=editorSheet(id);if(dialog&&!dialog.open)dialog.showModal();};
 const closeEditorSheets=()=>host.querySelectorAll('.kc-v3-sheet[open]').forEach(dialog=>dialog.close());
 if(op==='editor-sheet-close'){el.closest('dialog')?.close();return;}
 if(op==='editor-folder'){showEditorSheet('kc-v3-folder-sheet');return;}
 if(op==='editor-folder-select'){if(!editing)return;editing.collectionId=id;schedule();render();return;}
 if(op==='editor-tags'){showEditorSheet('kc-v3-tags-sheet');return;}
 if(op==='editor-tags-apply'){
  if(!editing)return;
  const raw=host.querySelector('#kc-v3-tags-input')?.value||'';
  editing.tags=[...new Set(raw.split(',').map(t=>t.trim().replace(/^#/,'').slice(0,60)).filter(Boolean))].slice(0,30);
  schedule();render();return;
 }
 if(op==='editor-linked-folders'){if(!flush())return;showEditorSheet('kc-v3-locations-sheet');return;}
 if(op==='editor-locations-save'){
  if(!flush())return;
  const ids=[...host.querySelectorAll('[data-kc-location]:checked')].map(x=>x.dataset.kcLocation);
  const ok=workspaceWrite(life=>{
   const note=life.notes.find(n=>n.id===selectedId);
   if(!note)throw Error('Notitie niet gevonden.');
   W.setLocations(life,selectedId,ids,C.collectionOf(life,note));
  },{undo:true});
  if(ok)startEdit(selectedId);
  return;
 }
 if(op==='editor-followup'){if(!flush())return;showEditorSheet('kc-v3-followup-sheet');return;}
 if(op==='editor-followup-kind'){
  if(!flush())return;
  closeEditorSheets();
  if(!root.MementoLifeFlow?.start?.('note',selectedId)){notify('Slim opvolgen is niet beschikbaar.');return;}
  const target=document.getElementById('followupTarget');
  if(target){target.value=id;target.dispatchEvent(new Event('change',{bubbles:true}));}
  return;
 }
 if(op==='editor-relations'){showEditorSheet('kc-v3-relations-sheet');return;}
 if(op==='editor-block-options'){editorMenu?.close();showEditorSheet('kc-v3-block-tools-sheet');return;}
 if(op==='ws-bullets'||op==='ws-insert-link'){
  if(!editing?.document)return;
  let block=editing.document.blocks.find(b=>b.id===workspaceBlock&&!['image','pdf'].includes(b.type));
  if(!block){block={id:C.uid(),type:'text',text:''};editing.document.blocks.push(block);}
  if(op==='ws-bullets')block.text=block.text.split('\n').map(line=>'• '+line.replace(/^• /,'')).join('\n');
  else{
   const href=prompt('Link (https://)','https://');
   if(!href)return;
   const safe=safeURL(href);
   if(!safe){notify('Gebruik een geldige http- of https-link.');return;}
   block.text+=(block.text?' ':'')+safe;
  }
  editing.body=C.documentText(editing.document);workspaceBlock=block.id;schedule();render();return;
 }
 if(op==='editor-manual-passage'){closeEditorSheets();showEditorSheet('kc-v3-manual-sheet');return;}
 if(op==='editor-attachments'){if(!flush())return;showEditorSheet('kc-v3-attachments-sheet');return;}
 if(op==='editor-link-note'){if(!flush())return;closeEditorSheets();linkQuery='';screen='link';render();return;}
 if(op==="editor-menu"){editorMenu?.showModal();return;}
 if(op==="editor-menu-close"){editorMenu?.close();return;}
 if(editorMenu?.open)editorMenu.close();
 if(op==='followup-start'){if(!flush())return;root.MementoLifeFlow?.start('note',id);return;}
 if(op==='followup-open'){if(!flush())return;const sep=id.indexOf('|');if(sep<0)return;const kind=id.slice(0,sep),recordId=id.slice(sep+1);
  if(kind==='note')root.MementoKnowledge?.showNote?.(recordId);
  else if(kind==='google')notify('De bronafspraak blijft in Google Agenda.');
  else bridge.openRelated?.(kind,recordId);
  return;
 }
 if(op==='recipe-add'||op==='recipe-remove'){if(!editing)return;editing.recipe||={ingredients:[],status:'concept',version:1,notes:''};if(op==='recipe-add')editing.recipe.ingredients.push({name:'',amount:'',unit:''});else editing.recipe.ingredients.splice(Number(id),1);schedule();render();return;}
 if(op==='recipe-shop'){if(!flush())return;screen='recipe-groceries';render();return;}
 if(op==='recipe-shop-confirm'){const n=read().notes.find(n=>n.id===selectedId);if(!n)return;const rows=ingredientRows(n.recipe).filter((x,i)=>host.querySelector('[data-mg-shop="'+i+'"]')?.checked);if(!rows.length){notify('Kies ten minste één ingrediënt.');return;}if(!confirm(rows.length+' ingrediënten op je boodschappenlijst zetten?'))return;if(bridge.addRecipeIngredients?.(rows)){screen='detail';notice='Ingrediënten toegevoegd.';render();}else notify('Ingrediënten niet opgeslagen. Probeer opnieuw.');return;}

 if(op==="central-clear"){centralQuery="";centralType="";centralCollection="";centralStatus="active";screen="search";render();root.MementoFeedback?.filter(host.querySelector(".kc-filter-status"));return;}
 if(op==="search-result"){if(!flush())return;searchReturn={y:window.scrollY};if(el.dataset.kind==="task")bridge.openRelated?.("task",id);else{if(selectedId!==id)recipeFactor=1;selectedId=id;editing=null;screen="detail";render();}return;}
 if(["selection-task","passage-task","convert-task"].includes(op)){
  const field=host.querySelector('#kc-body'),n=editing||read().notes.find(n=>n.id===selectedId);
  const passage=(op==="passage-task"?host.querySelector('#kc-task-passage')?.value:field?field.value.slice(field.selectionStart,field.selectionEnd):window.getSelection()?.toString())?.trim()||"";
  if(!passage||(op!=="passage-task"&&!n?.body?.includes(passage))){notify("Selecteer een passage in de notitie, of typ een actie bij ‘Passage invoeren’.");field?.focus();return;}
  if(!flush())return;bridge.convert?.(selectedId,"task",passage);return;
 }
 if(op==="recover-draft"){recoverDraft();return;}
 if(op==="discard-draft"){if(!confirm("Niet opgeslagen concept verwerpen? Opgeslagen tekst blijft behouden."))return;clearTimeout(timer);forgetDraft();dirty=false;editing=null;screen=selectedId?"detail":"home";render();return;}
 if(op==="writing-mode"){focusWriting=!focusWriting;host.classList.toggle("kc-focus-writing",focusWriting);el.textContent=focusWriting?"Normaal":"Schrijfstand";return;}
 if(screen==="detail"&&dirty&&!flush())return;
 if(workspaceAction(op,id,el))return;
 if(kc2Action(op,id,el))return;
 if(op==="quick-speech"){quickToggleSpeech();return;}
 if(op==="quick-save"){quickSave();return;}
 if(op==="quick-expand"){quickExpand();return;}
 if(op==="journal-jump"||op==="journal-date-open"||op==="journal-move"){
  stopDiaryDictation();
  const current=editing?.journal?.date||journalFilter||C.journalDate(),next=op==="journal-move"?diaryOffset(current,Number(id)):id;
  if(screen==="edit"){clearTimeout(timer);if(!flush())return;}
  journalFilter=next;if(screen==="collection"&&op!=="journal-date-open")render();else openJournal(next);return;
 }
 if(op==="journal-health-open"){clearTimeout(timer);if(!flush()){event.preventDefault();notify("Bewaar of corrigeer eerst je invoer voordat je Samsung Health opent.");}return;}
 if(op==="journal-prompt"&&editing?.journal){
  const input=host.querySelector("#kc-body");if(input){input.value+=(input.value.trim()?"\n\n":"")+id+"\n";editing.body=input.value;input.focus();schedule();}
  return;
 }
 if(op==="journal-speech"){toggleDiaryDictation();return;}
 if(op==="journal-ai-copy"){copyDiaryAI();return;}
 if(op==="purge-trash"){root.MementoLife?.openTrash?.();return}
 if(op==="back"){if(screen==="workspace"){workspacePanel="";if(editing){screen="edit";}else screen=workspaceContext==="overview"?"home":"collection";render();return;}back();return}
 if(op==="clear-filters"){query="";kindFilter="";tagFilter="";filtersExpanded=false;render();host.querySelector('[data-kc-input=search]')?.focus({preventScroll:true});return;}
 if(op==="new"&&workspaceReady()){if(!flush())return;const cid=screen==="collection"?collectionId:"inbox",tid=ws().preferences[cid]?.template||"blank";if(screen==="collection"&&allCollections().find(c=>c.id===cid)?.special==="journal"){openJournal(C.journalDate());return;}selectedId="";editing=W.newFromTemplate(read(),tid,cid);editing.title="";dirty=false;screen="edit";rememberBase();render();return;}
 if(op==="new"){const c=allCollections().find(c=>c.id===collectionId);if(screen==='collection'&&c?.special==='journal'){openJournal(C.journalDate());return;}beginNew(screen==="collection"?collectionId:"inbox");return}
 if(op==="collection"){if(el.closest('.kc-breadcrumbs')&&historyBackTo('collection',id))return;resetListFilters();journalFilter="";collectionId=id;screen="collection";if(workspaceReady())preferenceLoad(id);render();return}
 if(op==="collections"){screen="collections";render();return}
 if(["all","inbox","archive","trash","pinned"].includes(op)){filtersExpanded=false;screen=op;query="";kindFilter="";tagFilter="";viewOverride="";render();return}
 if(op==="mode"){filtersExpanded=true;viewOverride=id;preferenceSave();render();return}
 if(op==="open"){if(selectedId!==id)recipeFactor=1;selectedId=id;screen="detail";render();return}
 if(op==="edit"){startEdit(id);return}
 if(op==="save"){stopDiaryDictation();const journalDate=editing?.journal?.date||"";clearTimeout(timer);if(flush()){screen=journalDate?"collection":selectedId?"detail":"collection";if(journalDate)journalFilter=journalDate;editing=null;render();}return}
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
  field.setRangeText(next,a,b,"end");editing.body=field.value;if(kcV3SingleTextDocument(editing)){editing.document.blocks[0].text=field.value;editing.body=C.documentText(editing.document);}field.focus();growText();schedule();return;
 }
 if(op==="file"){openFile(id).catch(e=>notify(e.message));return}
 if(op==="remove-file"){
  const note=read().notes.find(n=>n.id===selectedId),attachment=note?.attachments?.find(a=>a.id===id);if(!confirm("Bijlage “"+(attachment?.name||"Onbekende bijlage")+"” loskoppelen van “"+(note?.title||"Deze notitie")+"”? Het bestand wordt niet direct definitief gewist."))return;
  if(!flush())return;
  if(write(s=>{const n=s.notes.find(x=>x.id===selectedId);C.updateNote(s,n.id,{attachments:(n.attachments||[]).filter(a=>a.id!==id)});})){startEdit(selectedId);}return;
 }
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
function cancelCollection(){
 if(colDraft?.dirty&&!confirm('Wijzigingen aan deze verzameling annuleren?'))return;
 const id=colDraft?.id;ArtUI?.clearPending();colDraft=null;screen=id?'collection':'home';if(id)collectionId=id;render();
}
function startSort(parentId){sortState={parentId:parentId||null,ids:children(parentId||null).map(c=>c.id)};screen='sort';render();}
function persistSort(ids){
 const before=children(sortState.parentId).map(c=>c.id);
 const ok=write(s=>C.reorderCollections(s,sortState.parentId,ids));
 sortState.ids=ok?ids:before;notice=ok?'Volgorde opgeslagen.':'Volgorde niet opgeslagen. De eerdere volgorde is teruggezet.';render();return ok;
}
function kc2Action(op,id,el){
 if(op==='migrate'){tryMigration();render();return true;}
 if(op==='home'){if(historyBackTo('home'))return true;screen='home';resetListFilters();journalFilter='';render();return true;}
 if(op==='new-sub'){openCollectionEditor('',id);return true;}
 if(op==='new-collection'){openCollectionEditor();return true;}
 if(op==='edit-collection'){openCollectionEditor(id);return true;}
 if(colDraft&&ArtUI?.interact(op,id,colDraft,host,render,notify))return true;
 if(op==='choose-icon'&&colDraft){colDraft.icon=id;colDraft.dirty=true;const current=host.querySelector('#kc-col-name');if(current)colDraft.name=current.value;render();host.querySelector('[data-kc="choose-icon"][data-id="'+id+'"]')?.focus();return true;}
 if(op==='cancel-collection'){cancelCollection();return true;}
 if(op==='save-collection'){
  if(!colDraft)return true;
  if(ArtUI)ArtUI.save(colDraft,{store:S,core:C,guard:root.MementoStorageGuard,write,onSaved:id=>{collectionId=id;colDraft=null;screen='collection';notice='Verzameling en illustratie opgeslagen.';render();},notify});
  else {let id=colDraft.id;if(write(state=>{id=C.saveCollection(state,colDraft).id;})){collectionId=id;colDraft=null;screen='collection';render();}}
  return true;
 }
 if(op==='archive-collection'||op==='restore-collection'){
  if(op==='archive-collection'&&!confirm('Verzameling archiveren? Notities en subverzamelingen blijven bewaard. Je kunt de verzameling later herstellen.'))return true;
  if(write(s=>C.setCollectionArchived(s,id,op==='archive-collection'))){colDraft=null;screen='collections';notice=op==='archive-collection'?'Verzameling gearchiveerd.':'Verzameling hersteld.';render();}return true;
 }
 if(op==='sort-roots'){startSort(null);return true;}
 if(op==='sort-children'){startSort(id);return true;}
 if(op==='sort-done'){back();return true;}
 if(op==='sort-up'||op==='sort-down'){
  const ids=[...sortState.ids],index=ids.indexOf(id),target=index+(op==='sort-up'?-1:1);if(index<0||target<0||target>=ids.length)return true;
  [ids[index],ids[target]]=[ids[target],ids[index]];persistSort(ids);
  host.querySelector('[data-kc="'+op+'"][data-id="'+id+'"]')?.focus();return true;
 }
 if(op==='journal-today'){collectionId=id;journalFilter=C.journalDate();openJournal(C.journalDate());return true;}
 if(op==='journal-open'){const n=read().notes.find(n=>n.id===id);if(n){journalFilter=n.journal.date;collectionId=C.collectionOf(read(),n);startEdit(id);}return true;}
 if(op==='journal-filter'){journalFilter=journalFilter?'':host.querySelector('#kc-journal-picker')?.value||'';render();return true;}
 if(op==='cancel-journal'){
  stopDiaryDictation();if(!flush())return true;

  if(dirty&&!confirm('Niet opgeslagen wijzigingen sluiten? Reeds automatisch opgeslagen tekst blijft bewaard.'))return true;
  clearTimeout(timer);editing=null;dirty=false;screen='collection';render();return true;
 }
 return false;
}
// SortableJS replaces the former pointer handler; Up/Down buttons still work.

document.addEventListener('submit',e=>{
 if(!host?.contains(e.target))return;
 if(e.target.id==='kc-capture-form'){e.preventDefault();quickSave();}
 if(e.target.id==='kc-journal-date-form'){e.preventDefault();const picker=host.querySelector('#kc-journal-picker');if(picker.checkValidity())openJournal(picker.value);}
 if(e.target.id==='kc-collection-form'){e.preventDefault();kc2Action('save-collection','',e.target);}
});

function growText(){
 for(const field of host?.querySelectorAll('textarea[data-kc-edit="body"]')||[]){
  field.style.height="auto";
  const keyboard=field.id==="kc-body"&&editing?.journal&&document.activeElement===field&&document.body.classList.contains("memento-diary-keyboard");
  const limit=keyboard?Math.max(165,Math.floor((root.visualViewport?.height||root.innerHeight)*.48)):Infinity;
  field.style.height=Math.min(Math.max(220,field.scrollHeight+2),limit)+"px";
  field.style.overflowY=keyboard?"auto":"hidden";
 }
}
function updateDiaryKeyboard(){
 const field=host?.querySelector("#kc-body");
 const focused=Boolean(field&&editing?.journal&&document.activeElement===field&&root.innerWidth<=800);
 const viewport=root.visualViewport?.height||root.innerHeight;
 const visible=focused&&diaryKeyboardBase-viewport>120;
 const changed=document.body.classList.contains("memento-diary-keyboard")!==visible;
 document.body.classList.toggle("memento-diary-keyboard",visible);
 if(changed){growText();if(visible)root.requestAnimationFrame(()=>{if(document.activeElement===field)field.scrollIntoView({block:"nearest",behavior:"instant"});});}
}

function onInput(event){
 const field=event.target,change=field.dataset.kcEdit;
 if(field.dataset.wsProperty&&editing){editing.properties||={};editing.properties[field.dataset.wsProperty]=field.value;schedule();return;}
 if(field.dataset.wsBlock&&editing?.document){const block=editing.document.blocks.find(b=>b.id===field.dataset.wsBlock);if(block){block.text=field.innerText.replace(/\r/g,'');editing.body=C.documentText(editing.document);workspaceBlock=block.id;schedule();}return;}
 if(field.dataset.kcInput==='journal-search'){journalSearch=field.value;const cursor=field.selectionStart;render();const next=host.querySelector('[data-kc-input="journal-search"]');next?.focus();next?.setSelectionRange(cursor,cursor);return;}
 if(field.dataset.mgIngredient!==undefined&&editing){const row=editing.recipe?.ingredients[Number(field.dataset.mgIngredient)];if(row){row[field.dataset.key]=field.value;const raw=host.querySelector('[data-kc-edit="ingredients"]');if(raw)raw.value=editing.recipe.ingredients.map(x=>[x.name,x.amount,x.unit].join(' | ')).join('\n');schedule();}return;}

 if(field.dataset.kcInput==="central-search"){centralQuery=field.value;screen="search";const cursor=field.selectionStart;render();const input=host.querySelector('[data-kc-input="central-search"]');input?.focus();input?.setSelectionRange(cursor,cursor);return;}
 if(field.dataset.kcInput==="quick"){quickDraft=field.value;return;}
 if(field.dataset.kcInput==="search"){if(!host?.contains(field))return;query=field.value;filtersExpanded=false;const cursor=field.selectionStart;render();const input=host.querySelector('[data-kc-input="search"]');if(input){input.focus();input.setSelectionRange(cursor,cursor);}return;}
 if(field.dataset.kcInput==="related-search"){linkQuery=field.value;render();host.querySelector('[data-kc-input="related-search"]')?.focus();return}
 if(colDraft&&ArtUI?.changed(field,host))return;
 if(field.dataset.kcCol&&colDraft){colDraft[field.dataset.kcCol]=field.value;colDraft.dirty=true;return;}
 if(field.dataset.kcManualHealth&&editing?.journal){
  const controls=[...host.querySelectorAll("[data-kc-manual-health]")];
  if(controls.some(el=>!el.validity.valid)){setSaveIndicator("Controleer de gezondheidswaarden");return;}
  const get=key=>controls.find(el=>el.dataset.kcManualHealth===key)?.value??"";
  const manual={version:1};
  const hours=get("sleepHours"),minutes=get("sleepRestMinutes");
  if(hours!==""||minutes!=="")manual.sleepMinutes=Number(hours||0)*60+Number(minutes||0);
  for(const key of ["steps","sleepScore","restingHeartRateBpm","exerciseMinutes"]){
   const value=get(key);if(value!=="")manual[key]=Number(value);
  }
  if(Object.keys(manual).length>1)editing.journal.manualHealth=manual;
  else delete editing.journal.manualHealth;
  diaryRefresh();schedule();return;
 }
 if(field.dataset.kcJournal&&editing?.journal){if(field.dataset.kcJournal==='date'&&editing.title===editing.journal.date)editing.title=field.value;editing.journal[field.dataset.kcJournal]=field.value;schedule();return;}
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
 if(change==="body"){if(kcV3SingleTextDocument(editing)){editing.document.blocks[0].text=field.value;editing.body=C.documentText(editing.document);workspaceBlock=editing.document.blocks[0].id;}if(diaryDictating&&!event.mementoDictation)stopDiaryDictation("Transcriptie gestopt om te typen.",false);if(host.querySelector("#kc-title")?.value==="")editing.title="";growText();}
 if(change==="kind"){
  if(field.value==="recipe"&&!editing.recipe)editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
  schedule();render();return;
 }
 schedule();
}
function onChange(event){
 const el=event.target;
 if(el.dataset.wsBlockCheck&&editing?.document){const block=editing.document.blocks.find(b=>b.id===el.dataset.wsBlockCheck);if(block){block.checked=el.checked;schedule();}return;}
 if(el.id==='kc-ws-template-file'){const file=el.files?.[0];if(file){if(file.size>1024*1024){notify('Sjabloonbestand te groot');return;}file.text().then(text=>{const parsed=JSON.parse(text),trial=C.clone(read());W.importTemplate(trial,parsed);workspacePendingImport=parsed;workspacePanel='template-preview';render();}).catch(e=>notify(e.message));}return;}
 if(el.id==='kc-ws-background-file'||el.id==='kc-ws-widget-file'){workspaceImage(el.files?.[0],el.id==='kc-ws-background-file'?'background':'widget');return;}
 if(el.id==='kc-ws-backup-file'){const file=el.files?.[0],pass=host.querySelector('#kc-ws-password')?.value||'';if(file)KB.prepare(file,S,pass).then(plan=>{workspacePendingImport=plan;workspacePanel='restore-preview';render();}).catch(e=>notify(e.message));return;}
 if(el.hasAttribute('data-mg-recipe-scale')){recipeFactor=Number(el.value)||1;render();return;}
 if(el.dataset.mgCook!==undefined){const checked=recipeChecks.get(selectedId)||new Set();if(el.checked)checked.add(Number(el.dataset.mgCook));else checked.delete(Number(el.dataset.mgCook));recipeChecks.set(selectedId,checked);return;}
 if(el.dataset.kcCentral){if(el.dataset.kcCentral==="type"){centralType=el.value;if(centralType==="task")centralCollection="";}if(el.dataset.kcCentral==="status")centralStatus=el.value;if(el.dataset.kcCentral==="collection"){centralCollection=el.value;if(centralCollection)centralType="note";}screen="search";render();root.MementoFeedback?.filter(host.querySelector(".kc-filter-status"));return;}
 if(el.dataset.kcCol||el.dataset.kcJournal||el.dataset.kcManualHealth){onInput(event);return;}
 if(el.dataset.kcChange){filtersExpanded=true;const val=el.value;if(el.dataset.kcChange==="kind")kindFilter=val;if(el.dataset.kcChange==="sort")sort=val;if(el.dataset.kcChange==="tag")tagFilter=val;preferenceSave();render();return}
 if(el.dataset.kcCheck){
  if(write(s=>C.toggleItem(s,el.dataset.note,el.dataset.kcCheck)))render();else el.checked=!el.checked;
  return;
 }
 if(el.id==="kc-file-input"){attach(Array.from(el.files||[]));}
 if(el.id==="kc-cover-file-input"&&colDraft)ArtUI?.fileChanged(el.files?.[0],colDraft,S,render,notify);
}
function prefillShared({title="",text="",url=""}={}){
 if(quickDraft.trim()){notify("Bewaar of werk je snelle notitie eerst uit.");return;}
 const destination="inbox",website=safeURL(url)||safeURL(text.trim());
 selectedId="";editing=C.makeNote({title:String(title||"").slice(0,180),body:String(text||"").slice(0,20000),collectionId:destination,kind:website?"link":"note"},read());
 if(website)editing.sourceUrl=website;
 screen="edit";dirty=true;notice="Gedeeld item staat als concept klaar. Controleer en sla op.";render();
 setSaveIndicator("Nog niet opgeslagen");
}
function mount(container,b){
 host=container;bridge=b;
 if(!bridge?.read||!bridge?.write){host.innerHTML='<p>Notities kan niet met Leven verbinden.</p>';return;}
 if(editing&&dirty&&screen==="edit"&&host.querySelector("#kc-body"))return;
 tryMigration();
 activateWorkspace();
 const guard=root.MementoStorageGuard;
 if((!read().knowledge?.hierarchyVersion||!workspaceReady())&&guard?.ready)guard.ready.then(()=>{if(host&&document.body.contains(host)&&!editing&&!colDraft){tryMigration();activateWorkspace();render();}});
 render();
 if(!recoveryChecked){recoveryChecked=true;recoverDraft();}
}
function hasPending(){return Boolean(workspaceBusy||editing&&dirty||colDraft?.dirty||ArtUI?.hasDraft()||quickDraft.trim()||quickListening||diaryDictating);}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){quickStop();stopDiaryDictation();if(hasPending())flush();}});
window.addEventListener("beforeunload",e=>{if(colDraft?.dirty||quickDraft.trim()||hasPending()&&!flush()){e.preventDefault();e.returnValue="";}});
document.addEventListener("toggle",e=>{if(e.target.id==="kc-filter-drawer")filtersExpanded=e.target.open;},true);
document.addEventListener('paste',e=>{if(host?.contains(e.target)&&e.target.matches('[data-ws-block]')){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));}});
document.addEventListener("focusin",e=>{
 if(e.target?.dataset.wsBlock)workspaceBlock=e.target.dataset.wsBlock;
 if(e.target?.id!=="kc-body"||!editing?.journal||!host?.contains(e.target))return;
 if(diaryDictating)stopDiaryDictation("Transcriptie gestopt om te typen.",false);
 diaryKeyboardBase=Math.max(root.visualViewport?.height||0,root.innerHeight);
 updateDiaryKeyboard();
});
document.addEventListener("focusout",e=>{if(e.target?.id!=="kc-body")return;root.setTimeout(()=>{if(document.activeElement!==e.target){diaryKeyboardBase=0;updateDiaryKeyboard();}},0);});
root.visualViewport?.addEventListener("resize",updateDiaryKeyboard);
document.addEventListener("click",e=>{if(host?.contains(e.target))click(e);});

document.addEventListener("click",e=>{
 const dialog=e.target?.closest?.(".kc-v3-sheet");
 if(dialog&&e.target===dialog&&dialog.open)dialog.close();
});

document.addEventListener("input",e=>{if(host?.contains(e.target)&&e.target.dataset.kcInput!=="search")onInput(e);});
document.addEventListener("change",e=>{if(host?.contains(e.target))onChange(e);});
root.MementoKnowledge={mount,hasPending,prefillShared,open:()=>{if(hasPending()){notify("Sla eerst je concept op of annuleer het.");return;}screen="home";editing=null;notice="";activateWorkspace();render();},newNote:()=>{if(!flush())return;beginNew("inbox");},showJournal:day=>{if(!flush())return;tryMigration();openJournal(day);},showNote:id=>{if(!flush())return;if(selectedId!==id)recipeFactor=1;selectedId=id;editing=null;screen="detail";render();}};
})(window);
