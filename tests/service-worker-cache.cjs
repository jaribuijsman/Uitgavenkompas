/* An obsolete worker can recreate its old cache after the new worker activates. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','sw.js'),'utf8');
const name=source.match(/const CACHE = "([^"]+)"/)[1],origin='https://example.test',base=origin+'/Uitgavenkompas/';
const handlers={},old=new Map(),current=new Map(),stores=new Map([['memento-obsolete-in-flight',old],[name,current]]);
const key=r=>new URL(typeof r==='string'?r:r.url,base).href;
old.set(base,new Response('obsolete document'));old.set(base+'index.html',new Response('obsolete fallback'));
old.set(base+'shared.js',new Response('obsolete shared asset'));
current.set(base,new Response('current document'));current.set(base+'index.html',new Response('current fallback'));
current.set(base+'shared.js',new Response('current shared asset'));
vm.runInNewContext(source,{
 self:{location:{origin,href:base+'sw.js'},addEventListener:(type,handler)=>handlers[type]=handler},URL,Response,
 caches:{open:async n=>{if(!stores.has(n))stores.set(n,new Map());const data=stores.get(n);return {match:async r=>data.get(key(r))?.clone(),put:async(r,response)=>data.set(key(r),response)};},match:async r=>{for(const data of stores.values()){const response=data.get(key(r));if(response)return response.clone();}}},
 fetch:async()=>{throw Error('offline');}
});
async function response(path,mode){let pending;handlers.fetch({request:{url:base+path,method:'GET',mode},respondWith:p=>pending=p});return await pending;}
(async()=>{
 assert.equal(await(await response('','navigate')).text(),'current document');
 assert.equal(await(await response('uncached-route','navigate')).text(),'current fallback');
 assert.equal(await(await response('shared.js','cors')).text(),'current shared asset');
 const redirect=await response('uitgavenkompas-v20-pincode-vergrendeling-1.html','navigate');assert.equal(redirect.status,302);assert.equal(redirect.headers.get('location'),base);
 console.log('PASS offline document, fallback and asset ignore resurrected old caches; historical writer redirects');
})().catch(e=>{console.error(e);process.exitCode=1;});
