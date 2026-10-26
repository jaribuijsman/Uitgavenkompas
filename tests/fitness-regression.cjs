const assert = require("node:assert/strict");
const C = require("../assets/memento-fitness-core.js");
let count = 0;
const test = (name, fn) => {
  fn();
  console.log("PASS", name);
  count++;
};
const fresh = () => {
  const f = C.empty();
  f.routines = C.starter();
  f.setup = true;
  return f;
};
const log = (f, weight = 40, reps = 12) => {
  f.active.exercises.forEach((e) =>
    e.logs.forEach((l) =>
      Object.assign(l, { done: true, weight, reps, rir: 2 }),
    ),
  );
};
test("empty fitness state is valid and contains no user records", () => {
  const f = C.validate(C.empty());
  for (const k of ["routines", "sessions", "bookings", "measurements"])
    assert.equal(f[k].length, 0);
  assert.equal(f.active, null);
});
test("starter templates are independent and have no recorded results", () => {
  const a = C.starter(),
    b = C.starter();
  assert.notEqual(a[0].id, b[0].id);
  assert.notEqual(a[0].exercises[0].id, b[0].exercises[0].id);
  assert.equal(a[0].exercises[0].logs, undefined);
});
test("short training retains core exercises without changing the routine", () => {
  const f = fresh(),
    r = f.routines[0];
  C.start(f, r.id, 25);
  assert.equal(f.active.exercises.length, 3);
  assert.equal(r.exercises.length, 4);
  f.active.exercises[0].note = "Session only";
  assert.equal(r.exercises[0].note, "");
  C.validate(f);
});
test("cannot overwrite an active workout or complete an empty one", () => {
  const f = fresh();
  C.start(f, f.routines[0].id);
  assert.throws(() => C.start(f, f.routines[1].id));
  assert.throws(() => C.finish(f));
  assert.equal(f.sessions.length, 0);
});
test("completion advances rotation, closes only linked booking and is not duplicated", () => {
  const f = fresh(),
    r = f.routines[0];
  f.bookings = [
    {
      id: "b",
      routineId: r.id,
      date: C.date(),
      time: "12:00",
      status: "planned",
      sessionId: "",
    },
    {
      id: "other",
      routineId: r.id,
      date: C.date(),
      time: "15:00",
      status: "planned",
      sessionId: "",
    },
  ];
  C.start(f, r.id, 45, undefined, "b");
  log(f);
  const result = C.finish(f);
  assert.equal(f.nextRoutineId, f.routines[1].id);
  assert.equal(f.bookings[0].sessionId, result.id);
  assert.equal(f.bookings[1].status, "planned");
  assert.equal(f.active, null);
  assert.throws(() => C.finish(f));
  assert.equal(f.sessions.length, 1);
  C.validate(f);
});
test("prescription edits never mutate recorded sessions", () => {
  const f = fresh();
  C.start(f, f.routines[0].id);
  log(f);
  C.finish(f);
  f.routines[0].exercises[0].name = "Changed";
  assert.notEqual(f.sessions[0].exercises[0].name, "Changed");
});
test("previous values use same movement, equipment and location only", () => {
  const f = fresh(),
    r = f.routines[0];
  C.start(f, r.id);
  log(f, 55);
  C.finish(f);
  C.start(f, r.id);
  assert.equal(f.active.exercises[0].logs[0].weight, 55);
  f.active = null;
  r.location = "Different gym";
  C.start(f, r.id);
  assert.equal(f.active.exercises[0].logs[0].weight, null);
});
test("progression requires two complete comparable exposures and exertion feedback", () => {
  const f = fresh(),
    r = f.routines[0],
    e = r.exercises[0];
  C.start(f, r.id);
  log(f);
  C.finish(f);
  assert.equal(C.recommendation(f, e, r.location).increase, false);
  C.start(f, r.id);
  log(f);
  C.finish(f);
  assert.equal(C.recommendation(f, e, r.location).increase, true);
  f.sessions[0].exercises[0].logs[0].rir = null;
  assert.equal(C.recommendation(f, e, r.location).increase, false);
});
test("pain or inconsistent loads never produce a progression suggestion", () => {
  const f = fresh(),
    r = f.routines[0];
  for (let i = 0; i < 2; i++) {
    C.start(f, r.id);
    log(f);
    C.finish(f);
  }
  f.sessions[0].checkin.pain = true;
  assert.equal(C.recommendation(f, r.exercises[0], r.location).increase, false);
  f.sessions[0].checkin.pain = false;
  f.sessions[0].exercises[0].logs[0].weight = 20;
  assert.equal(C.recommendation(f, r.exercises[0], r.location).increase, false);
});
test("full JSON round trip retains active drafts, rest deadline, notes and ids", () => {
  const f = fresh();
  C.start(f, f.routines[0].id);
  f.active.restUntil = Date.now() + 90000;
  f.active.notes = "Eigen tekst";
  f.active.exercises[0].logs[0].weight = 0;
  const restored = C.validate(JSON.parse(JSON.stringify(f)));
  assert.deepEqual(restored, f);
});
test("invalid data, duplicate ids and impossible dates are rejected", () => {
  for (const mutate of [
    (f) => f.routines.push(f.routines[0]),
    (f) => (f.profile.cycleDays = 0),
    (f) => (f.profile.shiftStart = "2026-02-31"),
    (f) =>
      f.measurements.push({
        id: "m",
        date: "2026-02-31",
        weight: 80,
        waist: null,
      }),
    (f) => (f.routines[0].exercises[0].max = 2),
  ]) {
    const f = fresh();
    mutate(f);
    assert.throws(() => C.validate(f));
  }
});
test("night shifts and existing bookings are excluded from suggested dates", () => {
  const f = fresh();
  Object.assign(f.profile, { shifts: "NNRR", shiftStart: "2026-10-25" });
  f.bookings = [
    {
      id: "b",
      routineId: f.routines[0].id,
      date: "2026-10-27",
      time: "",
      status: "planned",
      sessionId: "",
    },
  ];
  assert.deepEqual(C.suggestedDates(f, "2026-10-25"), [
    "2026-10-28",
    "2026-10-31",
    "2026-11-01",
  ]);
  C.validate(f);
});
test("archived routines are skipped without deleting training history", () => {
  const f = fresh();
  f.nextRoutineId = f.routines[0].id;
  f.routines[0].archived = true;
  assert.equal(C.next(f).id, f.routines[1].id);
});
test("deleted sessions do not affect performance suggestions", () => {
  const f = fresh(),
    r = f.routines[0];
  C.start(f, r.id);
  log(f);
  C.finish(f);
  f.sessions[0].deletedAt = new Date().toISOString();
  assert.equal(
    C.history(f, r.exercises[0].id, r.location, r.exercises[0].equipment)
      .length,
    0,
  );
});
test("personal split has three plans, real short variants and no demo results", () => {
  const f = fresh();
  assert.deepEqual(f.routines.map((r) => r.name),
    ["Borst & Triceps", "Rug & Biceps", "Benen, Schouders & Buik"]);
  assert.deepEqual(f.routines.map((r) => r.exercises.length), [4, 4, 5]);
  for (const routine of f.routines) {
    assert.equal(C.shortExercises(routine).length, 3);
    assert.equal(routine.exercises.some((e) => e.logs !== undefined), false);
  }
});
test("legacy backups without a routineCycle field remain valid", () => {
  const f = fresh();
  delete f.routineCycle;
  assert.equal(C.validate(f), f);
  assert.deepEqual(C.rotation(f).map((r) => r.name),
    ["Borst & Triceps", "Rug & Biceps", "Benen, Schouders & Buik"]);
});
test("an older unrelated routine stays saved but out of the active split", () => {
  const f = fresh();
  const other = { ...C.starter()[0], name: "Oud schema" };
  f.routines.unshift(other);
  f.routineCycle = f.routines.slice(1).map((r) => r.id);
  f.nextRoutineId = f.routineCycle[0];
  assert.equal(C.rotation(f).length, 3);
  for (let i = 0; i < 4; i++) {
    const current = C.next(f);
    assert.notEqual(current.id, other.id);
    C.start(f, current.id);
    f.active.exercises[0].logs[0].done = true;
    f.active.exercises[0].logs[0].weight = 10;
    f.active.exercises[0].logs[0].reps = 8;
    C.finish(f);
  }
  assert.equal(C.next(f).id, f.routineCycle[1]);
  assert.equal(f.routines[0].id, other.id);
  C.validate(f);
});
test("cycle skips archived plans but keeps references for restoration", () => {
  const f = fresh();
  f.routineCycle = f.routines.map((r) => r.id);
  f.routines[1].archived = true;
  assert.deepEqual(C.rotation(f).map((r) => r.name),
    ["Borst & Triceps", "Benen, Schouders & Buik"]);
  f.routines[1].archived = false;
  assert.equal(C.rotation(f).length, 3);
  C.validate(f);
});
test("corrupt cycle identifiers or duplicates are rejected", () => {
  const f = fresh();
  f.routineCycle = [f.routines[0].id, f.routines[0].id];
  assert.throws(() => C.validate(f));
  f.routineCycle = ["deleted-routine-id"];
  assert.throws(() => C.validate(f));
});
test("history matches exercise across routines but never mixes equipment", () => {
  const f = fresh(), first = f.routines[0];
  C.start(f, first.id);
  f.active.exercises[0].logs[0].weight = 60;
  f.active.exercises[0].logs[0].reps = 8;
  f.active.exercises[0].logs[0].done = true;
  C.finish(f);
  const same = { ...C.clone(first.exercises[0]), id: C.uid() };
  assert.equal(C.history(f, same, first.location, same.equipment).length, 1);
  assert.equal(C.history(f, { ...same, equipment: "Dumbbells" }, first.location, "Dumbbells").length, 0);
  assert.equal(C.history(f, same, "Other gym", same.equipment).length, 0);
});
test("library offers known movement-specific equipment alternatives", () => {
  const f = fresh();
  const ids = C.alternativeOptions(f.routines[0].exercises[0]).map((e) => e.id);
  assert.equal(ids.includes("dbchest"), true);
  assert.equal(ids.includes("pushup"), true);
  assert.equal(C.catalog.some((e) => e.id === "cablecrunch"), true);
});
test("short workouts remain shorter with old nonoptional routines", () => {
  const f = fresh();
  const r = f.routines[2];
  r.exercises.forEach((e) => e.optional = false);
  assert.equal(C.shortExercises(r).length, 3);
  C.start(f, r.id, 25);
  assert.equal(f.active.exercises.length, 3);
  assert.equal(r.exercises.length, 5);
});
console.log(`${count} fitness regression checks passed.`);
