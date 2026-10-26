/* Kenniscentrum binary attachments. IndexedDB is separate from the existing Life JSON. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoKnowledgeStore=api;})(globalThis,()=>{
"use strict";
const DB="memento_knowledge_files_v1",STORE="files",MAX_FILE=25*1024*1024,MAX_EXPORT=180*1024*1024;
const uid=()=>globalThis.crypto?.randomUUID?.()||"file-"+Date.now()+"-"+Math.random().toString(36).slice(2);
const validMime=new Set(["application/pdf","image/png","image/jpeg","image/webp"]);
function open(){
 return new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(Error("Bestandsopslag wordt niet ondersteund door deze browser."));return;}
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const st=db.createObjectStore(STORE,{keyPath:"id"});st.createIndex("noteId","noteId",{unique:false});}};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error("Bestandsopslag kan niet geopend worden"));
  req.onblocked=()=>reject(Error("Sluit andere Memento-tabbladen en probeer opnieuw"));
 });
}
async function transaction(mode,run){
 const db=await open();
 try{return await new Promise((resolve,reject)=>{
  let result;
  const tx=db.transaction(STORE,mode),st=tx.objectStore(STORE);
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||Error("Bestandsopslag mislukt"));
  tx.onabort=()=>reject(tx.error||Error("Bestandsopslag geannuleerd"));
  try{run(st,value=>{result=value;});}catch(e){tx.abort();reject(e);}
 });}finally{db.close();}
}
function get(id){return transaction("readonly",(st,set)=>{const r=st.get(id);r.onsuccess=()=>set(r.result||null);});}
function all(){return transaction("readonly",(st,set)=>{const r=st.getAll();r.onsuccess=()=>set(r.result||[]);});}
function remove(id){return transaction("readwrite",st=>{st.delete(id);});}
function putRecord(record){if(!record||typeof record.id!=="string"||!(record.blob instanceof Blob))throw Error("Ongeldige bijlage");return transaction("readwrite",st=>st.put(record));}
function putMany(records){
 if(!Array.isArray(records))throw Error("Ongeldige bijlagenlijst");
 return transaction("readwrite",st=>{for(const rec of records){if(!rec||typeof rec.id!=="string"||!(rec.blob instanceof Blob))throw Error("Ongeldige bestandsinhoud");st.put(rec);}});
}
async function sha256(blob){
 const bytes=await blob.arrayBuffer();
 if(!globalThis.crypto?.subtle)throw Error("Deze browser kan de bestandsintegriteit niet controleren.");
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}
async function inspect(file){
 if(!(file instanceof Blob)||file.size===0||file.size>MAX_FILE)throw Error("Kies een PDF of afbeelding van maximaal 25 MB.");
 const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const pdf=header.length>=5&&header[0]===37&&header[1]===80&&header[2]===68&&header[3]===70&&header[4]===45;
 const png=header.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>header[i]===x);
 const jpeg=header[0]===255&&header[1]===216&&header[2]===255;
 const webp=String.fromCharCode(...header.slice(0,4))==="RIFF"&&String.fromCharCode(...header.slice(8,12))==="WEBP";
 const mime=pdf?"application/pdf":png?"image/png":jpeg?"image/jpeg":webp?"image/webp":"";
 if(!validMime.has(mime))throw Error("Alleen echte PDF-, PNG-, JPG- of WebP-bestanden zijn toegestaan.");
 return mime;
}
async function save(noteId,file){
 if(typeof noteId!=="string"||!noteId)throw Error("Sla eerst een notitie op");
 const mime=await inspect(file);
 const metadata={id:uid(),noteId,name:String(file.name||"Bijlage").slice(0,200),type:mime,size:file.size,hash:await sha256(file),createdAt:new Date().toISOString()};
 await putRecord({...metadata,blob:file});
 return metadata;
}
function preview(record){
 if(!record||!(record.blob instanceof Blob))throw Error("Bestand ontbreekt");
 return URL.createObjectURL(record.blob);
}
async function storageInfo(){
 if(!navigator.storage?.estimate)return null;
 const estimate=await navigator.storage.estimate();
 return {used:estimate.usage||0,quota:estimate.quota||0,persisted:await navigator.storage.persisted?.()||false};
}
async function requestPersistence(){return Boolean(await navigator.storage?.persist?.());}
return {open,get,all,remove,putRecord,putMany,sha256,inspect,save,preview,storageInfo,requestPersistence,MAX_FILE,MAX_EXPORT};
});
