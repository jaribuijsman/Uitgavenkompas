"use strict";
// Fast, conservative CI planner. Full safety coverage is reserved for real
// state/security/worker/inline-code changes, not cache version-only churn.
const cp=require("node:child_process"),fs=require("node:fs");
const FULL=["interface-layout","interface-feature","interface-acceptance","interface-visual","life-full","data-full"];
const HIGH=/^(?:\.github\/workflows\/|tests\/ci-(?:plan|groups|plan-regression|postmerge|postmerge-regression)\.cjs$|assets\/memento-(?:storage-guard|backup|knowledge-store|trash-core|review-core|finance-dashboard-v9|finance-app|life-app|category-integrity)\.js$)/;
function normalizeHtml(s){
 return s.replace(/(<(?:script|link)\b[^>]*?\b(?:src|href)=["'][^"']+?)\?v=[\w.-]+(?=["'])/g,"$1?v=VERSION");
}
function versionOnlyHtml(before,after){return typeof before==="string"&&typeof after==="string"&&normalizeHtml(before)===normalizeHtml(after)}
// Mask only the body of real HTML <style> elements. Skip scripts and comments:
// text resembling a style tag inside JavaScript must never demote a code change.
function maskInlineCss(html){
 let pos=0,keptFrom=0,count=0,output="";
 while(pos<html.length){
  const at=html.indexOf("<",pos);
  if(at<0)break;
  if(html.startsWith("<!--",at)){
   const end=html.indexOf("-->",at+4);
   if(end<0)return null;
   pos=end+3;continue;
  }
  const tag=/^<(script|style)\b[^>]*>/i.exec(html.slice(at));
  if(!tag){pos=at+1;continue}
  const type=tag[1].toLowerCase(),bodyStart=at+tag[0].length;
  const close=new RegExp("<\\/\\s*"+type+"\\s*>","gi");
  close.lastIndex=bodyStart;
  const end=close.exec(html);
  if(!end)return null;
  if(type==="style"){
   output+=html.slice(keptFrom,bodyStart)+"INLINE_CSS_"+count++;
   keptFrom=end.index;
  }
  pos=close.lastIndex;
 }
 return {html:output+html.slice(keptFrom),count};
}
function styleOnlyHtml(before,after){
 if(typeof before!=="string"||typeof after!=="string")return false;
 const a=maskInlineCss(normalizeHtml(before)),b=maskInlineCss(normalizeHtml(after));
 return !!a&&!!b&&a.count>0&&a.count===b.count&&a.html===b.html;
}
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
function planFor(paths,read=()=>null,forceFull=false,verifiedPostmerge=false){
 const application=[...new Set(paths)].filter(p=>p&&!/^docs\//.test(p)&&!["AGENTS.md","README.md"].includes(p));
 if(!application.length&&!forceFull)return {tier:"none",groups:[],upgrade:false,files:paths};
 // Safe only after Git + GitHub API proof that this exact tree already passed PR CI.
 // Never applied for manual force-full or unverifiable/direct pushes to main.
 if(verifiedPostmerge&&!forceFull)return {tier:"low",groups:["interface-smoke"],upgrade:false,files:paths,postmerge:true};
 const htmlStyleOnly=application.includes("index.html")&&styleOnlyHtml(read("index.html","before"),read("index.html","after"));
 let high=forceFull,needsUpgrade=false;
 for(const p of application){
  if(HIGH.test(p)){high=true;continue}
  if(p==="tests/recovery-upgrade-browser.cjs"){high=true;needsUpgrade=true;continue}
  if(p==="index.html"&&!versionOnlyHtml(read(p,"before"),read(p,"after"))&&!htmlStyleOnly){high=true;needsUpgrade=true}
  if(p==="sw.js"&&!workerCacheOnly(read(p,"before"),read(p,"after"))){high=true;needsUpgrade=true}
 }
 // Actual changes to the offline lifecycle and persistent data must be upgrade-tested.
 if(high&&application.some(p=>p==="sw.js"&&!workerCacheOnly(read(p,"before"),read(p,"after"))
  ||/^assets\/memento-(?:storage-guard|backup|knowledge-store|trash-core|finance-app|life-app)\.js$/.test(p)))needsUpgrade=true;
 if(high)return {tier:"high",groups:FULL,upgrade:needsUpgrade,files:paths};
 const shared=htmlStyleOnly||application.some(p=>/^assets\/memento-(?:glass|layout|ui|tokens|base-app)\.css$/.test(p));
 const medium=application.some(p=>p==="index.html"||p==="sw.js"||p.endsWith(".js")||p.startsWith("tests/")||shared);
 const onlyTests=application.every(p=>p.startsWith("tests/"));
 const groups=new Set();
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
 if(application.some(p=>/^assets\/memento-(?:glass|ui|base-app)\.(?:css|js)$/.test(p)))groups.add("interface-day");
 // A domain-specific browser journey already covers the UI. Do not spawn a
 // redundant general visual journey on a second Chromium runner.
 if(!onlyTests&&groups.size===0)groups.add("interface-smoke");
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
 return planFor(paths,read,process.env.MEMENTO_CI_FORCE_FULL==="true",
  process.env.MEMENTO_CI_POSTMERGE_VERIFIED==="true"&&process.env.GITHUB_EVENT_NAME==="push"&&process.env.GITHUB_REF==="refs/heads/main");
}
if(require.main===module){
 const plan=collect();
 const outputs={tier:plan.tier,groups:JSON.stringify(plan.groups),upgrade:String(plan.upgrade)};
 console.log("MEMENTO_CI_PLAN "+JSON.stringify(plan));
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,Object.entries(outputs).map(([k,v])=>k+"="+v).join("\n")+"\n");
}
module.exports={planFor,versionOnlyHtml,styleOnlyHtml,workerCacheOnly,FULL};

