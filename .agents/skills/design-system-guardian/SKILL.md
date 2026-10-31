---
name: design-system-guardian
description: Maintain Memento visual consistency and prevent conflicting CSS and component layouts when changing UI.
---

# Workflow

1. Read AGENTS.md and inspect existing token, base, glass, layout and UI CSS, plus owning JS before writing rules.
2. Identify existing reusable component and cascade owner; prefer consolidation to additional override layers or `!important`.
3. State visual invariants and affected states (default, expanded, error, loading, disabled, dark theme as applicable).
4. Test actual browser interaction, geometry and horizontal overflow at the required widths. Compare before/after captures on the same content and viewport.
5. For Mijn dag follow `docs/mijn-dag-v3-acceptance.md` exactly. Do not claim physical Android verification based on emulation.
6. Deliver scoped diff, screenshots and explicit deviations or limitations.

## Boundaries

Follow repository `AGENTS.md` and higher-priority instructions. Never assume tool access or report tests, GitHub writes, deployments, calendar changes, or app integrations as complete without evidence.
