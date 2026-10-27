"use strict";
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict"), { chromium } = require("playwright");
const root = path.resolve(process.env.MEMENTO_VISUAL_ROOT || path.join(__dirname, "..")), width = Number(process.env.MEMENTO_VISUAL_WIDTH || 393), phase = process.env.MEMENTO_VISUAL_PHASE || "after";
const out = path.resolve(process.env.MEMENTO_VISUAL_OUT || "/tmp/memento-visual", phase, String(width)); fs.mkdirSync(out, { recursive: true });
const data = JSON.parse(fs.readFileSync(process.env.MEMENTO_VISUAL_FIXTURE, "utf8")), diagnostics = [], checks = [], errors = [];
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/__seed__") { res.setHeader("Content-Type", "text/html"); res.end("<!doctype html><title>Isolated visual fixture</title>"); return; }
  const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader("Content-Type", ({ ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" })[path.extname(file)] || "application/octet-stream"); res.end(fs.readFileSync(file));
});
async function navigate(page, area, view) {
  if(width>800){
    if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator(`#compassAreaBar [data-compass-area="${area}"]`).click();
    await page.locator(area==="life"?`#lifeNavigation [data-life-view="${view}"]`:`#sideNav [data-view="${view}"]`).click();
    await page.evaluate(()=>window.scrollTo(0,0));return;
  }
  await page.locator('[data-memento-menu="open"]').click();
  if (await page.evaluate(() => document.body.dataset.compassArea) !== area) await page.locator(`[data-memento-switch="${area}"]`).click();
  await page.locator(`#mementoMenuGrid [data-memento-dest="${area}:${view}"]`).click();
  await page.evaluate(() => window.scrollTo(0, 0));
}
async function shot(page, name, log = true) {
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(out, name + ".png"), fullPage: true, animations: "disabled" });
  const bytes = await page.screenshot({ path: path.join(out, name + ".jpg"), type: "jpeg", quality: 62, animations: "disabled" });
  if (log && process.env.MEMENTO_VISUAL_INLINE === "1") { const b64 = bytes.toString("base64"), count = Math.ceil(b64.length / 6000); for (let i = 0; i < count; i++) console.log(`VISUAL_IMAGE ${phase} ${width} ${name} ${i}/${count} ${b64.slice(i * 6000, (i + 1) * 6000)}`); }
  const measured = await page.evaluate(() => {
    const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const overflow = [...document.querySelectorAll("body *")].filter(visible).map(el => ({ tag: el.tagName, id: el.id, class: String(el.className).slice(0, 90), rect: el.getBoundingClientRect().toJSON() })).filter(x => x.rect.right > innerWidth + 2 || x.rect.left < -2).slice(0, 30);
    const controls = [...document.querySelectorAll("button,summary,a[href],input:not([type=hidden]),select,textarea")].filter(visible).filter(el => !el.closest("#pinLock")).map(el => { const r = el.getBoundingClientRect(); return { id: el.id, text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 60), width: Math.round(r.width), height: Math.round(r.height) }; });
    const focus = document.activeElement?.id;
    return { clientWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow, smallControls: controls.filter(x => x.width < 44 || x.height < 44), focus };
  });
  diagnostics.push({ name, ...measured });
}
(async () => {
  let browser;
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    const context = await browser.newContext({ viewport: { width, height: width > 700 ? 900 : 852 }, reducedMotion: "reduce", locale: "nl-NL", timezoneId: "Europe/Amsterdam", acceptDownloads: true });
    await context.route("https://**/*", route => route.abort());
    const page = await context.newPage(); page.on("pageerror", e => errors.push(e.message)); page.on("dialog", d => d.accept());
    await page.addInitScript(() => { const NativeDate = Date, fixed = Date.parse("2026-10-27T09:30:00+01:00"); window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [fixed])); } static now() { return fixed; } }; });
    const url = "http://127.0.0.1:" + server.address().port; await page.goto(url + "/__seed__");
    await page.evaluate(async data => {
      localStorage.setItem("uitgavenkompas_v1", JSON.stringify(data.finance)); localStorage.setItem("compass_life_preview_v1", JSON.stringify(data.life)); localStorage.setItem("uitgavenkompas_pin_config_v1", JSON.stringify(data.pin));
      const db = await new Promise((resolve, reject) => { const r = indexedDB.open("memento_knowledge_files_v1", 1); r.onupgradeneeded = () => { const s = r.result.createObjectStore("files", { keyPath: "id" }); s.createIndex("noteId", "noteId", { unique: false }); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
      await new Promise((resolve, reject) => { const t = db.transaction("files", "readwrite"); t.oncomplete = resolve; t.onerror = () => reject(t.error); for (const { base64, ...meta } of data.files) { const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0)); t.objectStore("files").put({ ...meta, blob: new Blob([bytes], { type: meta.type }) }); } }); db.close();
    }, data);
    await page.goto(url, { waitUntil: "domcontentloaded" }); await page.locator("#pinLock.visible").waitFor(); await shot(page, "pin", width === 393);
    await page.locator("#pinInput").fill("123456"); await page.locator(".pin-submit").click(); await page.locator("#pinLock").waitFor({ state: "hidden" });
    await page.waitForFunction(() => window.MementoStorageGuard?.writable); checks.push("PIN unlocked; fixture writer owns Web Lock");
    for (const [name, area, view] of [["day", "life", "today"], ["tasks", "life", "tasks"], ["groceries", "life", "groceries"], ["wishes", "life", "wishes"], ["agenda", "life", "agenda"], ["finance", "finance", "dashboard"], ["transactions", "finance", "transactions"], ["budgets", "finance", "budgets"], ["planning", "finance", "planning"], ["knowledge", "life", "notes"], ["fitness", "life", "fitness"], ["settings", "life", "backup"]]) { await navigate(page, area, view); await shot(page, name); }
    await navigate(page, "life", "notes"); await page.locator('[data-kc="all"]').first().click(); await shot(page, "knowledge-list", width === 393);
    await page.locator('[data-kc="open"][data-id="visual-note"]').first().click(); await shot(page, "note", width === 393);
    await page.locator('[data-kc="edit"]').click(); await page.locator("#kc-body").focus(); await shot(page, "editor", width === 393);
    await page.setViewportSize({ width, height: width > 700 ? 560 : 430 }); await page.locator("#kc-body").scrollIntoViewIfNeeded(); await shot(page, "editor-short", width === 393); await page.setViewportSize({ width, height: width > 700 ? 900 : 852 });
    await navigate(page, "finance", "transactions"); await page.locator("#addTransaction").click(); await shot(page, "transaction-modal", width === 393); await page.locator("#cancelTx").click();
    await navigate(page, "life", "fitness"); await page.locator('[data-fit="tab"][data-id="plan"]').click(); await shot(page, "fitness-plan", width === 393); await page.locator('[data-fit="tab"][data-id="progress"]').click(); await shot(page, "fitness-progress", width === 393);
    if(await page.locator('[data-memento-menu="open"]').isVisible())await page.locator('[data-memento-menu="open"]').click(); await shot(page, "navigation", width === 393);
    if(phase==="after"){
      if(await page.locator('#mementoMenuLayer:not([hidden])').count())await page.locator('#mementoMenuClose').click();
      for(const d of diagnostics)assert(d.scrollWidth<=width+1,"Horizontal overflow: "+d.name);
      await require('./helpers/visual-assertions.cjs')(page,navigate,width,checks,shot);
    }
    const sheets = await page.evaluate(() => [...document.styleSheets].map(sheet => { let rules = []; try { rules = [...sheet.cssRules].map(r => r.cssText); } catch {} return { id: sheet.ownerNode?.id || "", href: sheet.href, rules }; }));
    fs.writeFileSync(path.join(out, "cssom.json"), JSON.stringify(sheets));
    fs.writeFileSync(path.join(out, "report.json"), JSON.stringify({ phase, width, diagnostics, checks, errors }, null, 2)); assert.deepEqual(errors, []);
    console.log("VISUAL_REPORT " + JSON.stringify({ phase, width, checks, errors, diagnostics })); await context.close();
  } catch (e) { console.error(e); process.exitCode = 1; }
  finally { if (browser) await browser.close(); server.close(); }
})();
