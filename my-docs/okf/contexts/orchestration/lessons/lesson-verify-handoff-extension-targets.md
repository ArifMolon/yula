# Lesson: Verify handoff "extend" targets exist before drafting

```yaml
lesson_id: lesson-verify-handoff-extension-targets
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - pi-session-2026-07-14-issue-3-seed-adrs
prevention_guidance: When a handoff says to "extend ADR-0006" or "update artifact X", verify the target artifact exists on disk and inspect its current scope before planning the work. A handoff may describe intent ("extend the security ADR") against an artifact that was never written. Do not infer scope from the handoff's verbs; read the canonical file (or the plan's seed list) first, then decide whether the action is extend, write-new, or write-then-bake.
confidence: 0.6
validation_evidence:
  - 2026-07-14 issue #3: the handoff said "extend ADR-0006" and "extend ADR-0015" as if those ADRs existed. They did not — only ADR-0001 had a file; ADR-0006/0015 were listed in plan §11 as seed ADRs to be written. The agent planned a 3-ADR "extension" before discovering the targets were missing, then had to re-scope to writing the full WP-0.3 seed set (16 new ADRs) and confirm scope with the product owner.
operations:
  - plan-from-handoff
  - confirm-scope
  - write-canonical-artifact
tools:
  - ls
  - git-log
  - read
input_classes:
  - handoff-instruction-text
  - plan-seed-adr-list
  - adr-file-tree
```

## Context

During the Phase 0 architecture-decisions session (issue #3, 2026-07-14), the handoff's decision grid and next-action list used "extend ADR-0006" and "extend ADR-0015" language. The agent initially assumed those ADRs existed and planned to add Hotspot A/C content to them. On inspecting `my-docs/adr/`, only `0001-development-operating-model.md` was present. The plan §11 listed ADR-0001…0016 as seed ADRs to be written in WP-0.3, and only ADR-0001 had been written so far. The "extend" verbs described intent against non-canonical (not-yet-written) targets. The agent had to re-scope: write the full seed set (ADR-0002…0016) plus a new ADR-0017, baking the hotspot decisions into the relevant ADRs as they were written, and re-confirm scope with the product owner.

## Root cause

The handoff described the destination of decisions ("extend the security ADR") as if the artifact existed, and the agent trusted the verb "extend" as proof of existence instead of reading the file tree.

## Prevention

- **Read the target before planning to extend it.** Before planning any "extend/update/revise artifact X" instruction, `ls` or read the canonical path. If the file is absent, the instruction is really "write X (and seed it with the decision)".
- **Cross-check against the plan's seed list.** When the artifact is an ADR/seed record, plan §11 (or the equivalent seed list) tells whether it is to-be-written or already-written. "Extend" only applies to already-written.
- **Surface the discrepancy to the product owner before writing.** A scope mismatch (extend vs. write-new, or 3 ADRs vs. 17) changes the work materially; confirm scope explicitly rather than silently reinterpreting the handoff.
- **ADRs are single-decision records; "extend" still means one decision.** When genuinely extending an existing ADR, add the new decision as a clearly delimited section, not a second ADR for the same topic (DRY).

## Related

- `lesson-doc-only-specs-skip-worktree` — same session, same root cause axis (trusting handoff description over on-disk reality).
- `lesson-retry-without-reading-error` — same prevention family (inspect actual state before acting).