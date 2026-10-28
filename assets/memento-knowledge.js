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
let centralQuery="",centralType="",centralCollection="",centralStatus="active";
let focusWriting=false;
let colDraft=null,sortState=null,journalFilter="",migrationBusy=false,filtersExpanded=false;
let quickDraft="",quickSpeech=null,quickListening=false,quickToken=0;
let voiceRecorder=null,voiceStream=null,voiceFile=null,voiceURL="",voiceNotice="",voiceStarting=false,voiceToken=0;
let host=null,bridge=null,screen="home",collectionId="inbox",selectedId="",query="",kindFilter="",tagFilter="",sort="recent",listing="active",viewOverride="",editing=null,dirty=false,timer=0,notice="",fileUrl="",fileId="",fileRecord=null,linkQuery="";
const read=()=>bridge.read();
const allCollections=()=>C.ensure(read()).collections;
const collections=()=>allCollections().filter(c=>!c.archived&&!allCollections().some(p=>p.id===c.parentId&&p.archived));
const children=parent=>collections().filter(c=>parent===null?c.parentId===null:c.parentId===parent).sort((a,b)=>(a.order||0)-(b.order||0));
const rootCollections=()=>children(null);
const legacyCollections=()=>collections().filter(c=>c.parentId===undefined);
const pathName=c=>(c.parentId?C.collectionName(read(),c.parentId)+' › ':'')+c.name;
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
 '<div class="kc-head-label"><span>MEMENTO · NOTITIES</span><h2>'+esc(title)+'</h2></div>'+actions+"</header>";
}
function itemRows(items,mode="list"){
 if(!items.length)return '<div class="kc-empty"><strong>Nog geen kennisitems</strong><p>Voeg een item toe of pas de filters aan.</p></div>';
 return '<div class="kc-item-list kc-'+esc(mode)+'">'+items.map(n=>{
  const type=C.typeOf(n);
  return '<button type="button" class="kc-item" data-kc="open" data-id="'+esc(n.id)+'">'+
   '<span class="kc-item-icon" aria-hidden="true">'+itemIcon(n)+'</span><span class="kc-item-main"><strong>'+esc(n.title)+'</strong><small>'+esc(n.body?.trim()===n.title.trim()?kindNames[type]:String(n.body||n.sourceUrl||kindNames[type]||"").slice(0,95)||kindNames[type])+'</small>'+
    '<span class="kc-item-tags">'+chips(n.tags)+(n.pinned?'<span class="kc-tag">Vastgezet</span>':"")+'</span></span>'+
   '<span class="kc-item-side">'+(n.updatedAt?readable(n.updatedAt):"")+'<span aria-hidden="true">›</span></span></button>';
 }).join("")+"</div>";
}
function collectionRows(items){
 return '<div class="kc-collection-rows">'+items.map(c=>'<button type="button" data-kc="collection" data-id="'+esc(c.id)+'" class="kc-collection-row kc-art-row">'+collectionIcon(c)+'<span><strong>'+esc(c.name)+'</strong><small>'+counts(c.id)+(children(c.id).length?' notities incl. subverzamelingen · '+C.collectionCounts(read(),c.id).direct+' direct':' notities')+'</small></span><span class="kc-card-arrow" aria-hidden="true">›</span>'+(ArtUI?.cards(c,c.parentId?C.collectionName(read(),c.parentId):'')||'')+'</button>').join('')+'</div>';
}
function quickBox(){
 return '<section class="kc-quick" aria-label="Snelle notitie"><div class="kc-quick-head"><strong>Snel vastleggen</strong><small>Inbox</small></div>'+
 '<label class="kc-sr" for="kc-quick-text">Snelle notitie</label><textarea id="kc-quick-text" data-kc-input="quick" rows="2" maxlength="20000" placeholder="Wat wil je onthouden?">'+esc(quickDraft)+'</textarea>'+
 '<div class="kc-quick-actions"><button id="kc-quick-mic" type="button" data-kc="quick-speech" aria-label="'+(quickListening?'Stop inspreken':'Spraak transcriberen')+'" aria-pressed="'+quickListening+'" class="kc-quick-mic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg></button>'+
 btn("Uitwerken","quick-expand")+btn("Bewaar notitie","quick-save","",true)+'</div><p role="status" aria-live="polite" id="kc-quick-status">Controleer de transcriptie voordat je bewaart.</p></section>';
}
function quickMsg(t){const el=host?.querySelector("#kc-quick-status");if(el)el.textContent=t;}
function quickPaint(){const el=host?.querySelector("#kc-quick-mic");if(!el)return;el.classList.toggle("kc-listening",quickListening);el.setAttribute("aria-pressed",String(quickListening));el.setAttribute("aria-label",quickListening?"Stop inspreken":"Spraak transcriberen");}
function quickStop(){quickToken++;const r=quickSpeech;quickSpeech=null;quickListening=false;if(r)try{r.stop()}catch(e){}quickPaint();}
function quickToggleSpeech(){
 if(quickSpeech){quickStop();quickMsg("Opname gestopt. Controleer de tekst en bewaar.");return;}
 const field=host?.querySelector("#kc-quick-text");if(!field)return;
 const Speech=root.SpeechRecognition||root.webkitSpeechRecognition;
 if(!Speech){quickMsg("Spraakherkenning ontbreekt. Gebruik de microfoon van je Android-toetsenbord.");field.focus();return;}
 if(!root.isSecureContext){quickMsg("Inspreken vereist een beveiligde verbinding.");return;}
 root.MementoVoice?.stop?.();
 const token=++quickToken,initial=quickDraft.trim();let r;
 try{r=new Speech();}catch(e){quickMsg("Microfoon niet beschikbaar.");return;}
 quickSpeech=r;r.lang="nl-NL";r.continuous=false;r.interimResults=true;r.maxAlternatives=1;
 r.onstart=()=>{if(token!==quickToken)return;quickListening=true;quickPaint();quickMsg("Luisteren… Controleer de tekst na afloop.");};
 r.onresult=e=>{if(token!==quickToken)return;const words=[];for(let i=0;i<e.results.length;i++){const t=String(e.results[i][0]?.transcript||"").trim();if(t)words.push(t);}quickDraft=[initial,words.join(" ")].filter(Boolean).join(" ").slice(0,20000);const el=host?.querySelector("#kc-quick-text");if(el)el.value=quickDraft;};
 r.onerror=e=>{if(token!==quickToken)return;const msg={"not-allowed":"Microfoontoegang geweigerd.","no-speech":"Geen spraak herkend.","network":"Spraakherkenning niet bereikbaar.","audio-capture":"Microfoon niet beschikbaar."};quickStop();quickMsg(msg[e.error]||"Inspreken mislukt.");};
 r.onend=()=>{if(token!==quickToken)return;quickSpeech=null;quickListening=false;quickPaint();quickMsg(quickDraft.trim()?"Transcriptie klaar. Controleer en bewaar.":"Geen tekst herkend. Probeer opnieuw.");};
 try{r.start()}catch(e){quickStop();quickMsg("Opname kon niet starten.");}
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
 return header('Notities',false,btn('+ Notitie','new','',true))+
 centralSearchBox()+quickBox()+
 '<button type="button" class="kc-inbox" data-kc="inbox">'+symbol('folder')+'<strong>Inbox</strong><span>'+counts('inbox')+' items</span><span aria-hidden="true">›</span></button>'+
 (read().knowledge?.hierarchyVersion!==1?'<p class="kc-muted">Je bestaande verzamelingen zijn behouden.</p>'+btn('Nieuwe indeling toevoegen','migrate'):'')+
 '<div class="kc-section-head"><h3>Verzamelingen</h3><details class="kc-tools"><summary aria-label="Verzamelingen beheren">⋯</summary><div>'+btn('Hoofdverzameling toevoegen','new-collection')+btn('Volgorde wijzigen','sort-roots')+btn('Alle verzamelingen beheren','collections')+'</div></details></div>'+collectionRows(rootCollections())+
 (pinned.length?'<div class="kc-section-head"><h3>Vastgezet</h3></div>'+itemRows(pinned):'')+
 '<div class="kc-section-head"><h3>Recent bewaard</h3>'+btn('Alle items','all')+'</div>'+itemRows(items.slice(0,4))+
 (legacyCollections().length?'<details class="kc-legacy"><summary>Bestaande verzamelingen · '+legacyCollections().length+'</summary><p class="kc-muted">Behouden zonder automatische herindeling. Via Bewerken kies je zelf een bovenliggende verzameling.</p>'+collectionRows(legacyCollections())+'</details>':'')+
 '<div class="kc-hub-shortcuts">'+btn('Alle items','all')+btn('Archief','archive')+btn('Prullenbak','trash')+btn('Verzamelingen beheren','collections')+'</div>';
}
function centralSearchBox(){return '<label class="kc-central-search">Zoek in notities en taken<input type="search" data-kc-input="central-search" value="'+esc(centralQuery)+'" placeholder="Titel, inhoud of tags…" autocomplete="off"></label>';}
function renderCentralSearch(){
 const rows=C.centralSearch(read(),{query:centralQuery,type:centralType,collectionId:centralCollection,status:centralStatus});
 return header('Zoeken',true)+centralSearchBox()+'<div class="kc-central-filters">'+
 '<label>Type<select data-kc-central="type">'+[['','Notities en taken'],['note','Notities'],['task','Taken']].map(([v,l])=>'<option value="'+v+'"'+(centralType===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
 '<label>Status<select data-kc-central="status">'+[['active','Actief / open'],['all','Alle bewaarde items'],['done','Afgeronde taken'],['archive','Archief']].map(([v,l])=>'<option value="'+v+'"'+(centralStatus===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
 '<label>Verzameling<select data-kc-central="collection"><option value="">Alle bestemmingen</option><option value="inbox"'+(centralCollection==='inbox'?' selected':'')+'>Inbox</option>'+allCollections().map(c=>'<option value="'+esc(c.id)+'"'+(centralCollection===c.id?' selected':'')+'>'+esc(pathName(c))+'</option>').join('')+'</select></label></div>'+
 '<div class="kc-filter-status" role="status">'+rows.length+' resultaten · '+esc(centralQuery?'“'+centralQuery+'” · ':'')+esc(centralType==='task'?'Taken':centralType==='note'?'Notities':'Notities en taken')+' · '+esc({active:'Actief / open',all:'Alle bewaarde items',done:'Afgeronde taken',archive:'Archief'}[centralStatus])+(centralCollection?' · '+esc(C.collectionPath(read(),centralCollection)):'')+btn('Filters wissen','central-clear')+'</div>'+
 '<div class="kc-central-results">'+(rows.length?rows.map(x=>'<button class="kc-central-result" type="button" data-kc="search-result" data-kind="'+x.type+'" data-id="'+esc(x.id)+'"><small>'+esc(x.type==='task'?'Taak':'Notitie')+' · '+esc(x.context)+'</small><strong>'+esc(x.title)+'</strong><span>'+esc(x.snippet===x.title?'':x.snippet)+'</span></button>').join(''):'<p>Geen passende notities of taken.</p>')+'</div><p class="kc-muted">Zoekt lokaal in notities en taken. PDF-inhoud en financiële transacties hebben geen centrale zoekindex.</p>';
}
function breadcrumbs(){
 if(['home','edit','collection-editor','sort'].includes(screen))return '';
 const note=['detail','file','versions'].includes(screen)?read().notes.find(n=>n.id===selectedId):null;
 const cid=note?C.collectionOf(read(),note):collectionId;
 const c=allCollections().find(c=>c.id===cid),parent=c?.parentId?allCollections().find(x=>x.id===c.parentId):null;
 return '<nav class="kc-breadcrumbs" aria-label="Kruimelpad">'+btn('Notities','home')+(parent?'<span>›</span>'+btn(esc(parent.name),'collection',parent.id):'')+(c&&['collection','detail','file','versions'].includes(screen)?'<span>›</span>'+btn(esc(c.name),'collection',c.id):'')+'</nav>';
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
 if(screen==='collection'&&c?.special==='journal')return renderJournal(c);
 const subs=screen==='collection'?children(collectionId):[];
 return header(title,true,screen==="trash"?btn("Definitief leegmaken","purge-trash"):btn("+ Nieuw","new","",true))+
 (screen==='collection'?'<div class="kc-collection-actions"><details class="kc-tools"><summary aria-label="Instellingen van deze verzameling">Instellingen</summary><div>'+btn('Bewerken','edit-collection',collectionId)+(!c?.parentId?btn('Subverzameling toevoegen','new-sub',collectionId)+btn('Volgorde wijzigen','sort-children',collectionId):'')+'</div></details></div>'+collectionRows(subs)+(subs.length?'<h3 class="kc-content-caption">In deze verzameling</h3>':''):'')+
 '<details id="kc-filter-drawer" class="kc-filter-drawer"'+(filtersExpanded||query||kindFilter||tagFilter?' open':'')+'><summary>Zoeken en filteren'+(query||kindFilter||tagFilter?' · actief':'')+'</summary><div class="kc-filters"><label class="kc-search"><span class="kc-sr">Zoeken</span><input type="search" data-kc-input="search" placeholder="Zoek in titel, tekst en tags…" value="'+esc(query)+'"></label>'+
 '<div class="kc-filterline"><label>Type<select data-kc-change="kind"><option value="">Alles</option>'+Object.entries(kindNames).map(([v,n])=>'<option value="'+v+'"'+(kindFilter===v?" selected":"")+">"+n+"</option>").join("")+"</select></label>"+
 '<label>Tag<select data-kc-change="tag"><option value="">Alle tags</option>'+availableTags.map(v=>'<option value="'+esc(v)+'"'+(tagFilter===v?" selected":"")+">"+esc(v)+"</option>").join("")+"</select></label>"+
 '<label>Sortering<select data-kc-change="sort"><option value="recent"'+(sort==="recent"?" selected":"")+'>Recent</option><option value="title"'+(sort==="title"?" selected":"")+'>Titel</option><option value="old"'+(sort==="old"?" selected":"")+'>Oudste</option></select></label></div>'+
 '<div class="kc-mode-switch">'+btn("Lijst","mode","list",mode==="list")+btn("Galerij","mode","gallery",mode==="gallery")+btn("Tabel","mode","table",mode==="table")+'</div></div></details>'+
 '<p class="kc-count">'+items.length+' kennisitems</p>'+
 itemRows(items,mode)+
 (screen==="collection"?'<div class="kc-bottom-actions">'+btn("Verzameling beheren","edit-collection",collectionId)+"</div>":"");
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
 '<label>Bovenliggende verzameling<select id="kc-col-parent" data-kc-col="parentId"><option value="">Geen · hoofdverzameling</option>'+collections().filter(x=>!x.parentId&&x.id!==d.id).map(x=>'<option value="'+esc(x.id)+'"'+(d.parentId===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></label>'+
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
function sleepMinutes(c){
 if(!c?.sleepStart||!c?.sleepEnd)return null;
 const minutes=(new Date(c.sleepEnd)-new Date(c.sleepStart))/60000,awake=(c.latency||0)+(c.awake||0);
 return Number.isFinite(minutes)&&minutes>0&&minutes<=2160&&awake<=minutes?Math.round(minutes-awake):null;
}
function diarySummary(j){
 const c=j?.checkin||{},parts=[j?.mood||"",c.energy?"Energie "+c.energy+"/5":"",c.stress?"Stress "+c.stress+"/5":""],s=sleepMinutes(c);
 if(s!==null)parts.push("Slaap "+Math.floor(s/60)+"u "+String(s%60).padStart(2,"0")+"m");
 return parts.filter(Boolean).join(" · ")||"Stemming · Energie · Stress · Slaap";
}
function diaryCheckin(j){
 const c=j.checkin||{},opt=(key,title)=>'<label>'+title+'<select data-kc-checkin="'+key+'"><option value="">Niet ingevuld</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(c[key]===n?" selected":"")+'>'+n+" / 5"+'</option>').join("")+'</select></label>';
 const dt=(key,title)=>'<label>'+title+'<input type="datetime-local" data-kc-checkin="'+key+'" value="'+esc(c[key]||"")+'"></label>';
 const num=(key,title)=>'<label>'+title+'<input type="number" min="0" max="1440" step="1" inputmode="numeric" placeholder="0" data-kc-checkin="'+key+'" value="'+esc(c[key]??"")+'"></label>';
 return '<details class="kc-diary-checkin"><summary><span class="kc-diary-heart">♡</span><span><strong>Hoe voel je je vandaag?</strong><small id="kc-diary-summary">'+esc(diarySummary(j))+'</small></span><b>⌄</b></summary><div class="kc-diary-checkin-body">'+
 '<fieldset><legend>Stemming · optioneel</legend><div class="kc-diary-moods">'+[["Moeilijk","Slecht"],["Minder","Minder"],["Neutraal","Oké"],["Prima","Goed"],["Goed","Heel goed"]].map(([v,n])=>'<button type="button" data-kc="journal-mood" data-id="'+v+'" aria-pressed="'+(j.mood===v)+'">'+n+'</button>').join("")+'</div></fieldset>'+
 '<div class="kc-diary-fields">'+opt("energy","Energie")+opt("stress","Stress")+'</div>'+
 '<section class="kc-diary-sleep"><strong>◕ Slaap</strong><p>Ook overdag na een nachtdienst. Vul begin- en einddatum in; wakker gelegen tijd wordt afgetrokken.</p><div class="kc-diary-fields">'+dt("sleepStart","In bed vanaf")+dt("sleepEnd","Opgestaan op")+num("latency","Inslapen (min.)")+num("awake","Tussendoor wakker (min.)")+num("nap","Dutje (min.)")+'</div><small id="kc-diary-sleep-result">'+(sleepMinutes(c)===null?"Nog geen berekening":"Geschat: "+Math.floor(sleepMinutes(c)/60)+"u "+String(sleepMinutes(c)%60).padStart(2,"0")+"m")+'</small></section></div></details>';
}
function diaryPrompts(date){const seed=Math.floor(Date.parse(date+"T12:00:00Z")/86400000);return '<div class="kc-diary-prompts"><div class="kc-diary-heading"><strong>✧ Reflectievragen</strong><small>optioneel</small></div>'+[0,1,2].map(i=>{const q=diaryQuestions[((seed+i*3)%9+9)%9];return '<button type="button" data-kc="journal-prompt" data-id="'+esc(q)+'"><span>'+esc(q)+'</span><b>＋</b></button>';}).join("")+'</div>';}
function diaryVoice(){
 return '<section class="kc-diary-voice"><div class="kc-diary-heading"><strong>◉ Inspreken</strong><small>Start / Stop</small></div><p>Spreekpauzes stoppen de opname niet. Zonder transcriptiedienst wordt audio niet automatisch naar tekst omgezet.</p>'+
 (voiceRecorder||voiceStarting?btn(voiceStarting?"Microfoon openen…":"■ Stop opname",voiceStarting?"voice-wait":"voice-stop"):btn("◉ Start opname","voice-start","",true))+
 (voiceRecorder?'<span class="kc-diary-live"> ● Opname loopt</span>':"")+
 (voiceFile&&voiceURL?'<div class="kc-diary-audio"><audio controls preload="metadata" src="'+esc(voiceURL)+'"></audio>'+btn("Opname bewaren bij deze dag","voice-save","",true)+btn("Opname verwijderen","voice-discard")+'<a href="'+esc(voiceURL)+'" download="'+esc(voiceFile.name)+'">Audio apart downloaden</a></div>':"")+
 '<p id="kc-voice-status" role="status">'+esc(voiceNotice||"Alleen lokaal · maximaal 25 MB per opname")+'</p></section>';
}
function diaryAI(){
 const android=/Android/i.test(navigator.userAgent);
 return '<section class="kc-diary-ai"><div class="kc-diary-heading"><strong>✧ AI-schrijfhulp</strong><small>Gratis kopiëren</small></div><p>Kopieer de opdracht, open ChatGPT en plak hem daar. Het resultaat kun je na controle terugplakken in Memento.</p><div>'+btn("1. Kopieer opdracht","journal-ai-copy")+
 '<a class="kc-btn kc-primary" href="'+(android?"intent://chatgpt.com/#Intent;scheme=https;package=com.openai.chatgpt;end":"https://chatgpt.com/")+'" rel="noopener noreferrer">2. Open ChatGPT'+(android?"-app":"")+'</a></div><small id="kc-ai-status" role="status">Niets wordt automatisch verzonden of vervangen.</small></section>';
}
function renderJournal(c){
 const today=C.journalDate(),day=journalFilter||today,days=read().notes.filter(n=>!n.deletedAt&&!n.archived&&n.journal?.version===1&&C.collectionOf(read(),n)===c.id&&n.journal.date<today).sort((a,b)=>b.journal.date.localeCompare(a.journal.date)),note=C.findJournal(read(),day);
 return header("Mijn dagboek",true,btn("Vandaag","journal-today",c.id))+
 diaryHero(day)+diaryWeek(day)+
 '<div class="kc-diary-selected"><div><small>'+(day===today?"VANDAAG":"GEKOZEN DAG")+'</small><h3>'+esc(journalLabel(day))+'</h3></div>'+btn(note?"Open dag":"Schrijf","journal-date-open",day,true)+'</div>'+
 (note?'<button class="kc-diary-daypreview" type="button" data-kc="journal-date-open" data-id="'+day+'"><strong>'+esc(note.title===day?"Dagboek":note.title)+'</strong><small>'+esc(diarySummary(note.journal))+'</small><span>'+esc(note.body.slice(0,160)||"Check-in of opname bekijken")+'</span></button>':'<p class="kc-diary-empty">Nog niets vastgelegd voor deze dag. Een gemiste dag is geen probleem.</p>')+
 '<div class="kc-diary-heading kc-diary-history-title"><strong>Eerdere dagen</strong>'+btn("Beheer","edit-collection",c.id)+'</div>'+
 (days.length?'<div class="kc-diary-history">'+days.slice(0,20).map(n=>'<button type="button" data-kc="journal-open" data-id="'+esc(n.id)+'"><span style="background-image:url(./assets/pin-forests/'+diaryScene(n.journal.date)+')"></span><span><strong>'+esc(journalLabel(n.journal.date))+'</strong><small>'+esc(diarySummary(n.journal))+'</small></span><b>›</b></button>').join("")+'</div>':'<p class="kc-diary-empty">Je eerdere dagboekdagen verschijnen hier.</p>');
}
function openJournal(day){
 const existing=C.findJournal(read(),day);if(existing){collectionId=C.collectionOf(read(),existing);startEdit(existing.id);return;}
 const target=allCollections().find(c=>c.id===collectionId&&c.special==="journal")||collections().find(c=>c.special==="journal");
 if(!target){notify("Open eerst je dagboekverzameling.");return;}
 beginNew(target.id);editing.journal={version:1,date:day,mood:""};editing.title="";dirty=false;render();
}
function renderJournalEditor(){
 const e=editing,j=e.journal;
 return '<div class="kc-editor-head">'+header("Mijn dagboek",true,btn(focusWriting?"Normaal":"Schrijfstand","writing-mode")+btn("Sluiten","save","",true))+'</div>'+
 '<p id="kc-save-state" class="kc-save-state" role="status">'+(dirty?"Niet opgeslagen":selectedId?"Opgeslagen":"Concept · nog niet opgeslagen")+'</p>'+
 diaryWeek(j.date)+'<div class="kc-diary-selected"><div><small>DAGBOEK</small><h3>'+esc(journalLabel(j.date))+'</h3></div></div>'+

 '<section class="kc-diary-write"><div class="kc-diary-heading"><strong>✎ Mijn verhaal</strong><small>Vrij schrijven</small></div><label for="kc-body" class="kc-sr">Dagboektekst</label><textarea id="kc-body" data-kc-edit="body" maxlength="20000" rows="9" placeholder="Wat heb je vandaag meegemaakt?">'+esc(e.body)+'</textarea><label>Titel · optioneel<input id="kc-title" data-kc-edit="title" maxlength="180" value="'+esc(e.title===j.date?"":e.title)+'" placeholder="Titel van deze dag"></label><label>Tags · optioneel<input data-kc-edit="tags" maxlength="1000" value="'+esc((e.tags||[]).join(", "))+'"></label><div class="kc-diary-actions">'+btn("Versiegeschiedenis","versions")+'</div></section>'+
 diaryCheckin(j)+'<details class="kc-diary-optional"><summary>Reflectievragen · optioneel</summary>'+diaryPrompts(j.date)+'</details>'+diaryVoice()+diaryAI()+attachmentsHTML(e)+'<div class="kc-editor-actions">'+btn("Sluiten","cancel-journal")+btn("Concept verwerpen","discard-draft")+'</div>';
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
 const actions=n.deletedAt?btn("Herstellen","restore",n.id,true):btn("Meer opties","edit",n.id,true);
 const direct=!n.deletedAt&&!n.journal&&C.typeOf(n)==="note";
 if(direct&&(!editing||editing.id!==n.id||!dirty)){editing=C.clone(n);editing.collectionId=cid;dirty=false;rememberBase();}
 const original=safeURL(n.sourceUrl||"");
 const check=C.typeOf(n)==="checklist"?'<div class="kc-checklist">'+C.checklistItems(n).map(item=>'<label class="kc-check"><input data-kc-check="'+esc(item.id)+'" data-note="'+esc(n.id)+'" type="checkbox"'+(item.done?" checked":"")+(n.deletedAt?" disabled":"")+'><span>'+esc(item.text)+'</span></label>').join("")+"</div>":"";
 return header(n.journal?journalLabel(n.journal.date):n.body?.trim()===n.title.trim()?"Notitie":n.title,true,actions)+
 (n.journal?'<p class="kc-muted">'+esc(n.journal.mood||'Geen stemming')+'</p>':'')+
 '<div class="kc-detail-meta"><span>'+esc(collectionName(cid))+"</span><span>·</span><span>"+esc(kindNames[C.typeOf(n)]||"Notitie")+"</span><span>·</span><span>"+readable(n.updatedAt||n.createdAt)+"</span></div>"+
 '<div class="kc-tagline">'+chips(n.tags)+'</div>'+
 (C.typeOf(n)==="recipe"?recipeHTML(n.recipe):"")+
 (direct?'<div class="kc-editor-fields kc-direct-editor"><label>Titel · optioneel<input id="kc-title" data-kc-edit="title" maxlength="180" value="'+esc(n.body?.trim()===n.title.trim()?"":editing.title)+'"></label><label>Verzameling<select id="kc-collection" data-kc-edit="collectionId"><option value="inbox"'+(editing.collectionId==="inbox"?' selected':'')+'>Inbox</option>'+collections().map(c=>'<option value="'+esc(c.id)+'"'+(editing.collectionId===c.id?' selected':'')+'>'+esc(pathName(c))+'</option>').join('')+'</select></label><label for="kc-body">Inhoud</label><textarea id="kc-body" data-kc-edit="body" maxlength="20000">'+esc(editing.body)+'</textarea><p id="kc-save-state" class="kc-save-state" role="status">'+(dirty?'Concept':'Opgeslagen')+'</p>'+btn('Opslaan','save','',true)+'</div>':check||'<div class="kc-readable">'+markdown(n.body)+"</div>")+
 (original?'<a class="kc-source" href="'+esc(original)+'" target="_blank" rel="noopener noreferrer">Bron openen ↗</a>':"")+
 attachmentsHTML(n)+linkedHTML(n)+(n.deletedAt?'':passageActions())+
 (n.deletedAt?"":'<div class="kc-detail-actions">'+btn(n.pinned?"Losmaken":"Vastzetten","pin",n.id)+btn(n.archived?"Terug uit archief":"Archiveren","archive-item",n.id)+btn("Koppelen","link",n.id)+(n.journal?"":btn("Onderzoeken met AI","ai",n.id))+
 '<details class="kc-note-menu"><summary aria-label="Notitie beheren">⋯</summary><div>'+btn("Versiegeschiedenis","versions")+btn("Concept verwerpen","discard-draft")+btn("Als taak","convert-task",n.id)+btn("Als afspraak","convert-appointment",n.id)+btn("Als aankoopwens","convert-wish",n.id)+btn("Verwijderen","delete",n.id)+'</div></details></div>');
}
function renderEditor(){
 const e=editing;if(!e)return "";if(e.journal)return renderJournalEditor();
 const type=C.typeOf(e),isRecipe=type==="recipe",isLink=type==="link";
 const tags=(e.tags||[]).join(", ");
 const recipe=e.recipe||{ingredients:[],status:"concept",version:1,notes:""};
 return '<div class="kc-editor-head">'+header(selectedId?"Kennisitem bewerken":"Nieuw kennisitem",true,btn("Opslaan","save","",true))+'</div><p class="kc-save-state" id="kc-save-state" role="status">'+(dirty?"Concept":selectedId?"Opgeslagen":"Concept · nog niet opgeslagen")+'</p>'+
 '<div class="kc-editor-fields">'+
 '<label>Type<select data-kc-edit="kind" id="kc-kind">'+Object.entries(kindNames).filter(([key])=>key!=="pdf"&&key!=="image").map(([key,label])=>'<option value="'+key+'"'+(type===key?" selected":"")+">"+label+"</option>").join("")+"</select></label>"+
 '<label>Verzameling<select data-kc-edit="collectionId" id="kc-collection">'+
 '<option value="inbox"'+(e.collectionId==="inbox"?" selected":"")+'>Inbox</option>'+
 collections().map(c=>'<option value="'+esc(c.id)+'"'+(C.collectionOf(read(),e)===c.id?" selected":"")+">"+esc(pathName(c))+"</option>").join("")+"</select></label>"+
 '<label>Titel<input id="kc-title" data-kc-edit="title" maxlength="180" placeholder="Titel of onderwerp" value="'+esc(e.title==="Naamloze notitie"&&!selectedId?"":e.title)+'"></label>'+
 (isLink?'<label>Website (https://)<input type="url" id="kc-source" data-kc-edit="sourceUrl" value="'+esc(e.sourceUrl||"")+'" placeholder="https://…"></label>':"")+
 '<label for="kc-body">Inhoud</label>'+
 '<div class="kc-format-bar" role="toolbar" aria-label="Tekst opmaken">'+btn("Kop","format","# ")+btn("Vet","format","**")+btn("Lijst","format","- ")+btn("Citaat","format","> ")+btn("Link","format","[tekst](https://)")+"</div>"+
 '<textarea id="kc-body" data-kc-edit="body" rows="11" maxlength="20000" placeholder="Begin met schrijven…">'+esc(e.body||"")+"</textarea>"+
 (isRecipe?'<div class="kc-recipe-fields"><h3>Receptgegevens</h3><label>Status<select data-kc-edit="recipeStatus"><option value="concept"'+(recipe.status==="concept"?" selected":"")+'>Concept</option><option value="testen"'+(recipe.status==="testen"?" selected":"")+'>Testen</option><option value="definitief"'+(recipe.status==="definitief"?" selected":"")+'>Definitief</option></select></label>'+
 '<label>Ingrediënten (één per regel, met | als scheiding)<textarea data-kc-edit="ingredients" rows="4" placeholder="Ingrediënt | hoeveelheid | eenheid">'+esc((recipe.ingredients||[]).map(x=>[x.name,x.amount,x.unit].join(" | ")).join("\n"))+"</textarea></label>"+
 '<label>Testnotities<textarea data-kc-edit="recipeNotes" rows="3">'+esc(recipe.notes||"")+"</textarea></label></div>":"")+
 '<label>Tags (gescheiden door komma’s)<input data-kc-edit="tags" maxlength="1000" value="'+esc(tags)+'" placeholder="Bijvoorbeeld: Inspiratie, Project"></label>'+
 '<label class="kc-file-upload">PDF of afbeelding toevoegen<input id="kc-file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" multiple></label>'+
 '<p class="kc-muted">Maximaal 25 MB per bestand. PDF’s en afbeeldingen blijven op dit apparaat en worden meegenomen in de volledige ZIP-back-up.</p>'+
 attachmentsHTML(e)+passageActions()+
 '<div class="kc-editor-actions">'+btn("Voorbeeld","preview")+btn("Versiegeschiedenis","versions")+btn("Concept verwerpen","discard-draft")+"</div></div>";
}
function passageActions(){return '<div class="kc-passage-actions">'+btn('Taak uit selectie','selection-task')+'<details><summary>Passage invoeren</summary><label>Geselecteerde passage uit deze notitie<textarea id="kc-task-passage" maxlength="2500" rows="2" placeholder="Plak hier de exacte passage"></textarea></label>'+btn('Controleer taakvoorstel','passage-task')+'</details></div>';}
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
 fileRecord?.type?.startsWith("audio/")&&fileUrl?'<audio controls class="kc-diary-audio-player" src="'+esc(fileUrl)+'"></audio>':
  fileRecord?.type?.startsWith("image/")&&fileUrl?'<img class="kc-image" src="'+esc(fileUrl)+'" alt="'+esc(a?.name||"Bijlage")+'">':
 '<div class="kc-empty">Bestand wordt geladen of is niet beschikbaar.</div>')+link;
}
function render(){
 if(!host)return;
 const life=read();try{C.ensure(life)}catch(e){host.textContent=e.message;return;}
 let output="";
 if(screen==="search")output=renderCentralSearch();
 else if(screen==="home")output=renderHome();
 else if(screen==="sort")output=renderSort();
 else if(screen==="collections")output=renderCollections();
 else if(screen==="collection-editor")output=renderCollectionEditor();
 else if(["collection","all","inbox","archive","trash","pinned"].includes(screen))output=renderList();
 else if(screen==="detail")output=renderDetail();
 else if(screen==="edit")output=renderEditor();
 else if(screen==="versions")output=renderVersions();
 else if(screen==="link")output=renderLink();
 else if(screen==="file")output=renderFile();
 host.innerHTML='<div class="kc-app"><div id="kc-notice" role="status"'+(notice?"":" hidden")+">"+esc(notice)+"</div>"+breadcrumbs()+output+"</div>";
 ArtUI?.hydrate(host,S);
 host.classList.toggle("kc-focus-writing",focusWriting&&Boolean(editing?.journal));
 growText();
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
 if(selectedId&&JSON.stringify(read().notes.find(n=>n.id===selectedId)||null)!==editingBase){notify("Deze notitie heeft inmiddels een nieuwere versie. Je concept blijft zichtbaar om te kopiëren; het overschrijft die versie niet.");setSaveIndicator("Opslaan mislukt · nieuwere versie");}
}
function write(mutator,token){
 try{const ok=bridge.write(life=>{C.ensure(life);try{mutator(life);C.validate(life);}catch(e){notify(e.message);throw e;}},token);if(!ok&&!notice)notify("Opslaan mislukt. Je invoer is behouden; sluit de melding en probeer opnieuw.");return ok;}catch(e){notify(e.message);return false;}
}
function flush(){
 if(!editing||!dirty)return true;
 rememberDraft();
 if(selectedId&&editingBase&&JSON.stringify(read().notes.find(n=>n.id===selectedId)||null)!==editingBase){notify("Deze notitie is inmiddels gewijzigd. Kopieer je concept; de nieuwere versie blijft behouden.");setSaveIndicator("Opslaan mislukt · nieuwere versie");return false;}
 const draft=C.clone(editing),life=read();
 setSaveIndicator("Opslaan…");
 if(!draft.title.trim())draft.title=draft.journal?draft.journal.date:String(draft.body||"").trim().split("\n")[0].slice(0,85)||"Naamloze notitie";
 if(!draft.body.trim()&&draft.title==="Naamloze notitie"&&!draft.attachments?.length&&!selectedId){dirty=false;return true;}
 if(draft.sourceUrl&&!safeURL(draft.sourceUrl)){notify("Gebruik een geldige http- of https-link.");setSaveIndicator("Controleer de bronlink");return false;}
 if(draft.journal&&!C.journalHasContent(draft.body,draft.journal)){setSaveIndicator("Leeg concept · niet opgeslagen");if(!selectedId){dirty=false;forgetDraft();return true;}notify("Vul eerst iets in voordat je je dagboek leegmaakt.");return false;}
 const changed=write(state=>{
  if(draft.journal){const saved=C.saveJournal(state,{id:selectedId||undefined,date:draft.journal.date,mood:draft.journal.mood,checkin:draft.journal.checkin,audioOnly:draft.journal.audioOnly,title:draft.title,body:draft.body,tags:draft.tags,collectionId:draft.collectionId});draft.id=saved.id;return;}
  if(selectedId){C.updateNote(state,selectedId,{title:draft.title,body:draft.body,kind:draft.kind,collectionId:draft.collectionId,tags:draft.tags,sourceUrl:draft.sourceUrl,recipe:draft.recipe||null});}
  else {draft.revision=1;state.notes.unshift(draft);}
 });
 if(!changed){setSaveIndicator("Opslaan mislukt · invoer bewaard");return false;}
 selectedId=draft.id;editing=C.clone(read().notes.find(n=>n.id===draft.id));dirty=false;notice="";rememberBase();forgetDraft();
 setSaveIndicator("Opgeslagen");return true;
}
function setSaveIndicator(label){const el=host?.querySelector("#kc-save-state");if(el)el.textContent=label;}
function schedule(){dirty=true;rememberDraft();setSaveIndicator("Concept");clearTimeout(timer);timer=setTimeout(()=>flush(),850);}
function leave(next,id=""){
 if(voiceRecorder||voiceStarting||voiceFile){notify("Bewaar of verwijder eerst de opname.");return false;}
 clearTimeout(timer);if(!flush())return false;
 editing=null;screen=next;if(id)collectionId=id;notice="";render();return true;
}
function beginNew(cid){
 selectedId="";const state=read();editing=C.makeNote({title:"",body:"",collectionId:cid||"inbox",kind:"note"},state);dirty=false;screen="edit";rememberBase();render();
}
function startEdit(id){
 const note=read().notes.find(x=>x.id===id);if(!note)return;
 selectedId=id;editing=C.clone(note);editing.kind=C.typeOf(note);editing.collectionId=C.collectionOf(read(),note);
 if(!editing.tags)editing.tags=[];
 if(!editing.attachments)editing.attachments=[];
 if(!editing.recipe&&editing.kind==="recipe")editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
 dirty=false;screen="edit";rememberBase();render();
}
function back(){
 if(screen==='sort'){screen=sortState.parentId?'collection':'home';if(sortState.parentId)collectionId=sortState.parentId;sortState=null;render();return;}
 if(screen==='collection-editor'){cancelCollection();return;}
 if(screen==='collection'){const c=allCollections().find(c=>c.id===collectionId);if(c?.parentId){collectionId=c.parentId;render();return;}screen='home';render();return;}
 if(screen==="edit"){if(!leave(selectedId?"detail":editing?.journal?"collection":"home"))return;return}
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
 const j=editing?.journal;if(!j)return;const sum=host?.querySelector("#kc-diary-summary");if(sum)sum.textContent=diarySummary(j);
 const span=host?.querySelector("#kc-diary-sleep-result"),n=sleepMinutes(j.checkin);
 if(span)span.textContent=n===null?"Nog geen geldige berekening":"Geschat: "+Math.floor(n/60)+"u "+String(n%60).padStart(2,"0")+"m";
}
function voiceStatus(msg){voiceNotice=msg;const el=host?.querySelector("#kc-voice-status");if(el)el.textContent=msg;}
function releaseMic(){if(voiceStream){voiceStream.getTracks().forEach(t=>t.stop());voiceStream=null;}}
function discardVoice(){
 voiceToken++;if(voiceRecorder&&voiceRecorder.state!=="inactive")try{voiceRecorder.stop()}catch(e){}
 releaseMic();voiceRecorder=null;voiceStarting=false;voiceFile=null;
 if(voiceURL)URL.revokeObjectURL(voiceURL);voiceURL="";voiceNotice="";
}
function stopVoice(){if(voiceRecorder&&voiceRecorder.state!=="inactive")try{voiceRecorder.stop()}catch(e){voiceStatus("Stoppen mislukt.");}}
async function startVoice(){
 if(!editing?.journal||voiceRecorder||voiceFile||voiceStarting)return;
 if(!isSecureContext||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){voiceStatus("Veilige microfoonopname niet beschikbaar. Open Memento via HTTPS in Chrome.");return;}
 const mime=["audio/webm;codecs=opus","audio/webm","audio/mp4"].find(t=>MediaRecorder.isTypeSupported?.(t));
 if(!mime){voiceStatus("Dit apparaat ondersteunt geen geschikte audio-opname.");return;}
 voiceStarting=true;const token=++voiceToken;voiceStatus("Microfoon openen…");
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(token!==voiceToken||!editing?.journal){stream.getTracks().forEach(t=>t.stop());return;}
  voiceStream=stream;const r=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:64000}),chunks=[];
  voiceRecorder=r;voiceStarting=false;
  r.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
  r.onerror=()=>{releaseMic();voiceRecorder=null;voiceStatus("Opname mislukt.");render();};
  r.onstop=()=>{
   releaseMic();if(token!==voiceToken)return;
   voiceRecorder=null;const type=r.mimeType.split(";")[0],blob=new Blob(chunks,{type});
   if(blob.size<16){voiceStatus("Geen bruikbaar geluid opgenomen.");render();return;}
   voiceFile=new File([blob],"Dagboek-"+editing.journal.date+"."+(type==="audio/mp4"?"m4a":"webm"),{type});
   voiceURL=URL.createObjectURL(blob);voiceNotice=blob.size>25*1024*1024?"Opname te groot; download het bestand of neem korter op.":"Opname gereed. Bewaar haar bij deze dag.";render();
  };
  r.start();voiceNotice="Opname loopt · korte pauzes zijn toegestaan.";render();
 }catch(e){releaseMic();voiceStarting=false;voiceStatus(e.name==="NotAllowedError"?"Microfoontoegang geweigerd.":"Opnemen mislukt.");}
}
async function saveVoice(){
 if(!voiceFile||!editing?.journal||!S)return;
 if(voiceFile.size>25*1024*1024){voiceStatus("Maximaal 25 MB. Download deze opname afzonderlijk.");return;}
 const guard=root.MementoStorageGuard;let token,metadata=null,linked=false;
 try{
  if(!guard?.writable)throw Error("Memento is nu alleen-lezen. Probeer opnieuw.");
  editing.journal.audioOnly=true;dirty=true;clearTimeout(timer);
  if(!flush())throw Error("Dagboek niet opgeslagen. De audio blijft beschikbaar.");
  token=guard.beginOperation();metadata=await S.save(selectedId,voiceFile,token);
  linked=write(state=>{const n=state.notes.find(x=>x.id===selectedId);C.updateNote(state,n.id,{attachments:[...(n.attachments||[]),metadata]});},token);
  if(!linked)throw Error("Audio niet gekoppeld; probeer opnieuw.");
  voiceFile=null;if(voiceURL)URL.revokeObjectURL(voiceURL);voiceURL="";voiceNotice="Opname veilig lokaal bewaard bij deze dag.";
  startEdit(selectedId);notify(voiceNotice);
 }catch(e){voiceStatus(e.message||"Bewaren mislukt. Probeer opnieuw.");if(metadata&&!linked&&token)try{await S.remove(metadata.id,token)}catch{}}
 finally{if(token)guard.endOperation(token);}
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
 if(op==="central-clear"){centralQuery="";centralType="";centralCollection="";centralStatus="active";screen="search";render();return;}
 if(op==="search-result"){if(!flush())return;if(el.dataset.kind==="task")bridge.openRelated?.("task",id);else{selectedId=id;editing=null;screen="detail";render();}return;}
 if(["selection-task","passage-task","convert-task"].includes(op)){
  const field=host.querySelector('#kc-body'),n=editing||read().notes.find(n=>n.id===selectedId);
  const passage=(op==="passage-task"?host.querySelector('#kc-task-passage')?.value:field?field.value.slice(field.selectionStart,field.selectionEnd):window.getSelection()?.toString())?.trim()||"";
  if(!passage||!n?.body?.includes(passage)){notify("Selecteer een passage in de notitie, of plak die bij ‘Passage invoeren’. Er wordt geen hele notitie gekopieerd.");field?.focus();return;}
  if(!flush())return;bridge.convert?.(selectedId,"task",passage);return;
 }
 if(op==="recover-draft"){recoverDraft();return;}
 if(op==="discard-draft"){if(!confirm("Niet opgeslagen concept verwerpen? Opgeslagen tekst blijft behouden."))return;clearTimeout(timer);forgetDraft();dirty=false;editing=null;screen=selectedId?"detail":"home";render();return;}
 if(op==="writing-mode"){focusWriting=!focusWriting;host.classList.toggle("kc-focus-writing",focusWriting);el.textContent=focusWriting?"Normaal":"Schrijfstand";return;}
 if(screen==="detail"&&dirty&&!flush())return;
 if(kc2Action(op,id,el))return;
 if(op==="quick-speech"){quickToggleSpeech();return;}
 if(op==="quick-save"){quickSave();return;}
 if(op==="quick-expand"){quickExpand();return;}
 if(op==="journal-jump"||op==="journal-date-open"||op==="journal-move"){
  if(voiceRecorder||voiceFile||voiceStarting){notify("Bewaar of verwijder eerst de opname.");return;}
  const current=editing?.journal?.date||journalFilter||C.journalDate(),next=op==="journal-move"?diaryOffset(current,Number(id)):id;
  if(screen==="edit"){clearTimeout(timer);if(!flush())return;}
  journalFilter=next;if(screen==="collection"&&op!=="journal-date-open")render();else openJournal(next);return;
 }
 if(op==="journal-mood"&&editing?.journal){
  editing.journal.mood=editing.journal.mood===id?"":id;
  host.querySelectorAll('[data-kc="journal-mood"]').forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.id===editing.journal.mood)));
  diaryRefresh();schedule();return;
 }
 if(op==="journal-prompt"&&editing?.journal){
  const input=host.querySelector("#kc-body");if(input){input.value+=(input.value.trim()?"\n\n":"")+id+"\n";editing.body=input.value;input.focus();schedule();}
  return;
 }
 if(op==="voice-start"){startVoice();return;}
 if(op==="voice-stop"){stopVoice();return;}
 if(op==="voice-save"){saveVoice();return;}
 if(op==="voice-discard"){discardVoice();render();return;}
 if(op==="journal-ai-copy"){copyDiaryAI();return;}
 if(op==="purge-trash"){root.MementoLife?.openTrash?.();return}
 if(op==="back"){back();return}
 if(op==="new"){const c=allCollections().find(c=>c.id===collectionId);if(screen==='collection'&&c?.special==='journal'){openJournal(C.journalDate());return;}beginNew(screen==="collection"?collectionId:"inbox");return}
 if(op==="collection"){filtersExpanded=false;journalFilter="";collectionId=id;viewOverride="";sort="recent";query="";kindFilter="";tagFilter="";screen="collection";render();return}
 if(op==="collections"){screen="collections";render();return}
 if(["all","inbox","archive","trash","pinned"].includes(op)){filtersExpanded=false;screen=op;query="";kindFilter="";tagFilter="";viewOverride="";render();return}
 if(op==="mode"){filtersExpanded=true;viewOverride=id;render();return}
 if(op==="open"){selectedId=id;screen="detail";render();return}
 if(op==="edit"){startEdit(id);return}
 if(op==="save"){if(voiceRecorder||voiceStarting||voiceFile){notify("Bewaar of verwijder je audio voordat je dit scherm verlaat.");return;}const journalDate=editing?.journal?.date||"";clearTimeout(timer);if(flush()){screen=journalDate?"collection":selectedId?"detail":"collection";if(journalDate)journalFilter=journalDate;editing=null;render();}return}
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
 if(op==="remove-file"){
  if(!confirm("Bijlage loskoppelen van deze notitie? Het bestand wordt niet direct definitief gewist."))return;
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
 if(op==='home'){screen='home';query='';journalFilter='';render();return true;}
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
  if(!flush())return true;
  if(voiceRecorder||voiceStarting||voiceFile){notify('Bewaar of verwijder eerst je opname.');return true;}
  if(dirty&&!confirm('Niet opgeslagen wijzigingen sluiten? Reeds automatisch opgeslagen tekst blijft bewaard.'))return true;
  clearTimeout(timer);editing=null;dirty=false;screen='collection';render();return true;
 }
 return false;
}
// The handle alone opts out of native touch scrolling. Other rows retain normal scrolling.
let drag=null;
function cancelDrag(){
 if(!drag)return;clearTimeout(drag.timer);cancelAnimationFrame(drag.frame);
 const handle=drag.handle,id=drag.pointerId;drag=null;
 try{if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);}catch{}
 if(screen==='sort'&&sortState){sortState.ids=children(sortState.parentId).map(c=>c.id);render();}
}
function placeDrag(){
 if(!drag?.active)return;
 const list=host.querySelector('.kc-sort-list'),row=host.querySelector('[data-sort-id="'+drag.id+'"]');if(!list||!row)return;
 const rows=[...list.children].filter(n=>n!==row);
 const before=rows.find(n=>{const r=n.getBoundingClientRect();return drag.y<r.top+r.height/2});
 if(before)list.insertBefore(row,before);else list.appendChild(row);
 sortState.ids=[...list.children].map(n=>n.dataset.sortId);
}
function scrollDrag(){
 if(!drag?.active)return;
 const top=(document.getElementById('compassAreaBar')?.getBoundingClientRect().bottom||0)+60;
 const bottom=document.getElementById('mementoQuickNav')?.getBoundingClientRect();const edge=bottom?.height?bottom.top-60:innerHeight-65;
 if(drag.y<top)window.scrollBy(0,-Math.min(14,(top-drag.y)/3+3));
 else if(drag.y>edge)window.scrollBy(0,Math.min(14,(drag.y-edge)/3+3));
 placeDrag();drag.frame=requestAnimationFrame(scrollDrag);
}
document.addEventListener('pointerdown',e=>{
 const handle=e.target.closest?.('[data-drag-id]');if(!handle||!host?.contains(handle)||screen!=='sort'||drag||e.button!==0||e.isPrimary===false)return;
 const state=drag={pointerId:e.pointerId,id:handle.dataset.dragId,handle,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,active:false,timer:0,frame:0};
 handle.setPointerCapture(e.pointerId);
 state.timer=setTimeout(()=>{if(drag!==state)return;state.active=true;handle.closest('.kc-sort-row').classList.add('kc-dragging');notify('Verplaatsen. Laat los om op te slaan.');scrollDrag();},300);
});
document.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.pointerId)return;
 drag.x=e.clientX;drag.y=e.clientY;
 if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>10){cancelDrag();return;}
 if(drag.active){e.preventDefault();placeDrag();}
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(!drag||drag.pointerId!==e.pointerId)return;
 const d=drag,list=host.querySelector('.kc-sort-list'),r=list?.getBoundingClientRect(),ids=[...sortState.ids];
 clearTimeout(d.timer);cancelAnimationFrame(d.frame);drag=null;
 try{d.handle.releasePointerCapture(e.pointerId);}catch{}
 const valid=d.active&&r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=Math.max(0,r.top-25)&&e.clientY<=Math.min(innerHeight,r.bottom+25);
 if(valid)persistSort(ids);else{sortState.ids=children(sortState.parentId).map(c=>c.id);notice=d.active?'Verplaatsen geannuleerd. De volgorde is behouden.':'';render();}
});
document.addEventListener('pointercancel',e=>{if(drag?.pointerId===e.pointerId)cancelDrag();});
document.addEventListener('lostpointercapture',()=>{if(drag)cancelDrag();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){e.preventDefault();cancelDrag();}});
document.addEventListener('submit',e=>{
 if(!host?.contains(e.target))return;
 if(e.target.id==='kc-journal-date-form'){e.preventDefault();const picker=host.querySelector('#kc-journal-picker');if(picker.checkValidity())openJournal(picker.value);}
 if(e.target.id==='kc-collection-form'){e.preventDefault();kc2Action('save-collection','',e.target);}
});

