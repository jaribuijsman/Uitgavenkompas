/* Fitness stays inside Memento's Life navigation and atomic Life backup. */
(() => {
  "use strict";
  const C = window.MementoFitnessCore;
  if (!C) return;
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const fmt = (d) =>
    new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(
      new Date(d + "T12:00:00"),
    );
  const button = (label, action, value = "", primary = false) =>
    `<button type="button" class="life-btn${primary ? " life-btn-primary" : ""}" data-fit="${action}" data-id="${esc(value)}">${label}</button>`;
  const field = (label, name, value = "", type = "text", extra = "") =>
    `<label class="ft-field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
  const options = (list, selected) =>
    list
      .map(
        ([v, l]) =>
          `<option value="${esc(v)}"${String(v) === String(selected) ? " selected" : ""}>${esc(l)}</option>`,
      )
      .join("");
  const select = (label, name, list, value) =>
    `<label class="ft-field">${label}<select name="${name}">${options(list, value)}</select></label>`;
  const goals = [
    ["fit", "Fitter worden"],
    ["strength", "Sterker worden"],
    ["muscle", "Spieropbouw"],
    ["endurance", "Conditie opbouwen"],
  ];
  let bridge,
    host,
    tab = "today",
    pending = null,
    selectedMinutes = 45,
    showRir = false,
    progressKey = "",
    editingRoutine = "",
    lastFocus = null,
    clock = null;
  const data = () => pending || bridge.read();
  function error(text) {
    const el = host?.querySelector("#ft-notice");
    if (el) {
      el.hidden = false;
      el.setAttribute("role", "alert");
      el.textContent = text;
    }
  }
  function commit(fn) {
    const draft = C.clone(data());
    try {
      fn(draft);
      C.validate(draft);
    } catch (e) {
      error(e.message);
      return false;
    }
    if (!bridge.replace(draft)) {
      pending = draft;
      error(
        "Opslaan mislukt. Je invoer blijft hier staan. Maak ruimte vrij en probeer opnieuw.",
      );
      const retry = host?.querySelector("#ft-retry");
      if (retry) retry.hidden = false;
      return false;
    }
    pending = null;
    return true;
  }
  function change(fn, redraw = true) {
    if (!commit(fn)) return false;
    if (redraw) render();
    return true;
  }
  function panel(title, body, actions = "") {
    return `<section class="life-panel ft-panel"><div class="ft-heading"><h2>${title}</h2>${actions}</div>${body}</section>`;
  }
  function routineLabel(f, id) {
    return f.routines.find((r) => r.id === id)?.name || "Bewaarde training";
  }
  function bookingRows(f, bookings) {
    return bookings
      .map(
        (b) =>
          `<div class="ft-row"><div><strong>${esc(routineLabel(f, b.routineId))}</strong><small>${fmt(b.date)}${b.time ? " · " + esc(b.time) : ""}${b.date < C.date() && b.status === "planned" ? " · kies een nieuw moment" : ""}${b.status === "completed" ? " · afgerond" : ""}</small></div><div class="ft-actions">${b.status === "planned" ? button("Open", "booking", b.id) : ""}</div></div>`,
      )
      .join("");
  }
  const personalSplitNames = ["Borst & Triceps", "Rug & Biceps", "Benen, Schouders & Buik"];
  function splitOffer(f) {
    const found = personalSplitNames.map((name) => f.routines.find((r) => !r.archived && r.name === name));
    const cycle = C.rotation(f);
    const installed = found.every(Boolean);
    const current = installed && cycle.length === 3 && found.every((r, i) => r.id === cycle[i].id);
    if (current) return "";
    return panel("Jouw 3-daagse krachtschema",
      '<p>Borst & triceps · Rug & biceps · Benen, schouders & buik. Eerdere schema’s en resultaten blijven bewaard.</p><div class="ft-actions">' +
      button(installed ? "Als vaste A/B/C-cyclus instellen" : "Mijn 3-daagse split toevoegen", "starter", "", true) + "</div>");
  }
  function today() {
    const f = data(),
      r = C.next(f),
      recent = f.sessions.filter(
        (s) =>
          !s.deletedAt &&
          C.days(s.date, C.date()) >= 0 &&
          C.days(s.date, C.date()) < f.profile.cycleDays,
      ),
      planned = f.bookings
        .filter((b) => b.status === "planned")
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (!f.setup)
      return panel(
        "Een ritme dat bij jou past",
        `<p>Maak een eigen trainingsschema of begin met een aanpasbaar basisplan. Je trainingen en resultaten blijven in Memento.</p><div class="ft-actions">${button("Fitness instellen", "profile", "", true)}${button("Mijn 3-daagse split", "starter")}${button("Eigen schema maken", "routine-new")}</div><div class="ft-intro"><span>Kracht & conditie</span><span>Offline bijhouden</span><span>Je eigen tempo</span></div>`,
      );
    if (f.active) return session();
    return (
      splitOffer(f) +
      panel(
        r ? esc(r.name) : "Je eerste training",
        r
          ? `<div class="ft-kicker">VOLGENDE IN JE SCHEMA</div><p>${esc(r.location)} · ${r.exercises.length} oefeningen</p><div class="ft-choices" aria-label="Training kiezen">${[
              [25, "Kort"],
              [45, "Volledig"],
            ]
              .map(
                ([n, l]) =>
                  `<button type="button" data-fit="duration" data-id="${n}" aria-pressed="${selectedMinutes === n}">${l}</button>`,
              )
              .join(
                "",
              )}</div><p class="ft-hint">${selectedMinutes === 25 ? "Alleen je basisoefeningen; aanvullende oefeningen vervallen vandaag." : "Alle oefeningen uit je schema, inclusief aanvullende oefeningen."} De werkelijke duur hangt af van je rust en uitvoering.</p><div class="ft-actions">${button("Start training", "start", r.id, true)}${button("Ander schema", "tab", "plan")}</div>`
          : `<p>Stel je eigen oefeningen samen of voeg het basisplan toe.</p><div class="ft-actions">${button("Schema maken", "routine-new", "", true)}${button("Basisplan toevoegen", "starter")}</div>`,
      ) +
      `<div class="ft-strip"><span>Laatste ${f.profile.cycleDays} dagen</span><strong>${recent.length} / ${f.profile.target} trainingen</strong></div>` +
      (planned.length
        ? panel(
            "Gepland",
            bookingRows(f, planned.slice(0, 4)),
            button("＋ Plan", "plan-new"),
          )
        : panel(
            "Plan je volgende moment",
            `<p>Je trainingsvolgorde blijft staan, ook als je een dag overslaat.</p>${button("Training plannen", "plan-new")}`,
          )) +
      panel(
        "Hoe gaat het?",
        `<p>${f.sessions.filter((s) => !s.deletedAt).length ? "Bekijk je prestaties per oefening en je trainingshistorie." : "Na je eerste training verschijnt hier je voortgang."}</p>${button("Bekijk voortgang", "tab", "progress")}`,
      )
    );
  }
  function plan() {
    const f = data(), active = C.rotation(f),
      ids = new Set(active.map((r) => r.id)),
      remaining = f.routines.filter((r) => !r.archived && !ids.has(r.id));
    const card = (r, index, inCycle) =>
      panel('<span class="ft-routine-heading">' +
          (inCycle ? '<span class="ft-cycle-label">' + String.fromCharCode(65 + index) + '</span>' : '') +
          esc(r.name) + '</span>',
        '<p class="ft-routine-meta">' + esc(r.location) + ' · ' + r.exercises.length +
          ' oefeningen' + (C.next(f)?.id === r.id ? ' · volgende training' : '') +
          (inCycle ? ' · in je cyclus' : ' · apart schema') + '</p>' +
        (r.exercises.length ? '<details class="ft-details ft-routine-details"><summary>Bekijk oefeningen</summary>' +
          r.exercises.map((e) =>
            '<div class="ft-row"><div><strong>' + esc(e.name) + '</strong><small>' +
            (e.type === "strength" ? e.sets + ' × ' + e.min + '–' + e.max : e.sets + ' × ' + e.minutes + ' min') +
            (e.optional ? ' · optioneel' : '') + '</small></div>' +
            button("Uitleg", "guide", e.id) + '</div>').join("") +
          '</details>' : '<p>Voeg oefeningen toe om dit schema te kunnen trainen.</p>') +
        '<div class="ft-actions">' + (r.exercises.length ? button("Start", "start", r.id, true) : '') +
          button("Bewerken", "routine-edit", r.id) +
          (inCycle ? (active.length > 1 ? button("Uit cyclus", "toggle-cycle", r.id) : '') +
            button("Als volgende", "next", r.id) : button("In cyclus", "toggle-cycle", r.id)) + '</div>');
    return (
      '<div class="ft-actions ft-toolbar">' + button("＋ Schema", "routine-new", "", true) +
        button("Training plannen", "plan-new") + button("Voorkeuren", "profile") + '</div>' +
      splitOffer(f) +
      '<div class="ft-section-title"><h2>Actieve trainingscyclus</h2>' +
        '<p>De volgorde schuift alleen door wanneer je een training afrondt.</p></div>' +
      (active.length ? active.map((r, i) => card(r, i, true)).join("") :
        panel("Geen actieve schema’s", '<p>Maak een schema of voeg je driedelige split toe.</p>')) +
      (remaining.length ? '<div class="ft-section-title"><h2>Andere schema’s</h2>' +
        '<p>Deze blijven bewaard en beïnvloeden je A/B/C-volgorde niet.</p></div>' +
        remaining.map((r, i) => card(r, i, false)).join("") : '') +
      (f.bookings.some((b) => b.status === "planned")
        ? panel("Geplande trainingen", bookingRows(f, f.bookings
          .filter((b) => b.status === "planned")
          .sort((a, b) => a.date.localeCompare(b.date))), button("＋ Plan", "plan-new"))
        : '') +
      '<details class="ft-details"><summary>Geannuleerde planning</summary>' +
        (f.bookings.filter((b) => b.status === "cancelled").map((b) =>
          '<div class="ft-row"><span>' + esc(routineLabel(f, b.routineId)) +
          ' · ' + fmt(b.date) + '</span>' + button("Terugzetten", "restore-booking", b.id) +
          '</div>').join("") || '<p>Geen geannuleerde trainingen.</p>') +
        '</details><details class="ft-details"><summary>Gearchiveerde schema’s</summary>' +
        (f.routines.filter((r) => r.archived).map((r) =>
          '<div class="ft-row"><strong>' + esc(r.name) +
          '</strong>' + button("Terugzetten", "restore-routine", r.id) + '</div>').join("") ||
          '<p>Geen gearchiveerde schema’s.</p>') + '</details>'
    );
  }
  function session() {
    const f = data(),
      s = f.active,
      done = s.exercises.reduce(
        (n, e) => n + e.logs.filter((l) => l.done).length,
        0,
      ),
      total = s.exercises.reduce((n, e) => n + e.logs.length, 0);
    return (
      `<div class="ft-session-head"><div><h2>${esc(s.name)}</h2><p>${esc(s.location)} · ${done} / ${total} sets afgevinkt</p></div>${button("Afronden", "finish", "", true)}</div><div class="ft-timer" role="timer" aria-label="Rusttimer"><span id="ft-clock">Rusttimer</span>${button("Stop rust", "stop-rest")}</div>` +
      (s.checkin.pain
        ? '<p class="ft-warning">Je hebt pijn gemeld. Er worden geen verhogingen voorgesteld. Stop een pijnlijke oefening; deze app beoordeelt geen blessures.</p>'
        : "") +
      s.exercises
        .map((e, i) => {
          const rec = C.recommendation(f, e, s.location);
          if (
            rec.increase &&
            (s.checkin.pain ||
              s.checkin.energy === "low" ||
              s.checkin.sleep === "poor")
          )
            rec.text =
              "Vandaag geen verhoging voorgesteld op basis van je check-in. Pas de training aan je gevoel aan.";
          return panel(
            `${i + 1}. ${esc(e.name)}`,
            `<p class="ft-hint">${esc(e.equipment)}${e.group ? " · superset/circuit " + esc(e.group) : ""} · rust ${e.rest}s</p><p>${esc(rec.text)}</p>${e.note ? `<p class="ft-note">${esc(e.note)}</p>` : ""}<div class="ft-sets">${e.logs.map((l, j) => logRow(e, l, j)).join("")}</div><div class="ft-actions">${button("＋ Werkset", "add-set", e.id)}${button("＋ Opwarmset", "warmup", e.id)}${button("Vervangen", "replace", e.id)}</div><details class="ft-details"><summary>Uitvoering & notitie</summary><p>${esc(e.cue || "Kies een beheerst tempo en een comfortabele uitvoering.")}</p><label class="ft-field">Notitie voor deze training<textarea data-note="${esc(e.id)}" maxlength="4000">${esc(e.note)}</textarea></label></details>`,
          );
        })
        .join("") +
      panel(
        "Jouw training",
        `<label class="ft-field">Notitie<textarea data-session-note maxlength="4000">${esc(s.notes)}</textarea></label><div class="ft-actions">${button("Training afronden", "finish", "", true)}${button("Later verder", "later")}</div><details class="ft-details"><summary>Training annuleren</summary><p>Je kunt de laatst geannuleerde training in deze sessie terugzetten.</p>${button("Annuleer training", "cancel")}</details>`,
      )
    );
  }
  function logRow(e, l, j) {
    const input = (k, label, value, step, max) =>
      `<label>${label}<input aria-label="${esc(e.name)} set ${j + 1} ${label}" type="number" inputmode="decimal" min="0" max="${max}" step="${step}" data-ex="${esc(e.id)}" data-log="${esc(l.id)}" data-field="${k}" value="${value ?? ""}"${l.done ? " disabled" : ""}></label>`;
    return `<div class="ft-set${l.done ? " is-done" : ""}" data-set-row="${esc(l.id)}"><div class="ft-set-label">${l.warmup ? "W" : "Set " + (j + 1)}</div><div class="ft-set-fields">${e.type === "strength" ? input("weight", "kg", l.weight, 0.25, 100000) + input("reps", "reps", l.reps, 1, 1000) + input("rir", "over", l.rir, 1, 10) : input("minutes", "min", l.minutes, 0.1, 600) + (e.type === "cardio" ? input("distance", "km", l.distance, 0.01, 10000) : "")}</div><button type="button" class="ft-check" data-fit="toggle-set" data-ex="${esc(e.id)}" data-id="${esc(l.id)}" aria-label="${esc(e.name)} set ${j + 1} ${l.done ? "weer openen" : "afvinken"}" aria-pressed="${l.done}">${l.done ? "✓" : "○"}</button></div>`;
  }
  function progress() {
    const f = data(),
      sessions = f.sessions
        .filter((s) => !s.deletedAt)
        .slice()
        .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
    const records = new Map();
    for (const s of sessions)
      for (const e of s.exercises) {
        const key = e.id + "|" + s.location + "|" + e.equipment;
        if (!records.has(key) && e.logs.some((l) => l.done && !l.warmup))
          records.set(key, { e, s });
      }
    const totals = {};
    sessions
      .filter(
        (s) => C.days(s.date, C.date()) >= 0 && C.days(s.date, C.date()) < 7,
      )
      .forEach((s) =>
        s.exercises
          .filter((e) => e.type === "strength")
          .forEach((e) => {
            totals[e.muscle] =
              (totals[e.muscle] || 0) +
              e.logs.filter((l) => l.done && !l.warmup).length;
          }),
      );
    return (
      `<div class="ft-strip"><span>Afgeronde trainingen</span><strong>${sessions.length}</strong></div>` +
      panel(
        "Prestaties per oefening",
        records.size
          ? [...records.values()]
              .map(({ e, s }) => {
                const h = C.history(f, e.id, s.location, e.equipment),
                  prev = h[1],
                  current = e.logs.filter((l) => l.done && !l.warmup),
                  desc =
                    e.type === "strength"
                      ? current
                          .map((l) => `${l.weight} kg × ${l.reps}`)
                          .join(" · ")
                      : current.reduce((n, l) => n + (l.minutes || 0), 0) +
                        " min";
                return `<details class="ft-details"><summary>${esc(e.name)} <span>${esc(desc)}</span></summary><p>${esc(s.location)} · ${esc(e.equipment)} · ${fmt(s.date)}</p><p>${esc(C.recommendation(f, e, s.location).text)}</p>${
                  prev
                    ? "<p>Daarvoor: " +
                      prev.e.logs
                        .filter((l) => l.done && !l.warmup)
                        .map((l) =>
                          e.type === "strength"
                            ? `${l.weight} kg × ${l.reps}`
                            : `${l.minutes} min`,
                        )
                        .join(" · ") +
                      "</p>"
                    : "<p>Nog één training nodig om te vergelijken.</p>"
                }</details>`;
              })
              .join("")
          : "<p>Je eerste afgeronde training vormt je startpunt. Er worden geen voorbeeldresultaten toegevoegd.</p>",
      ) +
      panel(
        "Getraind in de laatste 7 dagen",
        Object.keys(totals).length
          ? Object.entries(totals)
              .map(
                ([m, n]) =>
                  `<div class="ft-row"><span>${esc(m)}</span><strong>${n} werksets</strong></div>`,
              )
              .join("") +
              '<p class="ft-hint">Sets tellen voor de gekozen hoofdspiergroep. Dit is trainingshistorie, geen meting van herstel.</p>'
          : "<p>Nog geen krachttraining geregistreerd in deze periode.</p>",
      ) +
      panel(
        "Lichaamsmetingen",
        f.measurements.length
          ? f.measurements
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map(
                (m) =>
                  `<div class="ft-row"><span>${fmt(m.date)}<small>${m.weight !== null ? m.weight + " kg" : ""}${m.waist !== null ? " · taille " + m.waist + " cm" : ""}</small></span>${button("Verwijderen", "delete-measurement", m.id)}</div>`,
              )
              .join("")
          : "<p>Optioneel: volg je gewicht en taille over meerdere meetmomenten.</p>",
        button("＋ Meting", "measurement"),
      ) +
      panel(
        "Trainingshistorie",
        sessions.length
          ? sessions
              .map(
                (s) =>
                  `<div class="ft-row"><div><strong>${esc(s.name)}</strong><small>${fmt(s.date)} · ${s.exercises.reduce((n, e) => n + e.logs.filter((l) => l.done && !l.warmup).length, 0)} werksets</small></div>${button("Bekijken", "history", s.id)}</div>`,
              )
              .join("")
          : "<p>Nog geen afgeronde trainingen.</p>",
      ) +
      `<details class="ft-details"><summary>Verwijderde trainingen</summary>${
        f.sessions
          .filter((s) => s.deletedAt)
          .map(
            (s) =>
              `<div class="ft-row"><span>${esc(s.name)} · ${fmt(s.date)}</span>${button("Terugzetten", "restore-session", s.id)}</div>`,
          )
          .join("") || "<p>Geen verwijderde trainingen.</p>"
      }</details>`
    );
  }
  function render() {
    if (!host || !host.isConnected) return;
    const f = data();
    host.innerHTML = `<div id="mementoFitness"><nav class="ft-tabs" aria-label="Fitness">${[
      ["today", "Vandaag"],
      ["plan", "Schema"],
      ["progress", "Voortgang"],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" data-fit="tab" data-id="${id}" aria-pressed="${tab === id}">${label}</button>`,
      )
      .join(
        "",
      )}</nav><div id="ft-notice" hidden role="status"></div><button id="ft-retry" class="life-btn" data-fit="retry" hidden>Opnieuw opslaan</button>${f.active && tab !== "today" ? '<div class="ft-strip"><span>Training bezig: ' + esc(f.active.name) + "</span>" + button("Hervatten", "tab", "today") + "</div>" : ""}${tab === "today" ? today() : tab === "plan" ? plan() : progress()}<div class="ft-footer">Alleen op dit apparaat · opgenomen in je volledige Memento-back-up</div></div>`;
    host.onclick = click;
    host.oninput = input;
    host.onsubmit = submit;
    if (pending) {
      error("Je laatste invoer is nog niet opgeslagen.");
      host.querySelector("#ft-retry").hidden = false;
    }
    tick();
  }
  function dialog(title, body, submitLabel = "Opslaan", form = "") {
    lastFocus = document.activeElement;
    const old = document.getElementById("fitnessDialog");
    old?.remove();
    const el = document.createElement("dialog");
    el.id = "fitnessDialog";
    el.innerHTML = `<form method="dialog" id="ft-form" data-form="${form}"><div class="ft-dialog-head"><h2>${esc(title)}</h2><button type="button" data-fit="close" aria-label="Sluiten">×</button></div><div class="ft-dialog-body">${body}</div><p id="ft-dialog-error" role="alert"></p><div class="ft-dialog-foot">${button("Annuleren", "close")}${submitLabel ? `<button class="life-btn life-btn-primary" type="submit">${submitLabel}</button>` : ""}</div></form>`;
    document.body.appendChild(el);
    el.onclick = click;
    el.onsubmit = submit;
    el.onclose = () => {
      el.remove();
      lastFocus?.focus?.();
    };
    el.addEventListener("cancel", (e) => {
      if (pending) {
        e.preventDefault();
        el.querySelector("#ft-dialog-error").textContent =
          "Sla je invoer eerst opnieuw op.";
      }
    });
    el.showModal();
  }
  function close() {
    document.getElementById("fitnessDialog")?.close();
  }
  function profile() {
    const f = data(),
      p = f.profile;
    dialog(
      "Jouw trainingsritme",
      `<div class="ft-form-grid">${select("Doel", "goal", goals, p.goal)}${field("Locatie", "location", p.location, "text", 'maxlength="100" required')}${field("Trainingen per cyclus", "target", p.target, "number", 'min="1" max="30" step="1" required')}${field("Dagen per cyclus", "cycleDays", p.cycleDays, "number", 'min="1" max="60" step="1" required')}</div><details class="ft-details"><summary>Dienstenrooster (optioneel)</summary><p>V = vroeg, L = laat, N = nacht, R = vrij. Bijvoorbeeld VVLLNNRRRR. Dit patroon herhaalt zich vanaf de startdatum.</p>${field("Startdatum patroon", "shiftStart", p.shiftStart, "date")}${field("Patroon", "shifts", p.shifts, "text", 'maxlength="100" pattern="[VvLlNnRr ]*"')}<label class="ft-checkbox"><input type="checkbox" name="avoidNight"${p.avoidNight ? " checked" : ""}> Geen nachtdienstdagen voorstellen</label></details>${!f.setup ? '<label class="ft-checkbox"><input type="checkbox" name="starter"> Voeg jouw drie trainingen (borst/triceps, rug/biceps en benen/schouders/buik) toe</label>' : ""}<p class="ft-hint">Je doel is een voorkeur. Oefeningen en belasting kies je zelf; de app stelt geen persoonlijk medisch trainingsplan op.</p>`,
      "Opslaan",
      "profile",
    );
  }
  function routineForm(id) {
    const r = data().routines.find((r) => r.id === id);
    editingRoutine = id || "";
    dialog(
      r ? "Schema bewerken" : "Nieuw schema",
      `${field("Naam", "name", r?.name || "", "text", 'required maxlength="120"')}${field("Locatie / apparaatgroep", "location", r?.location || data().profile.location, "text", 'required maxlength="100"')}<label class="ft-field">Notities<textarea name="notes" maxlength="4000">${esc(r?.notes || "")}</textarea></label>${r ? `<div class="ft-editor-list">${r.exercises.map((e, i) => `<div class="ft-row"><div><strong>${esc(e.name)}</strong><small>${e.optional ? "Aanvullend" : "Basis"}${e.group ? " · groep " + esc(e.group) : ""}</small></div><div class="ft-actions">${button("↑", "exercise-up", e.id)}${button("Bewerk", "exercise-edit", e.id)}</div></div>`).join("")}</div>${button("＋ Oefening", "exercise-new", id)}<details class="ft-details"><summary>Beheer</summary>${button("Schema archiveren", "archive", id)}</details>` : ""}`,
      "Opslaan",
      "routine",
    );
  }
  function exerciseForm(id = "", sessionReplacement = false) {
    const f = data(),
      r = f.routines.find((r) => r.id === editingRoutine);
    const e = sessionReplacement
      ? f.active.exercises.find((e) => e.id === id)
      : r?.exercises.find((e) => e.id === id);
    dialog(
      sessionReplacement
        ? "Oefening vervangen"
        : e
          ? "Oefening bewerken"
          : "Oefening toevoegen",
      `<input type="hidden" name="exerciseId" value="${esc(id)}"><input type="hidden" name="replacement" value="${sessionReplacement}">${select("Uit de oefenbibliotheek", "catalog", [["", "Eigen oefening"], ...C.catalog.map((e) => [e.id, e.name])], "")}<div class="ft-form-grid">${field("Naam", "name", e?.name || "", "text", 'required maxlength="120"')}${select(
        "Soort",
        "type",
        [
          ["strength", "Kracht"],
          ["cardio", "Cardio"],
          ["mobility", "Mobiliteit / duur"],
        ],
        e?.type || "strength",
      )}${field("Hoofdspiergroep", "muscle", e?.muscle || "Overig", "text", 'maxlength="80" required')}${field("Apparaat / materiaal", "equipment", e?.equipment || "", "text", 'maxlength="120" required')}${field("Sets", "sets", e?.sets || 3, "number", 'min="1" max="20" required')}${field("Rust (seconden)", "rest", e?.rest ?? 90, "number", 'min="0" max="900" required')}${field("Herhalingen vanaf", "min", e?.min || 8, "number", 'min="1" max="100" required')}${field("Herhalingen tot", "max", e?.max || 12, "number", 'min="1" max="100" required')}${field("Minuten per duurset", "minutes", e?.minutes || 1, "number", 'min="0.1" max="600" step="0.1" required')}${field("Superset / circuitgroep", "group", e?.group || "", "text", 'maxlength="40" placeholder="Bijv. A (optioneel)"')}</div><p class="ft-hint">Herhalingen gelden voor kracht; minuten voor cardio en mobiliteit. Dezelfde groepsnaam koppelt oefeningen visueel.</p><label class="ft-checkbox"><input type="checkbox" name="optional"${e?.optional ? " checked" : ""}> Aanvullend: weglaten in de korte training</label><label class="ft-field">Notitie / stoelstand<textarea name="note" maxlength="4000">${esc(e?.note || "")}</textarea></label>${e && !sessionReplacement ? button("Uit schema halen", "exercise-remove", e.id) : ""}`,
      "Opslaan",
      "exercise",
    );
    const sel = document.querySelector("#fitnessDialog [name=catalog]");
    sel.onchange = () => {
      const x = C.catalog.find((e) => e.id === sel.value);
      if (!x) return;
      for (const key of ["name", "type", "muscle", "equipment"])
        document.querySelector(`#fitnessDialog [name=${key}]`).value = x[key];
      document.querySelector("#fitnessDialog [name=sets]").value =
        x.type === "strength" ? 3 : 1;
      document.querySelector("#fitnessDialog [name=minutes]").value =
        x.type === "cardio" ? 15 : 1;
    };
  }
  let startBooking = "";
  function startForm(id, booking = "") {
    if (data().active) {
      tab = "today";
      render();
      return;
    }
    startBooking = booking;
    dialog(
      "Voor je begint",
      `<input type="hidden" name="routineId" value="${esc(id)}"><div class="ft-form-grid">${select(
        "Energie",
        "energy",
        [
          ["normal", "Normaal"],
          ["low", "Weinig energie"],
          ["high", "Veel energie"],
        ],
        "normal",
      )}${select(
        "Slaap",
        "sleep",
        [
          ["unknown", "Niet invullen"],
          ["good", "Goed geslapen"],
          ["poor", "Minder goed geslapen"],
        ],
        "unknown",
      )}</div><label class="ft-checkbox"><input type="checkbox" name="pain"> Ik heb pijnklachten</label><p>Gewichten vul je zelf in. Eerdere prestaties zijn een referentie, geen verplichting. Bij weinig energie of matige slaap: pas je training aan je gevoel aan.</p><p class="ft-hint">“Over” bij een set is optioneel: hoeveel herhalingen had je nog kunnen doen? 0 betekent geen, 2 betekent ongeveer twee.</p>`,
      "Start training",
      "start",
    );
  }
  function planForm(id) {
    const f = data(),
      b = f.bookings.find((x) => x.id === id);
    if (!C.available(f).length) {
      error("Maak eerst een schema met minstens één oefening.");
      return;
    }
    dialog(
      "Training plannen",
      `<input type="hidden" name="bookingId" value="${esc(id || "")}">${select(
        "Training",
        "routineId",
        C.available(f).map((r) => [r.id, r.name]),
        b?.routineId || C.next(f)?.id,
      )}<div class="ft-form-grid">${field("Datum", "date", b?.date || C.suggestedDates(f)[0] || C.date(), "date", "required")}${field("Tijd (optioneel)", "time", b?.time || "", "time")}</div><p>Beschikbare dagen volgens je fitnessplanning en diensten: ${C.suggestedDates(
        f,
      )
        .map((d) => fmt(d))
        .join(
          ", ",
        )}. Controleer ook je andere afspraken in Agenda.</p>${b ? '<div class="ft-actions">' + button("Training starten", "start-booking", b.id) + button("Planning annuleren", "cancel-booking", b.id) + "</div>" : ""}`,
      "In agenda zetten",
      "booking",
    );
  }
  function historyDialog(id) {
    const s = data().sessions.find((x) => x.id === id);
    dialog(
      s.name,
      `<p>${fmt(s.date)} · ${esc(s.location)}</p>${s.exercises
        .map(
          (e) =>
            `<div class="ft-history-ex"><h3>${esc(e.name)}</h3><p>${
              e.logs
                .filter((l) => l.done)
                .map(
                  (l) =>
                    (l.warmup ? "Opwarming: " : "") +
                    (e.type === "strength"
                      ? `${l.weight} kg × ${l.reps} reps`
                      : `${l.minutes} min${l.distance ? " · " + l.distance + " km" : ""}`),
                )
                .join("<br>") || "Niet uitgevoerd"
            }</p>${e.note ? "<p>" + esc(e.note) + "</p>" : ""}</div>`,
        )
        .join(
          "",
        )}<p>${esc(s.notes)}</p>${button("Naar prullenbak", "delete-session", s.id)}`,
      "",
      "history",
    );
  }
  let undoAction = null;
  function undoable(fn) {
    const before = C.clone(data());
    if (change(fn)) {
      undoAction = before;
      error("Gewijzigd. Je kunt dit ongedaan maken.");
      host
        .querySelector("#ft-notice")
        .insertAdjacentHTML("beforeend", button("Ongedaan maken", "undo"));
    }
  }
  function click(event) {
    const b = event.target.closest("[data-fit]");
    if (!b) return;
    const a = b.dataset.fit,
      id = b.dataset.id || "";
    if (pending && !["retry", "undo"].includes(a)) {
      error(
        "Je invoer is nog niet opgeslagen. Probeer eerst opnieuw op te slaan.",
      );
      document
        .querySelector("#ft-dialog-error")
        ?.replaceChildren(
          document.createTextNode("Opslaan mislukt. Klik nogmaals op Opslaan."),
        );
      return;
    }
    const f = data();
    if (
      a === "toggle-set" &&
      [...host.querySelectorAll("input[data-field]")].some(
        (el) => !el.checkValidity(),
      )
    ) {
      error("Controleer eerst de gemarkeerde getallen.");
      host.querySelector("input:invalid")?.reportValidity();
      return;
    }
    if (["exercise-new", "exercise-edit", "exercise-up"].includes(a)) {
      const form = document.querySelector("#fitnessDialog [data-form=routine]");
      if (form) {
        if (!form.reportValidity()) return;
        const v = Object.fromEntries(new FormData(form));
        if (
          !commit((f) => {
            const r = f.routines.find((r) => r.id === editingRoutine);
            Object.assign(r, {
              name: v.name.trim(),
              location: v.location.trim(),
              notes: v.notes,
            });
          })
        )
          return;
      }
    }
    if (a === "tab") {
      tab = id;
      render();
    } else if (a === "duration") {
      selectedMinutes = Number(id);
      render();
    } else if (a === "profile") profile();
    else if (a === "close") close();
    else if (a === "starter") {
      if (!confirm("Jouw A/B/C-cyclus activeren? Ontbrekende schema’s worden toegevoegd. Je bestaande rooster, overige schema’s, afspraken en trainingsresultaten blijven bewaard.")) return;
      if (change((f) => {
        const proposed = C.starter();
        const fresh = proposed.filter((r) => !f.routines.some((old) => !old.archived && old.name === r.name));
        f.routines.push(...fresh);
        f.routineCycle = personalSplitNames.map((name) => f.routines.find((r) => !r.archived && r.name === name).id);
        f.profile.goal = "muscle"; f.profile.cycleDays = 7; f.profile.target = 5;
        if (!f.profile.shiftStart) {
          f.profile.shiftStart = "2026-10-28";
          f.profile.shifts = "VVLLRNNRRR"; f.profile.avoidNight = true;
        }
        f.setup = true; f.nextRoutineId = f.routineCycle[0];
      })) { tab = "plan"; render(); }
    } else if (a === "toggle-cycle") {
      change((draft) => {
        const cycle = C.rotation(draft).map((r) => r.id), i = cycle.indexOf(id);
        if (i >= 0) {
          if (cycle.length === 1) throw Error("Houd minstens één schema actief in de cyclus.");
          cycle.splice(i, 1);
        } else {
          if (!draft.routines.some((r) => r.id === id && !r.archived && r.exercises.length))
            throw Error("Voeg eerst oefeningen toe aan dit schema.");
          cycle.push(id);
        }
        draft.routineCycle = cycle;
        if (!cycle.includes(draft.nextRoutineId)) draft.nextRoutineId = cycle[0] || "";
      });
    } else if (a === "routine-new") routineForm();
    else if (a === "routine-edit") routineForm(id);
    else if (a === "exercise-new") {
      close();
      exerciseForm();
    } else if (a === "exercise-edit") {
      close();
      exerciseForm(id);
    } else if (a === "replace") {
      if (
        f.active.exercises.find((e) => e.id === id).logs.some((l) => l.done)
      ) {
        error(
          "Deze oefening heeft afgevinkte sets. Maak die eerst ongedaan om te vervangen.",
        );
        return;
      }
      exerciseForm(id, true);
    } else if (a === "exercise-up") {
      if (
        change((f) => {
          const r = f.routines.find((r) => r.id === editingRoutine),
            i = r.exercises.findIndex((e) => e.id === id);
          if (i > 0)
            [r.exercises[i - 1], r.exercises[i]] = [
              r.exercises[i],
              r.exercises[i - 1],
            ];
        }, false)
      )
        routineForm(editingRoutine);
    } else if (a === "exercise-remove") {
      if (!confirm("Uit dit schema halen? Eerdere trainingen blijven bewaard."))
        return;
      if (
        change((f) => {
          const r = f.routines.find((r) => r.id === editingRoutine);
          r.exercises = r.exercises.filter((e) => e.id !== id);
        })
      ) {
        close();
        routineForm(editingRoutine);
      }
    } else if (a === "archive") {
      if (
        !confirm(
          "Schema archiveren? Geplande trainingen voor dit schema worden geannuleerd.",
        )
      )
        return;
      if (
        change((f) => {
          f.routines.find((r) => r.id === id).archived = true;
          f.bookings
            .filter((b) => b.routineId === id && b.status === "planned")
            .forEach((b) => (b.status = "cancelled"));
        })
      ) {
        close();
      }
    } else if (a === "restore-routine")
      change((f) => (f.routines.find((r) => r.id === id).archived = false));
    else if (a === "next") change((f) => (f.nextRoutineId = id));
    else if (a === "start") startForm(id);
    else if (a === "plan-new") planForm();
    else if (a === "booking") planForm(id);
    else if (a === "start-booking") {
      const booking = f.bookings.find((b) => b.id === id);
      close();
      startForm(booking.routineId, id);
    } else if (a === "restore-booking")
      change((f) => {
        const b = f.bookings.find((b) => b.id === id);
        if (!C.available(f).some((r) => r.id === b.routineId))
          throw Error("Zet het bijbehorende schema eerst terug.");
        b.status = "planned";
      });
    else if (a === "cancel-booking") {
      if (
        change(
          (f) => (f.bookings.find((b) => b.id === id).status = "cancelled"),
        )
      )
        close();
    } else if (a === "toggle-set") {
      const ex = f.active.exercises.find((e) => e.id === b.dataset.ex),
        l = ex.logs.find((l) => l.id === id);
      if (
        !l.done &&
        ((ex.type === "strength" &&
          (l.weight === null || l.reps === null || l.reps < 1)) ||
          (ex.type !== "strength" && !(l.minutes > 0)))
      ) {
        error(
          "Vul eerst " +
            (ex.type === "strength"
              ? "gewicht (0 mag) en herhalingen"
              : "een duur groter dan 0") +
            " in.",
        );
        return;
      }
      change((f) => {
        const e = f.active.exercises.find((e) => e.id === ex.id),
          x = e.logs.find((l) => l.id === id);
        x.done = !x.done;
        f.active.restUntil = x.done ? Date.now() + e.rest * 1000 : 0;
      });
    } else if (a === "add-set" || a === "warmup")
      change((f) => {
        const e = f.active.exercises.find((e) => e.id === id);
        if (e.logs.length >= 40) throw Error("Maximaal 40 sets per oefening.");
        e.logs.push({
          id: C.uid(),
          weight: null,
          reps: null,
          minutes: e.type === "strength" ? null : e.minutes,
          distance: null,
          rir: null,
          warmup: a === "warmup",
          done: false,
        });
      });
    else if (a === "stop-rest") change((f) => (f.active.restUntil = 0));
    else if (a === "finish") {
      const n = f.active.exercises.reduce(
        (n, e) => n + e.logs.filter((l) => !l.done && !l.warmup).length,
        0,
      );
      if (
        !confirm(
          (n
            ? n +
              " werksets zijn niet afgevinkt. Alleen uitgevoerde sets tellen mee. "
            : "") + "Training afronden?",
        )
      )
        return;
      change(C.finish);
    } else if (a === "later") {
      tab = "plan";
      render();
    } else if (a === "cancel") {
      if (confirm("Deze actieve training annuleren?"))
        undoable((f) => (f.active = null));
    } else if (a === "undo") {
      if (
        undoAction &&
        commit((f) => {
          Object.keys(f).forEach((k) => delete f[k]);
          Object.assign(f, C.clone(undoAction));
        })
      ) {
        undoAction = null;
        render();
      }
    } else if (a === "retry") {
      if (commit(() => {})) render();
    } else if (a === "measurement")
      dialog(
        "Lichaamsmeting",
        `${field("Datum", "date", C.date(), "date", "required")}<div class="ft-form-grid">${field("Gewicht (kg)", "weight", "", "number", 'min="1" max="500" step="0.1"')}${field("Taille (cm)", "waist", "", "number", 'min="1" max="500" step="0.1"')}</div>`,
        "Bewaren",
        "measurement",
      );
    else if (a === "delete-measurement")
      undoable(
        (f) => (f.measurements = f.measurements.filter((m) => m.id !== id)),
      );
    else if (a === "history") historyDialog(id);
    else if (a === "delete-session") {
      if (confirm("Training naar de prullenbak verplaatsen?")) {
        if (
          change(
            (f) =>
              (f.sessions.find((s) => s.id === id).deletedAt =
                new Date().toISOString()),
          )
        )
          close();
      }
    } else if (a === "restore-session")
      change((f) => (f.sessions.find((s) => s.id === id).deletedAt = ""));
  }
  function input(event) {
    const el = event.target;
    if (el.dataset.field) {
      if (!el.checkValidity()) {
        error(
          "Controleer het getal; gebruik een waarde binnen het aangegeven bereik.",
        );
        return;
      }
      commit((f) => {
        const e = f.active.exercises.find((e) => e.id === el.dataset.ex),
          l = e.logs.find((l) => l.id === el.dataset.log);
        l[el.dataset.field] = el.value === "" ? null : Number(el.value);
      });
    } else if (el.dataset.note !== undefined)
      commit(
        (f) =>
          (f.active.exercises.find((e) => e.id === el.dataset.note).note =
            el.value),
      );
    else if (el.hasAttribute("data-session-note"))
      commit((f) => (f.active.notes = el.value));
  }
  function submit(event) {
    const form = event.target;
    if (!form.dataset.form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (pending) {
      if (commit(() => {})) {
        close();
        render();
      }
      return;
    }
    const v = Object.fromEntries(new FormData(form)),
      kind = form.dataset.form;
    let ok = false,
      after = null;
    try {
      if (kind === "profile")
        ok = commit((f) => {
          f.profile = {
            goal: v.goal,
            location: v.location.trim(),
            target: +v.target,
            cycleDays: +v.cycleDays,
            shiftStart: v.shiftStart,
            shifts: v.shifts.toUpperCase().trim(),
            avoidNight: v.avoidNight === "on",
          };
          if (v.starter === "on") {
            const plans = C.starter().map((r) => ({ ...r, location: f.profile.location }));
            f.routines.push(...plans.filter((r) => !f.routines.some((old) => !old.archived && old.name === r.name)));
            f.routineCycle = personalSplitNames.map((name) => f.routines.find((r) => !r.archived && r.name === name).id);
            f.nextRoutineId = f.routineCycle[0];
          }
          f.setup = true;
        });
      if (kind === "routine") {
        let id = editingRoutine || C.uid();
        ok = commit((f) => {
          let r = f.routines.find((r) => r.id === id);
          if (!r) {
            r = { id, exercises: [], archived: false };
            f.routines.push(r);
          }
          Object.assign(r, {
            name: v.name.trim(),
            location: v.location.trim(),
            notes: v.notes,
          });
          f.setup = true;
        });
        after = () => {
          editingRoutine = id;
          tab = "plan";
          render();
          routineForm(id);
        };
      }
      if (kind === "exercise") {
        ok = commit((f) => {
          const replacement = v.replacement === "true",
            r = f.routines.find((r) => r.id === editingRoutine),
            list = replacement ? f.active.exercises : r.exercises,
            old = list.find((e) => e.id === v.exerciseId),
            cat = C.catalog.find((e) => e.id === v.catalog);
          const e = {
            ...(old ||
              C.exercise(
                cat || {
                  name: v.name,
                  type: v.type,
                  muscle: v.muscle,
                  equipment: v.equipment,
                },
              )),
            name: v.name.trim(),
            type: v.type,
            muscle: v.muscle.trim(),
            equipment: v.equipment.trim(),
            sets: +v.sets,
            min: +v.min,
            max: +v.max,
            rest: +v.rest,
            minutes: +v.minutes,
            optional: v.optional === "on",
            group: v.group,
            note: v.note,
          };
          if (cat) e.cue = cat.cue;
          // A changed movement gets a new identity; historical machine/variant comparisons stay separate.
          if (
            old &&
            (old.name !== e.name ||
              old.type !== e.type ||
              old.equipment !== e.equipment)
          )
            e.id = C.uid();
          if (replacement)
            e.logs = Array.from({ length: e.sets }, () => ({
              id: C.uid(),
              weight: null,
              reps: null,
              minutes: e.type === "strength" ? null : e.minutes,
              distance: null,
              rir: null,
              warmup: false,
              done: false,
            }));
          if (old) list[list.indexOf(old)] = e;
          else list.push(e);
        });
        after =
          v.replacement === "true" ? null : () => routineForm(editingRoutine);
      }
      if (kind === "start") {
        ok = commit((f) =>
          C.start(
            f,
            v.routineId,
            selectedMinutes,
            { energy: v.energy, sleep: v.sleep, pain: v.pain === "on" },
            startBooking,
          ),
        );
        tab = "today";
      }
      if (kind === "booking")
        ok = commit((f) => {
          const b = f.bookings.find((b) => b.id === v.bookingId);
          if (b)
            Object.assign(b, {
              routineId: v.routineId,
              date: v.date,
              time: v.time,
            });
          else
            f.bookings.push({
              id: C.uid(),
              routineId: v.routineId,
              date: v.date,
              time: v.time,
              status: "planned",
              sessionId: "",
            });
        });
      if (kind === "measurement")
        ok = commit((f) => {
          if (v.weight === "" && v.waist === "")
            throw Error("Vul minstens één meting in.");
          f.measurements.push({
            id: C.uid(),
            date: v.date,
            weight: v.weight === "" ? null : +v.weight,
            waist: v.waist === "" ? null : +v.waist,
          });
        });
    } catch (e) {
      form.querySelector("#ft-dialog-error").textContent = e.message;
      return;
    }
    if (ok) {
      close();
      render();
      after?.();
    } else
      form.querySelector("#ft-dialog-error").textContent =
        host.querySelector("#ft-notice")?.textContent ||
        "Controleer je invoer.";
  }
  function tick() {
    const el = document.getElementById("ft-clock");
    if (!el || !bridge) return;
    const t = data().active?.restUntil || 0,
      n = Math.max(0, Math.ceil((t - Date.now()) / 1000));
    el.textContent = n
      ? `Rust · ${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`
      : t
        ? "Rust voorbij · klaar voor je volgende set"
        : "Rust begint na het afvinken";
  }
  function dayHTML(f, date, carry = false) {
    if (!f) return "";
    const resume =
      f.active && date === C.date()
        ? `<section class="ft-day"><div class="ft-row"><div><strong>${esc(f.active.name)}</strong><small>Training bezig · invoer bewaard</small></div><button type="button" class="life-btn" data-fitness-resume>Hervatten</button></div></section>`
        : "";
    const b = f.bookings.filter(
      (b) =>
        b.status === "planned" && (b.date === date || (carry && b.date < date)),
    );
    return (
      resume +
      (b.length
        ? `<section class="ft-day"><div class="ft-kicker">FITNESS</div>${b.map((b) => `<div class="ft-row"><div><strong>${esc(routineLabel(f, b.routineId))}</strong><small>${b.date < date ? "Nog te plannen · " + fmt(b.date) : b.time || "Tijd zelf kiezen"}</small></div><button type="button" class="life-btn" data-fitness-booking="${esc(b.id)}">Open</button></div>`).join("")}</section>`
        : "")
    );
  }
  window.MementoFitness = {
    mount(el, b) {
      host = el;
      bridge = b;
      render();
      if (!clock) clock = setInterval(tick, 1000);
    },
    dayHTML,
    dayCount: (f, d) =>
      f?.bookings.filter((b) => b.status === "planned" && b.date === d)
        .length || 0,
    openBooking(id) {
      tab = "today";
      render();
      planForm(id);
    },
    resume() {
      tab = "today";
      render();
    },
    hasPending: () => Boolean(pending),
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-fitness-resume]")) {
      window.MementoFitnessBridge?.open();
      window.MementoFitness.resume();
      return;
    }
    const b = e.target.closest("[data-fitness-booking]");
    if (b) {
      window.MementoFitnessBridge?.open();
      window.MementoFitness.openBooking(b.dataset.fitnessBooking);
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (pending) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  new MutationObserver(() => {
    if (document.body.classList.contains("pin-locked"))
      document.getElementById("fitnessDialog")?.close();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
