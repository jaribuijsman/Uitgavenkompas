/* Memento Fitness: pure data rules shared by the UI and regression tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MementoFitnessCore = api;
})(globalThis, () => {
  "use strict";
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    "fit-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2);
  const date = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const validDate = (s) =>
    typeof s === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    date(new Date(s + "T12:00:00")) === s;
  const days = (a, b) =>
    Math.round(
      (Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000,
    );
  const empty = () => ({
    version: 1,
    profile: {
      goal: "fit",
      cycleDays: 7,
      target: 3,
      location: "Sportschool",
      shiftStart: "",
      shifts: "",
      avoidNight: true,
    },
    routines: [],
    routineCycle: [],
    sessions: [],
    bookings: [],
    measurements: [],
    active: null,
    nextRoutineId: "",
    setup: false,
  });
  const catalog = [
    [
      "squat",
      "Goblet squat",
      "strength",
      "Benen",
      "Dumbbell",
      "Houd de beweging beheerst en kies een comfortabele diepte.",
    ],
    [
      "legpress",
      "Leg press",
      "strength",
      "Benen",
      "Machine",
      "Noteer de machine en stoelstand voor vergelijkbare metingen.",
    ],
    [
      "rdl",
      "Romanian deadlift",
      "strength",
      "Achterzijde benen",
      "Dumbbells",
      "Beweeg vanuit je heupen; houd de gewichten dicht bij je lichaam.",
    ],
    [
      "chest",
      "Chest press",
      "strength",
      "Borst",
      "Machine",
      "Stel de zitting zo in dat je comfortabel kunt drukken.",
    ],
    [
      "pushup",
      "Push-up",
      "strength",
      "Borst",
      "Lichaamsgewicht",
      "Gebruik zo nodig een verhoogd steunpunt.",
    ],
    [
      "pulldown",
      "Lat pulldown",
      "strength",
      "Rug",
      "Kabelmachine",
      "Trek beheerst en vermijd zwaaien met je bovenlichaam.",
    ],
    [
      "row",
      "Seated row",
      "strength",
      "Rug",
      "Kabelmachine",
      "Gebruik een vaste zitpositie en beweeg gecontroleerd.",
    ],
    [
      "shoulder",
      "Shoulder press",
      "strength",
      "Schouders",
      "Dumbbells",
      "Kies een pijnvrije, comfortabele bewegingsuitslag.",
    ],
    [
      "lateral",
      "Lateral raise",
      "strength",
      "Schouders",
      "Dumbbells",
      "Een licht gewicht en rustige uitvoering zijn voldoende.",
    ],
    [
      "curl",
      "Biceps curl",
      "strength",
      "Armen",
      "Dumbbells",
      "Noteer bij dumbbells het gewicht per hand.",
    ],
    [
      "triceps",
      "Triceps pushdown",
      "strength",
      "Armen",
      "Kabelmachine",
      "Houd je bovenarmen rustig naast je lichaam.",
    ],
    [
      "plank",
      "Plank",
      "mobility",
      "Romp",
      "Mat",
      "Blijf doorademen; noteer de duur in minuten.",
    ],
    [
      "cross",
      "Crosstrainer",
      "cardio",
      "Conditie",
      "Crosstrainer",
      "Vergelijk alleen hetzelfde apparaat en dezelfde weerstand.",
    ],
    [
      "bike",
      "Fietsen",
      "cardio",
      "Conditie",
      "Fiets",
      "Bewaar weerstand of route in de notitie.",
    ],
    [
      "walk",
      "Wandelen",
      "cardio",
      "Conditie",
      "Buiten",
      "Afstand is optioneel.",
    ],
    [
      "run",
      "Hardlopen",
      "cardio",
      "Conditie",
      "Buiten",
      "Houd je tempo passend bij je ervaring en doel.",
    ],
    [
      "mobility",
      "Mobiliteit",
      "mobility",
      "Mobiliteit",
      "Mat",
      "Beweeg rustig binnen een comfortabele bewegingsuitslag.",
    ],
    ["inclinechest", "Incline chest press", "strength", "Borst", "Machine", "Druk schuin omhoog met gecontroleerde beweging."],
    ["overheadtriceps", "Overhead triceps extension", "strength", "Triceps", "Kabelmachine", "Houd je bovenarmen stabiel en strek je ellebogen."],
    ["hammercurl", "Hammer curl", "strength", "Biceps", "Dumbbells", "Houd je handpalmen naar binnen gericht."],
    ["legcurl", "Leg curl", "strength", "Benen", "Machine", "Buig je knieën beheerst zonder te zwaaien."],
    ["crunch", "Crunch", "strength", "Buik", "Mat", "Til je schouders rustig op zonder aan je nek te trekken."],
    ["dbchest", "Dumbbell chest press", "strength", "Borst", "Dumbbells", "Houd je polsen neutraal en laat de gewichten beheerst zakken."],
    ["dbincline", "Incline dumbbell press", "strength", "Borst", "Dumbbells", "Druk vanuit een licht schuin ingestelde bank."],
    ["bench", "Bench press", "strength", "Borst", "Halterbank", "Gebruik indien nodig een spotter en houd je voeten stabiel."],
    ["dbtriceps", "Dumbbell triceps extension", "strength", "Triceps", "Dumbbell", "Houd je bovenarmen rustig en beweeg vanuit je ellebogen."],
    ["machinepulldown", "Machine lat pulldown", "strength", "Rug", "Machine", "Trek je ellebogen naar beneden zonder met je rug te zwaaien."],
    ["dbrow", "Dumbbell row", "strength", "Rug", "Dumbbells", "Steun op een bank en trek je elleboog richting je heup."],
    ["machinerow", "Seated machine row", "strength", "Rug", "Machine", "Trek beheerst naar je toe terwijl je romp stil blijft."],
    ["cablecurl", "Cable biceps curl", "strength", "Biceps", "Kabelmachine", "Houd je bovenarmen op hun plaats tijdens het buigen."],
    ["legextension", "Leg extension", "strength", "Benen", "Machine", "Stel de machine passend af en strek je knieën beheerst."],
    ["seatedlegcurl", "Seated leg curl", "strength", "Benen", "Machine", "Stel de machine af en buig je knieën zonder momentum."],
    ["hack", "Hack squat", "strength", "Benen", "Machine", "Houd je voeten stevig en beweeg binnen een comfortabele diepte."],
    ["machineshoulder", "Machine shoulder press", "strength", "Schouders", "Machine", "Kies een comfortabele bewegingsuitslag en houd je romp stabiel."],
    ["cablelateral", "Cable lateral raise", "strength", "Schouders", "Kabelmachine", "Til je arm zijwaarts met een licht gewicht en zonder zwaaien."],
    ["cablecrunch", "Cable crunch", "strength", "Buik", "Kabelmachine", "Rond je bovenrug beheerst en houd je heupen rustig."],
  ].map(([id, name, type, muscle, equipment, cue]) => ({
    id,
    name,
    type,
    muscle,
    equipment,
    cue,
  }));
  const exerciseDirectory = "https://www.strengthlog.com/exercise-directory/";
  const demoPaths = {
    chest: "machine-chest-press", triceps: "tricep-pushdown-with-rope",
    pulldown: "lat-pulldown-with-pronated-grip", lateral: "dumbbell-lateral-raise",
    dbchest: "dumbbell-chest-press", bench: "bench-press",
    dbincline: "incline-dumbbell-press", squat: "goblet-squat",
    legpress: "leg-press", curl: "dumbbell-curl", hammercurl: "hammer-curl",
    legcurl: "seated-leg-curl", seatedlegcurl: "seated-leg-curl",
    rdl: "romanian-deadlift", row: "cable-close-grip-seated-row",
    shoulder: "seated-dumbbell-shoulder-press", crunch: "crunch",
    cablecrunch: "cable-crunch", legextension: "leg-extension",
    inclinechest: "smith-machine-incline-bench-press",
    overheadtriceps: "overhead-cable-triceps-extension-upper-position",
    dbrow: "dumbbell-row", machinerow: "seated-machine-row",
    dbtriceps: "dumbbell-standing-triceps-extension",
    machinepulldown: "machine-lat-pulldown", hack: "hack-squat-machine",
    machineshoulder: "seated-smith-machine-shoulder-press",
    cablelateral: "resistance-band-lateral-raise",
    cablecurl: "cable-curl-with-bar",
  };
  const alternatives = {
    chest: ["dbchest", "pushup", "bench"], inclinechest: ["dbincline", "chest"],
    dbchest: ["chest", "pushup"], dbincline: ["inclinechest", "dbchest"],
    triceps: ["dbtriceps", "overheadtriceps"], overheadtriceps: ["dbtriceps", "triceps"],
    pulldown: ["machinepulldown"], machinepulldown: ["pulldown"],
    row: ["machinerow", "dbrow"], machinerow: ["row", "dbrow"], dbrow: ["row", "machinerow"],
    curl: ["cablecurl", "hammercurl"], hammercurl: ["curl", "cablecurl"],
    legpress: ["hack", "squat"], hack: ["legpress", "squat"],
    legcurl: ["seatedlegcurl", "rdl"], seatedlegcurl: ["legcurl", "rdl"],
    shoulder: ["machineshoulder"], machineshoulder: ["shoulder"],
    lateral: ["cablelateral"], cablelateral: ["lateral"],
    crunch: ["cablecrunch", "plank"], cablecrunch: ["crunch"],
  };
  catalog.forEach((item) => { item.demo = demoPaths[item.id] ? "https://www.strengthlog.com/" + demoPaths[item.id] + "/" : exerciseDirectory; });
  const knownExercise = (e) => catalog.find((c) => c.id === e?.catalogId) ||
    catalog.find((c) => c.name.toLocaleLowerCase("nl") === String(e?.name || "").toLocaleLowerCase("nl"));
  const exerciseKey = (e) => {
    if (typeof e === "string") return "id:" + e;
    const known = knownExercise(e);
    return known ? "catalog:" + known.id : "custom:" + String(e?.name || "").trim().toLocaleLowerCase("nl");
  };
  const comparisonKey = (e, location) => [
    exerciseKey(e),
    String(location || "").trim().toLocaleLowerCase("nl"),
    String(e?.equipment || "").trim().toLocaleLowerCase("nl"),
  ].join("|");
  const alternativeOptions = (exercise) => {
    const id = knownExercise(exercise)?.id;
    return (alternatives[id] || []).map((candidate) => catalog.find((x) => x.id === candidate)).filter(Boolean);
  };
  function exercise(item) {
    return {
      ...clone(item),
      id: uid(),
      catalogId: item.id || "",
      sets: item.type === "strength" ? 3 : 1,
      min: 8,
      max: 12,
      rest: item.type === "strength" ? 90 : 30,
      minutes: item.type === "cardio" ? 15 : 1,
      optional: false,
      group: "",
      note: "",
    };
  }
  function starter() {
    const plans = [
      ["Borst & Triceps", [["chest", 3], ["inclinechest", 2], ["triceps", 3], ["overheadtriceps", 2]]],
      ["Rug & Biceps", [["pulldown", 3], ["row", 3], ["curl", 3], ["hammercurl", 2]]],
      ["Benen, Schouders & Buik", [["legpress", 3], ["legcurl", 2], ["shoulder", 2], ["lateral", 2], ["crunch", 2]]],
    ];
    return plans.map(([name, items]) => ({
      id: uid(), name, location: "Sportschool", notes: "", archived: false,
      exercises: items.map(([id, sets], i) => ({
        ...exercise(catalog.find((x) => x.id === id)), sets,
        optional: i >= 3,
        min: id === "lateral" || id === "crunch" ? 12 : id === "triceps" || id === "overheadtriceps" || id === "curl" || id === "hammercurl" || id === "legcurl" ? 10 : 8,
        max: id === "lateral" || id === "crunch" ? 15 : id === "triceps" || id === "overheadtriceps" || id === "curl" || id === "hammercurl" || id === "legcurl" ? 12 : 12,
      })),
    }));
  }
  function validate(f) {
    const fail = () => {
      throw Error(
        "Ongeldige fitnessgegevens. De bestaande opslag blijft behouden.",
      );
    };
    const str = (s, n = 4000) => typeof s === "string" && s.length <= n;
    const num = (n, min = 0, max = 1e6) =>
      typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
    const arr = (v, max = 100000) => Array.isArray(v) && v.length <= max;
    const unique = (a) => {
      const ids = new Set();
      for (const x of a) {
        if (!x || !str(x.id, 200) || !x.id || ids.has(x.id)) fail();
        ids.add(x.id);
      }
    };
    if (
      !f ||
      f.version !== 1 ||
      typeof f.setup !== "boolean" ||
      !str(f.nextRoutineId, 200)
    )
      fail();
    if (f.routineCycle !== undefined &&
      (!arr(f.routineCycle, 30) || f.routineCycle.some((id) => !str(id, 200) || !id) ||
       new Set(f.routineCycle).size !== f.routineCycle.length)) fail();
    const p = f.profile;
    if (
      !p ||
      !["fit", "strength", "muscle", "endurance"].includes(p.goal) ||
      !Number.isInteger(p.cycleDays) ||
      !num(p.cycleDays, 1, 60) ||
      !Number.isInteger(p.target) ||
      !num(p.target, 1, 30) ||
      !str(p.location, 100) ||
      !str(p.shifts, 100) ||
      !/^[V L N R]*$/.test(p.shifts) ||
      !str(p.shiftStart, 10) ||
      (p.shiftStart && !validDate(p.shiftStart)) ||
      typeof p.avoidNight !== "boolean" ||
      Boolean(p.shiftStart) !== Boolean(p.shifts.trim())
    )
      fail();
    for (const key of ["routines", "sessions", "bookings", "measurements"]) {
      if (!arr(f[key])) fail();
      unique(f[key]);
    }
    const checkExercise = (e) => {
      if (
        !e ||
        !str(e.id, 200) ||
        !str(e.name, 120) ||
        !e.name.trim() ||
        !["strength", "cardio", "mobility"].includes(e.type) ||
        !str(e.equipment, 120) ||
        !str(e.muscle, 80) ||
        !str(e.note) ||
        !str(e.group, 40) ||
        !Number.isInteger(e.sets) ||
        !num(e.sets, 1, 20) ||
        !Number.isInteger(e.min) ||
        !num(e.min, 1, 100) ||
        !Number.isInteger(e.max) ||
        !num(e.max, e.min, 100) ||
        !num(e.rest, 0, 900) ||
        !num(e.minutes, 0.1, 600) ||
        typeof e.optional !== "boolean"
      )
        fail();
    };
    for (const r of f.routines) {
      if (
        !str(r.name, 120) ||
        !r.name.trim() ||
        !str(r.location, 100) ||
        !str(r.notes) ||
        typeof r.archived !== "boolean" ||
        !arr(r.exercises, 60)
      )
        fail();
      unique(r.exercises);
      r.exercises.forEach(checkExercise);
    }
    const checkSession = (s, active) => {
      if (
        !s ||
        !str(s.id, 200) ||
        !str(s.routineId, 200) ||
        !str(s.name, 120) ||
        !str(s.location, 100) ||
        !str(s.notes) ||
        !validDate(s.date) ||
        !str(s.startedAt, 40) ||
        !Number.isFinite(Date.parse(s.startedAt)) ||
        !num(s.restUntil, 0, 1e16) ||
        !arr(s.exercises, 60) ||
        !str(s.bookingId, 200) ||
        !str(s.deletedAt, 40)
      )
        fail();
      if (
        !active &&
        (!str(s.finishedAt, 40) || !Number.isFinite(Date.parse(s.finishedAt)))
      )
        fail();
      if (
        !s.checkin ||
        !["normal", "low", "high"].includes(s.checkin.energy) ||
        !["unknown", "good", "poor"].includes(s.checkin.sleep) ||
        typeof s.checkin.pain !== "boolean"
      )
        fail();
      unique(s.exercises);
      for (const e of s.exercises) {
        checkExercise(e);
        if (!arr(e.logs, 40)) fail();
        unique(e.logs);
        for (const l of e.logs) {
          if (typeof l.done !== "boolean" || typeof l.warmup !== "boolean")
            fail();
          for (const k of ["weight", "reps", "minutes", "distance", "rir"]) {
            if (
              l[k] !== null &&
              !num(l[k], 0, k === "rir" ? 10 : k === "reps" ? 1000 : 100000)
            )
              fail();
          }
          if (l.reps !== null && !Number.isInteger(l.reps)) fail();
        }
      }
    };
    f.sessions.forEach((s) => checkSession(s, false));
    if (f.active !== null) checkSession(f.active, true);
    for (const b of f.bookings)
      if (
        !str(b.routineId, 200) ||
        !validDate(b.date) ||
        !str(b.time, 5) ||
        !(b.time === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(b.time)) ||
        !["planned", "completed", "cancelled"].includes(b.status) ||
        !str(b.sessionId, 200)
      )
        fail();
    for (const m of f.measurements)
      if (
        !validDate(m.date) ||
        (m.weight !== null && !num(m.weight, 1, 500)) ||
        (m.waist !== null && !num(m.waist, 1, 500))
      )
        fail();
    return f;
  }
  const available = (f) =>
    f.routines.filter((r) => !r.archived && r.exercises.length);
  const rotation = (f) => {
    const all = available(f);
    if (Array.isArray(f.routineCycle) && f.routineCycle.length)
      return f.routineCycle.map((id) => all.find((r) => r.id === id)).filter(Boolean);
    const names = ["Borst & Triceps", "Rug & Biceps", "Benen, Schouders & Buik"];
    const matched = names.map((name) => all.find((r) => r.name === name));
    return matched.every(Boolean) ? matched : all;
  };
  const next = (f) =>
    rotation(f).find((r) => r.id === f.nextRoutineId) || rotation(f)[0];
  const shortExercises = (routine) => {
    const base = routine.exercises.filter((e) => !e.optional);
    return base.length === routine.exercises.length && base.length > 3
      ? base.slice(0, 3)
      : base;
  };
  const history = (f, id, location, equipment) =>
    f.sessions
      .filter((s) => !s.deletedAt && s.location === location)
      .slice()
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
      .map((s) => ({
        s,
        e: s.exercises.find((e) => (typeof id === "string" ? e.id === id : exerciseKey(e) === exerciseKey(id)) &&
          e.equipment.trim().toLocaleLowerCase("nl") === String(equipment).trim().toLocaleLowerCase("nl")),
      }))
      .filter((x) => x.e && x.e.logs.some((l) => l.done && !l.warmup));
  function recommendation(f, e, location) {
    const rows = history(f, e, location, e.equipment),
      last = rows[0];
    if (!last)
      return {
        text: "Nog geen eerdere werksets voor deze oefening en locatie.",
        increase: false,
      };
    const logs = last.e.logs.filter((l) => l.done && !l.warmup);
    if (e.type !== "strength")
      return {
        text: `Vorige keer: ${logs.reduce((n, l) => n + (l.minutes || 0), 0)} minuten. Vergelijk dezelfde omstandigheden.`,
        increase: false,
      };
    const recent = rows.slice(0, 2),
      ready =
        recent.length === 2 &&
        recent.every(
          ({ e: x, s }) =>
            !s.checkin.pain &&
            s.checkin.energy !== "low" &&
            x.logs.filter((l) => !l.warmup).length >= e.sets &&
            x.logs
              .filter((l) => !l.warmup)
              .every(
                (l) =>
                  l.done && l.reps >= e.max && l.rir !== null && l.rir >= 2,
              ),
        );
    const matching =
      ready &&
      recent.every(
        ({ e: x }) =>
          x.min === e.min &&
          x.max === e.max &&
          x.logs
            .filter((l) => !l.warmup)
            .every((l) => l.weight === logs[0].weight),
      );
    return {
      text: matching
        ? "Twee trainingen op je bovengrens met minstens 2 herhalingen over. Overweeg de kleinste gewichtsstap; jij beslist."
        : `Vorige keer: ${logs.map((l) => `${l.weight ?? "—"} kg × ${l.reps ?? "—"}`).join(" · ")}.`,
      increase: matching,
    };
  }
  function start(
    f,
    rid,
    minutes = 45,
    checkin = { energy: "normal", sleep: "unknown", pain: false },
    bookingId = "",
  ) {
    if (f.active)
      throw Error(
        "Rond je actieve training eerst af of bewaar die voor later.",
      );
    const r = available(f).find((x) => x.id === rid);
    if (!r) throw Error("Voeg eerst een oefening aan dit schema toe.");
    const selected =
      minutes === 25 ? shortExercises(r) : r.exercises;
    if (!selected.length)
      throw Error(
        "Markeer minstens één oefening als basis voor de korte training.",
      );
    const t = new Date();
    f.active = {
      id: uid(),
      routineId: r.id,
      name: r.name,
      location: r.location,
      date: date(t),
      startedAt: t.toISOString(),
      notes: "",
      restUntil: 0,
      bookingId,
      deletedAt: "",
      checkin: clone(checkin),
      exercises: selected.map((e) => {
        const old =
          history(f, e, r.location, e.equipment)[0]?.e.logs.filter(
            (l) => l.done && !l.warmup,
          ) || [];
        return {
          ...clone(e),
          logs: Array.from({ length: e.sets }, (_, i) => ({
            id: uid(),
            weight: old[i]?.weight ?? null,
            reps: old[i]?.reps ?? null,
            minutes: e.type === "strength" ? null : e.minutes,
            distance: null,
            rir: null,
            warmup: false,
            done: false,
          })),
        };
      }),
    };
    return f.active;
  }
  function finish(f) {
    const s = f.active;
    if (!s || !s.exercises.some((e) => e.logs.some((l) => l.done && !l.warmup)))
      throw Error("Vink eerst minstens één werkset af.");
    s.finishedAt = new Date().toISOString();
    s.restUntil = 0;
    f.sessions.push(s);
    const b = f.bookings.find((b) => b.id === s.bookingId);
    if (b) {
      b.status = "completed";
      b.sessionId = s.id;
    }
    const a = rotation(f),
      i = a.findIndex((r) => r.id === s.routineId);
    f.nextRoutineId = a.length ? a[i >= 0 ? (i + 1) % a.length : 0].id : "";
    f.active = null;
    return s;
  }
  function shift(f, iso) {
    const p = f.profile,
      list = p.shifts.replace(/ /g, "").split("");
    if (!p.shiftStart || !list.length) return "";
    const d = days(p.shiftStart, iso);
    return list[((d % list.length) + list.length) % list.length];
  }
  function suggestedDates(f, from = date()) {
    const result = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(from + "T12:00:00");
      d.setDate(d.getDate() + i);
      const key = date(d);
      if (f.profile.avoidNight && shift(f, key) === "N") continue;
      if (f.bookings.some((b) => b.date === key && b.status === "planned"))
        continue;
      result.push(key);
      if (result.length === 3) break;
    }
    return result;
  }
  return {
    clone,
    uid,
    date,
    days,
    validDate,
    empty,
    catalog,
    exercise,
    starter,
    validate,
    available,
    rotation,
    next,
    shortExercises,
    exerciseKey,
    comparisonKey,
    alternativeOptions,
    knownExercise,
    history,
    recommendation,
    start,
    finish,
    shift,
    suggestedDates,
  };
});