function growText(){
 for(const field of host?.querySelectorAll('textarea[data-kc-edit="body"]')||[]){field.style.height="auto";field.style.height=Math.max(220,field.scrollHeight+2)+"px";}
}
function onInput(event){
 const field=event.target,change=field.dataset.kcEdit;
 if(field.dataset.kcInput==="central-search"){centralQuery=field.value;screen="search";const cursor=field.selectionStart;render();const input=host.querySelector('[data-kc-input="central-search"]');input?.focus();input?.setSelectionRange(cursor,cursor);return;}
 if(field.dataset.kcInput==="quick"){if(quickSpeech)quickStop();quickDraft=field.value;return;}
 if(field.dataset.kcInput==="search"){filtersExpanded=true;query=field.value;const cursor=field.selectionStart;render();const input=host.querySelector('[data-kc-input="search"]');if(input){input.focus();input.setSelectionRange(cursor,cursor);}return;}
 if(field.dataset.kcInput==="related-search"){linkQuery=field.value;render();host.querySelector('[data-kc-input="related-search"]')?.focus();return}
 if(colDraft&&ArtUI?.changed(field,host))return;
 if(field.dataset.kcCol&&colDraft){colDraft[field.dataset.kcCol]=field.value;colDraft.dirty=true;return;}
 if(field.dataset.kcCheckin&&editing?.journal){const key=field.dataset.kcCheckin,c=editing.journal.checkin||(editing.journal.checkin={});c[key]=["energy","stress","latency","awake","nap"].includes(key)?(field.value===""?null:Number(field.value)):field.value;diaryRefresh();schedule();return;}
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
 if(change==="body"){if(host.querySelector("#kc-title")?.value==="")editing.title="";growText();}
 if(change==="kind"){
  if(field.value==="recipe"&&!editing.recipe)editing.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
  schedule();render();return;
 }
 schedule();
}
function onChange(event){
 const el=event.target;
 if(el.dataset.kcCentral){if(el.dataset.kcCentral==="type"){centralType=el.value;if(centralType==="task")centralCollection="";}if(el.dataset.kcCentral==="status")centralStatus=el.value;if(el.dataset.kcCentral==="collection"){centralCollection=el.value;if(centralCollection)centralType="note";}screen="search";render();return;}
 if(el.dataset.kcCol||el.dataset.kcJournal){onInput(event);return;}
 if(el.dataset.kcChange){filtersExpanded=true;const val=el.value;if(el.dataset.kcChange==="kind")kindFilter=val;if(el.dataset.kcChange==="sort")sort=val;if(el.dataset.kcChange==="tag")tagFilter=val;render();return}
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
 const guard=root.MementoStorageGuard;
 if(!read().knowledge?.hierarchyVersion&&guard?.ready)guard.ready.then(()=>{if(host&&document.body.contains(host)&&!editing&&!colDraft){tryMigration();render();}});
 render();
 if(!recoveryChecked){recoveryChecked=true;recoverDraft();}
}
function hasPending(){return Boolean(editing&&dirty||colDraft?.dirty||ArtUI?.hasDraft()||quickDraft.trim()||quickSpeech||voiceRecorder||voiceStarting||voiceFile);}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){quickStop();if(hasPending())flush();}});
window.addEventListener("beforeunload",e=>{if(colDraft?.dirty||quickDraft.trim()||hasPending()&&!flush()){e.preventDefault();e.returnValue="";}});
document.addEventListener("toggle",e=>{if(e.target.id==="kc-filter-drawer")filtersExpanded=e.target.open;},true);
document.addEventListener("click",e=>{if(host?.contains(e.target))click(e);});
document.addEventListener("input",e=>{if(host?.contains(e.target))onInput(e);});
document.addEventListener("change",e=>{if(host?.contains(e.target))onChange(e);});
root.MementoKnowledge={mount,hasPending,prefillShared,open:()=>{if(hasPending()){notify("Sla eerst je concept op of annuleer het.");return;}screen="home";editing=null;notice="";render();},newNote:()=>{if(!flush())return;beginNew("inbox");},showJournal:day=>{if(!flush())return;tryMigration();openJournal(day);},showNote:id=>{if(!flush())return;selectedId=id;editing=null;screen="detail";render();}};
})(window);
