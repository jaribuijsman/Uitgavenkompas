'use strict';
// Use only provable, identical and previously tested PR trees for a short main smoke.
// Supports normal merges (two parents) and squash merges (one parent).
const cp=require('node:child_process');
const fs=require('node:fs');
const SHA=/^[a-f0-9]{40}$/;
function verifyEvidence({mergeSha,parents,mergeTree,headTree,pr,runs}){
 if(!SHA.test(mergeSha||'')||!SHA.test(mergeTree||'')||!SHA.test(headTree||'')||mergeTree!==headTree)return false;
 if(!Array.isArray(parents)||![1,2].includes(parents.length)||parents.some(x=>!SHA.test(x||'')))return false;
 if(!pr||pr.state!=='closed'||!pr.merged_at||pr.merge_commit_sha!==mergeSha||pr.base?.ref!=='main'||!SHA.test(pr.head?.sha||''))return false;
 // Never reuse CI from an old main base, or a different merge parent.
 if(pr.base?.sha!==parents[0])return false;
 if(parents.length===2&&parents[1]!==pr.head.sha)return false;
 const mergedAt=Date.parse(pr.merged_at);
 if(!Number.isFinite(mergedAt)||!Array.isArray(runs))return false;
 return runs.some(run=>{
  const testedAt=Date.parse(run?.updated_at||'');
  return run?.head_sha===pr.head.sha&&run.event==='pull_request'&&
   run.conclusion==='success'&&run.status==='completed'&&
   run.name==='Memento complete glass review'&&
   /(?:^|\/)app-review\.yml$/.test(run.path||'')&&
   Number.isFinite(testedAt)&&testedAt<=mergedAt;
 });
}
function git(...args){return cp.execFileSync('git',args,{encoding:'utf8',timeout:10000}).trim()}
async function api(url){
 const response=await fetch(url,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('GitHub status '+response.status);
 return response.json();
}
async function inspect(){
 if(process.env.GITHUB_EVENT_NAME!=='push'||process.env.GITHUB_REF!=='refs/heads/main'||!process.env.GH_TOKEN)return false;
 const repo=process.env.GITHUB_REPOSITORY;
 if(!/^[\w.-]+\/[\w.-]+$/.test(repo||''))return false;
 const [mergeSha,...parents]=git('rev-list','--parents','-n','1','HEAD').split(' ');
 if(!SHA.test(mergeSha||'')||![1,2].includes(parents.length))return false;
 const mergeTree=git('rev-parse','HEAD^{tree}');
 const prefix='https://api.github.com/repos/'+repo;
 const prs=await api(prefix+'/commits/'+mergeSha+'/pulls');
 if(!Array.isArray(prs))return false;
 for(const pr of prs){
  if(pr.merge_commit_sha!==mergeSha||!SHA.test(pr.head?.sha||'')||pr.base?.sha!==parents[0])continue;
  if(parents.length===2&&parents[1]!==pr.head.sha)continue;
  // A squash commit has no PR-head parent. Fetch and compare the exact head tree.
  const headCommit=await api(prefix+'/git/commits/'+pr.head.sha);
  const headTree=headCommit?.tree?.sha;
  if(mergeTree!==headTree)continue;
  const result=await api(prefix+'/actions/runs?event=pull_request&head_sha='+pr.head.sha+'&per_page=100');
  if(result.total_count>100)continue;
  if(verifyEvidence({mergeSha,parents,mergeTree,headTree,pr,runs:result.workflow_runs}))return true;
 }
 return false;
}
if(require.main===module){
 inspect().then(verified=>{
  console.log('MEMENTO_POSTMERGE '+(verified?'verified identical PR head; short smoke':'not verified; normal full risk-based checks'));
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'verified='+String(verified)+'\n');
 }).catch(err=>{
  console.warn('MEMENTO_POSTMERGE evidence unavailable: '+err.message+'; normal checks');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'verified=false\n');
 });
}
module.exports={verifyEvidence,inspect};
