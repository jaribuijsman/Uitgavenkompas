'use strict';
// A post-merge fast check is allowed only for an unchanged tree of a PR with
// a successfully completed, matching app-review workflow. Any uncertainty
// returns false and leaves the normal full risk-based plan intact.
const cp = require('node:child_process');
const fs = require('node:fs');
function verifyEvidence({mergeSha,secondParent,treeEqual,prs,runs}) {
  if(!treeEqual||!Array.isArray(prs)||!Array.isArray(runs)) return false;
  return prs.some(pr => pr && pr.merged_at && pr.state==='closed' &&
    pr.merge_commit_sha===mergeSha && pr.base?.ref==='main' &&
    pr.head?.sha===secondParent && runs.some(run =>
      run.head_sha===secondParent && run.event==='pull_request' &&
      run.conclusion==='success' && run.status==='completed' &&
      run.name==='Memento complete glass review' &&
      /(?:^|\/)app-review\.yml$/.test(run.path||'') &&
      Date.parse(run.updated_at||'')<=Date.parse(pr.merged_at) &&
      Number.isFinite(Date.parse(run.updated_at||''))));
}
function git(...args) { return cp.execFileSync('git',args,{encoding:'utf8',timeout:10000}).trim(); }
async function api(url) {
  const response=await fetch(url,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw Error('GitHub status '+response.status);
  return response.json();
}
async function inspect() {
  if(process.env.GITHUB_EVENT_NAME!=='push'||process.env.GITHUB_REF!=='refs/heads/main'||!process.env.GH_TOKEN) return false;
  const repo=process.env.GITHUB_REPOSITORY;
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo||''))return false;
  const [mergeSha,firstParent,secondParent,...additional]=git('rev-list','--parents','-n','1','HEAD').split(' ');
  if(!mergeSha||!firstParent||!secondParent||additional.length)return false;
  const treeEqual=git('rev-parse','HEAD^{tree}')===git('rev-parse','HEAD^2^{tree}');
  if(!treeEqual)return false;
  const prefix='https://api.github.com/repos/'+repo;
  const prs=await api(prefix+'/commits/'+mergeSha+'/pulls');
  if(!Array.isArray(prs)||!prs.some(p=>p.merge_commit_sha===mergeSha&&p.head?.sha===secondParent))return false;
  const result=await api(prefix+'/actions/runs?event=pull_request&head_sha='+secondParent+'&per_page=100');
  if(result.total_count>100)return false;
  return verifyEvidence({mergeSha,secondParent,treeEqual,prs,runs:result.workflow_runs});
}
if(require.main===module) {
  inspect().then(verified=>{
    console.log('MEMENTO_POSTMERGE '+(verified?'verified identical PR head; short smoke':'not verified; normal full risk-based checks'));
    if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'verified='+String(verified)+'\n');
  }).catch(err=>{
    console.warn('MEMENTO_POSTMERGE evidence unavailable: '+err.message+'; normal checks');
    if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'verified=false\n');
  });
}
module.exports={verifyEvidence,inspect};
