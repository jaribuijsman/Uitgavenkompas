/* Memento Kenniscentrum — compatible, local-first rules. No external services. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoKnowledgeCore=api;})(globalThis,()=>{
"use strict";
const clone=x=>JSON.parse(JSON.stringify(x));
const uid=()=>globalThis.crypto?.randomUUID?.()||"kc-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
const timestamp=()=>new Date().toISOString();
const builtins=[
 ["recipes","eLiquid Recepten","flask-conical","list"],
 ["inspiration","Inspiratie","sparkles","gallery"],
 ["documents","Documenten","file-text","list"],
 ["projects","Projecten","panels-top-left","list"],
 ["home","Huis & Leven","house","list"],
 ["research","Onderzoek","book-open","list"]
];
const nameKey=s=>String(s||"").trim().toLocaleLowerCase("nl");
function defaultCollection([id,name,icon,view]){return {id,name,icon,view,pinned:false,archived:false,createdAt:timestamp(),updatedAt:timestamp(),revision:1};}
function ensure(life){
 if(!life||!Array.isArray(life.notes))throw Error("Ongeldige Leven-opslag");
 if(life.knowledge!==undefined&&(!life.knowledge||typeof life.knowledge!=="object"))throw Error("Ongeldige kenniscentrummetadata");
 if(!life.knowledge){life.knowledge={version:1,deviceId:uid(),collections:builtins.map(defaultCollection),updatedAt:timestamp()};}
 const k=life.knowledge;
 if(k.version!==1||!Array.isArray(k.collections)||typeof k.deviceId!=="string")throw Error("Ongeldige kenniscentrummetadata");
 const existing=new Set(k.collections.map(c=>nameKey(c.name)));
 for(const note of life.notes){
  if(note.collectionId&&k.collections.some(c=>c.id===note.collectionId))continue;
  const category=String(note.category||"Persoonlijk").trim();
  if(!category||nameKey(category)==="inbox"||existing.has(nameKey(category)))continue;
  const id="category-"+uid();
  k.collections.push({id,name:category,icon:"folder",view:"list",pinned:false,archived:false,createdAt:timestamp(),updatedAt:timestamp(),revision:1});
  existing.add(nameKey(category));
 }
 return k;
}
const validKind=new Set(["note","link","recipe","checklist","pdf","image"]);
function typeOf(n){return validKind.has(n?.kind)?n.kind:n?.isChecklist?"checklist":"note";}
function collectionOf(life,n){
 const name=nameKey(n.category);
 if(n.collectionId==="inbox")return "inbox";
 const k=life.knowledge;
 if(n.collectionId&&k?.collections.some(c=>c.id===n.collectionId))return n.collectionId;
 if(name==="inbox")return "inbox";
 return k?.collections.find(c=>nameKey(c.name)===name)?.id||"inbox";
}
function collectionName(life,id){
 if(id==="inbox")return "Inbox";
 return life.knowledge?.collections.find(c=>c.id===id)?.name||"Inbox";
}
function checklistItems(n){
 if(Array.isArray(n.items))return clone(n.items);
 return String(n.body||"").split(/\r?\n/).map((text,i)=>({id:"legacy-"+n.id+"-"+i,text,done:(n.checkedLines||[]).includes(i)})).filter(x=>x.text.trim());
}
function reconcileItems(old,body){
 const prev=checklistItems(old),used=new Set();
 return String(body||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map((text,i)=>{
  let ix=prev.findIndex((p,j)=>!used.has(j)&&p.text===text);
  if(ix<0&&prev[i]&&!used.has(i))ix=i;
  if(ix<0)return {id:uid(),text,done:false};
  used.add(ix);return {...prev[ix],text};
 });
}
function makeNote(input,life){
 const k=ensure(life),collectionId=input.collectionId||"inbox";
 if(collectionId!=="inbox"&&!k.collections.some(c=>c.id===collectionId&&!c.archived))throw Error("Onbekende verzameling");
 const kind=validKind.has(input.kind)?input.kind:"note",now=timestamp();
 const title=String(input.title||"").trim()||String(input.body||"").trim().split(/\r?\n/)[0].slice(0,85)||"Naamloze notitie";
 const n={id:uid(),title:title.slice(0,180),body:String(input.body||"").slice(0,20000),kind,collectionId,category:collectionName(life,collectionId),tags:[],attachments:[],links:[],revisions:[],revision:1,sourceUrl:"",createdAt:now,updatedAt:now,deletedAt:"",archived:false,pinned:false};
 if(kind==="checklist"){n.isChecklist=true;n.items=reconcileItems({id:n.id,body:""},n.body);}
 if(kind==="recipe")n.recipe={ingredients:[],status:"concept",rating:0,version:1,notes:""};
 return n;
}
function updateNote(life,id,changes){
 ensure(life);const n=life.notes.find(x=>x.id===id);if(!n||n.deletedAt)throw Error("Notitie niet beschikbaar");
 const now=timestamp(),before=clone(n);
 const accepted=["title","body","kind","collectionId","tags","sourceUrl","recipe","pinned","archived","links","attachments","journal"];
 for(const key of accepted)if(Object.prototype.hasOwnProperty.call(changes,key))n[key]=clone(changes[key]);
 if(n.collectionId!==undefined)n.category=collectionName(life,n.collectionId);
 if(n.kind==="checklist"){n.isChecklist=true;if(before.body!==n.body||!Array.isArray(n.items))n.items=reconcileItems(before,n.body);}
 else n.isChecklist=false;
 n.revisions=Array.isArray(before.revisions)?before.revisions.slice(-11):[];
 // Autosave coalesces nearby edits; keep a useful older snapshot without filling Life storage.
 const last=n.revisions.at(-1);
 if(!last||Date.now()-Date.parse(last.savedAt||"")>5*60*1000||before.kind!==n.kind){
  n.revisions.push({revision:Number(before.revision)||1,savedAt:before.updatedAt||before.createdAt||now,title:before.title,body:before.body,kind:typeOf(before),collectionId:collectionOf(life,before),tags:clone(before.tags||[]),recipe:clone(before.recipe||null),items:clone(before.items||null),...(before.journal?{journal:clone(before.journal)}:{})});
 }
 n.revision=(Number(before.revision)||1)+1;n.updatedAt=now;
 validateNote(life,n);
 return n;
}
function restoreRevision(life,id,index){
 const n=life.notes.find(x=>x.id===id),rev=n?.revisions?.[index];
 if(!rev)throw Error("Versie niet gevonden");
 const changed=updateNote(life,id,{title:rev.title,body:rev.body,kind:rev.kind,collectionId:rev.collectionId||"inbox",tags:rev.tags||[],...(rev.recipe?{recipe:rev.recipe}:{}),...(rev.journal?{journal:rev.journal}:{})});
 if(Array.isArray(rev.items)){changed.items=clone(rev.items);changed.isChecklist=rev.kind==="checklist";}
 return changed;
}
function touch(life,n){n.revision=(Number(n.revision)||0)+1;n.updatedAt=timestamp();life.knowledge.updatedAt=n.updatedAt;}
function toggleItem(life,id,itemId){
 const n=life.notes.find(x=>x.id===id);if(!n||n.deletedAt)throw Error("Notitie niet gevonden");
 n.items=checklistItems(n);const item=n.items.find(x=>x.id===itemId);if(!item)throw Error("Lijstitem niet gevonden");
 item.done=!item.done;touch(life,n);return item.done;
}
function addCollection(life,name,icon="folder",view="list"){
 const k=ensure(life),clean=String(name||"").trim();
 if(!clean||clean.length>80)throw Error("Geef een verzamelingsnaam van maximaal 80 tekens");
 if(k.collections.some(c=>nameKey(c.name)===nameKey(clean)&&!c.archived))throw Error("Deze verzameling bestaat al");
 const c={id:uid(),name:clean,icon,view,pinned:false,archived:false,createdAt:timestamp(),updatedAt:timestamp(),revision:1};
 k.collections.push(c);k.updatedAt=timestamp();return c;
}
function renameCollection(life,id,name){
 const k=ensure(life),c=k.collections.find(x=>x.id===id);
 if(!c)throw Error("Verzameling niet gevonden");
 const clean=String(name||"").trim();if(!clean||clean.length>80)throw Error("Ongeldige naam");
 if(k.collections.some(x=>x.id!==id&&!x.archived&&nameKey(x.name)===nameKey(clean)))throw Error("Naam bestaat al");
 const moved=life.notes.filter(n=>collectionOf(life,n)===id);
 c.name=clean;c.revision++;c.updatedAt=timestamp();k.updatedAt=c.updatedAt;
 for(const note of moved){note.category=clean;note.collectionId=id;}
 return c;
}
function validateNote(life,n,checkDuplicates=true){
 if(!n||!n.id||typeof n.title!=="string"||n.title.length>180||!n.title.trim()||typeof n.body!=="string"||n.body.length>20000)throw Error("Ongeldige kennisnotitie");
 if(n.kind!==undefined&&!validKind.has(n.kind))throw Error("Onbekend itemtype");
 if(n.collectionId!==undefined&&n.collectionId!=="inbox"&&!life.knowledge?.collections.some(c=>c.id===n.collectionId))throw Error("Verzameling ontbreekt");
 for(const key of ["tags","attachments","links","revisions"]){if(n[key]!==undefined&&!Array.isArray(n[key]))throw Error("Ongeldige notitievelden");}
 if(n.tags&&(!n.tags.every(t=>typeof t==="string"&&t.length<=60)||n.tags.length>30))throw Error("Ongeldige tags");
 if(n.attachments&&(n.attachments.length>50||n.attachments.some(a=>!a||typeof a.id!=="string"||typeof a.name!=="string"||a.name.length>200||!Number.isFinite(a.size)||a.size<0)))throw Error("Ongeldige bijlage");
 if(n.journal!==undefined)validateJournal(life,n,checkDuplicates);
 if(n.revisions&&n.revisions.length>12)throw Error("Te veel versies");
 if(n.links&&n.links.some(l=>!l||typeof l.kind!=="string"||typeof l.id!=="string"))throw Error("Ongeldige koppeling");
 return true;
}
function validate(life){
 const k=ensure(life),ids=new Set();
 validateHierarchy(life);
 for(const c of k.collections){if(typeof c.id!=="string"||!c.id||c.id==="inbox"||ids.has(c.id)||typeof c.name!=="string"||!c.name.trim()||c.name.length>80||!["list","gallery","table"].includes(c.view))throw Error("Ongeldige verzameling");ids.add(c.id);}
 const dates=new Set();for(const n of life.notes){validateNote(life,n,false);if(n.journal&&!n.deletedAt){if(dates.has(n.journal.date))throw Error('Voor deze datum bestaat al een dagboeknotitie');dates.add(n.journal.date);}}
 return true;
}
function search(life,{collectionId="",query="",kind="",status="active",sort="recent",tag=""}={}){
 const q=nameKey(query);
 return life.notes.filter(n=>{
  if(status==="trash")return Boolean(n.deletedAt);
  if(n.deletedAt)return false;
  if(status==="archive")return Boolean(n.archived);
  if(n.archived)return false;
  if(status==="pinned"&&!n.pinned)return false;
  if(collectionId&&collectionOf(life,n)!==collectionId)return false;
  if(kind&&typeOf(n)!==kind)return false;
  if(tag&&!(n.tags||[]).includes(tag))return false;
  return !q||[n.title,n.body,n.category,n.sourceUrl,n.journal?.date,n.journal?.mood,...(n.tags||[])].join(" ").toLocaleLowerCase("nl").includes(q);
 }).sort((a,b)=>sort==="title"?a.title.localeCompare(b.title,"nl"):sort==="old"?String(a.updatedAt||a.createdAt||"").localeCompare(String(b.updatedAt||b.createdAt||"")):Number(!!b.pinned)-Number(!!a.pinned)||String(b.updatedAt||b.createdAt||"").localeCompare(String(a.updatedAt||a.createdAt||"")));
}

function collectionCounts(life,id){
 const k=ensure(life),scope=new Set([id]);let changed=true;
 while(changed){changed=false;for(const c of k.collections)if(!c.archived&&scope.has(c.parentId)&&!scope.has(c.id)){scope.add(c.id);changed=true;}}
 const active=life.notes.filter(n=>!n.deletedAt&&!n.archived);
 return {direct:active.filter(n=>collectionOf(life,n)===id).length,total:active.filter(n=>scope.has(collectionOf(life,n))).length};
}
function collectionPath(life,id){const c=life.knowledge?.collections.find(c=>c.id===id);return c?(c.parentId?collectionName(life,c.parentId)+' / ':'')+c.name:'Inbox';}
function centralSearch(life,{query='',type='',collectionId='',status='active'}={}){
 const q=nameKey(query),excerpt=text=>{text=String(text||'');const at=nameKey(text).indexOf(q),start=Math.max(0,at-45);return (start?'…':'')+text.slice(start,start+170)+(text.length>start+170?'…':'');};
 const rows=[];
 if(type!=='task')for(const n of life.notes){
  if(n.deletedAt||status==='done'||(status==='archive'&&!n.archived)||(status==='active'&&n.archived))continue;
  const cid=collectionOf(life,n);if(collectionId&&cid!==collectionId)continue;
  const text=[n.title,n.body,...(n.tags||[])].join(' ');if(q&&!nameKey(text).includes(q))continue;
  rows.push({id:n.id,type:'note',title:n.title,context:collectionPath(life,cid)+(n.archived?' · Archief':''),snippet:excerpt(n.body),status:n.archived?'archived':'active'});
 }
 if(type!=='note'&&!collectionId)for(const t of life.tasks||[]){
  if(t.deletedAt||status==='archive'&&!t.archived||status==='done'&&(!t.done||t.archived)||status==='active'&&(t.done||t.archived))continue;
  const text=[t.title,t.notes,...(t.steps||[]).map(s=>s.text)].join(' ');if(q&&!nameKey(text).includes(q))continue;
  rows.push({id:t.id,type:'task',title:t.title,context:[t.category,t.date,t.archived?'Archief':t.done?'Afgerond':'Open'].filter(Boolean).join(' · '),snippet:excerpt(t.notes||(t.steps||[]).map(s=>s.text).join(' · ')),status:t.archived?'archived':t.done?'done':'open'});
 }
 return rows;
}
// Versioned, additive migration. Caller must use the existing guarded Life write.
// Legacy collections and notes are never renamed, moved, archived or deleted here.
const hierarchyDefaults=[
 ['levenspad','Levenspad','route',[['dagboek','Dagboek','journal'],['reflecties','Reflecties & inzichten','heart'],['leren','Leren & ontwikkeling','book-open'],['reizen','Reizen & ervaringen','travel'],['naslag','Persoonlijke naslag','document']]],
 ['huis-wonen','Huis & wonen','house',[['apparaten','Apparaten & handleidingen','devices'],['onderhoud','Onderhoud & oplossingen','tools'],['woning','Woning & inrichting','house'],['huisdieren','Huisdieren','pet']]],
 ['recepten-creaties','Recepten & creaties','book-open',[['koken','Koken & maaltijden','recipe'],['dranken','Dranken & cocktails','drink'],['zelfmaken','Zelf maken & mengen','leaf']]],
 ['projecten-onderzoek','Projecten & onderzoek','folder-kanban',[['dossiers','Projectdossiers','folder'],['producten','Productonderzoek','search'],['bronnen','Uitzoekwerk & bronnen','document']]],
 ['ideeen-inspiratie','Ideeën & inspiratie','lightbulb',[['ideeen','Ideeënbank','lightbulb'],['visueel','Visuele inspiratie','camera'],['later','Later bekijken','book-open']]]
];
const iconIds=new Set(['folder','route','journal','house','book-open','heart','person','lightbulb','folder-kanban','tools','devices','pet','recipe','drink','travel','document','search','music','camera','fitness','leaf','flask-conical','sparkles','file-text','panels-top-left','lantern','compass','archive','sofa','chef','herbs','project','scroll','reference','palette','notebook','books','sun','tasks','agenda','groceries','star','image']);
function migrateHierarchy(life){
 const k=ensure(life);
 if(k.hierarchyVersion===1)return false;
 if(k.hierarchyVersion!==undefined)throw Error('Onbekende hiërarchieversie');
 // Reserved IDs must never absorb a pre-existing personal collection.
 const proposed=[];
 for(const [key,name,icon,children] of hierarchyDefaults){
  const id='kc2-'+key;
  proposed.push({...defaultCollection([id,name,icon,'list']),parentId:null,order:proposed.filter(c=>c.parentId===null).length});
  children.forEach(([child,label,symbol],order)=>proposed.push({...defaultCollection([id+'-'+child,label,symbol,'list']),parentId:id,order,...(child==='dagboek'?{special:'journal'}:{})}));
 }
 if(proposed.some(c=>k.collections.some(old=>old.id===c.id)))throw Error('Verzamelings-ID bestaat al; automatische indeling gestopt');
 k.collections.push(...proposed);k.hierarchyVersion=1;k.updatedAt=timestamp();validateHierarchy(life);return true;
}
function validateHierarchy(life){
 const k=life.knowledge;if(!k)return;
 const ids=new Set(k.collections.map(c=>c.id));
 for(const c of k.collections){
  if(c.parentId!==undefined&&c.parentId!==null){
   const parent=k.collections.find(p=>p.id===c.parentId);
   if(!parent||parent===c||parent.parentId)throw Error('Ongeldige bovenliggende verzameling');
  }
  if(c.parentId!==undefined&&!iconIds.has(c.icon))throw Error('Ongeldig pictogram');
  if(c.order!==undefined&&(!Number.isSafeInteger(c.order)||c.order<0))throw Error('Ongeldige volgorde');
  if(c.special!==undefined&&c.special!=='journal')throw Error('Onbekende speciale verzameling');
  if(c.coverId!==undefined&&(typeof c.coverId!=='string'||!/^(?:|[a-z][a-z0-9-]{0,40})$/.test(c.coverId)))throw Error('Ongeldige illustratie-ID');
  if(c.coverFocus!==undefined&&(!Number.isInteger(c.coverFocus)||c.coverFocus<0||c.coverFocus>100))throw Error('Ongeldige afbeeldingsuitsnede');
  if(c.coverFile!==undefined&&c.coverFile!==null){const f=c.coverFile;if(!f||typeof f!=='object'||!/^[a-z0-9-]{8,120}$/i.test(f.id||'')||typeof f.name!=='string'||f.name.length>200||!Number.isFinite(f.size)||f.size<=0||f.size>8*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type)||typeof f.hash!=='string'||!/^[a-f0-9]{64}$/.test(f.hash))throw Error('Ongeldige categorieafbeelding');}

 }
 if(ids.size!==k.collections.length)throw Error('Dubbele verzamelings-ID');
 const names=new Set();for(const c of k.collections){if(c.parentId===undefined)continue;const key=String(c.parentId)+'\0'+nameKey(c.name);if(names.has(key))throw Error('Dubbele verzamelingsnaam');names.add(key)}
 if(k.hierarchyVersion!==undefined&&k.hierarchyVersion!==1)throw Error('Onbekende hiërarchieversie');
}
function saveCollection(life,input){
 const k=ensure(life),old=input.id?k.collections.find(c=>c.id===input.id):null;
 if(input.id&&!old)throw Error('Verzameling ontbreekt');
 const name=String(input.name||'').trim(),parentId=input.parentId||null;
 if(!name||name.length>80)throw Error('Geef een naam van maximaal 80 tekens');
 if(!iconIds.has(input.icon)||!['list','gallery','table'].includes(input.view))throw Error('Ongeldig pictogram of weergave');
 const parent=parentId?k.collections.find(c=>c.id===parentId&&!c.archived):null;
 if(parentId&&(!parent||parent.parentId||parentId===input.id))throw Error('Kies een geldige hoofdverzameling');
 if(parentId&&old&&k.collections.some(c=>c.parentId===old.id))throw Error('Een hoofdverzameling met kinderen kan niet onder een andere verzameling');
 if(k.collections.some(c=>c.id!==input.id&&(c.parentId||null)===parentId&&nameKey(c.name)===nameKey(name)))throw Error('Naam bestaat al onder deze verzameling');
 const c=old||defaultCollection([uid(),name,input.icon,input.view]);
 // Bind legacy name-only notes before a rename; links and note IDs remain intact.
 const previousParent=old?.parentId||null;
 const notes=old?life.notes.filter(n=>collectionOf(life,n)===old.id):[];
 Object.assign(c,{name,icon:input.icon,view:input.view,parentId,updatedAt:timestamp(),revision:(old?.revision||0)+1});
 if(Object.prototype.hasOwnProperty.call(input,'coverId'))c.coverId=input.coverId||'';
 if(Object.prototype.hasOwnProperty.call(input,'coverFocus'))c.coverFocus=input.coverFocus;
 if(Object.prototype.hasOwnProperty.call(input,'coverFile'))c.coverFile=input.coverFile||null;
 if(!old||parentId!==previousParent||c.order===undefined)c.order=Math.max(-1,...k.collections.filter(x=>x.id!==c.id&&(x.parentId||null)===parentId).map(x=>x.order||0))+1;
 if(!old)k.collections.push(c);
 for(const n of notes){n.collectionId=c.id;n.category=name;}
 k.updatedAt=c.updatedAt;validateHierarchy(life);return c;
}
function reorderCollections(life,parentId,orderedIds){
 const k=ensure(life),scope=parentId||null;
 const siblings=k.collections.filter(c=>!c.archived&&(scope===null?c.parentId===null:c.parentId===scope));
 if(!Array.isArray(orderedIds)||orderedIds.length!==siblings.length||new Set(orderedIds).size!==orderedIds.length||orderedIds.some(id=>!siblings.some(c=>c.id===id)))throw Error('Ongeldige sorteervolgorde');
 orderedIds.forEach((id,order)=>{const c=siblings.find(c=>c.id===id);c.order=order;c.revision=(c.revision||0)+1;c.updatedAt=timestamp()});k.updatedAt=timestamp();
}
function setCollectionArchived(life,id,archived){
 const k=ensure(life),c=k.collections.find(c=>c.id===id);if(!c)throw Error('Verzameling ontbreekt');
 if(!archived&&c.parentId&&k.collections.find(p=>p.id===c.parentId)?.archived)throw Error('Herstel eerst de hoofdverzameling');
 c.archived=Boolean(archived);c.revision=(c.revision||0)+1;c.updatedAt=timestamp();k.updatedAt=c.updatedAt;
}
function journalDate(date=new Date()){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date),get=k=>p.find(x=>x.type===k).value;
 return get('year')+'-'+get('month')+'-'+get('day');
}
function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
function journalCheckinValid(c){
 if(c===undefined)return true;
 if(!c||typeof c!=="object"||Array.isArray(c))throw Error("Ongeldige dagelijkse check-in");
 for(const key of ["energy","stress"]){
  const v=c[key];if(v!==undefined&&v!==null&&(!Number.isInteger(v)||v<1||v>5))throw Error("Kies "+key+" op een schaal van 1 tot 5");
 }
 const pattern=/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;
 function checkDateTime(v){if(v===undefined||v===null||v==="")return; if(typeof v!=="string"||!pattern.test(v))throw Error("Ongeldige slaapdatum");
  const d=new Date(v),parts=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")+"T"+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
  if(!Number.isFinite(d.getTime())||parts!==v)throw Error("Ongeldige slaapdatum");
 }
 for(const key of ["sleepStart","sleepEnd"])checkDateTime(c[key]);
 for(const key of ["latency","awake","nap"]){
  const v=c[key];if(v!==undefined&&v!==null&&(!Number.isInteger(v)||v<0||v>1440))throw Error("Ongeldige slaapminuten");
 }
 if(c.sleepStart&&c.sleepEnd){
  const span=(new Date(c.sleepEnd).getTime()-new Date(c.sleepStart).getTime())/60000;
  if(span<=0||span>36*60)throw Error("De slaap moet na de begintijd eindigen (maximaal 36 uur)");
  if((c.latency||0)+(c.awake||0)>span)throw Error("Wakker gelegen minuten zijn meer dan je bedtijd");
 }
 return true;
}
function journalHasContent(body,j){
 const c=j?.checkin||{};
 return Boolean(String(body||"").trim()||j?.mood||j?.audioOnly||c.energy||c.stress||c.sleepStart||c.sleepEnd||c.nap||c.latency||c.awake);
}
function validateJournal(life,n,checkDuplicates=true){
 const j=n.journal;
 if(!j||j.version!==1||!validDate(j.date)||(j.mood!==undefined&&typeof j.mood!=='string')||!['','Goed','Prima','Neutraal','Minder','Moeilijk'].includes(j.mood||''))throw Error('Ongeldige dagboekmetadata');
 if(j.audioOnly!==undefined&&typeof j.audioOnly!=='boolean')throw Error('Ongeldige opnamegegevens');
 journalCheckinValid(j.checkin);
 // Archived days retain their reservation; deleted days are recoverable separately.
 if(checkDuplicates&&!n.deletedAt&&life.notes.some(x=>x.id!==n.id&&!x.deletedAt&&x.journal?.date===j.date))throw Error('Voor deze datum bestaat al een dagboeknotitie');
}
function findJournal(life,date){return life.notes.find(n=>!n.deletedAt&&n.journal?.version===1&&n.journal.date===date)||null;}
function saveJournal(life,{id,date,title='',body='',mood='',tags=[],collectionId,checkin,audioOnly}){
 if(!validDate(date))throw Error('Kies een geldige datum');
 const existing=findJournal(life,date);
 if(existing&&existing.id!==id)throw Error('Open de bestaande dagboeknotitie voor deze datum');
 if(!journalHasContent(body,{mood,checkin,audioOnly}))throw Error('Schrijf iets of vul je dagelijkse check-in in');
 if(String(body).length>20000||String(title).length>180)throw Error('Dagboektekst is te lang');
 const journal={version:1,date,mood};if(checkin!==undefined)journal.checkin=clone(checkin);if(audioOnly!==undefined)journal.audioOnly=Boolean(audioOnly);
 if(id){const old=life.notes.find(n=>n.id===id);if(old?.journal){if(checkin===undefined&&old.journal.checkin!==undefined)journal.checkin=clone(old.journal.checkin);if(audioOnly===undefined&&old.journal.audioOnly!==undefined)journal.audioOnly=old.journal.audioOnly;}}
 if(id){const old=life.notes.find(n=>n.id===id);if(!old?.journal)throw Error('Geen bestaande dagboeknotitie');return updateNote(life,id,{title:title.trim()||date,body,tags,journal});}
 const n=makeNote({title:title.trim()||date,body,collectionId},life);n.journal=journal;n.tags=clone(tags);validateNote(life,n);life.notes.push(n);return n;
}

return {collectionCounts,collectionPath,centralSearch,migrateHierarchy,saveCollection,reorderCollections,setCollectionArchived,journalDate,saveJournal,findJournal,journalCheckinValid,journalHasContent,iconIds,clone,uid,timestamp,builtins,ensure,validKind,typeOf,collectionOf,collectionName,checklistItems,reconcileItems,makeNote,updateNote,restoreRevision,toggleItem,addCollection,renameCollection,validate,validateNote,search};
});
