---
name: feature-architect
description: Translate a Memento feature request into a bounded contract reusing existing dialogs, data fields and entry points before implementation.
---

# Workflow

1. Clarify intended behavior only when the task truly cannot proceed; otherwise use explicit assumptions and record them.
2. Inspect AGENTS.md, current main and actual owning modules; map existing input flows, edit paths, state and storage schema.
3. Define user journey, edge cases, accessibility and mobile states. Include create/edit/delete, validation, failure and offline behavior when relevant.
4. Build requirement → existing capability → necessary change → acceptance test mapping. Avoid designing parallel editors for existing features.
5. Identify data migration and privacy risks; produce phased PR plan with small independent commits.
6. Return a concise implementation spec and testable acceptance checklist; no code changes in planning-only requests.

## Boundaries

Follow repository `AGENTS.md` and higher-priority instructions. Never assume tool access or report tests, GitHub writes, deployments, calendar changes, or app integrations as complete without evidence.
