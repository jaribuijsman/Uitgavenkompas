"use strict";
/* Real isolated browser contexts, shared origin/storage, native Web Locks and IDB.
   Requires Playwright; never connects to the user's app or uses real data. */
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict");
const { chromium } = require("playwright"), { emptyLife, task, tx } = require("./helpers/storage-fixture.cjs");
const root = path.resolve(__dirname, ".."), checks = [], errors = [];
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/__seed__") { res.setHeader("Content-Type", "text/html"); res.end("<!doctype html><title>Isolated seed</title>"); return; }
  const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
  res.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream"); res.end(fs.readFileSync(file));
});
async function until(page, predicate, arg) { await page.waitForFunction(predicate, arg, { timeout: 10000 }); }
async function unlock(page, first = false) {
  const mode = await page.locator("html").getAttribute("data-memento-pin-lock");
  if (mode === "manual") {
    if (await page.locator("#ms-continue").isVisible()) await page.locator("#ms-continue").click();
    await page.locator("#pinLock").waitFor({ state: "hidden" }); return;
  }
  if (mode === "disabled") {
    await page.locator("#pinLock").waitFor({ state: "hidden" }); return;
  }
  await page.locator("#pinInput").fill("123456"); await page.locator(".pin-submit").click();
  if (first) { await page.locator("#pinInput").fill("123456"); await page.locator(".pin-submit").click(); }
  await page.locator("#pinLock").waitFor({ state: "hidden" });
}
async function navigate(page, area, view) {
  await page.locator('[data-memento-menu="open"]').click();
  if (await page.evaluate(() => document.body.dataset.compassArea) !== area) await page.locator(`[data-memento-switch="${area}"]`).click();
  await page.locator(`#mementoMenuGrid [data-memento-dest="${area}:${view}"]`).click();
}
async function addTransaction(page, description) {
  await navigate(page, "finance", "transactions"); await page.locator("#addTransaction").click();
  await page.locator("#txDescription").fill(description); await page.locator("#txAmount").fill("12.34"); await page.locator("#txDate").fill("2026-10-26");
  await page.locator('[type="submit"][form="txForm"]').click();
}
(async () => {
  let browser;
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, acceptDownloads: true });
    // Keep fixtures local. Third-party auth/weather scripts are unnecessary here.
    await context.route("https://**/*", route => route.abort());
    context.on("page", p => { p.on("pageerror", e => errors.push(e.message)); p.on("dialog", d => d.accept()); });
    const a = await context.newPage(); await a.goto(url + "/__seed__");
    const finance = { version: 3, transactions: [tx("old-1", "Beginsaldo roodstand"), tx("old-2", "Saldo roodstand")], categories: [{ name: "Overig", icon: "✨", kind: "expense", color: "#aaaaaa", subcategories: [] }], receipts: [{ id: "bon", transactionId: "old-1", store: "Test", date: "2026-10-26", total: 12.34, text: "Fictief" }], budgets: {}, bills: [], goals: [], totalBudget: 0, monthClosures: {}, settings: { salaryPeriodStart: "2026-10-01", accountOpening: { personal: 100, joint: 0, creditcard: 0 } } };
    const life = emptyLife(); life.tasks.push({ ...task("trashed"), deletedAt: "2026-10-26" });
    await a.evaluate(({ finance, life }) => { localStorage.setItem("uitgavenkompas_v1", JSON.stringify(finance)); localStorage.setItem("compass_life_preview_v1", JSON.stringify(life)); }, { finance, life });
    await a.goto(url, { waitUntil: "domcontentloaded" }); await unlock(a, true);
    await until(a, () => window.MementoStorageGuard?.writable);
    for (let i = 0; i < 2; i++) {
      const data = await a.evaluate(() => JSON.parse(localStorage.getItem("uitgavenkompas_v1")));
      assert.deepEqual(data.transactions, finance.transactions); assert.deepEqual(data.receipts, finance.receipts); assert.equal(data.settings.accountOpening.personal, 100);
      if (!i) await a.reload({ waitUntil: "domcontentloaded" }); await unlock(a);
    }
    await until(a, () => window.MementoStorageGuard?.writable); checks.push("Description migration removed; IDs, amounts and receipt links survive reload");
    const b = await context.newPage(); await b.goto(url, { waitUntil: "domcontentloaded" }); await unlock(b);
    await until(b, () => window.MementoStorageGuard && !window.MementoStorageGuard.writable);
    await addTransaction(a, "Transactie A");
    await until(a, () => JSON.parse(localStorage.getItem("uitgavenkompas_v1")).transactions.some(t => t.description === "Transactie A"));
    await addTransaction(b, "Concept B"); assert.equal(await b.locator("#txDescription").inputValue(), "Concept B");
    assert(await b.locator("#modalBackdrop").evaluate(el => el.classList.contains("open")));
    let stored = await a.evaluate(() => JSON.parse(localStorage.getItem("uitgavenkompas_v1")));
    assert(stored.transactions.some(t => t.description === "Transactie A")); assert(!stored.transactions.some(t => t.description === "Concept B"));
    checks.push("Native two-tab transaction conflict preserves A and B's unsaved form");
    await b.locator("#cancelTx").click(); await navigate(a, "life", "tasks");
    await require("./helpers/reveal.cjs")(a,"#lifeQuickTitle");await a.locator("#lifeQuickTitle").fill("Taak A"); await a.locator("#lifeQuickForm button[type=submit]").click();
    await require("./helpers/reveal.cjs")(a,'[data-life-quick-kind="note"]');await a.locator('[data-life-quick-kind="note"]').click(); await a.locator("#lifeQuickTitle").fill("Notitie A"); await a.locator("#lifeQuickForm button[type=submit]").click();
    await until(a,()=>JSON.parse(localStorage.getItem("compass_life_preview_v1")).notes.some(n=>n.title==="Notitie A"));
    await navigate(b, "life", "tasks"); await require("./helpers/reveal.cjs")(b,"#lifeQuickTitle");await b.locator("#lifeQuickTitle").fill("Taakconcept B"); await b.locator("#lifeQuickForm button[type=submit]").click();
    assert.equal(await b.locator("#lifeQuickTitle").inputValue(), "Taakconcept B");
    assert((await a.evaluate(() => JSON.parse(localStorage.getItem("compass_life_preview_v1")))).tasks.some(t => t.title === "Taak A"));
    checks.push("Two-tab Life conflict preserves saved task and quick-capture input");
    await navigate(b, "life", "backup"); await require("./helpers/reveal.cjs")(b,"#lifeOpenPurgeTrash");await b.locator("#lifeOpenPurgeTrash").click(); await b.locator("#lifePurgeWord").fill("VERWIJDEREN"); await b.locator("#lifePurgeExecute").click();
    assert.match(await b.locator("#lifePurgeFeedback").textContent(), /Geen items definitief verwijderd/);
    assert((await a.evaluate(() => JSON.parse(localStorage.getItem("compass_life_preview_v1")))).tasks.some(t => t.title === "Taak A"));
    await b.locator("#mementoStorageNotice [data-storage-dismiss]").click();
    assert.equal(await b.evaluate(()=>window.MementoStorageGuard.writable),false);
    await b.locator("#lifeDialog [data-life-close]").first().click();
    checks.push("Stale purge is rejected before touching active tasks");
    await navigate(b, "life", "notes"); await b.locator('[data-kc="new"]').first().click(); await b.locator("#kc-title").fill("Notitieconcept B"); await b.locator("#kc-body").fill("Invoer blijft bewaard"); await b.locator('[data-kc="save"]').click();
    assert.equal(await b.locator("#kc-body").inputValue(), "Invoer blijft bewaard"); assert(await b.evaluate(() => window.MementoKnowledge.hasPending()));
    checks.push("Read-only note editor retains failed autosave/manual-save draft");
    // A real storage fault on a writable page must keep the DOM input for retry.
    await a.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (key === "compass_life_preview_v1") throw Error("Quota fixture"); return window.originalSetItem.call(this, key, value); }; });
    await require("./helpers/reveal.cjs")(a,'[data-life-quick-kind="task"]');await a.locator('[data-life-quick-kind="task"]').click();
    await a.locator("#lifeQuickTitle").fill("Quotaconcept"); await a.locator("#lifeQuickForm button[type=submit]").click(); assert.equal(await a.locator("#lifeQuickTitle").inputValue(), "Quotaconcept");
    await a.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; }); await a.locator("#lifeQuickForm button[type=submit]").click();
    checks.push("Writable-tab quota failure preserves input and retry saves it");
    await a.close(); await b.close(); const c = await context.newPage(); await c.goto(url, { waitUntil: "domcontentloaded" }); await unlock(c); await until(c, () => window.MementoStorageGuard?.writable);
    await navigate(c, "life", "notes"); await c.locator('[data-kc="new"]').first().click(); await c.locator("#kc-title").fill("Fictieve PDF"); await c.locator("#kc-body").fill("Bijlagefixture");
    await c.locator("#kc-file-input").setInputFiles({ name: "fictief.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nFictieve integriteitsbytes\n%%EOF") });
    await until(c, () => JSON.parse(localStorage.getItem("compass_life_preview_v1")).notes.some(n => n.attachments?.length));
    const binary = await c.evaluate(async () => { const all = await window.MementoKnowledgeStore.all(); return { count: all.length, text: await all[0].blob.text(), meta: all[0].id }; });
    assert.equal(binary.count, 1); assert(binary.text.startsWith("%PDF-1.4")); checks.push("Real IndexedDB attachment write uses the owning operation token");
    await navigate(c, "life", "backup"); const downloadPromise = c.waitForEvent("download"); await c.locator("#lifeExportBackup").click(); const download = await downloadPromise;
    const archive = fs.readFileSync(await download.path()); assert.equal(archive.readUInt32LE(0), 0x04034b50);
    const before = await c.evaluate(() => ({ life: JSON.parse(localStorage.getItem("compass_life_preview_v1")), finance: JSON.parse(localStorage.getItem("uitgavenkompas_v1")) }));
    const restoredNavigation=c.waitForNavigation({waitUntil:"domcontentloaded"});
    await require("./helpers/reveal.cjs")(c,"#lifeImportFile");await c.locator("#lifeImportFile").setInputFiles({ name: "original-format.zip", mimeType: "application/zip", buffer: archive });
    await restoredNavigation; await until(c, () => window.MementoStorageGuard?.writable);
    const after = await c.evaluate(() => ({ life: JSON.parse(localStorage.getItem("compass_life_preview_v1")), finance: JSON.parse(localStorage.getItem("uitgavenkompas_v1")) }));
    assert.deepEqual(after, before); checks.push("UI ZIP export/restore retains complete objects and existing attachment IDs");
    await c.evaluate(async () => { await navigator.serviceWorker.ready; }); await c.reload({ waitUntil: "domcontentloaded" }); await unlock(c); await until(c, () => navigator.serviceWorker.controller !== null);
    await context.setOffline(true); await c.reload({ waitUntil: "domcontentloaded" }); await unlock(c); await until(c, () => window.MementoStorageGuard?.writable);
    const historical = await c.evaluate(async () => { const r = await fetch("./uitgavenkompas-v20-pincode-vergrendeling-1.html", { redirect: "manual" }); return { type: r.type, status: r.status }; });
    assert(historical.type === "opaqueredirect" || historical.status === 302); checks.push("Offline app obtains lock; historical URL is redirected by the current worker");
    assert.deepEqual(errors, []); console.log(JSON.stringify({ checks, errors }, null, 2)); await context.close();
  } catch (e) {
    console.error(e); console.log(JSON.stringify({completedChecks:checks,errors},null,2)); process.exitCode = 1;
  } finally { if (browser) await browser.close(); server.close(); }
})();
