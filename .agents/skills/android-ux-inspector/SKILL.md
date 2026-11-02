---
name: android-ux-inspector
description: Audit Memento Android-sized touch and layout behavior with real browser journeys and screenshots; distinguish browser emulation from physical device tests.
---

# Android UX Inspector

Use this skill for mobile layout, navigation, dialogs, forms, overflow, gestures and responsive acceptance checks in Memento.

## Normatieve bron

Gebruik bij werk in Memento de [Android-PWA UX-standaard](../../../docs/android-pwa-ux-standaard.md) en de relevante richtlijnen van developer.android.com. De Android-ervaring bepaalt de UX, maar dit blijft een **PWA**: neem geen Compose-API, native insets of nieuwe dependencies over. Een bestaande goedgekeurde Memento-component en de eigen visuele identiteit blijven leidend. Inspecteer daadwerkelijke browser-hit-testing/scroll en de primaire gebruikersroute.

## Preparation
1. Read `AGENTS.md`, the current `main` SHA, the affected UI modules and any relevant acceptance contract. Reuse existing browser tests and artifacts before proposing new tooling.
2. Determine the target behavior and the exact affected states, including keyboard open/closed, long content, empty lists, accessibility labels and touch reachability.
3. Use 393px as the default quick smoke width, and 360/412px when wrapping, overflow or layout risk warrants it. Use 1280px for broad responsive changes. Set explicit viewport height and device pixel ratio where material.
4. On changes affecting Mijn dag, follow `docs/mijn-dag-v3-acceptance.md` and use `tests/day-v3-browser.cjs`. Test menu → edit → cancel/save → switch day and note overlay, not merely initial rendering.
5. Check geometry, horizontal overflow, touch target dimensions (48×48 CSS px preferred for new/modified primary controls; retain existing 44×44 project minimum), scroll containment, focus visibility, keyboard avoidance, and gestures. Record browser errors and actionable failure evidence only when relevant.
6. Compare before/after screenshots using identical fixtures, viewport and state. Reuse the existing CI screenshot artifacts; do not generate excessive duplicate runs.
7. Classify results as verified, failed or not tested. An emulated Chromium viewport is NOT a physical Samsung Galaxy A54 5G or TalkBack test. If device-specific behavior matters, give a concise manual test script.

## Installed Android PWA and cost control
- Memento is primarily opened as a standalone PWA on Samsung Galaxy A54 5G. When relevant, verify standalone display mode, safe-area/system-navigation clearance, visible form actions during keyboard-like viewport resizing, and absence of blocked scrolling or menus. Browser emulation cannot establish physical Android behavior.
- Use the existing 393px targeted smoke by default. Add 360/412px, keyboard-height or standalone-specific cases only where the actual diff presents that risk. Prefer existing fixtures and CI screenshots; do not install new tools or run a full suite for a cosmetic patch.
- Separate application defects from selector drift, timing/flakiness, and browser setup failures. Never weaken assertions to hide genuine bugs. Report the failed interaction and smallest reproducible evidence.

## Gate voor echt mobiel schermbewijs

Begin bij een concrete bestaande appstaat en reconstrueer de gebruikerroute tot de afwijkende scrollpositie (top, midden, einde), na actie en bij geopend menu. Een screenshot van alleen de eerste viewport bewijst geen geldige sticky header of bereikbare laatste actie. Gebruik bij gewijzigde editors `tests/helpers/mobile-visual-contract.cjs` en de bestaande domeinjourney; controleer dat de test de gewijzigde editor daadwerkelijk opent, niet slechts de tab. Bij visueel werk: vergelijk geslaagde CI-artifacts voor de exacte PR-head met het overeengekomen prototype; afwezig bewijs = NIET GEVERIFIEERD, ook bij groene CI. Houd de extra scenario's gericht.

## Boundaries
- Never change production data, run destructive storage resets or hide an existing test failure.
- Follow the authoritative `AGENTS.md` risk tiers and `tests/ci-plan.cjs`; this skill does not downgrade CI.
- Do not claim a deployed version is correct without checking actual served assets and state.
