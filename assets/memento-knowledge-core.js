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
 if(!life.knowledge){life.knowledge={version:1,deviceId:uid(),collections:builtins.map(defaultCollection),updatedAt:timestamp()};}
 const k=life.knowledge;
 if(k.version!==1||!Array.isArray(k.collections)||typeof k.deviceId!=="string")throw Error("Ongeldige kenniscentrummetadata");
 const existing=new Set(k.collections.map(c=>nameKey(c.name)));
 for(const note of life.notes){
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
 if(name==="inbox"||n.collectionId==="inbox")return "inbox";
 const k=life.knowledge;
 if(n.collectionId&&k?.collections.some(c=>c.id===n.collectionId))return n.collectionId;
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
 const accepted=["title","body","kind","collectionId","tags","sourceUrl","recipe","pinned","archived","links","attachments"];
 for(const key of accepted)if(Object.prototype.hasOwnProperty.call(changes,key))n[key]=clone(changes[key]);
 if(n.collectionId!==undefined)n.category=collectionName(life,n.collectionId);
 if(n.kind==="checklist"){n.isChecklist=true;if(before.body!==n.body||!Array.isArray(n.items))n.items=reconcileItems(before,n.body);}
 else n.isChecklist=false;
 n.revisions=Array.isArray(before.revisions)?before.revisions.slice(-11):[];
 // Autosave coalesces nearby edits; keep a useful older snapshot without filling Life storage.
 const last=n.revisions.at(-1);
 if(!last||Date.now()-Date.parse(last.savedAt||"")>5*60*1000||before.kind!==n.kind){
  n.revisions.push({revision:Number(before.revision)||1,savedAt:before.updatedAt||before.createdAt||now,title:before.title,body:before.body,kind:typeOf(before),collectionId:collectionOf(life,before),tags:clone(before.tags||[]),recipe:clone(before.recipe||null),items:clone(before.items||null)});
 }
 n.revision=(Number(before.revision)||1)+1;n.updatedAt=now;
 validateNote(life,n);
 return n;
}
function restoreRevision(life,id,index){
 const n=life.notes.find(x=>x.id===id),rev=n?.revisions?.[index];
 if(!rev)throw Error("Versie niet gevonden");
 const changed=updateNote(life,id,{title:rev.title,body:rev.body,kind:rev.kind,collectionId:rev.collectionId||"inbox",tags:rev.tags||[],...(rev.recipe?{recipe:rev.recipe}:{})});
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
function validateNote(life,n){
 if(!n||!n.id||typeof n.title!=="string"||n.title.length>180||!n.title.trim()||typeof n.body!=="string"||n.body.length>20000)throw Error("Ongeldige kennisnotitie");
 if(n.kind!==undefined&&!validKind.has(n.kind))throw Error("Onbekend itemtype");
 if(n.collectionId!==undefined&&n.collectionId!=="inbox"&&!life.knowledge?.collections.some(c=>c.id===n.collectionId))throw Error("Verzameling ontbreekt");
 for(const key of ["tags","attachments","links","revisions"]){if(n[key]!==undefined&&!Array.isArray(n[key]))throw Error("Ongeldige notitievelden");}
 if(n.tags&&(!n.tags.every(t=>typeof t==="string"&&t.length<=60)||n.tags.length>30))throw Error("Ongeldige tags");
 if(n.attachments&&(n.attachments.length>50||n.attachments.some(a=>!a||typeof a.id!=="string"||typeof a.name!=="string"||a.name.length>200||!Number.isFinite(a.size)||a.size<0)))throw Error("Ongeldige bijlage");
 if(n.revisions&&n.revisions.length>12)throw Error("Te veel versies");
 if(n.links&&n.links.some(l=>!l||typeof l.kind!=="string"||typeof l.id!=="string"))throw Error("Ongeldige koppeling");
 return true;
}
function validate(life){
 const k=ensure(life),ids=new Set();
 for(const c of k.collections){if(!c.id||ids.has(c.id)||!c.name||c.name.length>80||!["list","gallery","table"].includes(c.view))throw Error("Ongeldige verzameling");ids.add(c.id);}
 for(const n of life.notes)validateNote(life,n);
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
  return !q||[n.title,n.body,n.category,n.sourceUrl,...(n.tags||[])].join(" ").toLocaleLowerCase("nl").includes(q);
 }).sort((a,b)=>sort==="title"?a.title.localeCompare(b.title,"nl"):sort==="old"?String(a.updatedAt||a.createdAt||"").localeCompare(String(b.updatedAt||b.createdAt||"")):Number(!!b.pinned)-Number(!!a.pinned)||String(b.updatedAt||b.createdAt||"").localeCompare(String(a.updatedAt||a.createdAt||"")));
}
return {clone,uid,timestamp,builtins,ensure,validKind,typeOf,collectionOf,collectionName,checklistItems,reconcileItems,makeNote,updateNote,restoreRevision,toggleItem,addCollection,renameCollection,validate,validateNote,search};
});
