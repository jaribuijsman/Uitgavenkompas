'use strict';
/* Public static files only. No browser storage, credentials, analytics or user data. */
const fs=require('node:fs'),crypto=require('node:crypto');
const paths=['index.html','sw.js','assets/memento-knowledge-core.js','assets/memento-knowledge.js','assets/memento-knowledge.css'];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const commit=process.env.GITHUB_SHA;if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('Expected a verified GitHub commit');
 const expected=Object.fromEntries(paths.map(p=>[p,digest(fs.readFileSync(p))]));let last=[];
 for(let attempt=0;attempt<60;attempt++){
  const results=await Promise.allSettled(paths.map(async p=>{const r=await fetch('https://jaribuijsman.github.io/Uitgavenkompas/'+p+'?verify='+commit,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(p+': HTTP '+r.status);return {path:p,sha256:digest(Buffer.from(await r.arrayBuffer()))}}));
  last=results.map((r,i)=>r.status==='fulfilled'?{...r.value,matches:r.value.sha256===expected[r.value.path]}:{path:paths[i],error:String(r.reason),matches:false});
  if(last.every(r=>r.matches)){const evidence={commit,url:'https://jaribuijsman.github.io/Uitgavenkompas/',checkedAt:new Date().toISOString(),files:last};fs.writeFileSync('/tmp/kc2-publication.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));return;}
  console.log('Waiting for Pages deployment; attempt '+(attempt+1)+': '+last.filter(r=>!r.matches).map(r=>r.path).join(', '));await new Promise(r=>setTimeout(r,10000));
 }
 throw Error('Pages did not publish the expected files: '+JSON.stringify(last));
})().catch(e=>{console.error(e);process.exitCode=1});
