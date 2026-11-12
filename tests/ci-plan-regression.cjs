"use strict";
const assert=require("node:assert/strict");
const {planFor,versionOnlyHtml,styleOnlyHtml,workerCacheOnly,FULL}=require("./ci-plan.cjs");
const htmlA='<link rel="stylesheet" href="./assets/memento-layout.css?v=old">\n<script src="./assets/memento.js?v=old"></script>';
const htmlB='<link rel="stylesheet" href="./assets/memento-layout.css?v=new">\n<script src="./assets/memento.js?v=new"></script>';
const swA='const CACHE = "old";\nconst CORE = ["./assets/old.css?v=old"];\nself.addEventListener("fetch",()=>{});\n';
const swB='const CACHE = "new";\nconst CORE = ["./assets/old.css?v=new"];\nself.addEventListener("fetch",()=>{});\n';
function read(snapshot){return(p,when)=>snapshot[p]?.[when]??null}
let count=0;
function check(title,fn){fn();count++;console.log("PASS "+title)}
check("documentation-only does not invoke browsers",()=>{
 const a=planFor(["AGENTS.md","docs/readme.md"]);assert.equal(a.tier,"none");assert.deepEqual(a.groups,[]);
});
check("appointment recurrence runs the existing agenda integration exactly once",()=>{
 for(const paths of [['assets/memento-appointment-recurrence.js'],['assets/memento-appointment-recurrence.js','tests/agenda-plan-browser.cjs']]){
  const p=planFor(paths);assert.equal(p.tier,'medium');assert.deepEqual(p.groups,['test-agenda-plan-browser']);assert.equal(p.upgrade,false);
 }
 for(const file of ['assets/memento-start.js','assets/memento-fitness.css'])assert(!planFor([file]).groups.includes('test-agenda-plan-browser'));
});
check("knowledge archives and Fitness core retain full data and upgrade coverage",()=>{
 for(const file of ['assets/memento-knowledge-backup.js','assets/memento-fitness-core.js']){
  const p=planFor([file]);assert.equal(p.tier,'high',file);assert.deepEqual(p.groups,FULL);assert.equal(p.upgrade,true,file);
 }
 for(const file of ['assets/memento-knowledge.css','assets/memento-fitness.css'])assert.equal(planFor([file]).upgrade,false,file);
});
check("shared fixtures and quick-note assertions select their real browser consumers",()=>{
 assert.equal(planFor(['tests/helpers/visual-fixture.cjs']).tier,'high');
 assert.deepEqual(planFor(['tests/helpers/quick-note-browser-checks.cjs']).groups,['interface-day']);
 assert.deepEqual(planFor(['tests/helpers/quick-note-browser-checks.cjs','tests/day-v3-browser.cjs']).groups,['test-day-v3-browser']);
});
check("every planned browser group resolves in the runner, including icons",()=>{
 const groups=JSON.parse(require('node:child_process').execFileSync(process.execPath,[require('node:path').join(__dirname,'ci-groups.cjs'),'--list-groups'],{encoding:'utf8'}));
 assert(Object.values(groups).flat().includes('illustrative-icons-browser'),'Icon journey must be registered before the planner selects it');
 const {suitesForGroup}=require('./ci-suites.cjs');
 for(const paths of [
  ['tests/illustrative-icons-browser.cjs'],
  ['tests/visual-browser.cjs'],
  ['tests/knowledge-workspace-browser.cjs','tests/global-search-browser.cjs'],
  ['assets/memento-storage-guard.js']
 ]){
  const plan=planFor(paths);
  for(const group of plan.groups)assert(suitesForGroup(group).length,group);
 }
 assert.deepEqual(suitesForGroup('test-illustrative-icons-browser'),['illustrative-icons-browser']);
});
check("unknown suites fail during planning and cannot launch arbitrary files",()=>{
 const {suitesForGroup}=require('./ci-suites.cjs');
 for(const suite of ['unknown-browser','../storage-safety','masterplan-browser']){
  assert.throws(()=>suitesForGroup('test-'+suite),/Unknown direct browser suite/);
 }
 assert.throws(()=>suitesForGroup('unknown-group'),/Unknown CI group/);
 assert.throws(()=>planFor(['tests/unknown-browser.cjs']),/Unknown direct browser suite/);
});
check("retired browser files select current full coverage without reviving V1 routes",()=>{
 for(const suite of ['masterplan-browser','knowledge-v2-browser','knowledge-covers-browser','notes-direction-c-browser','journal-upgrade-browser']){
  const p=planFor(['tests/'+suite+'.cjs']);
  assert.equal(p.tier,'high',suite);assert.deepEqual(p.groups,FULL);
  assert.equal(p.upgrade,false,suite);
 }
});
check("full coverage exercises the icon and postmerge smoke journeys once",()=>{
 const {suitesForGroup}=require('./ci-suites.cjs');
 const suites=planFor(['tests/ci-plan.cjs']).groups.flatMap(suitesForGroup);
 for(const suite of ['illustrative-icons-browser','visual-browser'])assert.equal(suites.filter(s=>s===suite).length,1,suite);
});
check("shared smoke assertions run the smoke journey without a duplicate direct suite",()=>{
 assert.deepEqual(planFor(['tests/helpers/visual-assertions.cjs']).groups,['interface-smoke']);
 assert.deepEqual(planFor(['tests/visual-browser.cjs','tests/helpers/visual-assertions.cjs']).groups,['test-visual-browser']);
 assert.equal(planFor(['tests/ci-suites.cjs']).tier,'high','Registry changes must retain full safety coverage');
});
check("Agent Markdown skills are documentation-only, not a browser regression",()=>{
 const doc=planFor(["AGENTS.md","docs/android-pwa-ux-standaard.md",".agents/skills/android-ux-inspector/SKILL.md",".agents/skills/design-system-guardian/SKILL.md"]);
 assert.equal(doc.tier,"none");assert.deepEqual(doc.groups,[]);assert.equal(doc.upgrade,false);
 const code=planFor([".agents/skills/android-ux-inspector/browser-helper.js"]);
 assert.notEqual(code.tier,"none","Executable helpers remain code");
});
check("local CSS selects only a mobile smoke journey",()=>{
 const a=planFor(["assets/memento-dictation.css"]);assert.equal(a.tier,"low");assert.deepEqual(a.groups,["interface-smoke"]);assert.equal(a.upgrade,false);
});
check("shared CSS selects visual and layout checks, not all safety suites",()=>{
 const a=planFor(["assets/memento-glass.css"]);assert.equal(a.tier,"medium");assert(a.groups.includes("interface-layout-smoke"));assert(!a.groups.includes("interface-smoke"));assert(!a.groups.includes("data-full"));
});
check("day materials and menu decorators retain the V3 integration contract",()=>{
 for(const file of ["assets/memento-glass.css","assets/memento-glass.js","assets/memento-ui.css","assets/memento-base-app.css"]){
  assert(planFor([file]).groups.includes("interface-day"),file);
 }
});
check("knowledge UI selects relevant life browser journeys",()=>{
 const a=planFor(["assets/memento-knowledge.css"]);assert(a.groups.includes("life-knowledge"));assert(!a.groups.includes("interface-smoke"));assert(!a.groups.includes("life-full"));
});
check("global search assets and shared navigation select the existing search journey",()=>{
 for(const file of ["assets/memento-global-search.js","assets/memento-global-search-core.js","assets/memento-global-search.css","assets/memento-unified-nav.js"]){
  const p=planFor([file]);
  assert.deepEqual(p.groups,["test-global-search-browser"],file);
  assert.equal(p.tier,file.endsWith(".css")?"low":"medium",file);
  assert.equal(p.upgrade,false,file);
 }
});
check("search and navigation impact selection deduplicates source and browser-test paths",()=>{
 const p=planFor(["assets/memento-global-search.js","assets/memento-global-search-core.js","assets/memento-global-search.css","assets/memento-unified-nav.js","tests/global-search-browser.cjs","assets/memento-global-search.js"]);
 assert.equal(p.tier,"medium");assert.deepEqual(p.groups,["test-global-search-browser"]);assert.equal(p.upgrade,false);
 const onlyTest=planFor(["tests/global-search-browser.cjs"]);
 assert.deepEqual(onlyTest.groups,["test-global-search-browser"]);
});
check("unrelated assets and core-only tests do not select the search browser",()=>{
 for(const file of ["assets/memento-start.js","assets/memento-fitness.css","assets/memento-tab-layout.js","tests/global-search-core.cjs","docs/global-search.md"]){
  assert(!planFor([file]).groups.includes("test-global-search-browser"),file);
 }
 assert.deepEqual(planFor(["assets/memento-start.js"]).groups,["interface-start"]);
 assert.deepEqual(planFor(["assets/memento-fitness.css"]).groups,["life-fitness"]);
});
check("search impact never adds a second copy to high-risk coverage or changes upgrade requirements",()=>{
 for(const file of ["assets/memento-life-app.js","assets/memento-finance-app.js","assets/memento-storage-guard.js"]){
  const p=planFor([file,"assets/memento-global-search.js","assets/memento-unified-nav.js","tests/global-search-browser.cjs"]);
  assert.equal(p.tier,"high",file);assert.deepEqual(p.groups,FULL,file);assert.equal(p.upgrade,true,file);
 }
 const planner=planFor(["tests/ci-plan.cjs","assets/memento-global-search.js"]);
 assert.equal(planner.tier,"high");assert.deepEqual(planner.groups,FULL);assert.equal(planner.upgrade,false);
 const verified=planFor(["assets/memento-global-search.js","assets/memento-unified-nav.js"],()=>null,false,true);
 assert.equal(verified.tier,"low");assert.deepEqual(verified.groups,["interface-smoke"]);assert.equal(verified.upgrade,false);
 const forced=planFor(["assets/memento-global-search.js"],()=>null,true);
 assert.equal(forced.tier,"high");assert.deepEqual(forced.groups,FULL);
});
check("finance code touching calculations forces full coverage",()=>{
 const a=planFor(["assets/memento-review-core.js"]);assert.equal(a.tier,"high");assert.deepEqual(a.groups,FULL);
});

