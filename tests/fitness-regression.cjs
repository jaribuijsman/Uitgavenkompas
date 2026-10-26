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
  assert.equal(r.exercises.length, 5);
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
console.log(`${count} fitness regression checks passed.`);
