"use strict";
// Fast, conservative CI planner. Full safety coverage is reserved for real
// state/security/worker/inline-code changes, not cache version-only churn.
const cp=require("node:child_process"),fs=require("node:fs");
const FULL=["interface-layout","interface-feature","interface-acceptance","interface-visual","life-full","data-full"];
const HIGH=/^(?:\.github\/workflows\/|tests\/ci-(?:plan|groups|plan-regression)\.cjs$|assets\/memento-(?:storage-guard|backup|knowledge-store|trash-core|review-core|finance-dashboard-v9|finance-app|life-app|category-integrity)\.js$)/;
function normalizeHtml(s){
 return s.replace(/(<(?:script|link)\b[^>]*?\b(?:src|href)=["'][^"']+?)\?v=[\w.-]+(?=["'])/g,"$1?v=VERSION");
}
function versionOnlyHtml(before,after){return typeof before==="string"&&typeof after==="string"&&normalizeHtml(before)===normalizeHtml(after)}
function normalizeWorker(s){
 return s.replace(/^const CACHE = [^\n]*\n/m,"const CACHE = VERSION;\n")
         .replace(/^const CORE = [^\n]*\n/m,"const CORE = VERSION;\n");
}
function workerCacheOnly(before,after){
 if(typeof before!=="string"||typeof after!=="string"||normalizeWorker(before)!==normalizeWorker(after))return false;
 const capture=s=>s.match(/^const CORE = (\[[^\n]*\]);/m);
 const a=capture(before),b=capture(after);
 if(!a||!b)return false;
 try{
  const norm=entry=>entry.replace(/\?v=[\w.-]+(?=$)/,"?v=VERSION");
  const names=s=>JSON.parse(s[1]).map(norm);
  return JSON.stringify(names(a))===JSON.stringify(names(b));
 }catch{return false}
}
function planFor(paths,read=()=>null,forceFull=false){
 const application=[...new Set(paths)].filter(p=>p&&!/^docs\//.test(p)&&!["AGENTS.md","README.md"].includes(p));
 if(!application.length&&!forceFull)return {tier:"none",groups:[],upgrade:false,files:paths};
 let high=forceFull,needsUpgrade=false;
 for(const p of application){
  if(HIGH.test(p)){high=true;continue}
  if(p==="tests/recovery-upgrade-browser.cjs"){high=true;needsUpgrade=true;continue}
  if(p==="index.html"&&!versionOnlyHtml(read(p,"before"),read(p,"after"))){high=true;needsUpgrade=true}
  if(p==="sw.js"&&!workerCacheOnly(read(p,"before"),read(p,"after"))){high=true;needsUpgrade=true}
 }
 // Actual changes to the offline lifecycle and persistent data must be upgrade-tested.
 if(high&&application.some(p=>p==="sw.js"&&!workerCacheOnly(read(p,"before"),read(p,"after"))
  ||/^assets\/memento-(?:storage-guard|backup|knowledge-store|trash-core|finance-app|life-app)\.js$/.test(p)))needsUpgrade=true;
 if(high)return {tier:"high",groups:FULL,upgrade:needsUpgrade,files:paths};
 const shared=application.some(p=>/^assets\/memento-(?:glass|layout|ui|tokens|base-app)\.css$/.test(p));
 const medium=application.some(p=>p==="index.html"||p==="sw.js"||p.endsWith(".js")||p.startsWith("tests/")||shared);
 const onlyTests=application.every(p=>p.startsWith("tests/"));
 const groups=new Set(onlyTests?[]:["interface-smoke"]);
 for(const p of application){
  const match=p.match(/^tests\/([\w-]+-browser)\.cjs$/);
  if(match)groups.add("test-"+match[1]);
 }
 // A PR changing only browser tests runs those exact tests, without duplicates.
 if(onlyTests&&application.every(p=>/^tests\/[\w-]+-browser\.cjs$/.test(p)))return {tier:"medium",groups:[...groups],upgrade:false,files:paths};
 if(application.some(p=>/knowledge|note|journal|cover/i.test(p)))groups.add("life-knowledge");
 if(application.some(p=>/fitness|quickfit/i.test(p)))groups.add("life-fitness");
 if(application.some(p=>/assistant|dictation/i.test(p)&&p.endsWith(".js")))groups.add("life-assistant");
 if(application.some(p=>/finance|account|transaction|receipt|categor|budget/i.test(p)))groups.add("data-finance");
 if(application.some(p=>/storage|backup|recovery/i.test(p)))groups.add("data-storage");
 if(application.some(p=>/calendar|agenda/i.test(p)))groups.add("interface-calendar");
 if(application.some(p=>/memento-start/i.test(p)))groups.add("interface-start");
 // Global material/style changes require a layout check, but not every domain suite.
 if(shared)groups.add("interface-layout-smoke");
 return {tier:medium?"medium":"low",groups:[...groups],upgrade:false,files:paths};
}
function git(args){return cp.execFileSync("git",args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]})}
function locateBase(){
 const proposed=process.env.MEMENTO_CI_BASE_SHA;
 if(proposed&&/^[a-f0-9]{40}$/.test(proposed)&&!/^(0{40})$/.test(proposed)){
  try{git(["cat-file","-e",proposed+"^{commit}"])}
  catch{git(["fetch","--no-tags","--depth=1","origin",proposed])}
  return proposed;
 }
 return "HEAD^";
}
function collect(){
 const base=locateBase();
 const paths=git(["diff","--name-only",base,"HEAD"]).split(/\r?\n/).filter(Boolean);
 const read=(file,which)=>{
  try{return which==="before"?git(["show",base+":"+file]):fs.readFileSync(file,"utf8")}catch{return null}
 };
 return planFor(paths,read,process.env.MEMENTO_CI_FORCE_FULL==="true");
}
if(require.main===module){
 const plan=collect();
 const outputs={tier:plan.tier,groups:JSON.stringify(plan.groups),upgrade:String(plan.upgrade)};
 console.log("MEMENTO_CI_PLAN "+JSON.stringify(plan));
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,Object.entries(outputs).map(([k,v])=>k+"="+v).join("\n")+"\n");
}
module.exports={planFor,versionOnlyHtml,workerCacheOnly,FULL};
