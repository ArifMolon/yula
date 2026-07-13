# Phase 0 Spec Backlog

**Project:** [YULA Development](https://github.com/users/ArifMolon/projects/5)  
**Published:** 2026-07-13  
**Boundary:** Only Phase 0 Spec Issues exist. Child tracer-bullet issues remain intentionally absent until the user selects the first spec.

| Order | Spec | Bounded Context | Risk | Review | Size | Dependencies |
|---:|---|---|---|---|---|---|
| 1 | [SPEC-P0-domain-discovery](https://github.com/ArifMolon/yula/issues/1) | Orchestration | R1 | Required | M | None |
| 2 | [SPEC-P0-ubiquitous-language](https://github.com/ArifMolon/yula/issues/2) | Agent Studio | R1 | Required | S | SPEC-P0-domain-discovery |
| 3 | [SPEC-P0-seed-decisions](https://github.com/ArifMolon/yula/issues/3) | Orchestration | R3 | Required | M | Domain discovery, Ubiquitous Language |
| 4 | [SPEC-P0-monorepo-foundation](https://github.com/ArifMolon/yula/issues/4) | Orchestration | R2 | Policy | M | Seed decisions |
| 5 | [SPEC-P0-sidecar-lifecycle-spike](https://github.com/ArifMolon/yula/issues/5) | Orchestration | R2 | Policy | S | Monorepo foundation |
| 6 | [SPEC-P0-worker-ipc-spike](https://github.com/ArifMolon/yula/issues/6) | Orchestration | R2 | Policy | M | Monorepo foundation, sidecar lifecycle |
| 7 | [SPEC-P0-tool-sandbox-spike](https://github.com/ArifMolon/yula/issues/7) | Tool Lab | R3 | Required | M | Seed decisions, monorepo foundation |
| 8 | [SPEC-P0-hybrid-retrieval-spike](https://github.com/ArifMolon/yula/issues/8) | Knowledge | R2 | Policy | M | Seed decisions, monorepo foundation |
| 9 | [SPEC-P0-model-adapter-spike](https://github.com/ArifMolon/yula/issues/9) | Model Gateway | R2 | Policy | S | Seed decisions, monorepo foundation |

## Recommended first spec

`SPEC-P0-domain-discovery` is the dependency frontier. It validates the domain flows and Context Map that block the glossary and seed decisions; those in turn block every implementation spike.
