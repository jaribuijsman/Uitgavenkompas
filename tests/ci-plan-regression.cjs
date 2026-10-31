"use strict";
const assert=require("node:assert/strict");
const {planFor,versionOnlyHtml,workerCacheOnly,FULL}=require("./ci-plan.cjs");
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
 const a=planFor(["assets/memento-glass.css"]);assert.equal(a.tier,"medium");assert(a.groups.includes("interface-layout-smoke"));assert(!a.groups.includes("data-full"));
});
check("knowledge UI selects relevant life browser journeys",()=>{
 const a=planFor(["assets/memento-knowledge.css"]);assert(a.groups.includes("life-knowledge"));assert(!a.groups.includes("life-full"));
});
check("finance code touching calculations forces full coverage",()=>{
 const a=planFor(["assets/memento-review-core.js"]);assert.equal(a.tier,"high");assert.deepEqual(a.groups,FULL);
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
});
check("manual full test request retains all browser suites",()=>{
 const a=planFor([],()=>null,true);assert.equal(a.tier,"high");assert.deepEqual(a.groups,FULL);
});
console.log("CI_PLANNER_REGRESSION_PASS "+count+" cases");
