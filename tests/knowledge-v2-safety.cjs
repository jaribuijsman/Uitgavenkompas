'use strict';
const assert=require('node:assert/strict'),{tab,knowledge,clone,emptyLife,locks,Guard,K,ZIP,sha256}=require('./helpers/storage-fixture.cjs');
let count=0;async function test(name,fn){await fn();console.log('PASS '+name);count++;}
(async()=>{
 await test('guarded migration retains the exact raw original in previous-version recovery',async()=>{
  const source=emptyLife();source.notes=[{id:'legacy',title:'Oud recept',body:'Alle inhoud',deletedAt:'',category:'eLiquid Recepten',tags:['oud'],attachments:[],revisions:[],recipe:{ingredients:[{name:'Bewaren',amount:'4',unit:'ml'}],version:9,notes:'Bewaren'}}];
  const raw=JSON.stringify(source),storage=new Map([[Guard.KEYS.life,raw]]),s=await tab(storage);const finance=s.storage.get(Guard.KEYS.finance);knowledge(s);
  assert.equal(s.life.state.knowledge.hierarchyVersion,1);assert.equal(storage.get('compass_life_preview_v1_vorige'),raw);assert.deepEqual(s.life.state.notes,source.notes);assert.equal(storage.get(Guard.KEYS.finance),finance);s.MementoStorageGuard.close();
 });
 await test('read-only bridges refuse collection create/edit/reorder/archive and journal writes',async()=>{
  const initial=emptyLife();K.ensure(initial);K.migrateHierarchy(initial);const storage=new Map([[Guard.KEYS.life,JSON.stringify(initial)]]),manager=locks(),a=await tab(storage,manager),b=await tab(storage,manager);
  const before=storage.get(Guard.KEYS.life);const root=b.life.state.knowledge.collections.find(c=>c.parentId===null),ids=b.life.state.knowledge.collections.filter(c=>c.parentId===null).map(c=>c.id).reverse();
  const actions=[s=>K.saveCollection(s,{name:'Niet opslaan',icon:'leaf',view:'list'}),s=>K.saveCollection(s,{id:root.id,name:'Hernoemd',icon:'heart',view:'gallery'}),s=>K.reorderCollections(s,null,ids),s=>K.setCollectionArchived(s,root.id,true),s=>K.saveJournal(s,{date:'2026-10-27',body:'Concept bewaren'})];
  for(const action of actions){assert.equal(b.MementoKnowledgeBridge.write(action),false);assert.equal(storage.get(Guard.KEYS.life),before);assert.equal(JSON.stringify(b.life.state),before);}
  a.MementoStorageGuard.close();b.MementoStorageGuard.close();
 });
 await test('old JSON import remains valid and malformed v2 hierarchy is rejected before writes',async()=>{
  const s=await tab(),old=emptyLife(),archive={format:'compass-life-backup',version:1,lifeState:old};
  assert.equal(await s.life.importBackup({text:async()=>JSON.stringify(archive)},false),true);
  const before=s.storage.get(Guard.KEYS.life);const invalid=clone(old);K.ensure(invalid);K.migrateHierarchy(invalid);invalid.knowledge.collections.find(c=>c.parentId).parentId='missing';
  assert.equal(await s.life.importBackup({text:async()=>JSON.stringify({...archive,lifeState:invalid})},false),false);assert.equal(s.storage.get(Guard.KEYS.life),before);s.MementoStorageGuard.close();
 });
 await test('old and new ZIP v2 retain attachment bytes, finance, hierarchy, journal and revisions',async()=>{
  for(const modern of [false,true]){
   const life=emptyLife();K.ensure(life);if(modern)K.migrateHierarchy(life);
   const note=K.makeNote({title:'eLiquid',kind:'recipe',collectionId:'recipes',body:'Legacy recept'},life);life.notes.push(note);note.recipe={ingredients:[{name:'Ingrediënt',amount:'1',unit:'ml'}],status:'definitief',version:7,notes:'Bewaren'};
   const blob=new Blob(['%PDF-1.4\nFictief document'],{type:'application/pdf'}),meta={id:'11111111-1111-4111-8111-111111111111',noteId:note.id,name:'bewaren.pdf',type:blob.type,size:blob.size,hash:await sha256(blob)};note.attachments=[meta];
   if(modern){const n=K.saveJournal(life,{date:'2026-10-27',body:'Lang dagboek '.repeat(500),mood:'Goed',tags:['rust'],collectionId:'kc2-levenspad-dagboek'});K.saveJournal(life,{id:n.id,date:'2026-10-27',body:n.body+' Extra',mood:'Prima',tags:n.tags});K.reorderCollections(life,null,life.knowledge.collections.filter(c=>c.parentId===null).map(c=>c.id).reverse());K.saveCollection(life,{id:'kc2-huis-wonen-apparaten',name:'Mijn handleidingen',icon:'devices',view:'table',parentId:'kc2-projecten-onderzoek'});K.setCollectionArchived(life,'kc2-ideeen-inspiratie',true);}
   const finance={transactions:[{id:'t',amount:123.45}],categories:[{name:'Oud'}]},store={all:async()=>[{...meta,blob}],sha256};const archive=await ZIP.createArchive({life,finance},store),restored=await ZIP.prepareArchive(archive.blob,store);
   assert.equal(archive.manifest.version,2);K.validate(restored.life);assert.deepEqual(restored.life,life);assert.deepEqual(restored.finance,finance);assert.equal(await restored.files[0].blob.text(),await blob.text());
   if(!modern){const before=clone(restored.life.notes);K.migrateHierarchy(restored.life);K.migrateHierarchy(restored.life);assert.deepEqual(restored.life.notes,before);}
  }
 });
 await test('invalid diary dates, duplicate days and cycles fail validation on import',async()=>{
  const life=emptyLife();K.ensure(life);K.migrateHierarchy(life);const note=K.saveJournal(life,{date:'2026-10-27',body:'Bewaren'});
  for(const change of [s=>s.notes.push({...clone(note),id:'duplicate'}),s=>{s.notes[0].journal.date='2026-02-30'},s=>{s.knowledge.collections.find(c=>c.id==='kc2-levenspad').parentId='kc2-levenspad-dagboek'}]){const copy=clone(life);change(copy);assert.throws(()=>K.validate(copy));}
 });
 console.log(count+' knowledge v2 safety groups passed');
})().catch(e=>{console.error(e);process.exitCode=1});
