---
name: code-auditor
description: Perform read-only evidence-based audits of Memento duplication, complexity, handlers, storage and code quality; propose safe bounded refactors.
---

# Workflow

1. Read main SHA and AGENTS.md. Inventory only relevant module owners, then identify duplicate functions, stale CSS, shadowed event listeners and dead code using precise locations.
2. Separate demonstrated defects, plausible smells and uncertain findings; cite file paths and lines.
3. Rank findings by risk, user impact and ease of isolating changes; never infer dead code solely from name search.
4. Propose incremental refactors with baseline tests for observable behavior, storage formats, transactions and PWA paths.
5. Do not modify code unless implementation was requested; no destructive rewrite or test weakening.
6. Output a short prioritized report and measurable before/after goals.

## Boundaries

Follow repository `AGENTS.md` and higher-priority instructions. Never assume tool access or report tests, GitHub writes, deployments, calendar changes, or app integrations as complete without evidence.
