/* Separate, bounded Kenniscentrum archives. WebCrypto only; no external scripts. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./memento-backup.js'):root.MementoCompleteBackup,typeof module==='object'&&module.exports?require('./memento-knowledge-workspace.js'):root.MementoKnowledgeWorkspace);if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoKnowledgeBackup=api;})(globalThis,(ZIP,W)=>{
'use strict';
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true}),MAGIC=enc.encode('MKCENC01'),ITERATIONS=600000;
async function key(password,salt){const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function seal(blob,password){
 if(typeof password!=='string'||password.length<12)throw Error('Gebruik een wachtwoord van minimaal twaalf tekens. Zonder wachtwoord is herstel onmogelijk.');
 if(blob.size>ZIP.LIMIT)throw Error('Back-up te groot');
 const header=new Uint8Array(40);header.set(MAGIC);const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));header.set(salt,8);header.set(iv,24);new DataView(header.buffer).setUint32(36,ITERATIONS);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:header,tagLength:128},await key(password,salt),await blob.arrayBuffer());return new Blob([header,ciphertext],{type:'application/octet-stream'});
}
async function unseal(file,password){
 if(file.size>ZIP.LIMIT+1048576)throw Error('Back-up te groot');const bytes=new Uint8Array(await file.arrayBuffer());
 if(!MAGIC.every((x,i)=>bytes[i]===x))return file;
 if(bytes.length<56||new DataView(bytes.buffer).getUint32(36)!==ITERATIONS)throw Error('Onbekend versleuteld back-upformaat');
 try{const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(24,36),additionalData:bytes.slice(0,40),tagLength:128},await key(String(password||''),bytes.slice(8,24)),bytes.slice(40));return new Blob([data],{type:'application/zip'});}catch{throw Error('Verkeerd wachtwoord of beschadigde back-up. Er is niets hersteld.');}
}
async function create(life,store,password=''){
 const data=W.projection(life),bytes=enc.encode(JSON.stringify(data)),records=new Map((await store.all()).map(r=>[r.id,r])),files=[],entries=[{name:'data/knowledge.json',bytes}];
 for(const [id,meta] of W.fileReferences(life)){if(!/^[a-z0-9-]{8,120}$/i.test(id))throw Error('Ongeldige bestands-ID');const r=records.get(id);if(!r?.blob)throw Error('Bestand ontbreekt: '+meta.name);const hash=await store.sha256(r.blob);if(meta.hash&&meta.hash!==hash||r.blob.size!==meta.size)throw Error('Beschadigd bestand: '+meta.name);const clean={id,noteId:r.noteId,name:r.name,type:r.type,size:r.blob.size,hash,createdAt:r.createdAt};files.push(clean);entries.push({name:'files/'+id,bytes:new Uint8Array(await r.blob.arrayBuffer())});}
 const manifest={format:'memento-knowledge',version:1,scope:'knowledge-only',exportedAt:new Date().toISOString(),dataHash:await store.sha256(new Blob([bytes])),files};entries.unshift({name:'manifest.json',bytes:enc.encode(JSON.stringify(manifest))});let blob=ZIP.zip(entries);if(password)blob=await seal(blob,password);return {blob,manifest,encrypted:Boolean(password)};
}
async function prepare(file,store,password=''){
 const plain=await unseal(file,password),parts=ZIP.unzip(new Uint8Array(await plain.arrayBuffer()));const parse=name=>{const b=parts.get(name);if(!b)throw Error('Bestand ontbreekt: '+name);return JSON.parse(dec.decode(b))};
 const manifest=parse('manifest.json');if(manifest.format!=='memento-knowledge'||manifest.version!==1||manifest.scope!=='knowledge-only'||!Array.isArray(manifest.files))throw Error('Onbekende Kenniscentrum-back-up');
 const bytes=parts.get('data/knowledge.json');if(!bytes||await store.sha256(new Blob([bytes]))!==manifest.dataHash)throw Error('Kenniscentrumgegevens zijn beschadigd');
 const incoming=parse('data/knowledge.json');if(Object.keys(incoming).some(k=>!['notes','knowledge'].includes(k)))throw Error('Back-up bevat andere gegevensgebieden');W.validate(incoming);
 const files=[],seen=new Set();for(const f of manifest.files){if(!f||!/^[a-z0-9-]{8,120}$/i.test(f.id)||seen.has(f.id)||!Number.isSafeInteger(f.size)||f.size<0)throw Error('Ongeldige bestandenlijst');seen.add(f.id);const b=parts.get('files/'+f.id);if(!b||b.length!==f.size)throw Error('Bestand ontbreekt: '+f.name);const blob=new Blob([b],{type:f.type});if(await store.sha256(blob)!==f.hash)throw Error('Beschadigd bestand: '+f.name);files.push({...f,blob});}
 for(const [id,meta] of W.fileReferences(incoming)){const f=files.find(f=>f.id===id);if(!f||f.hash!==meta.hash||f.size!==meta.size)throw Error('Ontbrekende of ongeldige bijlageverwijzing');}
 if(parts.size!==files.length+2)throw Error('Onverwachte bestanden in export');return {incoming,files,manifest};
}
return {create,prepare,seal,unseal,ITERATIONS};
});
