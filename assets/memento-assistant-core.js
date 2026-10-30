/* Memento-assistent v1: pure, local-only export and guarded proposal planner. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoAssistantCore=api;})(globalThis,()=>{
"use strict";
const FORMAT="memento-life-assistant-proposal",EXPORT="memento-life-assistant-export",VERSION=1;
const TASK_CATS=["Huishouden","Huis & klussen","Administratie","Persoonlijk","Samen","Gezondheid","Werk"];
const ROOMS=["Keuken","Badkamer & toilet","Slaapkamer","Wasruimte","Hele huis"];
const REPEATS=["none","daily","weekly","monthly","quarterly","yearly","custom"];
const TYPES={task:"tasks",note:"notes",grocery:"groceries",wish:"wishes"};
const PERMITTED={task:["category","room","kind","repeat","repeatDays","priority"],note:["collectionId"],grocery:["category"],wish:[]};
const copy=v=>JSON.parse(JSON.stringify(v));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function fail(msg){throw Error(msg);}
function regularNote(n){return n&&!n.deletedAt&&!n.journal&&!n.attachments?.length&&!["pdf","image"].includes(n.kind);}
function snapshot(s,choice={}){
 if(!s||!Array.isArray(s.tasks)||!Array.isArray(s.notes))fail("Leven-gegevens ontbreken.");
 const selected={tasks:choice.tasks!==false,notes:choice.notes!==false,groceries:choice.groceries===true,wishes:choice.wishes===true};
 const clean=(a,p)=>a.filter(x=>x&&!x.deletedAt).map(p);
 const result={format:EXPORT,version:VERSION,exportedAt:new Date().toISOString(),privacy:"Geen financiën, dagboeken, bijlagen of verwijderde items.",selected,collections:[]};
 if(selected.tasks)result.tasks=clean(s.tasks,t=>({id:t.id,title:t.title,notes:t.notes||"",category:t.category||"Persoonlijk",room:t.room||"Hele huis",kind:t.kind,repeat:t.repeat,repeatDays:t.repeatDays,priority:!!t.priority,date:t.date||"",focusDate:t.focusDate||"",done:!!t.done,archived:!!t.archived,steps:(t.steps||[]).map(x=>x.text)}));
 if(selected.notes){
  result.collections=(s.knowledge?.collections||[]).filter(c=>!c.archived&&!c.special).map(c=>({id:c.id,name:c.name,parentId:c.parentId??null}));
  result.collections.unshift({id:"inbox",name:"Inbox",parentId:null});
  result.notes=s.notes.filter(regularNote).map(n=>({id:n.id,title:n.title,body:n.body||"",kind:n.kind||"note",category:n.category||"Inbox",collectionId:n.collectionId||"inbox",tags:Array.isArray(n.tags)?n.tags:[],archived:!!n.archived}));
 }
 if(selected.groceries)result.groceries=clean(s.groceries||[],g=>({id:g.id,title:g.title,notes:g.notes||"",category:g.category||"Overig",list:g.list||"groceries",bought:!!g.bought}));
 if(selected.wishes)result.wishes=clean(s.wishes||[],w=>({id:w.id,title:w.title,notes:w.notes||"",status:w.status||""}));
 return result;
}
function valueValid(type,key,value,s){
 if(type==="task"){
  if(key==="category")return TASK_CATS.includes(value);
  if(key==="room")return ROOMS.includes(value);
  if(key==="kind")return value==="task"||value==="routine";
  if(key==="repeat")return REPEATS.includes(value);
  if(key==="repeatDays")return Number.isInteger(value)&&value>=1&&value<=3650;
  if(key==="priority")return typeof value==="boolean";
 }
 if(type==="note"&&key==="collectionId")return value==="inbox"||(typeof value==="string"&&s.knowledge?.collections?.some(c=>c.id===value&&!c.archived&&!c.special));
 if(type==="grocery"&&key==="category")return typeof value==="string"&&value.trim()===value&&value.length>=1&&value.length<=80;
 return false;
}
function prepare(s,proposal,selected=null){
 if(!proposal||proposal.format!==FORMAT||proposal.version!==VERSION||!Array.isArray(proposal.changes)||proposal.changes.length>1000)fail("Dit is geen geldig Memento-assistentvoorstel (versie 1).");
 if(!Array.isArray(s?.tasks)||!Array.isArray(s?.notes))fail("Leven-opslag ontbreekt.");
 const next=copy(s),all=[],seen=new Set(),chosen=selected?new Set(selected):null;
 for(let i=0;i<proposal.changes.length;i++){
  const p=proposal.changes[i];
  if(!p||!own(TYPES,p.type)||typeof p.id!=="string"||p.id.length>180||!p.id)fail("Ongeldig item in voorstel "+(i+1)+".");
  const key=p.type+":"+p.id;
  if(seen.has(key))fail("Dubbele wijziging voor hetzelfde item: "+key);
  seen.add(key);
  if(!p.set||typeof p.set!=="object"||Array.isArray(p.set)||!p.expected||typeof p.expected!=="object"||Array.isArray(p.expected))fail("Voorstel mist nieuwe en oorspronkelijke waarden: "+key);
  const setKeys=Object.keys(p.set);
  if(!setKeys.length||setKeys.length>8||setKeys.some(k=>!PERMITTED[p.type].includes(k))||Object.keys(p.expected).length!==setKeys.length||setKeys.some(k=>!own(p.expected,k)))fail("Niet-toegestane velden of ontbrekende oude waarden: "+key);
  if(typeof p.reason!=="string"||!p.reason.trim()||p.reason.length>500)fail("Geef per voorstel een korte reden: "+key);
  const row=next[TYPES[p.type]].find(x=>x.id===p.id);
  if(!row||row.deletedAt||(p.type==="note"&&!regularNote(row)))fail("Item ontbreekt of is uitgesloten: "+key);
  const before={},after={};
  for(const k of setKeys){
   if(!valueValid(p.type,k,p.set[k],next))fail("Ongeldige voorgestelde waarde voor "+key+"."+k);
   // Do not accept a stale plan even if the user has since edited this item.
   if(JSON.stringify(row[k])!==JSON.stringify(p.expected[k]))fail("De huidige waarde is gewijzigd sinds de analyse: "+key+"."+k);
   if(JSON.stringify(row[k])!==JSON.stringify(p.set[k])){before[k]=copy(row[k]??null);after[k]=copy(p.set[k]);}
  }
  if(!Object.keys(after).length)continue;
  const effective={...row,...after};
  if(p.type==="task"&&effective.repeat!=="none"&&effective.kind!=="routine")fail("Een herhalende taak moet een routine zijn: "+key);
  if(p.type==="note"&&effective.journal)fail("Dagboeken mogen niet worden gewijzigd.");
  all.push({key,id:p.id,type:p.type,label:String(row.title||"Item").slice(0,180),reason:p.reason,before,after});
 }
 if(chosen){for(const key of chosen)if(!all.some(x=>x.key===key))fail("Selectie bevat een onbekende of verouderde wijziging.");}
 const changes=all.filter(x=>!chosen||chosen.has(x.key));
 return {changes,total:all.length,next:applyRecords(next,changes,"after")};
}
function applyRecords(s,changes,side){
 const out=copy(s);
 for(const change of changes){
  const row=out[TYPES[change.type]]?.find(x=>x.id===change.id);
  if(!row||row.deletedAt||(change.type==="note"&&!regularNote(row)))fail("Item niet beschikbaar voor verwerking: "+change.key);
  const expected=change[side==="after"?"before":"after"],set=change[side];
  for(const k of Object.keys(set)){
   // Other user edits remain intact; only these fields are touched.
   if(JSON.stringify(row[k]??null)!==JSON.stringify(expected[k]))fail("Item is intussen aangepast: "+change.key+"."+k);
  }
  if(change.type==="note"){
   const core=globalThis.MementoKnowledgeCore;
   if(!core?.updateNote)fail("Notitiemodule is niet beschikbaar.");
   core.updateNote(out,change.id,set);
  }else Object.assign(row,copy(set));
 }
 return out;
}
function reverse(s,undo){
 if(!undo||undo.format!=="memento-life-assistant-undo"||undo.version!==1||!Array.isArray(undo.changes)||undo.changes.length>1000)fail("Herstelgegevens ontbreken of zijn ongeldig.");
 const changes=undo.changes,seen=new Set();
 for(const change of changes){
  if(!change||!own(TYPES,change.type)||typeof change.id!=="string"||!change.id||seen.has(change.type+":"+change.id))fail("Ongeldige herstelverwijzing.");
  seen.add(change.type+":"+change.id);
  const before=change.before,after=change.after;
  if(!before||!after||typeof before!=="object"||typeof after!=="object"||Array.isArray(before)||Array.isArray(after))fail("Ongeldige herstelwaarden.");
  const keys=Object.keys(before);
  if(!keys.length||keys.length>8||keys.some(k=>!PERMITTED[change.type].includes(k)||!own(after,k))||Object.keys(after).length!==keys.length)fail("Herstel bevat niet-toegestane velden.");
  for(const field of keys){if(!valueValid(change.type,field,after[field],s))fail("Ongeldige herstelwaarde.");}
 }
 // Validate the entire batch before touching any item.
 return applyRecords(s,changes.slice().reverse(),"before");
}
function validateExportForChat(s,choices){const data=snapshot(s,choices);if(JSON.stringify(data).length>1800000)fail("De gekozen export is te groot. Selecteer minder onderdelen.");return data;}
return Object.freeze({FORMAT,EXPORT,VERSION,TASK_CATS,ROOMS,REPEATS,snapshot:validateExportForChat,prepare,reverse});
});