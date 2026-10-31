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
 const a=planFor(["tests/notes-direction-c-browser.cjs"]);
 assert.equal(a.tier,"medium");
 assert.deepEqual(a.groups,["test-notes-direction-c-browser"]);
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
console.log("CI_PLANNER_REGRESSION_PASS "+count+" cases");


// A proven identical PR tree needs one post-merge smoke; no evidence means full.
{
 const a=planFor(["assets/memento-life-app.js"],()=>null,false,true);
 assert.equal(a.tier,"low");assert.deepEqual(a.groups,["interface-smoke"]);
 assert.equal(a.upgrade,false);
 assert.equal(planFor(["assets/memento-life-app.js"]).tier,"high");
 assert.equal(planFor(["assets/memento-life-app.js"],()=>null,true,true).tier,"high");
}
