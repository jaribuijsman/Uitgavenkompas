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
    clock = null,lastExerciseId="";
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
    if (r && selectedMinutes === 25 && C.shortExercises(r).length === r.exercises.length)
      selectedMinutes = 45;
    return (
      splitOffer(f) +
      ('<div class="ft-shift-hint">Vandaag: '+C.duty(C.date()).code+' · '+esc(C.duty(C.date()).label)+' · '+esc(C.duty(C.date()).time)+'</div>') +
      panel(
        r ? esc(r.name) : "Je eerste training",
        r
          ? `<div class="ft-kicker">VOLGENDE IN JE SCHEMA</div><p>${esc(r.location)} · ${r.exercises.length} oefeningen</p><div class="ft-choices" aria-label="Training kiezen">${(C.shortExercises(r).length < r.exercises.length
              ? [[25, "Kort · " + C.shortExercises(r).length + " oefeningen"], [45, "Volledig"]]
              : [[45, "Volledig"]])
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
      panel("Spieropbouw · jouw huidige niveau",
        '<p>Je traint al ongeveer een maand 3–4 keer per week. Het bijgewerkte A/B/C-programma heeft 10, 10 en 13 werksets, met herhalingsbereiken en rusttijden. Je huidige schema’s veranderen alleen na je bevestiging.</p>' +
        '<div class="ft-actions">' + button("Voorgesteld schema toepassen", "apply-hypertrophy") + '</div>') +
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
  function muscleMark(e) {
    const muscle = String(e?.muscle || "").toLocaleLowerCase("nl");
    const points = /borst/.test(muscle) ? [18, 18] :
      /rug/.test(muscle) ? [18, 21] :
      /schouder/.test(muscle) ? [10, 17] :
      /triceps|biceps|armen/.test(muscle) ? [6, 23] :
      /benen|achterzijde/.test(muscle) ? [14, 34] : [18, 26];
    return '<span class="ft-muscle-icon" aria-hidden="true"><svg viewBox="0 0 36 44" width="30" height="40" fill="none">' +
      '<circle cx="18" cy="7" r="4" stroke="currentColor" stroke-width="1.7"/>' +
      '<path d="M13 14L8 17L4 28M23 14L28 17L32 28M13 14L12 27L10 41M23 14L24 27L26 41M12 27H24M13 14H23" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + points[0] + '" cy="' + points[1] +
      '" r="4.2" fill="#b9cebd" stroke="#203328" stroke-width="1.1"/></svg></span>';
  }
  function findExercise(id) {
    const f = data();
    return f.active?.exercises.find((e) => e.id === id) ||
      f.routines.flatMap((r) => r.exercises).find((e) => e.id === id);
  }
  function guideDialog(id) {
    const e = findExercise(id);
    if (!e) return error("Deze oefening is niet meer beschikbaar.");
    const known = C.knownExercise(e), demo = known?.demo ||
      "https://www.strengthlog.com/exercise-directory/";
    const searched = known ? "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(known.name + " exercise technique") : "";
    dialog("Oefening uitgelegd",
      '<div class="ft-guide-head">' + muscleMark(e) +
        '<div><h3>' + esc(e.name) + '</h3><p>' + esc(e.muscle) + ' · ' +
        esc(e.equipment) + '</p></div></div>' +
      '<h3>Zo voer je hem uit</h3><p>' +
        esc(known?.cue || e.cue || "Begin met een comfortabel gewicht en voer de beweging beheerst uit.") +
      '</p><p class="ft-hint">Stel apparaten passend af. Stop bij pijn. Een instructie vervangt geen begeleiding bij het leren van een oefening.</p>' +
      '<div class="ft-actions"><a class="life-btn life-btn-primary" href="' +
        esc(demo) + '" target="_blank" rel="noopener noreferrer">Foto’s en uitleg ↗</a>' +
        (searched ? '<a class="life-btn" href="' + esc(searched) +
        '" target="_blank" rel="noopener noreferrer">Zoek demonstratievideo ↗</a>' : '') + '</div>' +
      '<p class="ft-hint">De korte uitleg werkt offline. De externe demonstraties vereisen internet.</p>',
      "", "guide");
  }
  function alternativesDialog(id) {
    const e = data().active?.exercises.find((e) => e.id === id);
    if (!e) return error("Geen actieve oefening gevonden.");
    if (e.logs.some((l) => l.done)) return error("Maak eerst de afgevinkte sets ongedaan voordat je vervangt.");
    const candidates = C.alternativeOptions(e);
    dialog("Oefening vervangen",
      '<p>Alleen voor deze training. Je vaste schema en eerdere resultaten veranderen niet.</p>' +
      (candidates.length ? candidates.map((x) =>
        '<div class="ft-row"><div><strong>' + esc(x.name) + '</strong><small>' +
          esc(x.equipment) + ' · ' + esc(x.muscle) + '</small></div>' +
          '<button type="button" class="life-btn" data-fit="replace-with" data-ex="' +
          esc(e.id) + '" data-id="' + esc(x.id) + '">Kiezen</button></div>'
        ).join("") : '<p>Geen gecontroleerd vergelijkbaar alternatief in de bibliotheek.</p>') +
      '<div class="ft-actions">' + button("Zelf een oefening kiezen", "replace", e.id) + '</div>',
      "", "alternatives");
  }
  function session() {
    const f = data(), s = f.active,
      done = s.exercises.reduce((n, e) => n + e.logs.filter((l) => l.done && !l.warmup).length, 0),
      total = s.exercises.reduce((n, e) => n + e.logs.filter((l) => !l.warmup).length, 0);
    return (
      '<div class="ft-session-head"><div><h2>' + esc(s.name) + '</h2><p>' +
      esc(s.location) + ' · ' + done + ' / ' + total + ' werksets afgerond</p></div>' +
      button("Afronden", "finish", "", true) + '</div>' +
      '<div class="ft-session-progress"><span>'+done+' van '+total+' geplande werksets afgerond</span><div class="ft-session-track" role="progressbar" aria-label="Afgeronde werksets" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+done+'"><span style="width:'+(total?done*100/total:0).toFixed(1)+'%"></span></div></div>' +
      '<div class="ft-timer" role="timer" aria-label="Rusttimer"><span id="ft-clock">Rusttimer</span>' +
      button("Rust beëindigen", "stop-rest")+button("−15 sec", "adjust-rest", "-15")+button("+15 sec", "adjust-rest", "15") + '</div>' +
      (s.checkin.pain ? '<p class="ft-warning">Je hebt pijn gemeld. Er worden geen verhogingen voorgesteld. Stop een pijnlijke oefening.</p>' : '') +
      '<div class="ft-session-controls">' +
        '<button type="button" class="life-btn" data-fit="next-open-set">Volgende set</button>' +
        button(showRir ? "Over verbergen" : "Herhalingen over tonen", "toggle-rir") +
        '<span class="ft-hint">Gewichten en herhalingen worden direct bewaard.</span></div>' +
      s.exercises.map((e, i) => {
        const rec = C.recommendation(f, e, s.location);
        const prior = C.history(f, e, s.location, e.equipment)[0];
        const pastSets=prior?.e.logs.filter(l=>l.done&&!l.warmup)||[];let workIndex=0;
        const prev = prior?.e.logs.filter((l) => l.done && !l.warmup)
          .map((l) => e.type === "strength" ? l.weight + " kg × " + l.reps : l.minutes + " min")
          .join(" · ") || "";
        if (rec.increase && (s.checkin.pain || s.checkin.energy === "low" || s.checkin.sleep === "poor"))
          rec.text = "Vandaag geen verhoging voorgesteld. Stem de belasting af op je herstel.";
        return '<section class="life-panel ft-panel ft-exercise-panel" id="ft-exercise-' + esc(e.id) + '">' +
          '<div class="ft-exercise-head">' + muscleMark(e) +
            '<div class="ft-exercise-title"><span class="ft-kicker">OEFENING ' + (i + 1) + ' VAN ' +
              s.exercises.length + '</span><h2>' + esc(e.name) + '</h2>' +
              '<p>' + esc(e.equipment) + ' · ' + esc(e.muscle) + '</p></div>' +
            button("Uitleg", "guide", e.id) + '</div>' +
          '<p class="ft-prescription">Doel: '+e.sets+' × '+(e.type==='strength'?e.min+'–'+e.max+' herhalingen':e.minutes+' minuten')+' · Rust '+e.rest+' sec.</p>'+
          (prev ? '<p class="ft-prev">Vorige meting: '+esc(fmt(prior.s.date))+' · '+esc(e.equipment)+' · '+esc(prior.s.location)+'. Resultaten staan als referentie bij je sets.</p>' :
            '<p class="ft-prev">Eerste registratie met dit apparaat.</p>') +
          '<div class="ft-sets">' + e.logs.map((l, j) => logRow(e, l, j, l.warmup?null:pastSets[workIndex++])).join("") + '</div>' +
          (rec.increase ? '<p class="ft-hint ft-progress-hint">' + esc(rec.text) + '</p>' : '') +
          '<div class="ft-actions ft-exercise-actions">' + button("Ander apparaat", "machine", e.id)+button("Andere uitvoering", "alternatives", e.id) +
            '<details class="ft-more-actions"><summary>Meer</summary><div class="ft-actions">' +
              button("＋ Werkset", "add-set", e.id) + button("＋ Opwarmset", "warmup", e.id) +
              button("Andere oefening kiezen", "replace", e.id) + '</div></details></div>' +
          '<details class="ft-details"><summary>Notitie en uitvoering</summary>' +
            '<p>' + esc(e.cue || "Kies een beheerst tempo en een comfortabele uitvoering.") + '</p>' +
            '<label class="ft-field">Notitie<textarea data-note="' + esc(e.id) +
            '" maxlength="4000">' + esc(e.note) + '</textarea></label></details></section>';
      }).join("") +
      panel("Training afronden",
        '<label class="ft-field">Trainingnotitie<textarea id="ft-session-note" data-session-note maxlength="4000">' +
          esc(s.notes) + '</textarea></label>' + window.MementoDictation.button('ft-session-note') + '<div class="ft-actions">' +
          button("Afronden", "finish", "", true) + button("Later verder", "later") + '</div>' +
        '<details class="ft-details"><summary>Training annuleren</summary>' +
          '<p>Annuleren kun je direct ongedaan maken.</p>' + button("Annuleer training", "cancel") + '</details>')
    );
  }
  function logRow(e, l, j, previous=null) {
    const input = (k, label, value, step, max) =>
      `<label class="${k === "rir" ? "ft-rir-field" : ""}">${label}<input aria-label="${esc(e.name)} set ${j + 1} ${label}" type="number" inputmode="${k==='reps'||k==='rir'?'numeric':'decimal'}" min="0" max="${max}" step="${step}" data-ex="${esc(e.id)}" data-log="${esc(l.id)}" data-field="${k}" value="${value ?? ""}"${l.done ? " disabled" : ""}></label>`;
    return `<div class="ft-set${l.done ? " is-done" : ""}" data-set-row="${esc(l.id)}"><div class="ft-set-label">${l.warmup ? "W" : "Set " + (j + 1)}</div><div class="ft-set-fields">${e.type === "strength" ? input("weight", "kg", l.weight, 0.25, 100000) + input("reps", "reps", l.reps, 1, 1000) + input("rir", "over", l.rir, 1, 10) : input("minutes", "min", l.minutes, 0.1, 600) + (e.type === "cardio" ? input("distance", "km", l.distance, 0.01, 10000) : "")}</div><button type="button" class="ft-check" data-fit="toggle-set" data-ex="${esc(e.id)}" data-id="${esc(l.id)}" aria-label="${esc(e.name)} set ${j + 1} ${l.done ? "weer openen" : "afvinken"}" aria-pressed="${l.done}">${l.done ? "✓" : "○"}</button>${previous?`<span class="ft-set-reference">Vorige set: ${esc(e.type==="strength"?(previous.weight??"—")+" kg × "+(previous.reps??"—"):(previous.minutes??"—")+" min")}</span>`:""}</div>`;
  }
  function smallChart(points, unit, label) {
    if (!points.length) return '<p>Er zijn nog geen metingen.</p>';
    const vals = points.slice(-8).map((p) => p.value),
      min = Math.min(...vals), max = Math.max(...vals),
      spread = max - min || Math.max(1, max * .1),
      coords = vals.map((v, i) => ({
        x: 18 + i * 264 / Math.max(1, vals.length - 1),
        y: 86 - ((v - min) / spread) * 60,
      }));
    const pairs = coords.map((c) => c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" "),
      dot = coords.map((c) => '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) +
        '" r="3.5" fill="#b9cebd" stroke="#203328" stroke-width="1.5"/>').join("");
    return '<div class="ft-chart"><svg viewBox="0 0 300 105" role="img" aria-label="' + esc(label) +
      '. ' + vals.length + ' meetpunten van ' + min + ' tot ' + max + ' ' + esc(unit) + '">' +
      '<path d="M18 86H282" stroke="#597363" stroke-width="1"/>' +
      (coords.length > 1 ? '<polyline fill="none" stroke="#b9cebd" stroke-width="3" stroke-linejoin="round" points="' +
      pairs + '"/>' : '') + dot + '</svg><div class="ft-chart-labels"><span>' +
      esc(points.at(-vals.length).date || '') + '</span><span>' +
      esc(points.at(-1).date || '') + '</span></div></div>';
  }
  function progress() {
    const f = data(), sessions = f.sessions.filter((s) => !s.deletedAt).slice()
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
      records = new Map(), muscleSets = {}, frequency = Array(6).fill(0);
    for (const session of sessions) {
      const since = C.days(session.date, C.date());
      if (since >= 0 && since < 42) frequency[5 - Math.floor(since / 7)]++;
      for (const e of session.exercises) {
        const worked = e.logs.filter((l) => l.done && !l.warmup);
        if (since >= 0 && since < 7 && e.type === "strength")
          muscleSets[e.muscle] = (muscleSets[e.muscle] || 0) + worked.length;
        if (!worked.length || e.type !== "strength") continue;
        const key = C.comparisonKey(e, session.location);
        if (!records.has(key)) records.set(key, {
          name: e.name, location: session.location, equipment: e.equipment, points: [],
        });
        const eligible = worked.filter((l) => l.weight !== null && l.reps !== null);
        if (!eligible.length) continue;
        const best = eligible.reduce((a, b) =>
          b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a);
        records.get(key).points.push({
          date: fmt(session.date), weight: best.weight, reps: best.reps, time: session.finishedAt,
        });
      }
    }
    const sorted = [...records.entries()].filter(([key, v]) => v.points.length)
      .sort((a, b) => a[1].name.localeCompare(b[1].name, "nl"));
    const selected = sorted.find(([key]) => key === progressKey) || sorted[0];
    const rec = selected?.[1];
    const points = rec ? rec.points.slice().reverse() : [];
    const bodyOnly = points.length && points.every((p) => p.weight === 0);
    const previousPoint=points.length>1?points[points.length-2]:null,lastPoint=points.at(-1);
    const delta=previousPoint&&lastPoint?(bodyOnly?lastPoint.reps-previousPoint.reps:lastPoint.weight-previousPoint.weight):null;
    const measures = f.measurements.filter((m) => m.weight !== null).slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({ date: fmt(m.date), value: m.weight }));
    const maxWeek = Math.max(1, ...frequency);
    const weekGraph = '<div class="ft-week-bars" role="img" aria-label="Afgeronde trainingen in de laatste zes perioden van zeven dagen: ' +
      frequency.join(", ") + '">' + frequency.map((n, i) =>
        '<div class="ft-week-col"><div class="ft-week-bar" style="height:' +
        Math.max(n ? 10 : 3, n * 84 / maxWeek).toFixed(1) + 'px"></div>' +
        '<span>' + n + '</span><small>' + (i === 5 ? "Nu" : "-" + (5 - i) + "w") +
        '</small></div>').join("") + '</div>';
    return (
      '<div class="ft-stats"><div><strong>' + sessions.length +
      '</strong><span>Trainingen totaal</span></div><div><strong>' +
      sessions.filter((s) => {const n=C.days(s.date,C.date());return n>=0&&n<7}).length +
      '</strong><span>Laatste 7 dagen</span></div></div>' +
      panel("Trainingsfrequentie", weekGraph +
        '<p class="ft-hint">Aantal afgeronde trainingen per periode van zeven dagen.</p>') +
      panel("Sterker worden per oefening",
        (selected ? '<label class="ft-field">Kies oefening en apparaat<select id="ft-progress-select" aria-label="Kies oefening">' +
          sorted.map(([key, x]) => '<option value="' + esc(key) + '"' +
            (key === selected[0] ? ' selected' : '') + '>' + esc(x.name + ' · ' + x.equipment + ' · ' +
              x.location) + '</option>').join("") + '</select></label>' +
          '<p class="ft-hint">Vergelijkbare resultaten van hetzelfde soort apparaat en dezelfde locatie.</p>' +
          smallChart(points.map((p) => ({
            date: p.date, value: bodyOnly ? p.reps : p.weight,
          })), bodyOnly ? "herhalingen" : "kg", "Beste set per training") +
          '<div class="ft-chart-facts"><span>Laatste: <strong>' +
            (bodyOnly ? points.at(-1).reps + ' herh.' : points.at(-1).weight + ' kg × ' + points.at(-1).reps) +
            '</strong></span><span>Beste: <strong>' +
            (bodyOnly ? Math.max(...points.map((p) => p.reps)) + ' herh.' :
              Math.max(...points.map((p) => p.weight)) + ' kg') + '</strong></span></div>' +
          '<p class="ft-hint">Beste uitgevoerde set per sessie; dit is geen voorspelling van je maximale kracht.</p>' + (delta===null ? '' : '<p class="ft-change">Verschil met vorige training: <strong>'+(delta>0?'+':'')+delta.toLocaleString('nl-NL')+(bodyOnly?' herhalingen':' kg')+'</strong> · zelfde oefening, apparaat en locatie. Eén meting is geen trend.</p>')
        : '<p>Na je eerste afgeronde training verschijnt hier een grafiek. Er worden geen voorbeeldmetingen toegevoegd.</p>')) +
      panel("Spieropbouw · voeding en gewicht",
        '<p>Bij 64 kg en stabiel gewicht: probeer als start ongeveer 250 kcal per dag extra en 110–130 g eiwit. Vergelijk je gemiddelde ochtendgewicht per week. Als het na 2–3 weken niet stijgt, overweeg circa 100–150 kcal extra.</p>' +
        '<p class="ft-hint">Dit zijn richtwaarden, geen berekende caloriebehoefte. Er wordt niets automatisch bijgehouden of naar een externe dienst verstuurd.</p>') +
      panel("Werksets per hoofdspiergroep · 7 dagen",
        Object.keys(muscleSets).length ? Object.entries(muscleSets)
          .sort((a,b)=>b[1]-a[1]).map(([m,n]) =>
            '<div class="ft-row"><span>' + esc(m) + '</span><strong>' + n +
            ' werksets</strong></div>').join("") +
            '<p class="ft-hint">Dit is geregistreerde belasting, geen herstelmeting.</p>' :
          '<p>In deze periode zijn nog geen werksets geregistreerd.</p>') +
      panel("Lichaamsmetingen",
        (measures.length > 1 ? smallChart(measures, "kg", "Lichaamsgewicht in kg") : "") +
        (f.measurements.length ? f.measurements.slice().sort((a,b) => b.date.localeCompare(a.date))
          .slice(0, 10).map((m) =>
            '<div class="ft-row"><span>' + fmt(m.date) + '<small>' +
              (m.weight !== null ? m.weight + " kg" : "") +
              (m.waist !== null ? " · taille " + m.waist + " cm" : "") +
            '</small></span>' + button("Verwijderen", "delete-measurement", m.id) + '</div>').join("") :
          "<p>Optioneel: volg je gewicht en taille.</p>"), button("＋ Meting", "measurement")) +
      panel("Trainingshistorie",
        sessions.length ? sessions.map((s) =>
          '<div class="ft-row"><div><strong>' + esc(s.name) + '</strong><small>' +
          fmt(s.date) + ' · ' + s.exercises.reduce((n,e) => n +
          e.logs.filter((l)=>l.done&&!l.warmup).length,0) +
          ' werksets</small></div>' + button("Bekijken","history",s.id) + '</div>').join("") :
        '<p>Nog geen afgeronde trainingen.</p>') +
      '<details class="ft-details"><summary>Verwijderde trainingen</summary>' +
      (f.sessions.filter((s)=>s.deletedAt).map((s) =>
        '<div class="ft-row"><span>' + esc(s.name) + ' · ' + fmt(s.date) +
        '</span>' + button("Terugzetten", "restore-session", s.id) + '</div>').join("") ||
        '<p>Geen verwijderde trainingen.</p>') + '</details>'
    );
  }
  function render() {
    if (!host || !host.isConnected) return;
    const f = data();
    host.innerHTML = `<div id="mementoFitness" class="${showRir ? "ft-show-rir" : ""}"><nav class="ft-tabs" aria-label="Fitness">${[
      ["today", "Vandaag"],
      ["plan", "Schema"],
      ["progress", "Voortgang"],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" data-fit="tab" data-id="${id}" aria-pressed="${tab === id}">${window.MementoIllustratedIcons?.svg(id==="today"?"sun":id==="plan"?"tasks":"analysis")||""}<span>${label}</span></button>`,
      )
      .join(
        "",
      )}</nav><div id="ft-notice" hidden role="status"></div><button id="ft-retry" class="life-btn" data-fit="retry" hidden>Opnieuw opslaan</button>${f.active && tab !== "today" ? '<div class="ft-strip"><span>Training bezig: ' + esc(f.active.name) + "</span>" + button("Hervatten", "tab", "today") + "</div>" : ""}${tab === "today" ? today() : tab === "plan" ? plan() : progress()}<div class="ft-footer">Alleen op dit apparaat · opgenomen in je volledige Memento-back-up</div></div>`;
    host.onclick = click;
    host.oninput = input;
    host.onfocusin=event=>{if(event.target.dataset.ex)lastExerciseId=event.target.dataset.ex;};
    host.onchange = (event) => { if (event.target.id === "ft-progress-select") input(event); };
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
      `<div class="ft-form-grid">${select("Doel", "goal", goals, p.goal)}${field("Locatie", "location", p.location, "text", 'maxlength="100" required')}${field("Trainingen per cyclus", "target", p.target, "number", 'min="1" max="30" step="1" required')}${field("Dagen per cyclus", "cycleDays", p.cycleDays, "number", 'min="1" max="60" step="1" required')}</div><details class="ft-details"><summary>Rooster en historische instellingen</summary><p>Actief: OOMMVNNVVV vanaf 28 oktober 2026. O = 06:00–14:00, M = 14:00–22:00, N = 22:00–06:00, V = vrij. De bewaarde oude instellingen hieronder blijven intact: daarin betekende V vroeg, L laat en R vrij. Ze wijzigen het actieve rooster niet.</p>${field("Bewaarde historische startdatum", "shiftStart", p.shiftStart, "date", "readonly")}${field("Patroon", "shifts", p.shifts, "text", 'maxlength="100" pattern="[VvLlNnRr ]*" readonly')}<label class="ft-checkbox"><input type="checkbox" name="avoidNight"${p.avoidNight ? " checked" : ""}> Geen nachtdienstdagen voorstellen</label></details>${!f.setup ? '<label class="ft-checkbox"><input type="checkbox" name="starter"> Voeg jouw drie trainingen (borst/triceps, rug/biceps en benen/schouders/buik) toe</label>' : ""}<p class="ft-hint">Je doel is een voorkeur. Oefeningen en belasting kies je zelf; de app stelt geen persoonlijk medisch trainingsplan op.</p>`,
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
      `<input type="hidden" name="exerciseId" value="${esc(id)}"><input type="hidden" name="replacement" value="${sessionReplacement}"><p class="ft-hint">Je ziet eerst oefeningen voor dit schema. Kies een andere spiergroep om de volledige bibliotheek te bekijken.</p>${select("Spiergroep filter", "muscleFilter", [["", "Alle spiergroepen"], ...[...new Set(C.catalog.map((x) => x.muscle))].sort((a,b)=>a.localeCompare(b,"nl")).map((x) => [x,x])], "")}${select("Apparatuur filter", "equipmentFilter", [["", "Alle apparatuur"], ...[...new Set(C.catalog.map((x) => x.equipment))].sort((a,b)=>a.localeCompare(b,"nl")).map((x) => [x,x])], "")}${select("Uit de oefenbibliotheek", "catalog", [["", "Eigen oefening"], ...C.catalog.map((e) => [e.id, e.name])], "")}<div class="ft-form-grid">${field("Naam", "name", e?.name || "", "text", 'required maxlength="120"')}${select(
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
    const muscles = document.querySelector("#fitnessDialog [name=muscleFilter]");
    const tools = document.querySelector("#fitnessDialog [name=equipmentFilter]");
    const suggested = C.catalog.filter((x) => {
      if (sessionReplacement) return true;
      const title = r?.name || "";
      if (/Borst.*Triceps/i.test(title)) return ["Borst","Triceps"].includes(x.muscle) ||
        (x.muscle === "Armen" && /triceps/i.test(x.name));
      if (/Rug.*Biceps/i.test(title)) return ["Rug","Biceps"].includes(x.muscle) ||
        (x.muscle === "Armen" && /biceps|curl/i.test(x.name));
      if (/Benen.*Schouders.*Buik/i.test(title)) return ["Benen","Achterzijde benen","Bilspieren","Kuiten","Schouders","Buik","Romp"].includes(x.muscle);
      return true;
    });
    const suggestedMuscles = [...new Set(suggested.map((x) => x.muscle))];
    muscles.innerHTML = options([["", "Alle spiergroepen"], ...suggestedMuscles.sort((a,b)=>a.localeCompare(b,"nl")).map((x)=>[x,x])], "");
    const filterCatalog = () => {
      const current = sel.value;
      const visible = (muscles.value || tools.value ? C.catalog : suggested).filter((x) =>
        (!muscles.value || x.muscle === muscles.value) &&
        (!tools.value || x.equipment === tools.value)).sort((a,b)=>a.name.localeCompare(b.name,"nl"));
      sel.innerHTML = options([["", "Eigen oefening"], ...visible.map((x) => [x.id,x.name])],
        visible.some((x)=>x.id===current) ? current : "");
    };
    muscles.onchange = filterCatalog;
    tools.onchange = filterCatalog;
    filterCatalog();
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
  const shiftDescription = { V: "Ochtend", L: "Middag", N: "Nacht", R: "Vrij" };
  function planForm(id) {
    const f = data(), b = f.bookings.find((x) => x.id === id);
    if (!C.available(f).length) {
      error("Maak eerst een schema met minstens één oefening."); return;
    }
    const days = C.suggestedDates(f, b?.date || C.date());
    const suggestions = days.length ?
      '<div class="ft-field"><span>Geschikte dagen volgens je rooster</span>' +
        '<div class="ft-date-choices">' + days.map((date) => {
          const previous = new Date(date + "T12:00:00");
          previous.setDate(previous.getDate() - 1);
          const afterNight = C.duty(C.date(previous)).code === "N";
          const label = (C.duty(date).label+" · "+C.duty(date).time) +
            (afterNight ? " · na nacht" : "");
          return '<button type="button" class="ft-date-choice" data-fit="pick-date" data-id="' +
            esc(date) + '">' + fmt(date) + '<small>' + esc(label) +
            '</small></button>';
        }).join("") + '</div></div>' : "";
    dialog("Training plannen",
      '<input type="hidden" name="bookingId" value="' + esc(id || "") + '">' +
      select("Training", "routineId", C.available(f).map((r)=>[r.id,r.name]), b?.routineId || C.next(f)?.id) +
      suggestions + '<div class="ft-form-grid">' +
        field("Datum","date",b?.date || days[0] || C.date(),"date","required") +
        field("Tijd (optioneel)","time",b?.time || "","time") + '</div>' +
      '<p class="ft-hint">Dit zijn suggesties, geen automatische afspraken. Een training op een nachtdienstdag kun je nog steeds zelf plannen. Bekijk ook je overige afspraken in Agenda.</p>' +
      (b ? '<div class="ft-actions">' + button("Training starten","start-booking",b.id) +
        button("Planning annuleren","cancel-booking",b.id) + '</div>' : ""),
      "In agenda zetten", "booking");
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
    if(["later","tab","finish","machine","alternatives","replace","replace-with"].includes(a)&&host.querySelector('input[data-field]:invalid')){error("Controleer de ongeldige setinvoer voordat je verdergaat. Je invoer blijft staan.");host.querySelector('input[data-field]:invalid').reportValidity();return;}
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
      render();if(id==="today")restorePosition();
    } else if(a==="next-open-set") {
      const target=host?.querySelector('.ft-check[aria-pressed="false"]');
      if(target){target.closest(".ft-set")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});target.focus({preventScroll:true});}else error("Alle werksets zijn afgevinkt. Je kunt de training afronden.");
    } else if (a === "duration") {
      selectedMinutes = Number(id);
      render();
    } else if (a === "toggle-rir") {
      showRir = !showRir;
      render();
    } else if (a === "pick-date") {
      const field = document.querySelector("#fitnessDialog [name=date]");
      if (field) { field.value = id; field.focus(); }
    } else if (a === "guide") guideDialog(id);
    else if(a==="machine"){const e=f.active.exercises.find(x=>x.id===id);dialog("Ander apparaat",`<input type="hidden" name="exerciseId" value="${esc(id)}">${field("Apparaat / herkenbare machine", "equipment", e.equipment,"text",'required maxlength="120"')}<p>Met invoer of afgeronde sets blijft de oorspronkelijke oefening volledig staan. Het nieuwe apparaat komt als een afzonderlijke oefening erbij; alleen zelf ingevulde sets tellen als prestatie. Zonder invoer verandert alleen het apparaatlabel.</p>`,"Apparaat kiezen","equipment");}
    else if (a === "alternatives") alternativesDialog(id);
    else if (a === "profile") profile();
    else if (a === "close") close();
    else if (a === "apply-hypertrophy") {
      if (!confirm("Nieuwe set- en herhalingsdoelen toepassen op jouw A/B/C-schema’s? Bestaande oefeningen met dezelfde naam worden bijgewerkt. Extra eigen oefeningen, notities, resultaten en actieve trainingen blijven behouden.")) return;
      if (change((f) => C.applyHypertrophyPlan(f))) { tab = "plan"; render(); }
    }
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
    } else if (a === "replace-with") {
      const oldId = b.dataset.ex;
      const selected = C.catalog.find((x) => x.id === id);
      if (!selected) return error("Alternatief niet beschikbaar.");
      if (!change((draft) => {
        const index = draft.active.exercises.findIndex((e) => e.id === oldId);
        if (index < 0) throw Error("De oorspronkelijke oefening is niet gevonden.");
        const old = draft.active.exercises[index];
        const keepOriginal=C.hasSetInput(old);
        const replacement = C.exercise(selected);
        Object.assign(replacement, {
          sets: old.sets, min: old.min, max: old.max, rest: old.rest,
          optional: old.optional, group: old.group,
        });
        replacement.logs = Array.from({ length: replacement.sets }, () => ({
          id: C.uid(), weight: null, reps: null, minutes: null,
          distance: null, rir: null, warmup: false, done: false,
        }));
        if(keepOriginal)draft.active.exercises.splice(index+1,0,replacement);else draft.active.exercises[index] = replacement;
      })) return;
      close();
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
          minutes: null,
          distance: null,
          rir: null,
          warmup: a === "warmup",
          done: false,
        });
      });
    else if(a==="adjust-rest")change(f=>{if(f.active.restUntil>Date.now())f.active.restUntil=Math.max(Date.now(),f.active.restUntil+Number(id)*1000);});
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
      if(!change(f=>{f.active.resumeExerciseId=lastExerciseId||f.active.resumeExerciseId||f.active.exercises[0]?.id||"";},false))return;
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
    if (el.id === "ft-progress-select") {
      progressKey = el.value;
      render();
      return;
    }
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
        l[el.dataset.field] = el.value === "" ? null : Number(el.value);f.active.resumeExerciseId=e.id;
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
          f.profile = {...f.profile,
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
          if (cat && cat.name === e.name && cat.type === e.type && cat.equipment === e.equipment) {
            e.catalogId = cat.id;
            e.cue = cat.cue;
            e.demo = cat.demo;
          } else if (!old || old.name !== e.name || old.type !== e.type || old.equipment !== e.equipment) {
            e.catalogId = "";
            e.demo = "";
            e.cue = "Beweeg beheerst en kies een comfortabele uitvoering.";
          }
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
              minutes: null,
              distance: null,
              rir: null,
              warmup: false,
              done: false,
            }));
          if(old&&replacement&&C.hasSetInput(old))list.splice(list.indexOf(old)+1,0,e);
          else if (old) list[list.indexOf(old)] = e;
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
      if(kind==="equipment"){ok=commit(f=>C.switchEquipment(f,v.exerciseId,v.equipment));if(ok){lastExerciseId=data().active.resumeExerciseId||v.exerciseId;after=restorePosition;}}
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
    el.closest(".ft-timer").hidden=n===0;
    el.textContent = n
      ? `Rust · ${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`
      : t
        ? "Rust voorbij · klaar voor je volgende set"
        : "Rust begint na het afvinken";
  }
  function restorePosition(){const id=data().active?.resumeExerciseId;if(id)requestAnimationFrame(()=>document.getElementById('ft-exercise-'+id)?.scrollIntoView({block:'start'}));}
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
      render();restorePosition();
    },
    hasPending: () => Boolean(pending||host?.querySelector('input[data-field]:invalid')),
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
    if (pending||host?.querySelector('input[data-field]:invalid')) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  new MutationObserver(() => {
    if (document.body.classList.contains("pin-locked"))
      document.getElementById("fitnessDialog")?.close();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
