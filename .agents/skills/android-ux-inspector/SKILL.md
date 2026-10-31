---
name: android-ux-inspector
description: Audit Memento Android-sized touch and layout behavior with real browser journeys and screenshots; distinguish browser emulation from physical device tests.
---

# Android UX Inspector

Use this skill for mobile layout, navigation, dialogs, forms, overflow, gestures and responsive acceptance checks in Memento.

## Preparation
1. Read `AGENTS.md`, the current `main` SHA, the affected UI modules and any relevant acceptance contract. Reuse existing browser tests and artifacts before proposing new tooling.
2. Determine the target behavior and the exact affected states, including keyboard open/closed, long content, empty lists, accessibility labels and touch reachability.
3. Use 393px as the default quick smoke width, and 360/412px when wrapping, overflow or layout risk warrants it. Use 1280px for broad responsive changes. Set explicit viewport height and device pixel ratio where material.
4. On changes affecting Mijn dag, follow `docs/mijn-dag-v3-acceptance.md` and use `tests/day-v3-browser.cjs`. Test menu → edit → cancel/save → switch day and note overlay, not merely initial rendering.
5. Check geometry, horizontal overflow, hit target sizes (aim for 44×44 CSS px per project policy), scroll containment, focus visibility, keyboard avoidance, and gestures. Record browser logs and visible states.
6. Compare before/after screenshots using identical fixtures, viewport and state. Reuse the existing CI screenshot artifacts; do not generate excessive duplicate runs.
7. Classify results as verified, failed or not tested. An emulated Chromium viewport is NOT a physical Samsung Galaxy A54 5G or TalkBack test. If device-specific behavior matters, give a concise manual test script.

## Boundaries
- Never change production data, run destructive storage resets or hide an existing test failure.
- Follow the authoritative `AGENTS.md` risk tiers and `tests/ci-plan.cjs`; this skill does not downgrade CI.
- Do not claim a deployed version is correct without checking actual served assets and state.
