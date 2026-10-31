/* Regression coverage for Kenniscentrum, legacy data, attachments and full offline ZIP backups. */
"use strict";
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");
const C=require("../assets/memento-knowledge-core.js");
const S=require("../assets/memento-knowledge-store.js");
const ZIP=require("../assets/memento-backup.js");
let count=0;
function test(name,fn){return Promise.resolve().then(fn).then(()=>{count++;console.log("PASS "+name)});}
const legacy=()=>({version:1,tasks:[],groceries:[],wishes:[],notes:[
 {id:"old-note",title:"Persoonlijke notitie",body:"eerste regel\ntweede regel",category:"Persoonlijk",isChecklist:true,checkedLines:[1],createdAt:"2026-01-01T00:00:00.000Z",deletedAt:""},
 {id:"inbox-old",title:"Inbox item",body:"niet ingedeeld",category:"Inbox",createdAt:"2026-01-02T00:00:00.000Z",deletedAt:""}
],templates:[],appointments:[],history:[]});
const digest=async blob=>createHash("sha256").update(Buffer.from(await blob.arrayBuffer())).digest("hex");
async function run(){
 await test("legacy notes retain identities, categories and original content",()=>{
  const f=legacy(),before=JSON.stringify(f.notes);C.ensure(f);C.validate(f);
  assert.equal(JSON.stringify(f.notes),before);
  assert.equal(C.collectionName(f,C.collectionOf(f,f.notes[0])),"Persoonlijk");
  assert.equal(C.collectionOf(f,f.notes[1]),"inbox");
  assert.equal(f.knowledge.collections.length>=7,true);
 });
 await test("reopening an existing collection does not add duplicate collections",()=>{
  const f=legacy();C.ensure(f);const ids=f.knowledge.collections.map(x=>x.id);
  C.ensure(f);assert.deepEqual(f.knowledge.collections.map(x=>x.id),ids);
 });
 await test("legacy checklist checkboxes retain their state",()=>{
  const f=legacy();C.ensure(f);
  const items=C.checklistItems(f.notes[0]);assert.equal(items[1].done,true);
  C.toggleItem(f,"old-note",items[0].id);
  assert.deepEqual(C.checklistItems(f.notes[0]).map(x=>x.done),[true,true]);
 });
 await test("checklist lines preserve IDs when reordered or edited",()=>{
  const f=legacy();C.ensure(f);
  const original=C.checklistItems(f.notes[0]);
  const arranged=C.reconcileItems(f.notes[0],"tweede regel\neerste regel\nextra regel");
  assert.equal(arranged[0].id,original[1].id);
  assert.equal(arranged[0].done,true);
  assert.equal(arranged[1].id,original[0].id);
  assert.equal(arranged[2].done,false);
 });
 await test("a collection rename preserves legacy note destination",()=>{
  const f=legacy();C.ensure(f);const id=C.collectionOf(f,f.notes[0]);
  C.renameCollection(f,id,"Mijn gedachten");
  assert.equal(C.collectionOf(f,f.notes[0]),id);
  assert.equal(f.notes[0].category,"Mijn gedachten");
 });
 await test("create, edit, tags and filters work together",()=>{
  const f=legacy();C.ensure(f);
  const n=C.makeNote({title:"Memento overzicht",collectionId:"projects",body:"Zoekbaar"},f);f.notes.push(n);
  C.updateNote(f,n.id,{tags:["App","Plan"],body:"Zoekbare tekst"});
  assert.equal(C.search(f,{collectionId:"projects",query:"zoekbare",tag:"App"}).length,1);
  assert.equal(C.search(f,{collectionId:"home",query:"zoekbare"}).length,0);
  assert.equal(n.revision,2);
  C.validate(f);
 });
 await test("autosave snapshots are coalesced and restorable",()=>{
  const f=legacy();C.ensure(f);const n=C.makeNote({title:"A",body:"eerste"},f);f.notes.push(n);
  C.updateNote(f,n.id,{body:"tweede"});
  C.updateNote(f,n.id,{body:"derde"});
  assert.equal(n.revisions.length,1);
  C.restoreRevision(f,n.id,0);
  assert.equal(n.body,"eerste");
  assert.equal(n.revision,4);
 });
 await test("recipe metadata survives revisions",()=>{
  const f=legacy();C.ensure(f);const n=C.makeNote({title:"Recept",kind:"recipe",collectionId:"recipes"},f);f.notes.push(n);
  C.updateNote(f,n.id,{recipe:{ingredients:[{name:"Ingrediënt",amount:"1",unit:"deel"}],status:"testen",notes:"test",version:2}});
  assert.equal(n.recipe.ingredients.length,1);assert.equal(C.typeOf(n),"recipe");C.validate(f);
 });
 await test("soft delete and archiving are distinct states",()=>{
  const f=legacy();C.ensure(f);const n=C.makeNote({title:"Bewaren",collectionId:"home"},f);f.notes.push(n);
  n.archived=true;
  assert.equal(C.search(f,{status:"active"}).some(x=>x.id===n.id),false);
  assert.equal(C.search(f,{status:"archive"}).some(x=>x.id===n.id),true);
  n.deletedAt=new Date().toISOString();
  assert.equal(C.search(f,{status:"trash"}).some(x=>x.id===n.id),true);
 });
 await test("archive and trash honor search, collection, kind and tag filters",()=>{
  const f=legacy();C.ensure(f);
  const archived=C.makeNote({title:"Gevonden archief",body:"Uitzoeken",collectionId:"home"},f);
  archived.tags=["bewaar"];archived.archived=true;
  const otherArchived=C.makeNote({title:"Gevonden in een andere verzameling",body:"Uitzoeken",collectionId:"projects"},f);
  otherArchived.tags=["bewaar"];otherArchived.archived=true;
  const deleted=C.makeNote({title:"Gevonden prullenbak",body:"Uitzoeken",collectionId:"home"},f);
  deleted.tags=["bewaar"];deleted.deletedAt="2026-10-31T00:00:00.000Z";
  const otherDeleted=C.makeNote({title:"Niet relevant",body:"Uitzoeken",collectionId:"home"},f);
  otherDeleted.tags=["bewaar"];otherDeleted.deletedAt="2026-10-31T00:00:00.000Z";
  f.notes.push(archived,otherArchived,deleted,otherDeleted);
  const opts={collectionId:"home",query:"gevonden",kind:"note",tag:"bewaar"};
  assert.deepEqual(C.search(f,{...opts,status:"archive"}).map(n=>n.id),[archived.id]);
  assert.deepEqual(C.search(f,{...opts,status:"trash"}).map(n=>n.id),[deleted.id]);
  assert.deepEqual(C.search(f,{status:"archive",query:"niet-bestaand"}),[]);
  assert.deepEqual(C.search(f,{status:"trash",query:"niet-bestaand"}),[]);
  assert.deepEqual(C.search(f,{status:"active",query:"gevonden"}),[]);
  assert.deepEqual(C.search(f,{status:"trash",collectionId:"projects"}),[]);
 });
 await test("collection IDs remain stable and independent of display name",()=>{
  const f=legacy();C.ensure(f);
  const c=C.addCollection(f,"Boeken","folder","list");const n=C.makeNote({title:"Artikel",collectionId:c.id},f);f.notes.push(n);
  C.renameCollection(f,c.id,"Artikelen");
  assert.equal(n.collectionId,c.id);assert.equal(n.category,"Artikelen");
 });
 await test("real MIME signatures are required for PDFs and images",async()=>{
  const pdf=Object.assign(new Blob(["%PDF-1.7\nsome example text"],{type:"application/pdf"}),{name:"voorbeeld.pdf"});
  const lie=Object.assign(new Blob(["not a PDF"],{type:"application/pdf"}),{name:"lie.pdf"});
  assert.equal(await S.inspect(pdf),"application/pdf");
  await assert.rejects(()=>S.inspect(lie),/Alleen echte/);
 });
 await test("ZIP STORE archives roundtrip byte-identically",async()=>{
  const raw=new Uint8Array([0,1,2,255,128,10]),blob=ZIP.zip([{name:"data/hello.bin",bytes:raw}]);
  const restored=ZIP.unzip(new Uint8Array(await blob.arrayBuffer()));
  assert.deepEqual(Array.from(restored.get("data/hello.bin")),Array.from(raw));
 });
 await test("corrupted ZIP entries are rejected by CRC32",async()=>{
  const blob=ZIP.zip([{name:"file.txt",bytes:new TextEncoder().encode("test")}]);
  const raw=new Uint8Array(await blob.arrayBuffer());
  raw[38]^=1; // local header (30) + 8-byte filename; flip content, not filename
  assert.throws(()=>ZIP.unzip(raw),/Controlegetal/);
 });
 await test("complete ZIP includes exact Life, Finance, preferences and attachment bytes",async()=>{
  const life=legacy();C.ensure(life);const content=new Blob(["%PDF-1.4\nMijn eigen document"],{type:"application/pdf"});
  const id="11111111-1111-4111-8111-111111111111";
  const hash=await digest(content);
  const meta={id,noteId:"old-note",name:"bewaar.pdf",size:content.size,type:"application/pdf",hash,createdAt:"2026-10-26T00:00:00Z"};
  life.notes[0].attachments=[meta];
  const finance={transactions:[{id:"t1",amount:123.45}],categories:[{name:"Overig"}],settings:{currency:"EUR"}};
  const fake={all:async()=>[{...meta,blob:content}],sha256:digest};
  const archive=await ZIP.createArchive({life,finance,extras:{UK_DASHBOARD_SCOPE:"personal"}},fake);
  const restored=await ZIP.prepareArchive(archive.blob,fake);
  assert.equal(restored.life.notes[0].id,"old-note");
  assert.deepEqual(restored.finance,finance);
  assert.equal(restored.extras.UK_DASHBOARD_SCOPE,"personal");
  assert.equal(restored.files.length,1);
  assert.equal(await digest(restored.files[0].blob),hash);
 });
 await test("archive creation refuses missing attachments",async()=>{
  const life=legacy();C.ensure(life);
  life.notes[0].attachments=[{id:"22222222-2222-4222-8222-222222222222",name:"ontbreekt.pdf",size:20,type:"application/pdf"}];
  await assert.rejects(()=>ZIP.createArchive({life,finance:{transactions:[],categories:[]}}, {all:async()=>[],sha256:digest}),/Bijlage ontbreekt/);
 });
 await test("archive creation refuses missing finance instead of exporting partial data",async()=>{
  await assert.rejects(()=>ZIP.createArchive({life:legacy(),finance:null}, {all:async()=>[],sha256:digest}),/Financiën ontbreekt/);
 });
 console.log(count+" knowledge regression checks passed.");
}
run().catch(e=>{console.error(e);process.exitCode=1});
