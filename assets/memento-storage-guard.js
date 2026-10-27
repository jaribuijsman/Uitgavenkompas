/* Phase 1: one cooperative writer per origin. No expiring localStorage leases. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MementoStorageGuard = api.create(root);
})(globalThis, () => {
  "use strict";
  const LOCK = "memento-personal-data-writer-v1";
  const JOURNAL = "memento_storage_pending_v1";
  const KEYS = Object.freeze({ finance: "uitgavenkompas_v1", life: "compass_life_preview_v1" });
  const BACKUPS = { finance: "uitgavenkompas_auto_backup_v1", life: "compass_life_preview_v1_vorige" };
  const AUX = new Set(["memento_trash_pending_files_v1", "UK_DASHBOARD_PERIOD_MODE", "UK_DASHBOARD_SCOPE"]);
  function create(host) {
    const storage = host.localStorage, expected = {};
    let owner = false, stopped = false, busy = null, release = null, reason = "Memento controleert het schrijfslot. Probeer zo opnieuw.", pending = null;
    const read = key => storage.getItem(key);
    const put = (key, value) => value === null ? storage.removeItem(key) : storage.setItem(key, value);
    function announce(message = reason) {
      const doc = host.document;
      if (!doc?.body) return;
      let panel = doc.getElementById("mementoStorageNotice");
      if (!panel) {
        panel = doc.createElement("aside"); panel.id = "mementoStorageNotice";
        panel.setAttribute("role", "alert");
        panel.style.cssText = "position:fixed;z-index:2147483646;top:8px;left:8px;right:8px;max-width:680px;margin:auto;padding:12px;background:#293c2d;color:#fff;border:2px solid #c6d5b5;border-radius:10px;font:14px/1.4 system-ui;max-height:45dvh;overflow:auto";
        const dismiss = doc.createElement("button"); dismiss.type = "button"; dismiss.dataset.storageDismiss = ""; dismiss.textContent = "Melding sluiten";
        dismiss.style.cssText = "float:right;min-height:44px;margin:0 0 8px 8px";
        dismiss.onclick = () => { panel.hidden = true; }; // Presentation only: never releases or grants a lock.
        panel.appendChild(dismiss);
        const text = doc.createElement("p"); text.dataset.storageMessage = ""; panel.appendChild(text);
        const reload = doc.createElement("button"); reload.type = "button"; reload.textContent = "Actuele gegevens opnieuw laden";
        reload.onclick = () => {
          if (host.confirm("Opnieuw laden haalt de actuele gegevens op. Nog niet opgeslagen formulierinvoer gaat daarbij verloren. Doorgaan?")) host.location.reload();
        };
        panel.appendChild(reload); doc.body.appendChild(panel);
      }
      panel.hidden = false;
      if (pending && !panel.querySelector("[data-storage-recovery]")) {
        const download = doc.createElement("button"); download.type = "button"; download.dataset.storageRecovery = ""; download.textContent = "Herstelset downloaden";
        download.onclick = () => {
          const url = host.URL.createObjectURL(new host.Blob([pending], { type: "application/json" }));
          const a = doc.createElement("a"); a.href = url; a.download = "memento-onderbroken-opslag.json"; a.click();
          host.setTimeout(() => host.URL.revokeObjectURL(url), 30000);
        };
        panel.appendChild(download);
      }
      panel.querySelector("[data-storage-message]").textContent = message;
    }
    function error(message, fatal = false) {
      reason = message;
      if (fatal) stopped = true;
      announce(message);
      const e = new Error(message); e.name = "MementoStorageError"; return e;
    }
    function assertCurrent(token) {
      if (!owner || stopped) throw error(reason);
      if (busy !== null && busy !== token) throw error("Een herstel- of opruimactie is bezig. Je invoer is niet opgeslagen; probeer daarna opnieuw.");
      if (token !== undefined && token !== busy) throw error("Deze opslagactie is niet meer actief. Laad de actuele gegevens opnieuw.");
      for (const [domain, key] of Object.entries(KEYS)) {
        if (read(key) !== expected[domain]) throw error("De opgeslagen gegevens zijn gewijzigd buiten dit tabblad. Je wijziging is niet opgeslagen. Bewaar je invoer en laad de actuele gegevens opnieuw.", true);
      }
      return true;
    }
    function beginOperation() {
      assertCurrent();
      const token = Object.freeze({}); busy = token; return token;
    }
    function endOperation(token) { if (busy === token) busy = null; }
    function commit(changes, { token, extra = {}, backups = true } = {}) {
      assertCurrent(token);
      const entries = [];
      for (const [domain, value] of Object.entries(changes)) {
        if (!Object.hasOwn(KEYS, domain) || (value !== null && typeof value !== "string")) throw new TypeError("Ongeldige opslagwijziging");
        entries.push({ key: KEYS[domain], domain, before: expected[domain], after: value });
      }
      for (const [key, value] of Object.entries(extra)) {
        if (!AUX.has(key) || (value !== null && typeof value !== "string")) throw new TypeError("Ongeldige opslagmetadata");
        const before = read(key); if (before !== value) entries.push({ key, before, after: value });
      }
      if (!entries.length) return true;
      // A cross-key write must retain its exact original values before changing either domain.
      const journalled = entries.length > 1;
      if (journalled) storage.setItem(JOURNAL, JSON.stringify({ format: "memento-pending-write", version: 1, entries }));
      const written = [];
      try {
        assertCurrent(token);
        for (const entry of entries) { put(entry.key, entry.after); written.push(entry); }
      } catch (cause) {
        let restored = true;
        for (const entry of written.reverse()) {
          try {
            if (read(entry.key) !== entry.after) { restored = false; continue; }
            put(entry.key, entry.before);
          } catch (_) { restored = false; }
        }
        if (journalled && restored) { try { storage.removeItem(JOURNAL); } catch (_) { restored = false; } }
        if (!restored) {
          pending = read(JOURNAL);
          throw error("Opslag is onderbroken en kon niet volledig worden teruggezet. Wijzigen is geblokkeerd. Download de herstelset en bewaar je externe back-up.", true);
        }
        throw cause;
      }
      for (const entry of entries) if (entry.domain) expected[entry.domain] = entry.after;
      if (journalled) {
        try { storage.removeItem(JOURNAL); }
        catch (_) {
          pending = read(JOURNAL); stopped = true;
          reason = "De wijziging is opgeslagen, maar de herstelmarkering kon niet worden afgerond. Bewaar de herstelset en laad opnieuw voordat je verdergaat."; announce();
        }
      }
      if (backups) for (const entry of entries) if (entry.domain && entry.before !== null && entry.before !== entry.after) {
        try { storage.setItem(BACKUPS[entry.domain], entry.before); }
        catch (_) { announce("De wijziging is opgeslagen, maar de vorige lokale herstelkopie kon niet worden bijgewerkt. Bewaar een volledige ZIP-back-up."); }
      }
      return true;
    }
    function snapshot(domain) {
      if (!Object.hasOwn(KEYS, domain)) throw new TypeError("Onbekend opslagdomein");
      return expected[domain];
    }
    function close() {
      owner = false; stopped = true;
      reason = "Dit tabblad heeft het schrijfslot vrijgegeven. Laad de actuele gegevens opnieuw om te wijzigen.";
      release?.(); release = null;
    }
    let settle;
    const ready = new Promise(resolve => { settle = resolve; });
    try {
      for (const [domain, key] of Object.entries(KEYS)) expected[domain] = read(key);
      pending = read(JOURNAL);
      if (pending !== null) {
        stopped = true; reason = "Een eerdere opslagactie is onderbroken. Wijzigen is geblokkeerd; bewaar de herstelset voordat je gegevens herstelt."; settle(false);
      } else if (host.isSecureContext !== true || typeof host.navigator?.locks?.request !== "function") {
        stopped = true; reason = "Deze browser biedt hier geen veilig schrijfslot. Memento is alleen-lezen. Gebruik een actuele browser via HTTPS; je gegevens zijn niet gewijzigd."; settle(false);
      } else {
        Promise.resolve(host.navigator.locks.request(LOCK, { mode: "exclusive", ifAvailable: true }, lock => {
          if (!lock || stopped) {
            reason = "Een ander Memento-tabblad heeft het schrijfslot. Dit tabblad is alleen-lezen. Sluit het andere tabblad en laad hier opnieuw; je invoer is nog niet opgeslagen.";
            settle(false); announce(); return;
          }
          owner = true; reason = "";
          // Deliberately keep the native lock for this document's lifetime. Closing/crashing
          // the document also releases it in the browser; there is no persisted lease.
          return new Promise(resolve => { release = resolve; settle(true); });
        })).catch(() => {
          owner = false; stopped = true; reason = "Het veilige schrijfslot kon niet worden verkregen. Memento blijft alleen-lezen. Laad opnieuw in een actuele browser via HTTPS."; settle(false); announce();
        });
      }
    } catch (_) {
      stopped = true; reason = "Browseropslag is niet veilig beschikbaar. Wijzigen is geblokkeerd; de bestaande gegevens zijn niet vervangen."; settle(false);
    }
    ready.then(ok => { if (!ok) announce(); });
    host.document?.addEventListener?.("DOMContentLoaded", () => { if (!owner || stopped) announce(); });
    host.addEventListener?.("pagehide", close);
    host.addEventListener?.("pageshow", event => { if (event.persisted && stopped) announce(); });
    return Object.freeze({ ready, snapshot, assertCurrent, beginOperation, endOperation, commit, close, show: announce,
      get writable() { return owner && !stopped && busy === null; }, get message() { return reason; } });
  }
  return { create, LOCK, JOURNAL, KEYS };
});
