"use strict";
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const root = path.join(__dirname, "../.."), html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const Guard = require("../../assets/memento-storage-guard.js"), K = require("../../assets/memento-knowledge-core.js"), F = require("../../assets/memento-fitness-core.js"), ZIP = require("../../assets/memento-backup.js"), Trash = require("../../assets/memento-trash-core.js");
const clone = x => JSON.parse(JSON.stringify(x));
function locks() {
  let held = false;
  return { async request(name, options, callback) {
    await Promise.resolve();
    if (held) { if (!options.ifAvailable) throw Error("Test requires non-queued acquisition"); return callback(null); }
    held = true;
    try { return await callback({ name, mode: "exclusive" }); } finally { held = false; }
  } };
}
function node() {
  return { value: "", textContent: "", innerHTML: "", hidden: false, disabled: false, dataset: {}, style: {}, isConnected: true,
    children: [], options: [], selectedOptions: [{ textContent: "Alle rekeningen" }], listeners: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    get parentElement() { return this; }, addEventListener(t, f) { (this.listeners[t] ||= []).push(f); },
    append() {}, appendChild() {}, remove() {}, querySelector() { return node(); }, querySelectorAll() { return []; },
    setAttribute() {}, getAttribute() { return null; }, focus() {}, reset() {}, closest() { return this; }, contains() { return true; } };
}
async function tab(storage = new Map(), manager = locks(), options = {}) {
  const nodes = new Map(), listeners = {}, get = id => { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); };
  const s = { console, Date, Intl, Math, Number, String, Boolean, Array, Object, JSON, Set, Map, URL, URLSearchParams, TextEncoder, TextDecoder, Blob, Uint8Array, DataView, ArrayBuffer,
    crypto: require("node:crypto").webcrypto, localStorage: { getItem: k => storage.has(k) ? storage.get(k) : null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: { getElementById: get, querySelectorAll: () => [], querySelector: () => null, addEventListener(t, fn) { (listeners[t] ||= []).push(fn); }, createElement: node, body: node(), readyState: "loading" },
    navigator: { locks: options.supported === false ? undefined : manager }, isSecureContext: options.secure !== false,
    location: { protocol: "https:", reload() { s.reloaded = true; } }, setTimeout: () => 1, clearTimeout() {}, queueMicrotask() {}, MutationObserver: class { observe() {} },
    confirm: () => true, addEventListener(t, fn) { (listeners[t] ||= []).push(fn); }, scrollTo() {}, matchMedia: () => ({ matches: false }),
    MementoKnowledgeCore: K, MementoFitnessCore: F, MementoTrashCore: Trash, MementoCompleteBackup: { ...ZIP }, CompassFlow: { home: () => "", mount() {} } };
  s.window = s; s.get = get; s.storage = storage; s.listeners = listeners; s.MementoStorageGuard = Guard.create(s);
  await s.MementoStorageGuard.ready; vm.createContext(s);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  const first = scripts.find(m => !m[1].includes("src=") && !m[1].includes("type="))[2];
  const exports = `renderAll=()=>{};globalThis.fin={get state(){return state},set state(v){state=v},get blocked(){return financeStorageBlocked},loadState,emptyState,save,softDeleteFinance,restoreFinance,restoreAutoBackup,importBackup,renderSalaryPeriod,transactionModal,billModal,goalModal,budgetRecord,editableBudget};`;
  vm.runInContext(first.replace(/\ninit\(\);\s*\n\}\)\(\);\s*$/, "\n" + exports + "\n})();"), s, { filename: "finance-under-test.js" });
  get("compassLifeSeed").textContent = html.match(/id="compassLifeSeed"[^>]*>([\s\S]*?)<\/script>/)[1];
  const source = html.match(/<script id="compassLifeScript">([\s\S]*?)<\/script>/)[1];
  const end = source.lastIndexOf("scheduleDayRefresh();\nrender();setArea(area);");
  if (end < 0) throw Error("Life bootstrap marker changed");
  const lifeExports = `render=()=>{globalThis.renderCalls=(globalThis.renderCalls||0)+1};globalThis.life={get state(){return state},set state(v){state=v},get blocked(){return blocked},set blocked(v){blocked=v},save,mutate,validate,importBackup,importCompleteBackup,restorePreviousLife,performPermanentTrashPurge,exportBackup,submitQuickCapture,set quickKind(v){quickKind=v}};`;
  vm.runInContext(source.slice(0, end) + lifeExports + "})();", s, { filename: "life-under-test.js" });
  s.MementoKnowledgeStore = files(s.MementoStorageGuard);
  return s;
}
function knowledge(s) {
  let source = fs.readFileSync(path.join(root, "assets/memento-knowledge.js"), "utf8");
  source = source.replace("root.MementoKnowledge={mount,", "globalThis.knowledgeTest={flush,onInput,startEdit,get editing(){return editing}};root.MementoKnowledge={mount,");
  vm.runInContext(source, s); s.MementoKnowledge.mount(s.get("knowledge-host"), s.MementoKnowledgeBridge);
  return s.knowledgeTest;
}
const sha256 = async blob => require("node:crypto").createHash("sha256").update(Buffer.from(await blob.arrayBuffer())).digest("hex");
function files(guard, records = []) {
  const map = new Map(records.map(r => [r.id, r]));
  return { map, removed: [], writes: 0, sha256, all: async () => [...map.values()], get: async id => map.get(id) || null,
    async putMany(list, token) { guard.assertCurrent(token); this.writes++; for (const r of list) map.set(r.id, r); },
    async remove(id, token) { guard.assertCurrent(token); this.removed.push(id); map.delete(id); } };
}
const emptyLife = () => ({ version: 1, tasks: [], notes: [], groceries: [], wishes: [], templates: [], appointments: [], googleAppointments: [], appointmentChecks: {}, fitness: F.empty() });
const task = (id, title = id) => ({ id, title, kind: "task", category: "Persoonlijk", repeat: "none", repeatDays: 4, date: "", focusDate: "", lastDone: "", steps: [], history: [], deletedAt: "", done: false, archived: false });
const tx = (id, description = id) => ({ id, description, amount: 12.34, account: "personal", type: "expense", date: "2026-10-26", category: "Overig" });
const tick = () => new Promise(resolve => setImmediate(resolve));
module.exports = { root, html, fs, path, vm, Guard, K, F, ZIP, Trash, clone, locks, tab, knowledge, files, sha256, emptyLife, task, tx, tick };
