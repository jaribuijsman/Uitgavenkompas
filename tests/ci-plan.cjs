"use strict";
// CI risk gate: current main is the source of truth; source changes select current-version tests.
const cp=require("node:child_process"),fs=require("node:fs");
const paths=process.env.MEMENTO_CI_FORCE_FULL==="true"?["index.html","sw.js"]:
 cp.execFileSync("git",["diff","--name-only",process.env.GITHUB_EVENT_NAME==="pull_request"?"HEAD^1":"HEAD^","HEAD"],{encoding:"utf8"})
  .split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const application=paths.filter(p=>!p.startsWith("docs/")&&p!=="AGENTS.md"&&p!=="README.md");
const isHigh=p=>/^(index\.html|sw\.js|assets\/memento-(storage-guard|backup|knowledge-store|assistant-core|assistant)\.js|assets\/memento-trash-core\.js|tests\/ci-(plan|groups)\.cjs)$/.test(p);
const high=application.some(isHigh);
const medium=application.some(p=>p.startsWith("assets/")&&p.endsWith(".js")||p.startsWith("tests/")||p.startsWith(".github/workflows/"));
const tier=high?"high":medium?"medium":"low";
let groups=[];
if(high)groups=["interface","life","data"];
else if(medium){
 groups=["interface"];
 if(paths.some(p=>/knowledge|note|journal|fitness|assistant|life|task|quickfit|icon/.test(p)))groups.push("life");
 if(paths.some(p=>/finance|storage|transaction|backup|recovery|receipt/.test(p)))groups.push("data");
}else if(application.length)groups=["interface"];
const upgrade=high&&paths.some(p=>/^(index\.html|sw\.js|assets\/memento-(storage-guard|backup|knowledge-store|assistant-core|assistant)\.js)$/.test(p));
const output={tier,groups,upgrade:upgrade?"true":"false",files:paths};
console.log("MEMENTO_CI_PLAN "+JSON.stringify(output));
if(process.env.GITHUB_OUTPUT){
 fs.appendFileSync(process.env.GITHUB_OUTPUT,
  "tier="+tier+"\n"+"groups="+JSON.stringify(groups)+"\n"+"upgrade="+String(upgrade)+"\n");
}
module.exports=output;