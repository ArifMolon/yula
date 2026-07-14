# YULA OKF Log

Bu dosya append-only knowledge update ledger'dır. Mevcut kayıtlar yeniden yazılmaz veya silinmez.

## Entry format

```markdown
## YYYY-MM-DDTHH:mm:ssZ — KnowledgeUpdateRequested

- Request: kur-...
- Issue: owner/repo#123
- Spec: SPEC-...
- Bounded Context: orchestration
- Pull Request: owner/repo#456
- Capability: domain capability name
- Events: PublishedEventName
- Lessons: lesson ID or none
- Verification: command and result reference
```

## 2026-07-14T10:45:00Z — Lesson candidates recorded (issue #3, no PR)

- Issue: ArifMolon/yula#3
- Spec: SPEC-P0-arch-decisions
- Bounded Context: orchestration
- Pull Request: none (doc-only work merged directly to main; see open loop below)
- Capability: phase-0-architecture-decisions / seed-adrs / hotspot-resolution
- Events: none (no Published Language event produced)
- Lessons: lesson-doc-only-specs-skip-worktree (Candidate), lesson-verify-handoff-extension-targets (Candidate), lesson-retry-without-reading-error (Candidate, new evidence added)
- Verification: validate-operating-model PASS; tests 65/65; verify-plan-html PASS (47); git diff --check clean.

Note: a structured `KnowledgeUpdateRequested` (kur-) JSON was not created for this entry because `schemas/knowledge-update-requested.schema.json` requires `pull_request` (minLength 1) and issue #3 was merged to main without a PR. This schema-gap open loop is carried forward; it will be closed either by opening a PR for #3 or by relaxing the schema in a separate operating-model issue.
