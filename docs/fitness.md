# Memento Fitness

Fitness lives under Leven → Meer → Fitness. It shares Memento's PIN, theme, Life state and full backup. No personal data or demo results ship in the repository. The optional starter plan creates editable templates only after the user selects it.

## Boundaries

- `assets/memento-fitness-core.js`: versioned data validation, exercise catalogue, session snapshots, sequence, comparison and shift-date helpers. Also exports CommonJS for tests.
- `assets/memento-fitness.js`: scoped UI, dialogs, autosave/draft retry, rest deadline and shared calendar rows.
- `assets/memento-fitness.css`: matte forest/sage styling, 48px session controls, compact fields and narrow mobile layouts.
- `index.html`: explicit Life navigation and storage bridge; renders linked bookings in Today and Agenda.
- `sw.js`: caches all three modules for offline use.

Fitness is stored as `fitness` inside `compass_life_preview_v1`. This intentionally uses the existing single Life save transaction instead of writing another unrelated localStorage database. Schema version 1 includes profile, routines, optional `routineCycle` references, session history, active session, bookings and measurements. `routineCycle` is an optional list of existing routine ids; legacy backups without it remain valid. When a legacy setup contains all three named split routines, they form the inferred A/B/C cycle. Existing unrelated routines stay available as separate manual workouts and do not interrupt the cycle. Sessions snapshot exercises; later routine edits cannot rewrite history. Catalogue movement identity, equipment and location determine comparisons across routines; custom exercises use their name and equipment. Changing a movement name/type/equipment creates a new exercise identity, and the UI updates the catalogue link when appropriate.

A successful set edit is saved immediately. On write failure, the UI keeps an in-memory draft, displays the error, blocks ordinary navigation and offers retry; it does not report success. A forced browser close can still lose an unsaved draft. Browser data remains local and is not encrypted by the PIN. No cloud or health-data API is used.

Full Life backups include fitness automatically. An older backup without the fitness property preserves current fitness when imported. A current backup restores its exact fitness snapshot. Invalid data is rejected before writes. Templates can be archived/restored; history has a recoverable trash state. Cancelled bookings can be restored.

## Product rules

- Rotation advances only when finishing a session with at least one completed working set; uncompleted sets never count as completed work. Finishing a manual workout outside the active cycle does not change the next planned A/B/C routine.
- Short sessions omit optional exercises without modifying the routine. The personal three-way starter makes its last exercise(s) optional; legacy plans with over three nonoptional exercises fall back to the first three. When a session cannot be shortened, the UI hides the short option. Times are not promised as exact durations.
- Progression is a suggestion, never an automatic weight increase. It requires two comparable complete strength exposures at the selected repetition ceiling with at least two reported repetitions in reserve. Pain or low energy suppresses it; current poor sleep also suppresses the displayed suggestion.
- Muscle totals count completed non-warmup sets for the exercise's primary group. No recovery percentage, diagnosis or calorie estimate is fabricated.
- V/L/N/R shift patterns filter suggested dates. A day after a night shift is labelled explicitly so the user can choose to recover; it is not automatically blocked. Date chips only select a date for the form, and the user must explicitly save a booking. Other appointments still need to be checked in Agenda. This is not an automatic appointment scheduler.
- Exercise headers show a small locally rendered muscle-area symbol; instructions and technical cues stay offline. External instructional links open only on an explicit user tap. Four individually verified StrengthLog demonstration pages are linked directly; other exercises link to their directory and an optional YouTube search (query contains only the exercise name). No third-party content is fetched automatically.
- Replacement suggestions are movement-specific; choosing one replaces the exercise only within the current session, without modifying a routine or previous results. The regular editor remains available for a permanent change. Completed sets must be undone before replacement.
- Progress charts represent the heaviest completed workset (or reps for bodyweight at 0 kg) for each comparable movement/equipment/location across sessions, plus six 7-day windows and optional body-weight measurement history. These are descriptive records, not estimated maximums, medical guidance or a recovery score.
- Superset/circuit labels are visual groupings; the user chooses the next exercise. Rest uses an absolute deadline, so elapsed time survives backgrounding/reload. The timer is sticky while the active screen is open. Audible background notifications are not promised.
- Health Connect/Samsung Health, external AI coaching and automatic synchronisation are not included.

## Verification

```sh
node tests/fitness-regression.cjs # 23 core checks as of this revision
# With Playwright and a Chromium installation available:
node tests/fitness-browser.cjs
# Optional: BROWSER_EXECUTABLE=/path/to/chromium SCREENSHOT_DIR=/path/to/screenshots
```

The browser test uses an isolated local origin and fresh test storage. It covers PIN setup, menu navigation, three-routine setup, shared Today/Agenda bookings, exercise help, one-workout substitution, set autosave, persisted rest deadline, reload, narrow layouts, storage failure/retry, progression of the rotation, charts, editor changes, reversible measurements, full/legacy/invalid backup handling and offline reload/start. It does not touch the user's browser data. Browser assertions were updated, but a browser run and on-device visual inspection are still required on this revision.

The existing `tests/memento-regression.cjs` has two failures already present at base `ff61b17`: it directly renders removed library/household views and expects checklist markup that changed earlier. Running the assertions with failure collection produces the same 79 passing checks and the same two failures on the base and this change. Those unrelated tests and app features are not modified here.
