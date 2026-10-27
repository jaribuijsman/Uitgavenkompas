/* Offline portable full Memento backup: ZIP STORE, no third-party API. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoCompleteBackup=api;})(globalThis,()=>{
"use strict";
const enc=new TextEncoder(),dec=new TextDecoder("utf-8",{fatal:true}),encode=s=>enc.encode(s),decode=b=>dec.decode(b);
const LIMIT=180*1024*1024;
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
const crc32=bytes=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0};
const v16=(v,i,n)=>v.setUint16(i,n,true),v32=(v,i,n)=>v.setUint32(i,n>>>0,true),r16=(v,i)=>v.getUint16(i,true),r32=(v,i)=>v.getUint32(i,true);
function zip(entries){
 const seen=new Set(),parts=[],central=[];let offset=0,centralSize=0;
 if(entries.length>1000)throw Error("Te veel bijlagen");
 for(const {name,bytes} of entries){
  if(!name||name.startsWith("/")||name.includes("..")||name.includes("\\")||seen.has(name))throw Error("Ongeldige ZIP-naam");seen.add(name);
  const title=encode(name),body=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),checksum=crc32(body);
  if(body.length>LIMIT||title.length>65535||offset+centralSize+body.length>LIMIT)throw Error("Back-up is groter dan 180 MB.");
  const h=new DataView(new ArrayBuffer(30));v32(h,0,0x04034b50);v16(h,4,20);v16(h,6,0x800);v32(h,14,checksum);v32(h,18,body.length);v32(h,22,body.length);v16(h,26,title.length);
  const c=new DataView(new ArrayBuffer(46));v32(c,0,0x02014b50);v16(c,4,20);v16(c,6,20);v16(c,8,0x800);v32(c,16,checksum);v32(c,20,body.length);v32(c,24,body.length);v16(c,28,title.length);v32(c,42,offset);
  parts.push(new Uint8Array(h.buffer),title,body);central.push(new Uint8Array(c.buffer),title);offset+=30+title.length+body.length;centralSize+=46+title.length;
 }
 const e=new DataView(new ArrayBuffer(22));v32(e,0,0x06054b50);v16(e,8,entries.length);v16(e,10,entries.length);v32(e,12,centralSize);v32(e,16,offset);
 return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:"application/zip"});
}
function unzip(bytes){
 if(bytes.length>LIMIT+1048576||bytes.length<22)throw Error("Ongeldige of te grote back-up");
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(r32(v,p)===0x06054b50){end=p;break}
 if(end<0)throw Error("Geen volledige ZIP-back-up");
 const total=r16(v,end+10),start=r32(v,end+16),size=r32(v,end+12);
 if(total>1000||r16(v,end+8)!==total||start+size>end)throw Error("Beschadigde ZIP-index");
 const result=new Map();let p=start;
 for(let i=0;i<total;i++){
  if(p+46>start+size||r32(v,p)!==0x02014b50)throw Error("Beschadigde ZIP-index");
  const flags=r16(v,p+8),method=r16(v,p+10),crc=r32(v,p+16),length=r32(v,p+20),plain=r32(v,p+24),nl=r16(v,p+28),ex=r16(v,p+30),co=r16(v,p+32),loc=r32(v,p+42);
  if(flags&1||method!==0||length!==plain||p+46+nl+ex+co>start+size)throw Error("Onbekende ZIP-compressie");
  const name=decode(bytes.subarray(p+46,p+46+nl));
  if(!name||name.startsWith("/")||name.includes("..")||name.includes("\\")||result.has(name))throw Error("Ongeldige ZIP-bestandsnaam");
  if(loc+30>start||r32(v,loc)!==0x04034b50)throw Error("Beschadigd ZIP-bestand");
  const b=loc+30+r16(v,loc+26)+r16(v,loc+28);
  if(b+length>start)throw Error("ZIP-bestand onvolledig");
  const payload=bytes.slice(b,b+length);if(crc32(payload)!==crc)throw Error("Controlegetal is fout: "+name);
  result.set(name,payload);p+=46+nl+ex+co;
 }
 if(p!==start+size)throw Error("ZIP-index bevat onverwachte bytes");
 return result;
}
const json=(map,name)=>{const bytes=map.get(name);if(!bytes)throw Error("Bestand ontbreekt: "+name);return JSON.parse(decode(bytes))};
async function createArchive({life,finance,extras={}},store){
 if(!life||!Array.isArray(life.notes)||!finance||!Array.isArray(finance.transactions)||!Array.isArray(finance.categories))throw Error("Leven of Financiën ontbreekt: geen volledige back-up gemaakt");
 const byId=new Map((await store.all()).map(x=>[x.id,x])),refs=new Map();
 for(const n of life.notes)for(const a of n.attachments||[])refs.set(a.id,a);
 for(const c of life.knowledge?.collections||[])if(c.coverFile?.id)refs.set(c.coverFile.id,c.coverFile);
 const entries=[
  {name:"data/life.json",bytes:encode(JSON.stringify(life))},
  {name:"data/finance.json",bytes:encode(JSON.stringify(finance))},
  {name:"data/preferences.json",bytes:encode(JSON.stringify(extras))}
 ],files=[];
 for(const [id,meta] of refs){
  if(!/^[a-z0-9-]{8,120}$/i.test(id))throw Error("Ongeldige bijlage-ID");
  const record=byId.get(id);
  if(!record?.blob)throw Error("Bijlage ontbreekt: "+meta.name+". Back-up niet gemaakt.");
  const hash=await store.sha256(record.blob);
  if(meta.hash&&meta.hash!==hash)throw Error("Beschadigde bijlage: "+meta.name);
  entries.push({name:"files/"+id,bytes:new Uint8Array(await record.blob.arrayBuffer())});
  files.push({id,noteId:record.noteId,name:record.name,type:record.type,size:record.size,hash,createdAt:record.createdAt});
 }
 const manifest={format:"memento-complete",version:2,exportedAt:new Date().toISOString(),scope:"life+finance+attachments",files};
 entries.unshift({name:"manifest.json",bytes:encode(JSON.stringify(manifest))});
 return {blob:zip(entries),manifest};
}
async function prepareArchive(file,store){
 if(!file||file.size>LIMIT+1048576)throw Error("Back-up te groot, maximum 180 MB");
 const parts=unzip(new Uint8Array(await file.arrayBuffer())),manifest=json(parts,"manifest.json");
 if(manifest.format!=="memento-complete"||manifest.version!==2||!Array.isArray(manifest.files))throw Error("Onbekend back-upformaat");
 const life=json(parts,"data/life.json"),finance=json(parts,"data/finance.json"),extras=json(parts,"data/preferences.json");
 if(!life||!Array.isArray(life.notes)||!Array.isArray(life.tasks)||!finance||!Array.isArray(finance.transactions)||!Array.isArray(finance.categories))throw Error("Leven of Financiën ontbreekt");
 const files=[],ids=new Set();
 for(const f of manifest.files){
  if(!f||!/^[a-z0-9-]{8,120}$/i.test(f.id)||ids.has(f.id))throw Error("Ongeldige bijlagen");
  ids.add(f.id);const bytes=parts.get("files/"+f.id);
  if(!bytes||bytes.length!==f.size)throw Error("Bijlage ontbreekt: "+f.name);
  const blob=new Blob([bytes],{type:f.type}),hash=await store.sha256(blob);
  if(hash!==f.hash)throw Error("Bijlage-integriteit klopt niet: "+f.name);
  files.push({...f,blob});
 }
 for(const n of life.notes)for(const a of n.attachments||[])if(!ids.has(a.id))throw Error("Een notitie verwijst naar een ontbrekende bijlage");
 for(const c of life.knowledge?.collections||[])if(c.coverFile?.id&&!ids.has(c.coverFile.id))throw Error('Een verzameling verwijst naar een ontbrekende afbeelding');
 return {life,finance,extras,files,manifest};
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
return {zip,unzip,crc32,createArchive,prepareArchive,download,LIMIT};
});
