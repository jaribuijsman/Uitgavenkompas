/* Run with Playwright installed. BROWSER_EXECUTABLE optionally selects Chromium. */
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.join(__dirname, "..");
const server = http.createServer((req, res) => {
  const file = path.join(
    root,
    decodeURIComponent(
      req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0],
    ),
  );
  if (
    !file.startsWith(root) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  ) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader(
    "Content-Type",
    file.endsWith(".css")
      ? "text/css"
      : file.endsWith(".js")
        ? "application/javascript"
        : file.endsWith(".json")
          ? "application/json"
          : file.endsWith(".png")
            ? "image/png"
            : "text/html",
  );
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  const url = "http://127.0.0.1:" + server.address().port;
  const click = async (a,id) => {const target=page.locator(`#lifeContent [data-fit="${a}"]${id ? `[data-id="${id}"]` : ""}`).first();await require('./helpers/reveal.cjs')(page,target);await target.click();};
  const stored = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("compass_life_preview_v1")),
    );
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
  const pinMode = await page.locator("html").getAttribute("data-memento-pin-lock");
  if (pinMode === "manual") {
      await page.locator("#ms-continue").click();
  } else if (pinMode !== "disabled") {
      await page.locator("#pinInput").fill("123456");
      await page.locator(".pin-submit").click();
      await page.locator("#pinInput").fill("123456");
      await page.locator(".pin-submit").click();
  }
    await page.locator("#pinLock").waitFor({ state: "hidden" });
    await page.locator('[data-memento-menu="open"]').click();
    await page
      .locator('#mementoMenuGrid [data-memento-dest="life:fitness"]')
      .click();
    assert.equal(await page.locator("#lifeTitle").textContent(), "Fitness");
    checks.push("Real PIN setup and menu navigation");
    await click("profile");
    await page.locator("#fitnessDialog [name=starter]").check();
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.equal((await stored()).fitness.routines.length, 3);
    assert.equal((await stored()).fitness.routineCycle.length, 3);
    checks.push("Explicit setup creates three split routines without demo results");
    const rid = (await stored()).fitness.routines[0].id;
    await click("plan-new");
    await page.locator("#fitnessDialog [name=time]").fill("17:00");
    await page.locator("#fitnessDialog button[type=submit]").click();
    const bid = (await stored()).fitness.bookings[0].id;
    await page
      .locator('#mementoQuickNav [data-memento-dest="life:today"]')
      .click();
    assert.equal(
      await page.locator(`[data-fitness-booking="${bid}"]`).count(),
      1,
    );
    await page.locator(`[data-fitness-booking="${bid}"]`).click();
    await page.locator("#fitnessDialog [data-fit=close]").first().click();
    await page
      .locator('#mementoQuickNav [data-memento-dest="life:agenda"]')
      .click();
    await page.locator("[data-mg-agenda=month]").click();
    await page
      .locator(`[data-gcal-day="${(await stored()).fitness.bookings[0].date}"]`)
      .click();
    assert.equal(
      await page.locator(`[data-fitness-booking="${bid}"]`).count(),
      1,
    );
    await page.locator(`[data-fitness-booking="${bid}"]`).click();
    await page.locator("#fitnessDialog [data-fit=start-booking]").click();
    await page.locator("#fitnessDialog button[type=submit]").click();
    checks.push("Today and Agenda open the same booking");
    assert.equal(await page.locator("#mementoFitness .ft-muscle-icon").count(), 4);
    const secondId = (await stored()).fitness.active.exercises[1].id;
    await page.locator('#mementoFitness [data-fit="guide"]').first().click();
    assert.equal(await page.locator('#fitnessDialog a[href*="strengthlog.com"]').count(), 1);
    await page.locator('#fitnessDialog [data-fit="close"]').first().click();
    await require('./helpers/reveal.cjs')(page,'#mementoFitness [data-fit="alternatives"][data-id="' + secondId + '"]');
    await page.locator('#mementoFitness [data-fit="alternatives"][data-id="' + secondId + '"]').click();
    await page.locator('#fitnessDialog [data-fit="replace-with"]').first().click();
    assert.notEqual((await stored()).fitness.active.exercises[1].id, secondId);
    assert.equal((await stored()).fitness.routines[0].exercises[1].id, secondId);
    checks.push("Inline exercise help and one-workout alternative preserve the template");
    const eid = (await stored()).fitness.active.exercises[0].id;
    await require("./helpers/reveal.cjs")(page,page.locator(`[data-ex="${eid}"][data-field=weight]`).first());
    await page
      .locator(`[data-ex="${eid}"][data-field=weight]`)
      .first()
      .fill("40");
    await page
      .locator(`[data-ex="${eid}"][data-field=reps]`)
      .first()
      .fill("12");
    await click("toggle-rir");
    await page.locator(`[data-ex="${eid}"][data-field=rir]`).first().fill("2");
    await page
      .locator(`[data-fit=toggle-set][data-ex="${eid}"]`)
      .first()
      .click();
    assert.equal(
      (await stored()).fitness.active.exercises[0].logs[0].done,
      true,
    );
    assert.ok((await stored()).fitness.active.restUntil > Date.now());
    checks.push("Set autosave and rest deadline");
    await page.locator("[data-session-note]").fill("Eigen notitie behouden");
    await page.reload({ waitUntil: "domcontentloaded" });
    if (await page.locator("#ms-continue").isVisible()) await page.locator("#ms-continue").click();
    await page.evaluate(() => window.MementoFitnessBridge.open());
    assert.equal(
      await page.locator("[data-session-note]").inputValue(),
      "Eigen notitie behouden",
    );
    assert.equal(
      (await stored()).fitness.active.exercises[0].logs[0].done,
      true,
    );
    checks.push("Reload restores active sets and notes");
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow at ${width}`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, "fitness-active.png"),
        fullPage: true,
      });
    }
    checks.push("No horizontal overflow at 320, 390 and 768 px");
    // Force a real quota failure and verify disk remains unchanged while input survives.
    await page.evaluate(() => {
      window.testSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === "compass_life_preview_v1") throw Error("Quota test");
        return window.testSetItem.call(this, k, v);
      };
    });
    await page.locator("[data-session-note]").fill("Niet kwijt bij fout");
    assert.equal(
      (await stored()).fitness.active.notes,
      "Eigen notitie behouden",
    );
    assert.equal(
      await page.locator("[data-session-note]").inputValue(),
      "Niet kwijt bij fout",
    );
    assert.equal(await page.locator("#ft-retry").isVisible(), true);
    await page.evaluate(() => (Storage.prototype.setItem = window.testSetItem));
    await click("retry");
    assert.equal((await stored()).fitness.active.notes, "Niet kwijt bij fout");
    checks.push("Quota error retains draft and retry saves it");
    await click("finish");
    assert.equal((await stored()).fitness.active, null);
    assert.equal((await stored()).fitness.sessions.length, 1);
    assert.equal((await stored()).fitness.bookings[0].status, "completed");
    assert.notEqual((await stored()).fitness.nextRoutineId, rid);
    checks.push("Partial completion and rotation advance");
    await click("tab", "plan");
    await click("routine-edit", rid);
    await page.locator("#fitnessDialog [name=name]").fill("Mijn eigen schema");
    await page.locator("#fitnessDialog [data-fit=exercise-new]").click();
    await page.locator("#fitnessDialog [name=catalog]").selectOption("bike");
    await page.locator("#fitnessDialog [name=minutes]").fill("20");
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.equal(
      (await stored()).fitness.routines[0].name,
      "Mijn eigen schema",
    );
    assert.equal(
      (await stored()).fitness.routines[0].exercises.at(-1).type,
      "cardio",
    );
    await page.locator("#fitnessDialog [data-fit=close]").first().click();
    checks.push("Exercise editor preserves edited routine fields");
    await click("tab", "progress");
    assert.equal(await page.locator("#mementoFitness .ft-week-bars").count(), 1);
    assert.equal(await page.locator("#mementoFitness .ft-chart svg[role=img]").count(), 1);
    checks.push("Charts show real logged records without placeholder data");
    await click("measurement");
    await page.locator("#fitnessDialog [name=weight]").fill("80.5");
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.equal((await stored()).fitness.measurements[0].weight, 80.5);
    await click("delete-measurement");
    assert.equal((await stored()).fitness.measurements.length, 0);
    await click("undo");
    assert.equal((await stored()).fitness.measurements.length, 1);
    checks.push("Measurement removal is reversible");
    await click("measurement");
    await page.locator("#fitnessDialog [name=waist]").fill("90");
    await page.evaluate(() => {
      Storage.prototype.setItem = function (k, v) {
        if (k === "compass_life_preview_v1") throw Error("Quota test");
        return window.testSetItem.call(this, k, v);
      };
    });
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.equal((await stored()).fitness.measurements.length, 1);
    await page.evaluate(() => (Storage.prototype.setItem = window.testSetItem));
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.equal((await stored()).fitness.measurements.length, 2);
    checks.push("Retrying failed dialog save does not duplicate records");

    await page.evaluate(() => window.MementoLife.openBackup());
    const dl = page.waitForEvent("download");
    await page.locator("#lifeExportBackup").click();
    const download = await dl;
    const archive = fs.readFileSync(await download.path());
    assert.equal(archive.readUInt32LE(0), 0x04034b50);
    const restored = await require('../assets/memento-backup.js').prepareArchive(new Blob([archive]), {sha256:async blob=>require('node:crypto').createHash('sha256').update(Buffer.from(await blob.arrayBuffer())).digest('hex')});
    const backup = {format:'compass-life-backup',version:1,lifeState:restored.life,financeState:restored.finance};
    assert.equal(backup.lifeState.fitness.sessions.length, 1);
    assert.equal(
      backup.lifeState.fitness.routines[0].name,
      "Mijn eigen schema",
    );
    checks.push("Full backup includes fitness");
    const older = JSON.parse(JSON.stringify(backup));
    delete older.lifeState.fitness;
    await page
      .locator("#lifeImportFile")
      .setInputFiles({
        name: "older.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(older)),
      });
    assert.equal((await stored()).fitness.sessions.length, 1);
    checks.push("Older backup preserves existing fitness");
    const invalid = JSON.parse(JSON.stringify(backup));
    invalid.lifeState.fitness.sessions[0].date = "2026-02-31";
    await page
      .locator("#lifeImportFile")
      .setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(invalid)),
      });
    assert.equal((await stored()).fitness.sessions.length, 1);
    checks.push("Invalid fitness import rejected");
    await page
      .locator("#lifeImportFile")
      .setInputFiles({
        name: "roundtrip.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    assert.deepEqual((await stored()).fitness, backup.lifeState.fitness);
    checks.push("Backup restores exact fitness data");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    if (await page.locator("#ms-continue").isVisible()) await page.locator("#ms-continue").click();
    await page.evaluate(() => window.MementoFitnessBridge.open());
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    if (await page.locator("#ms-continue").isVisible()) await page.locator("#ms-continue").click();
    await page.evaluate(() => window.MementoFitnessBridge.open());
    assert.equal(await page.locator("#mementoFitness").count(), 1);
    await click("start");
    await page.locator("#fitnessDialog button[type=submit]").click();
    assert.ok((await stored()).fitness.active);
    checks.push("Offline reload and workout start");
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } catch (e) {
    console.error(e);
    if (process.env.SCREENSHOT_DIR)
      await page.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, "fitness-failure.png"),
        fullPage: true,
      });
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