check("extracted Finance and Life applications always retain offline data safety",()=>{
 for(const file of ["assets/memento-finance-app.js","assets/memento-life-app.js","assets/memento-finance-validation.js"]){
  const a=planFor([file]);
  assert.equal(a.tier,"high",file);
  assert.deepEqual(a.groups,FULL,file);
  assert.equal(a.upgrade,true,file+" must test old stored records when updating entrypoint code");
 }
});
check("base stylesheet is shared UI, not a trivial isolated cosmetic patch",()=>{
 const a=planFor(["assets/memento-base-app.css"]);
 assert.equal(a.tier,"medium");
 assert(a.groups.includes("interface-layout-smoke"));
 assert(!a.groups.includes("interface-smoke"));
 assert.equal(a.upgrade,false);
});
check("storage guard changes require full coverage and upgrade",()=>{
 const a=planFor(["assets/memento-storage-guard.js"]);assert.equal(a.tier,"high");assert(a.upgrade);
});
check("cache URL changes do not masquerade as a rewrite",()=>{
 assert(versionOnlyHtml(htmlA,htmlB));assert(workerCacheOnly(swA,swB));
 const a=planFor(["index.html","sw.js","assets/memento-knowledge.css"],read({"index.html":{before:htmlA,after:htmlB},"sw.js":{before:swA,after:swB}}));
 assert.equal(a.tier,"medium");assert.equal(a.upgrade,false);assert(a.groups.includes("life-knowledge"));
});
check("adding precache entries requires full offline review",()=>{
 const modified=swB.replace('["./assets/old.css?v=new"]','["./assets/old.css?v=new","./assets/extra.js?v=new"]');
 assert(!workerCacheOnly(swA,modified));
 const a=planFor(["sw.js"],read({"sw.js":{before:swA,after:modified}}));
 assert.equal(a.tier,"high");assert.equal(a.upgrade,true);
});
check("inline CSS and matching cache versions need visual checks, not storage upgrade",()=>{
 const a='<style id="tasks">.task-menu{width:32px}</style><script>save()</script>'+htmlA;
 const b='<style id="tasks">.task-menu{width:44px}</style><script>save()</script>'+htmlB;
 assert(styleOnlyHtml(a,b));
 const plan=planFor(["index.html","sw.js","assets/memento-base-app.css"],read({
  "index.html":{before:a,after:b},"sw.js":{before:swA,after:swB}
 }));
 assert.equal(plan.tier,"medium");assert.equal(plan.upgrade,false);
 assert(plan.groups.includes("interface-layout-smoke"));assert(plan.groups.includes("interface-day"));
 assert(!plan.groups.includes("life-full"));assert(!plan.groups.includes("data-full"));
});
check("changing scripts, markup, or style structure cannot be called CSS-only",()=>{
 const a='<style>.task{color:green}</style><script>save()</script>';
 for(const changed of [
  a.replace("save()","erase()"),
  a.replace("<script>","<script type=\"module\">"),
  a.replace("<style>","<style id=\"unsafe\">"),
  a.replace("</style>","</style><input onfocus=\"erase()\">"),
  '<script>save()</script>'
 ]){
  assert(!styleOnlyHtml(a,changed));
  const plan=planFor(["index.html"],read({"index.html":{before:a,after:changed}}));
  assert.equal(plan.tier,"high");assert.equal(plan.upgrade,true);
 }
});
check("fake style markup in JavaScript cannot mask a script edit",()=>{
 const a='<script>const x="<style>before</style>";</script><style>.task{color:green}</style>';
 const b=a.replace("before</style>","after</style>");
 assert(!styleOnlyHtml(a,b));
 assert.equal(planFor(["index.html"],read({"index.html":{before:a,after:b}})).tier,"high");
});
check("unknown HTML baseline remains high risk",()=>{
 const plan=planFor(["index.html"],read({}));
 assert.equal(plan.tier,"high");assert.equal(plan.upgrade,true);
});
check("changes to inline scripts remain high risk",()=>{
 const a=planFor(["index.html"],read({"index.html":{before:htmlA+'<script>save()</script>',after:htmlB+'<script>erase()</script>'}}));
 assert.equal(a.tier,"high");assert(a.upgrade);
});
check("worker fetch event changes remain high risk",()=>{
 const a=planFor(["sw.js"],read({"sw.js":{before:swA,after:swB.replace("fetch","activate")}}));
 assert.equal(a.tier,"high");assert(a.upgrade);
});
check("modified browser test runs itself, without unrelated suites",()=>{
 const a=planFor(["tests/taken-v4-browser.cjs"]);
 assert.equal(a.tier,"medium");
 assert.deepEqual(a.groups,["test-taken-v4-browser"]);
});
check("upgrade-browser changes retain full offline upgrade",()=>{
 const a=planFor(["tests/recovery-upgrade-browser.cjs"]);
 assert.equal(a.tier,"high");assert(a.upgrade);
});
check("CI and workflow changes run full coverage",()=>{
 assert.equal(planFor(["tests/ci-groups.cjs"]).tier,"high");
 assert.equal(planFor([".github/workflows/app-review.yml"]).tier,"high");
 assert.equal(planFor(["tests/ci-postmerge.cjs"]).tier,"high");
 assert.equal(planFor(["tests/ci-postmerge-regression.cjs"]).tier,"high");
});
check("manual full test request retains all browser suites",()=>{
 const a=planFor([],()=>null,true);assert.equal(a.tier,"high");assert.deepEqual(a.groups,FULL);
});
check("domain-specific CSS runs no redundant general smoke",()=>{
 const p=planFor(["assets/memento-fitness.css"]);
 assert.deepEqual(p.groups,["life-fitness"]);
});
check("existing UI interaction routes to its affected domain",()=>{
 const p=planFor(["assets/memento-calendar-ui.js"]);
 assert.equal(p.tier,"medium");assert.deepEqual(p.groups,["interface-calendar"]);
});
check("mixed Life entrypoint remains high until persistence is separated",()=>{
 const p=planFor(["assets/memento-life-app.js"]);
 assert.equal(p.tier,"high");assert.equal(p.upgrade,true);assert.deepEqual(p.groups,FULL);
});
check("full high-risk shards retain all domains, unique knowledge journey and safety tests",()=>{
 const groups=JSON.parse(require("node:child_process").execFileSync(process.execPath,[require("node:path").join(__dirname,"ci-groups.cjs"),"--list-groups"],{encoding:"utf8"}));
 function verify(byGroup){
  assert.equal(FULL.length,6,"six high-risk shards must remain");
  const fullSuites=FULL.flatMap(name=>{
   assert(Array.isArray(byGroup[name])&&byGroup[name].length>0,"missing full CI domain "+name);
   return byGroup[name];
  });
  assert.equal(fullSuites.length,27,"full matrix including icons and postmerge smoke must remain");
  assert.equal(fullSuites.filter(s=>s==="knowledge-workspace-browser").length,1,"duplicate or missing knowledge journey in full run");
  assert.equal(fullSuites.filter(s=>s==="agenda-plan-browser").length,1,"recurring agenda journey must run exactly once");
  assert.equal(fullSuites.filter(s=>s==="ai-hub-browser").length,1,"duplicate or missing AI Hub journey in full run");
  assert(byGroup["life-full"].includes("knowledge-workspace-browser"),"life-full must own knowledge journey");
  assert.deepEqual(byGroup["interface-visual"],["glass-rendering-browser","illustrative-icons-browser","visual-browser"],"visual shard retains dedicated glass journey");
  assert.deepEqual(byGroup["life-knowledge"],["knowledge-workspace-browser"],"targeted knowledge journey must remain");
  const mandatory={
   "interface-layout":["layout-completion-browser","visual-layout-browser"],
   "interface-feature":["day-v3-browser"],
   "interface-acceptance":["release-acceptance-browser"],
   "interface-visual":["glass-rendering-browser"],
   "life-full":["grocery-import-browser","followup-browser","taken-v4-browser","knowledge-workspace-browser","ai-hub-browser","quickfit-browser"],
   "data-full":["app-review-browser","storage-safety-browser","recovery-browser"]
  };
  for(const [owner,required] of Object.entries(mandatory)){
   for(const suite of required)assert(byGroup[owner].includes(suite),owner+" lost required "+suite);
  }
 }
 verify(groups);
 assert.throws(()=>verify({...groups,"interface-visual":[...groups["interface-visual"],"knowledge-workspace-browser"]}),/duplicate|27/);
 assert.throws(()=>verify({...groups,"data-full":[]}),/missing full CI domain/);
 assert.throws(()=>verify({...groups,"data-full":groups["data-full"].filter(s=>s!=="storage-safety-browser")}),/27|storage-safety-browser/);
 assert.throws(()=>verify({...groups,"life-full":groups["life-full"].filter(s=>s!=="grocery-import-browser")}),/27|grocery-import-browser/);
});
check("manual workflows reject obsolete V1 browser contracts without losing offline or safety coverage",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const mp=fs.readFileSync(path.join(__dirname,"../.github/workflows/masterplan.yml"),"utf8");
 const kc=fs.readFileSync(path.join(__dirname,"../.github/workflows/knowledge-v2.yml"),"utf8");
 for(const [name,body] of [["masterplan",mp],["knowledge",kc]]){
  assert(/workflow_dispatch:/.test(body),name+" manual entry must stay intentional");
  assert(!/node (?:app\/)?tests\/(?:masterplan-browser|masterplan-journeys|knowledge-v2-browser)\.cjs/.test(body),name+" still runs obsolete V1 DOM");
  assert(!/node (?:app\/)?tests\/visual-browser\.cjs/.test(body),name+" still runs a stale baseline geometry comparison");
  assert(!/ref: f7d1d04fdca7fc26185cb3a7931859ca9c8c903e/.test(body),name+" still pins the old visual baseline");
  assert.equal(planFor([".github/workflows/"+(name==="masterplan"?"masterplan.yml":"knowledge-v2.yml")]).tier,"high");
 }
 for(const suite of ["knowledge-v2-safety","storage-safety","storage-lock-native","memento-regression","fitness-regression"])assert(mp.includes("node tests/"+suite+".cjs"),"manual masterplan safety lost: "+suite);
 for(const suite of ["ci-groups.cjs life-knowledge high","taken-v4-browser.cjs","day-v3-browser.cjs","memento-category-browser.cjs","app-review-browser.cjs","recovery-upgrade-browser.cjs"])assert(mp.includes("node tests/"+suite),"manual masterplan journey lost: "+suite);
 assert(mp.includes("248a5dd811b90b293aebda134e67c32338563e86"),"immutable pre-F0 worker upgrade baseline missing");
 assert(mp.includes("MEMENTO_RECOVERY_BASELINE_ROOT="),"offline upgrade baseline not configured");
 for(const suite of ["knowledge-workspace-browser.cjs","storage-safety-browser.cjs","pin-disabled-regression.cjs","pin-forest-regression.cjs","knowledge-v2-publication.cjs"])assert(kc.includes("node tests/"+suite),"manual knowledge safety lost: "+suite);
 assert(kc.includes("matrix:")&&kc.includes("width: [360, 393, 412, 1280]"),"manual viewport range changed");
 assert(kc.includes("if-no-files-found: error"),"missing green visual artifact should fail");
 assert(!kc.includes("cmp \"$RUNNER_TEMP/kc2-review/before"),"old PIN pixel comparison survived");
});
console.log("CI_PLANNER_REGRESSION_PASS "+count+" cases");


// A proven identical PR tree needs one post-merge smoke; no evidence means full.
{
 const a=planFor(["assets/memento-life-app.js"],()=>null,false,true);
 assert.equal(a.tier,"low");assert.deepEqual(a.groups,["interface-smoke"]);
 assert.equal(a.upgrade,false);
 assert.equal(planFor(["assets/memento-life-app.js"]).tier,"high");
 assert.equal(planFor(["assets/memento-life-app.js"],()=>null,true,true).tier,"high");
}
