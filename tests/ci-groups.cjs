"use strict";
// One Chromium installation per domain group. Run every selected suite and report all failures.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process");
const domain=process.argv[2],tier=process.argv[3]||"high";
const full={
 interface:["layout-completion-browser","visual-layout-browser","patches-001-002-004-browser","masterplan-browser","memento-start-browser","calendar-header-browser","release-acceptance-browser","glass-rendering-browser","visual-browser"],
 life:["memento-category-browser","knowledge-v2-browser","knowledge-covers-browser","notes-direction-c-browser","journal-upgrade-browser","journal-selfcare-browser","memento-assistant-browser","illustrative-icons-browser","quickfit-browser","fitness-browser"],
 data:["app-review-browser","storage-safety-browser","recovery-browser"]
};
const medium={
 interface:["memento-start-browser","glass-rendering-browser","visual-browser"],
 life:["knowledge-v2-browser","memento-assistant-browser","fitness-browser"],
 data:["storage-safety-browser","app-review-browser"]
};
if(!Object.hasOwn(full,domain))throw Error("Unknown CI group "+domain);
const suites=tier==="high"?full[domain]:tier==="medium"?medium[domain]:domain==="interface"?["visual-browser"]:[];
let count=0,failures=[];
const env={...process.env};
const root=path.join(__dirname,"..");
function run(script,extra={}){
 const result=cp.spawnSync(process.execPath,[path.join(root,"tests",script)],{stdio:"inherit",env:{...env,...extra},cwd:root,timeout:12*60*1000});
 if(result.error||result.status!==0){
  failures.push(script+(result.error?": "+result.error.message:" (exit "+result.status+")"));
 }else count++;
}
let fixture="";
if(suites.includes("visual-browser")||suites.includes("knowledge-v2-browser")){
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
if(failures.length){console.error("FAILED SUITES:\n"+failures.join("\n"));process.exitCode=1;}