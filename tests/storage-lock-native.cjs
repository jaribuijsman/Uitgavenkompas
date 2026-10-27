"use strict";
// Exercise actual lock arbitration and owner termination, independently of the DOM
// fixtures. Node's Web Locks implementation is available in Node >=24.5.
const assert = require("node:assert/strict"), { Worker, locks } = require("node:worker_threads"), path = require("node:path");
const { LOCK } = require("../assets/memento-storage-guard.js");
(async () => {
  if (!locks) { console.log("SKIP native Web Locks lifetime test: requires Node >=24.5"); return; }
  const worker = new Worker(`
    const {parentPort,locks}=require('node:worker_threads');
    const {create}=require(${JSON.stringify(path.join(__dirname, "../assets/memento-storage-guard.js"))});
    const values=new Map();
    const guard=create({localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},navigator:{locks},isSecureContext:true});
    parentPort.on('message',()=>{});
    guard.ready.then(acquired=>parentPort.postMessage(acquired));
  `, { eval: true });
  try {
    const acquired = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); });
    assert.equal(acquired, true);
    await locks.request(LOCK, { ifAvailable: true, mode: "exclusive" }, lock => assert.equal(lock, null));
    await worker.terminate();
    await locks.request(LOCK, { ifAvailable: true, mode: "exclusive" }, lock => assert(lock, "terminated owner must release its lock"));
    console.log("PASS native Web Locks deny a concurrent writer and release on owner termination");
  } finally { await worker.terminate(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
