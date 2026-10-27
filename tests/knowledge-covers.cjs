"use strict";
const assert=require("node:assert/strict"),C=require("../assets/memento-knowledge-core.js"),A=require("../assets/memento-knowledge-art.js"),Backup=require("../assets/memento-backup.js");
const state=()=>{const s={notes:[],tasks:[]};C.ensure(s);C.migrateHierarchy(s);return s;};
(async()=>{
 assert.equal(A.SCENES.length,30);assert.equal(new Set(A.SCENES.map(x=>x.id)).size,30);
 for(const scene of A.SCENES){assert(A.valid(scene.id));assert.match(A.sceneSVG(scene.id),/<svg/);assert.match(A.url(scene.id),/^data:image\/svg\+xml/);assert(!/<script\b/i.test(A.sceneSVG(scene.id)));}
 assert.equal(A.choose("Mijn reizen"),"reizen");assert.match(A.prompt({name:"Mijn katten",scene:"huisdieren"}),/3:1/);
 console.log("PASS 30 offline scenes and auto-selection");
 const s=state(),c=s.knowledge.collections.find(x=>x.id==="kc2-levenspad-dagboek"),oldId=c.id;assert(!Object.hasOwn(c,"coverId"));C.validate(s);
 C.saveCollection(s,{id:oldId,name:"Mijn verhalen",icon:c.icon,view:c.view,parentId:c.parentId,coverId:"dagboek",coverFocus:70});
 C.saveCollection(s,{id:oldId,name:"Mijn verhalen",icon:c.icon,view:c.view,parentId:c.parentId});
 assert.equal(c.coverId,"dagboek");assert.equal(c.coverFocus,70);C.validate(s);
 console.log("PASS unchanged IDs and compatible legacy collection fields");
 const blob=new Blob([Uint8Array.from([137,80,78,71,13,10,26,10,1,2,3,4])],{type:"image/png"});
 const hash=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());const hex=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,"0")).join("");
 c.coverFile={id:"cover-backup-xyz",name:"eigen.png",size:blob.size,type:"image/png",hash:hex};
 const rec={...c.coverFile,noteId:"collection-cover-test",createdAt:"2026-10-27T12:00:00.000Z",blob};
 C.validate(s);
 for(const mutate of [x=>x.coverFile.hash="bad",x=>x.coverFocus=105,x=>x.coverId="javascript:bad",x=>x.coverFile.type="image/svg+xml"]){const copy=C.clone(s);mutate(copy.knowledge.collections.find(x=>x.id===c.id));assert.throws(()=>C.validate(copy));}
 console.log("PASS validated secure cover metadata");
 const store={all:async()=>[rec],sha256:async x=>{const d=await crypto.subtle.digest("SHA-256",await x.arrayBuffer());return Array.from(new Uint8Array(d),q=>q.toString(16).padStart(2,"0")).join("");}};
 const finance={transactions:[],categories:[]},zip=await Backup.createArchive({life:s,finance},store);
 assert.equal(zip.manifest.version,2);assert.equal(zip.manifest.files.length,1);
 const restored=await Backup.prepareArchive(zip.blob,store);
 assert.equal(restored.life.knowledge.collections.find(x=>x.id===c.id).coverFile.id,rec.id);
 await assert.rejects(Backup.createArchive({life:s,finance},{...store,all:async()=>[]}),/Bijlage ontbreekt/);
 console.log("PASS ZIP round trip and missing-file fail closed");
})().catch(e=>{console.error(e);process.exitCode=1;});
