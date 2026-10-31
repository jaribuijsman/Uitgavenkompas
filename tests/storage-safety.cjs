"use strict";
const assert = require("node:assert/strict");
const { root, html, fs, path, vm, Guard, K, F, ZIP, clone, locks, tab, knowledge, sha256, emptyLife, task, tx, tick } = require("./helpers/storage-fixture.cjs");
let passed = 0;
async function test(name, run) { await run(); passed++; console.log("PASS", name); }
(async () => {
  await test("only one simultaneous tab obtains the native session writer role", async () => {
    const storage = new Map(), manager = locks(), tabs = await Promise.all([tab(storage, manager), tab(storage, manager)]);
    assert.equal(tabs.filter(s => s.MementoStorageGuard.writable).length, 1);
    tabs.forEach(s => s.MementoStorageGuard.close());
  });
  await test("A's saved transaction survives a stale B save without false success", async () => {
    const storage = new Map(), manager = locks(), a = await tab(storage, manager), b = await tab(storage, manager);
    a.fin.state.transactions.push(tx("A")); assert.equal(a.fin.save(), true);
    b.fin.state.transactions.push(tx("B")); b.get("txDescription").value = "Niet opgeslagen formulier";
    assert.equal(b.fin.save(), false); assert.deepEqual(JSON.parse(storage.get(Guard.KEYS.finance)).transactions.map(t => t.id), ["A"]);
    assert.equal(b.get("txDescription").value, "Niet opgeslagen formulier");
    assert.equal(b.get("saveStatus").textContent, "Opslaan mislukt"); a.MementoStorageGuard.close();
  });
  await test("stale Life tasks and note drafts cannot replace A's persisted records", async () => {
    const storage = new Map(), manager = locks(), a = await tab(storage, manager), b = await tab(storage, manager);
    assert(a.life.mutate(() => { a.life.state.tasks.push(task("task-A")); a.life.state.notes.push(K.makeNote({ title: "Notitie A", body: "Bewaren" }, a.life.state)); }));
    const before = storage.get(Guard.KEYS.life); assert.equal(b.life.mutate(() => b.life.state.tasks.push(task("task-B"))), false);
    const k = knowledge(b); b.MementoKnowledge.newNote();
    for (const [field, value] of [["title", "Concept B"], ["body", "Deze invoer moet blijven"]]) { b.get("kc-" + field).value = value; k.onInput({ target: { dataset: { kcEdit: field }, value } }); }
    assert.equal(k.flush(), false); assert.equal(k.editing.body, "Deze invoer moet blijven"); assert.equal(b.get("kc-body").value, "Deze invoer moet blijven");
    assert(b.MementoKnowledge.hasPending()); assert.equal(storage.get(Guard.KEYS.life), before); a.MementoStorageGuard.close();
  });
  await test("raw source verification rejects an external write even in the owner tab", async () => {
    const s = await tab(); s.fin.state.transactions.push(tx("original")); assert(s.fin.save());
    const newer = clone(s.fin.state); newer.transactions.push(tx("external")); s.storage.set(Guard.KEYS.finance, JSON.stringify(newer));
    s.life.state.tasks.push(task("stale")); assert.equal(s.life.save(), false);
    assert.deepEqual(JSON.parse(s.storage.get(Guard.KEYS.finance)), newer); assert.equal(s.storage.has(Guard.KEYS.life), false);
    assert.match(s.MementoStorageGuard.message, /buiten dit tabblad/); s.MementoStorageGuard.close();
  });
  await test("stale permanent purge retains newer active records, files and recovery copies", async () => {
    const original = emptyLife(); original.tasks.push({ ...task("trash"), deletedAt: "2026-10-26" });
    const storage = new Map([[Guard.KEYS.life, JSON.stringify(original)], ["compass_life_preview_v1_vorige", "original-recovery"]]);
    const a = await tab(storage); assert(a.fin.save());
    const newer = clone(a.life.state); newer.tasks.push(task("new-active")); storage.set(Guard.KEYS.life, JSON.stringify(newer));
    const before = clone([...storage]); a.get("lifePurgeWord").value = "VERWIJDEREN";
    assert.equal(await a.life.performPermanentTrashPurge(), false); assert.deepEqual([...storage], before); assert.equal(a.MementoKnowledgeStore.removed.length, 0);
    assert.match(a.get("lifePurgeFeedback").textContent, /Geen items definitief verwijderd/); a.MementoStorageGuard.close();
  });
  await test("quota failure rolls back memory, keeps draft fields and never reports success", async () => {
    const s = await tab(); s.fin.state.transactions.push(tx("saved")); assert(s.fin.save()); const before = s.storage.get(Guard.KEYS.finance);
    const setter = s.localStorage.setItem; s.localStorage.setItem = () => { throw Error("QuotaExceededError"); };
    s.fin.state.transactions.push(tx("unsaved")); s.get("txDescription").value = "Concept"; assert.equal(s.fin.save(), false);
    assert.equal(s.storage.get(Guard.KEYS.finance), before); assert.equal(s.fin.state.transactions.length, 1); assert.equal(s.get("txDescription").value, "Concept");
    s.get("lifeQuickTitle").value = "Taakconcept"; s.life.quickKind = "task"; s.get("lifeQuickDate").value = "";
    assert.equal(s.life.submitQuickCapture(), false); assert.equal(s.get("lifeQuickTitle").value, "Taakconcept");
    s.localStorage.setItem = setter; assert(s.life.mutate(() => s.life.state.tasks.push(task("normal-retry")))); s.MementoStorageGuard.close();
  });
  await test("cross-domain write failure restores both originals and preserves recovery snapshots", async () => {
    const s = await tab(); assert(s.fin.save()); assert(s.life.save());
    s.storage.set("uitgavenkompas_auto_backup_v1", "keep-finance-recovery"); s.storage.set("compass_life_preview_v1_vorige", "keep-life-recovery");
    const before = clone([...s.storage]); const setter = s.localStorage.setItem; let once = true;
    s.localStorage.setItem = (k, v) => { if (k === Guard.KEYS.life && once) { once = false; throw Error("quota"); } setter(k, v); };
    assert.throws(() => s.MementoStorageGuard.commit({ finance: JSON.stringify({ ...s.fin.state, transactions: [tx("new")] }), life: JSON.stringify({ ...s.life.state, tasks: [task("new")] }) }), /quota/);
    assert.deepEqual([...s.storage], before); s.MementoStorageGuard.close();
  });
  await test("failed rollback retains exact original data in a durable journal and blocks writes", async () => {
    const s = await tab(); assert(s.fin.save()); assert(s.life.save()); const oldFinance = s.storage.get(Guard.KEYS.finance), oldLife = s.storage.get(Guard.KEYS.life);
    const setter = s.localStorage.setItem; let financeWritten = false;
    s.localStorage.setItem = (k, v) => { if (k === Guard.KEYS.life || (k === Guard.KEYS.finance && financeWritten)) throw Error("quota"); setter(k, v); if (k === Guard.KEYS.finance) financeWritten = true; };
    assert.throws(() => s.MementoStorageGuard.commit({ finance: JSON.stringify({ ...s.fin.state, transactions: [tx("new")] }), life: JSON.stringify({ ...s.life.state, tasks: [task("new")] }) }), /niet volledig/);
    const journal = JSON.parse(s.storage.get(Guard.JOURNAL)); assert.equal(journal.entries[0].before, oldFinance); assert.equal(journal.entries[1].before, oldLife);
    assert.equal(s.MementoStorageGuard.writable, false); s.MementoStorageGuard.close();
    const restarted = await tab(s.storage); assert.equal(restarted.MementoStorageGuard.writable, false); assert.equal(restarted.fin.save(), false); assert(restarted.storage.has(Guard.JOURNAL));
  });
  await test("unavailable locks, insecure origins and rejected requests fail closed", async () => {
    for (const options of [{ supported: false }, { secure: false }]) {
      const s = await tab(new Map(), locks(), options); assert.equal(s.fin.save(), false); assert.equal(s.life.save(), false); assert.equal(s.storage.size, 0);
    }
    const s = await tab(new Map(), { request() { return Promise.reject(Error("not permitted")); } });
    assert.equal(s.fin.save(), false); assert.equal(s.storage.size, 0);
  });
  await test("closing or page-hiding an owner releases the slot without a persisted lease", async () => {
    const manager = locks(), storage = new Map(), a = await tab(storage, manager); assert(a.MementoStorageGuard.writable);
    for (const fn of a.listeners.pagehide) fn({}); await tick();
    assert.equal(a.fin.save(), false); const b = await tab(storage, manager); assert(b.MementoStorageGuard.writable); assert(b.fin.save()); b.MementoStorageGuard.close();
    assert(![...storage.keys()].some(k => /lease|lock/i.test(k)));
  });
  await test("description matches survive repeated read-only loads with all financial links intact", async () => {
    const seed = await tab(); const data = clone(seed.fin.state); seed.MementoStorageGuard.close();
    data.settings.accountOpening.personal = 100; data.transactions = [tx("real-1", "Beginsaldo roodstand"), tx("real-2", "Saldo roodstand"), {...tx("joint"),account:"joint"}, tx("other")];
    data.receipts = [{ id: "receipt", transactionId: "real-1", total: 12.34 },{id:"receipt-2",transactionId:"real-2",total:12.34}];
    const raw = JSON.stringify(data), storage = new Map([[Guard.KEYS.finance, raw], ["uitgavenkompas_auto_backup_v1", "untouched"]]), s = await tab(storage);
    for (let i = 0; i < 3; i++) { const loaded = s.fin.loadState(); assert.deepEqual(clone(loaded.transactions), data.transactions); assert.deepEqual(clone(loaded.receipts), data.receipts); assert.deepEqual(clone(loaded.settings.accountOpening), data.settings.accountOpening); assert.equal(storage.get(Guard.KEYS.finance), raw); }
    assert.equal(storage.get("uitgavenkompas_auto_backup_v1"), "untouched"); s.MementoStorageGuard.close();
  });
  await test("a zero opening balance is never changed to compensate description-matching transactions", async () => {
    const seed=await tab(),data=clone(seed.fin.state);seed.MementoStorageGuard.close();data.settings.accountOpening.personal=0;
    data.transactions=[{...tx("p1","Beginsaldo roodstand"),amount:123.45},{...tx("p2","Saldo roodstand"),amount:67.89}];
    const raw=JSON.stringify(data),s=await tab(new Map([[Guard.KEYS.finance,raw]]));const loaded=s.fin.loadState();assert.equal(loaded.settings.accountOpening.personal,0);assert.deepEqual(clone(loaded.transactions),data.transactions);assert.equal(s.storage.get(Guard.KEYS.finance),raw);s.MementoStorageGuard.close();
  });
  await test("old JSON data, IDs, amounts, Fitness and the unchanged ZIP format remain compatible", async () => {
    const s = await tab(); const life = emptyLife(); life.tasks.push(task("old-task")); life.notes.push(K.makeNote({ title: "Bewaren", body: "Originele inhoud" }, life));
    const finance = clone(s.fin.state); finance.transactions.push(tx("old-tx", "Beginsaldo roodstand"));
    const blob = new Blob(["%PDF-1.4\nFictieve bytes"], { type: "application/pdf" });
    const file = { id: "11111111-1111-4111-8111-111111111111", noteId: life.notes[0].id, name: "test.pdf", size: blob.size, type: blob.type, hash: await sha256(blob), createdAt: "2026-10-26T00:00:00Z" };
    life.notes[0].attachments = [file];
    const archive = await ZIP.createArchive({ life, finance, extras: { UK_DASHBOARD_SCOPE: "joint" } }, { all: async () => [{ ...file, blob }], sha256 });
    assert.equal(await s.life.importCompleteBackup(archive.blob), true); assert(s.reloaded);
    assert.deepEqual(JSON.parse(s.storage.get(Guard.KEYS.life)), life); assert.deepEqual(JSON.parse(s.storage.get(Guard.KEYS.finance)), finance);
    assert.equal(await sha256(s.MementoKnowledgeStore.map.get(file.id).blob), file.hash);
    const old = await tab(); const previous = emptyLife(); delete previous.fitness; previous.tasks.push(task("legacy"));
    assert.equal(await old.life.importBackup(new Blob([JSON.stringify({ format: "compass-life-backup", version: 1, lifeState: previous })]), false), true);
    assert.equal(old.life.state.tasks[0].id, "legacy"); F.validate(old.life.state.fitness); old.MementoStorageGuard.close();
  });
  await test("stale ZIP/JSON restore and direct bridge writes fail before replacing data or blobs", async () => {
    const manager = locks(), storage = new Map(), a = await tab(storage, manager), b = await tab(storage, manager);
    a.fin.state.transactions.push(tx("keep")); assert(a.fin.save()); assert(a.life.save()); const before = clone([...storage]);
    const archive = await ZIP.createArchive({ life: emptyLife(), finance: clone(a.fin.emptyState()) }, { all: async () => [], sha256 });
    assert.equal(await b.life.importCompleteBackup(archive.blob), false);
    assert.equal(await b.life.importBackup(new Blob([JSON.stringify({ format: "compass-life-backup", version: 1, lifeState: emptyLife(), financeState: a.fin.emptyState() })]), true), false);
    assert.throws(() => b.MementoFinanceTrashBridge.replace(b.fin.emptyState(), storage.get(Guard.KEYS.finance)), /alleen-lezen|schrijfslot/);
    assert.deepEqual([...storage], before); assert.equal(b.MementoKnowledgeStore.writes, 0); a.MementoStorageGuard.close();
  });
  await test("financial import and both previous-version restore buttons cannot bypass read-only mode", async () => {
    const manager=locks(),storage=new Map(),a=await tab(storage,manager),b=await tab(storage,manager);
    a.fin.state.transactions.push(tx("keep"));assert(a.fin.save());assert(a.life.save());
    storage.set("compass_life_preview_v1_vorige",JSON.stringify(emptyLife()));
    storage.set("uitgavenkompas_auto_backup_v1",JSON.stringify(a.fin.emptyState()));
    const before=clone([...storage]);
    b.FileReader=class{readAsText(file){this.result=file.contents;this.onload();}};
    b.fin.importBackup({contents:JSON.stringify(a.fin.emptyState())});b.fin.restoreAutoBackup();assert.equal(b.life.restorePreviousLife(),false);
    assert.deepEqual([...storage],before);a.MementoStorageGuard.close();
  });
  await test("actual asynchronous ZIP restore retains exclusion across an awaited file write", async () => {
    const s=await tab();assert(s.fin.save());assert(s.life.save());
    const restored=emptyLife(),note=K.makeNote({title:"Restored",body:"Original archive"},restored);restored.notes.push(note);
    const blob=new Blob(["%PDF-1.4\nFixture"]),file={id:"22222222-2222-4222-8222-222222222222",noteId:note.id,name:"test.pdf",size:blob.size,type:"application/pdf",hash:await sha256(blob),createdAt:"2026-10-26T00:00:00Z"};note.attachments=[file];
    const archive=await ZIP.createArchive({life:restored,finance:clone(s.fin.state)},{all:async()=>[{...file,blob}],sha256});
    const original=s.MementoKnowledgeStore.putMany;let resume;
    s.MementoKnowledgeStore.putMany=async function(records,token){await new Promise(resolve=>{resume=resolve;});return original.call(this,records,token);};
    const importing=s.life.importCompleteBackup(archive.blob);for(let i=0;i<100&&!resume;i++)await tick();assert(resume);
    assert.equal(s.life.mutate(()=>s.life.state.tasks.push(task("during-import"))),false);s.fin.state.transactions.push(tx("during-import"));assert.equal(s.fin.save(),false);
    resume();assert.equal(await importing,true);assert.deepEqual(JSON.parse(s.storage.get(Guard.KEYS.life)),restored);assert(s.MementoKnowledgeStore.map.has(file.id));
  });
  await test("ordinary full export uses a stable guarded snapshot and retains ZIP version 2", async () => {
    const s=await tab();s.fin.state.transactions.push(tx("export"));assert(s.fin.save());assert(s.life.save());let downloaded;
    s.MementoCompleteBackup.download=blob=>{downloaded=blob};await s.life.exportBackup();assert(downloaded);
    const archive=await ZIP.prepareArchive(downloaded,s.MementoKnowledgeStore);assert.equal(archive.manifest.version,2);assert.equal(archive.finance.transactions[0].id,"export");assert.equal(s.MementoStorageGuard.writable,true);s.MementoStorageGuard.close();
  });
  await test("asynchronous restore excludes same-tab mutations and standalone bridges", async () => {
    const s = await tab(); assert(s.fin.save()); assert(s.life.save()); const token = s.MementoStorageGuard.beginOperation();
    s.get("txDescription").value = "Concept tijdens herstel"; s.fin.state.transactions.push(tx("not-saved")); assert.equal(s.fin.save(), false);
    assert.equal(s.MementoFitnessBridge.replace(F.empty()), false); assert.equal(s.MementoKnowledgeBridge.write(l => l.notes.push({ id: "bad", title: "bad" })), false);
    assert.throws(() => s.MementoFinanceTrashBridge.replace(s.fin.state, s.storage.get(Guard.KEYS.finance)), /bezig/);
    assert.equal(s.get("txDescription").value, "Concept tijdens herstel"); s.MementoStorageGuard.endOperation(token); assert(s.fin.save()); s.MementoStorageGuard.close();
  });
  await test("normal purge commits both domains and preserves active/shared/recovery data", async () => {
    const life = emptyLife(); life.tasks = [task("active"), { ...task("gone"), deletedAt: "2026-10-26" }];
    const s = await tab(new Map([[Guard.KEYS.life, JSON.stringify(life)], ["compass_life_preview_v1_vorige", JSON.stringify(life)]]));
    s.fin.state.transactions.push(tx("keep")); s.fin.state.trash = { transactions: [{ id: "gone-finance", item: tx("gone"), deletedAt: "2026-10-26" }] }; assert(s.fin.save());
    const recovery = s.storage.get("compass_life_preview_v1_vorige"), financialRecovery = s.storage.get("uitgavenkompas_auto_backup_v1");
    s.get("lifePurgeWord").value = "VERWIJDEREN"; assert.equal(await s.life.performPermanentTrashPurge(), true);
    assert.deepEqual(JSON.parse(s.storage.get(Guard.KEYS.life)).tasks.map(t => t.id), ["active"]); assert.equal(s.fin.state.transactions[0].id, "keep"); assert.equal(s.fin.state.trash.transactions.length, 0);
    assert.equal(s.storage.get("compass_life_preview_v1_vorige"), recovery); assert.equal(s.storage.get("uitgavenkompas_auto_backup_v1"), financialRecovery); s.MementoStorageGuard.close();
  });
  await test("all persistent primary writes and file transactions go through the guard", async () => {
    for (const source of [fs.readFileSync(path.join(root, "assets/memento-finance-app.js"), "utf8"), fs.readFileSync(path.join(root, "assets/memento-life-app.js"), "utf8")]) {
      assert(!/localStorage\.(?:setItem|removeItem)\((?:STORAGE_KEY|KEY|FINANCE_KEY)[,)]/.test(source));
    }
    const store = fs.readFileSync(path.join(root, "assets/memento-knowledge-store.js"), "utf8"); assert.match(store, /guard\.assertCurrent\(token\)/);
    const s = await tab(new Map(), locks(), { supported: false }); let opens = 0; s.indexedDB = { open() { opens++; throw Error("unexpected open"); } };
    vm.runInContext(store, s); await assert.rejects(() => s.MementoKnowledgeStore.putRecord({ id: "some-file", blob: new Blob(["test"]) }), /alleen-lezen|schrijfslot/); assert.equal(opens, 0);
  });
  await test("historical HTML contains no executable writer and SW routes before cache lookup", async () => {
    const legacy = fs.readFileSync(path.join(root, "uitgavenkompas-v20-pincode-vergrendeling-1.html"), "utf8");
    assert(!/<script|localStorage|indexedDB/i.test(legacy)); assert.match(legacy, /http-equiv="refresh"/);
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8"); assert(sw.indexOf('url.pathname.endsWith("/uitgavenkompas') < sw.indexOf("const isAppDocument"));
    const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith(".html")); assert.deepEqual(htmlFiles.sort(), ["index.html", "uitgavenkompas-v20-pincode-vergrendeling-1.html"]);
    for (const asset of ["memento-storage-guard.js", "memento-knowledge-store.js", "memento-knowledge.js"]) {
      const src = html.match(new RegExp(asset.replaceAll(".", "\\.") + "\\?v=([^\"]+)"))[0]; assert(sw.includes(src));
    }
  });
  await test("new worker redirects a legacy URL even when an executable old response is cached", async () => {
    const listeners={};let response,cacheReads=0;
    vm.runInNewContext(fs.readFileSync(path.join(root,"sw.js"),"utf8"),{URL,Response,self:{location:{origin:"https://example.invalid",href:"https://example.invalid/Uitgavenkompas/sw.js"},addEventListener:(type,fn)=>{listeners[type]=fn;}},caches:{match:async()=>{cacheReads++;return new Response("<script>oldWriter()</script>");}},fetch:async()=>{throw Error("offline");}});
    listeners.fetch({request:{method:"GET",mode:"navigate",url:"https://example.invalid/Uitgavenkompas/uitgavenkompas-v20-pincode-vergrendeling-1.html"},respondWith:promise=>{response=promise;}});
    const actual=await response;assert.equal(actual.status,302);assert.equal(actual.headers.get("location"),"https://example.invalid/Uitgavenkompas/");assert.equal(cacheReads,0);
  });
  console.log(`${passed} phase-1 storage safety tests passed.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
