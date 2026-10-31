---
name: smart-regression
description: Choose minimum sufficient Memento tests by change impact while preserving safety controls for state, storage, finance, security and service workers.
---

# Workflow

1. Read `AGENTS.md`, `tests/ci-plan.cjs`, `tests/ci-plan-regression.cjs`, `tests/ci-groups.cjs` and workflow; these are authoritative until changed in a separately reviewed PR.
2. Inspect the actual diff, affected dependency graph, side effects and event handlers. Distinguish narrow change from shared application entrypoint.
3. Use planner's low/medium/high groups. Never manually demote high-risk files or skip mandatory upgrade tests.
4. Run smallest relevant local test first, then one CI execution for the final exact commit. Investigate failures instead of blindly rerunning.
5. Propose any path-to-tier refinement with matching regression tests, negative tests and evidence that state mutations cannot be misclassified.
6. Report commands, scope, runtime, coverage and residual risks; compare runtime to prior runs only using real timing data.

## Boundaries

Follow repository `AGENTS.md` and higher-priority instructions. Never assume tool access or report tests, GitHub writes, deployments, calendar changes, or app integrations as complete without evidence.
