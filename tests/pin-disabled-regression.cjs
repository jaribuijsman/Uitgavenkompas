"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.match(html, /<html[^>]+data-memento-pin-lock="disabled"/);
const start = html.indexOf("// Disabled at the owner's request.");
const end = html.indexOf("\nfunction init(){", start);
assert(start >= 0 && end > start);
const source = html.slice(start, end);
const snapshot = { finance: "unchanged-finance", life: "unchanged-life", files: "unchanged-attachments" };
async function check(savedPin, blockedStorage = false) {
  const values = new Map(Object.entries(snapshot));
  if (savedPin) values.set("uitgavenkompas_pin_config_v1", "opaque-existing-configuration");
  const original = [...values];
  const nodes = new Map(), events = [], timers = [], statuses = [{ textContent: "" }, { textContent: "" }];
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set(id === "pinLock" ? ["visible"] : []);
      nodes.set(id, { value: "", textContent: "", classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) }, classes });
    }
    return nodes.get(id);
  }
  const bodyClasses = new Set(["pin-locked"]);
  const context = {
    document: {
      documentElement: { dataset: { mementoPinLock: "disabled" } },
      body: { classList: { remove: x => bodyClasses.delete(x) } },
      getElementById: node,
      querySelectorAll: selector => selector === "[data-memento-pin-status]" ? statuses : [],
      addEventListener: (...args) => events.push(args),
    },
    window: { addEventListener: (...args) => events.push(args) },
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error("Storage unavailable"); return values.get(key) ?? null; },
      setItem() { throw Error("PIN-disabled startup must not write storage"); },
      removeItem() { throw Error("PIN-disabled startup must not remove storage"); },
    },
    sessionStorage: { getItem() { throw Error("Session read is unnecessary"); }, setItem() { throw Error("Session write is unnecessary"); }, removeItem() { throw Error("Session deletion is unnecessary"); } },
    setTimeout: (...args) => timers.push(args), clearTimeout() {}, Date,
  };
  vm.createContext(context);
  vm.runInContext(source + "\nglobalThis.pinTest={initPinLock,pinLockNow,pinLockVisible,pinCheckExpiry,resetPinIdleTimer,get unlocked(){return pinUnlocked}}", context);
  await context.pinTest.initPinLock();
  // An expired session or a direct call cannot restore the disabled screen.
  vm.runInContext("pinLastActivity=1", context);
  context.pinTest.pinLockNow(); context.pinTest.pinLockVisible(); context.pinTest.resetPinIdleTimer();
  assert.equal(context.pinTest.pinCheckExpiry(), true);
  assert.equal(context.pinTest.unlocked, true);
  assert.equal(node("pinLock").classes.has("visible"), false);
  assert.equal(bodyClasses.has("pin-locked"), false);
  assert.equal(events.length, 0, "No PIN lifecycle handlers registered");
  assert.equal(timers.length, 0, "No idle or focus timers registered");
  assert(statuses.every(status => status.textContent === "Pincodescherm uitgeschakeld"));
  assert.deepEqual([...values], original, "Saved PIN and personal storage remain unchanged");
}
(async () => {
  await check(false); await check(true); await check(true, true);
  const forest = fs.readFileSync(path.join(root, "assets/memento-forest-lock.js"), "utf8");
  vm.runInNewContext(forest, { document: { documentElement: { dataset: { mementoPinLock: "disabled" } } } });
  const panels = [...html.matchAll(/<(div|section) class="[^"]*memento-pin-settings[^\"]*"[\s\S]*?(?=<div class="footer-note">|<section class="life-panel"><h2>Opslag)/g)];
  assert.equal(panels.length, 2);
  for (const panel of panels) {
    assert.match(panel[0], /Pincodescherm uitgeschakeld/);
    assert(!panel[0].includes("data-memento-pin-lock-now"));
    assert(!panel[0].includes("data-memento-pin-timeout"));
  }
  assert(!html.includes("Je pincode beschermt de toegang op je scherm."));
  let compiled = 0;
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=|type="(?:application\/json|text\/plain|importmap)"/.test(script[1]) || !script[2].trim()) continue;
    new vm.Script(script[2]); compiled++;
  }
  new vm.Script(fs.readFileSync(path.join(root, "sw.js"), "utf8"));
  assert.match(fs.readFileSync(path.join(root, "sw.js"), "utf8"), /memento-pwa-v34-20261027-pin-disabled-v1/);
  console.log(`PIN disabled: new and existing sessions, unavailable storage, idle/manual lock, no writes or timers, both settings panels, forest early exit and ${compiled} inline scripts OK`);
})().catch(error => { console.error(error); process.exitCode = 1; });
