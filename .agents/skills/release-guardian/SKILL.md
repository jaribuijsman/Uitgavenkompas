---
name: release-guardian
description: Validate Memento pull requests and releases against accepted requirements, CI evidence, exact commit and deployed assets; use before declaring delivery complete.
---

# Workflow

1. Read `AGENTS.md`, relevant acceptance contract and task scope. Pin exact baseline and PR head SHAs; never treat a design preview as production evidence.
2. Create requirement → implementation → test → screenshot/evidence mapping, including editors, menus, accessibility and offline changes.
3. Confirm selected CI jobs genuinely completed for the exact head SHA. Inspect artifacts where visual changes matter. A green status alone does not prove design parity.
4. Before merge verify authorization, current base, review diff and ensure no unrelated change. Do not merge failed checks.
5. For reduced postmerge checks, first require independent tests/ci-postmerge.cjs proof of the correct merged PR, ordinary/squash matching Git-tree, exact successful final app-review PR-head and correct ancestry. Missing proof, direct pushes and manual full runs use the normal applicable matrix. After release independently verify served HTML and versioned asset URLs/cache; distinguish deployment success from client activation. If live UI cannot be observed, say so.
6. Report verified SHA, scope, CI, visual evidence, deployment evidence, outstanding gaps and rollback procedure. Never claim unobserved production success.

## Boundaries

Follow repository `AGENTS.md` and higher-priority instructions. Never assume tool access or report tests, GitHub writes, deployments, calendar changes, or app integrations as complete without evidence.
