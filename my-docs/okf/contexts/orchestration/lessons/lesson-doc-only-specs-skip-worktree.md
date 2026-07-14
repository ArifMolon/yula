# Lesson: Doc-only specs should skip the spec worktree

```yaml
lesson_id: lesson-doc-only-specs-skip-worktree
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - pi-session-2026-07-14-issue-3-seed-adrs
prevention_guidance: When a spec issue produces only durable my-docs artifacts (ADR, glossary, OKF, plan, context-map, handoff) and no code/test, do not bootstrap a spec worktree. The sparse-checkout excludes my-docs from worktrees by design (the main checkout owns durable docs), so a worktree for a doc-only spec is a dead end: my-docs cannot be written there. Run spec-worktree only when the spec owns code/tests; for doc-only specs, keep the spec and feature branches in the main checkout.
confidence: 0.6
validation_evidence:
  - 2026-07-14 issue #3: the agent bootstrapped .worktrees/spec-arch-decisions and started feature/3-seed-adrs there, then discovered my-docs/ was absent (sparse-checkout excludes my-docs, .worktrees, .superpowers). Writing ADR/glossary/conclusion in the worktree was impossible; the worktree had to be removed and the work redone from the main checkout.
operations:
  - select-spec-execution-mode
  - bootstrap-spec-worktree
  - write-durable-docs
tools:
  - scripts-spec-worktree
  - git
input_classes:
  - spec-issue-with-only-doc-deliverables
  - spec-issue-with-code-deliverables
```

## Context

During the Phase 0 architecture-decisions session (issue #3, 2026-07-14), the agent followed the handoff's `scripts/spec-worktree` instruction and bootstrapped `.worktrees/spec-arch-decisions` with `feature/3-seed-adrs`. #3 produces only durable docs (17 ADRs, glossary v1.1 note, Context Map conclusion update, plan update). The operating-model design explicitly excludes `my-docs/` from worktrees via sparse-checkout so the main checkout owns durable knowledge. The worktree therefore had no writable target for any deliverable. The agent removed the worktree and reran the work from the main checkout, keeping the `spec/arch-decisions` + `feature/3-seed-adrs` branch pair for lifecycle trace.

## Root cause

The spec-worktree lifecycle was treated as mandatory for every spec regardless of deliverable type. The policy ("code worktrees contain only source code, permanent tests, and required manifests/lockfiles; the main checkout owns my-docs, OKF, plans, ADRs") implies the inverse — a spec with no code has nothing to put in a worktree.

## Prevention

- **Classify the deliverable type before bootstrapping.** If the issue's deliverables are ADR/glossary/OKF/plan/context-map/handoff only (no source or permanent tests under tests/ or code roots), the spec is doc-only.
- **Doc-only specs skip the worktree.** Keep `spec/<name>` and `feature/<issue>-<slug>` branches in the main checkout; do not run `spec-worktree bootstrap`. Lifecycle trace is preserved by the branch pair, and the single-writer boundary is unaffected because my-docs is already main-owned.
- **Code-bearing specs use the worktree.** When the spec owns tests or source, bootstrap normally — the worktree isolates code and the sparse exclusion keeps my-docs safe.
- **Confirm by attempting a targeted write, not by assumption.** If unsure, dry-run or test-write one my-docs path before committing to a worktree. The exit signal (path not found) is cheaper than redoing the work.

## Related

- `lesson-retry-without-reading-error` — same session root cause axis (acting on assumption instead of inspecting actual state).