"use strict";
// High-risk browser coverage is sharded across runners, never removed.
// For narrow changes, only directly relevant real-browser journeys run.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const domain=process.argv[2],tier=process.argv[3]||"high";
const suitesByGroup={
 "interface-layout":["layout-completion-browser","visual-layout-browser","patches-001-002-004-browser","day-swipe-browser"],
 "interface-feature":["masterplan-browser","memento-start-browser","calendar-header-browser"],
 "interface-acceptance":["release-acceptance-browser"],
 "interface-visual":["glass-rendering-browser","visual-browser"],
 "life-full":["global-search-browser","memento-category-browser","knowledge-v2-browser","knowledge-covers-browser","notes-direction-c-browser","journal-upgrade-browser","journal-selfcare-browser","memento-assistant-browser","illustrative-icons-browser","quickfit-browser","fitness-browser"],
 "data-full":["app-review-browser","storage-safety-browser","recovery-browser"],
 "interface-smoke":["visual-browser"],
 "interface-layout-smoke":["visual-layout-browser"],
 "interface-calendar":["calendar-header-browser"],
 "interface-start":["memento-start-browser"],
 "life-knowledge":["knowledge-v2-browser","notes-direction-c-browser"],
 "life-fitness":["quickfit-browser","fitness-browser"],
 "life-assistant":["memento-assistant-browser"],
 "data-finance":["app-review-browser"],
 "data-storage":["storage-safety-browser"]
};
const direct=domain.startsWith("test-")?domain.slice(5):"";
const allowed=new Set(Object.values(suitesByGroup).flat());
if(direct&&!allowed.has(direct))throw Error("Unknown direct browser suite: "+direct);
if(!direct&&!Object.hasOwn(suitesByGroup,domain))throw Error("Unknown CI group: "+domain);
const suites=direct?[direct]:suitesByGroup[domain],root=path.join(__dirname,"..");
let count=0,failures=[],fixture="";
const timings=[];
function run(script,extra={}){
 const started=Date.now();
 const result=cp.spawnSync(process.execPath,[path.join(root,"tests",script)],{
  stdio:"inherit",env:{...process.env,...extra},cwd:root,timeout:12*60*1000
 });
 const seconds=Number(((Date.now()-started)/1000).toFixed(1));
 timings.push({suite:script,seconds,passed:result.status===0&&!result.error});
 if(result.error||result.status!==0)failures.push(script+(result.error?": "+result.error.message:" (exit "+result.status+")"));
 else count++;
 console.log("CI_SUITE_DURATION "+JSON.stringify(timings[timings.length-1]));
}
if(suites.some(s=>s==="visual-browser"||s==="knowledge-v2-browser")){
 const r=cp.spawnSync(process.execPath,[path.join(__dirname,"helpers/visual-fixture.cjs")],{cwd:root,encoding:"utf8",maxBuffer:8*1024*1024});
 if(r.status!==0||r.error)throw Error("Isolated fixture generation failed: "+(r.stderr||r.error||""));
 fixture=path.join(os.tmpdir(),"memento-ci-fixture-"+process.pid+".json");fs.writeFileSync(fixture,r.stdout);
}
try{
 for(const suite of suites){
  if(suite==="visual-browser"){
   const widths=tier==="high"?[360,393,412,1280]:[393];
   for(const width of widths){
    console.log("RUN "+suite+" at "+width+"px");
    run(suite+".cjs",{MEMENTO_VISUAL_FIXTURE:fixture,MEMENTO_VISUAL_WIDTH:String(width)});
   }
  }else{
   console.log("RUN "+suite);
   run(suite+".cjs",suite==="knowledge-v2-browser"?{MEMENTO_VISUAL_FIXTURE:fixture}:{});
  }
 }
}finally{if(fixture)try{fs.unlinkSync(fixture)}catch{}}
console.log("CI GROUP "+domain+" tier="+tier+" passed="+count+" failed="+failures.length);
if(failures.length){console.error("FAILED SUITES:\n"+failures.join("\n"));process.exitCode=1}
