# Lesson: Retry tool-call syntax errors without reading the error first

```yaml
lesson_id: lesson-retry-without-reading-error
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - pi-session-2026-07-14-issue-2-glossary-graphql-syntax-errors
  - pi-session-2026-07-14-issue-16-project-status-query-syntax-errors
  - pi-session-2026-07-14-issue-3-seed-adrs-handoff-vs-disk-mismatch
prevention_guidance: When a tool call fails with a syntax or contract error (GraphQL parse error, wrong working directory, schema mismatch), stop and read the full error message before retrying. Do not re-send the same payload with cosmetic changes. Identify the exact cause, fix it once, and verify the fix against the error before the next attempt. Repeated identical-failure retries waste tokens and signal that the error was not understood.
confidence: 0.85
validation_evidence:
  - 2026-07-14 issue #16: sent a GitHub Projects v2 GraphQL query with malformed brace nesting; got "Expected one of SCHEMA..." parse error; re-sent a near-identical query and got the same error before fixing the nesting.
  - 2026-07-14 issue #2: re-sent the same malformed query structure a second time after the first JSON decode failure, instead of reading the GraphQL parse error in the raw output.
  - 2026-07-14 issue #3: proceeded on the handoff's "extend ADR-0006/0015" wording without first listing my-docs/adr/; the ADRs did not exist and the work had to be re-scoped. A single `ls my-docs/adr/` before planning would have shown only ADR-0001 was written.
  - 2026-07-14 issue #3: bootstrapped a spec worktree for a doc-only spec before confirming the worktree could hold the deliverables; the sparse exclusion of my-docs made it unusable. A dry-run write test would have surfaced this before the worktree was created.
operations:
  - run-tool-call
  - diagnose-failure
  - retry-after-fix
tools:
  - agent-browser
  - bash-gh-api
  - bash
input_classes:
  - tool-call-error-output
  - graphql-query
  - shell-command-error
```

## Context

During the Phase 0 Glossary freeze session (issue #2, 2026-07-14) and the Context Map ratification (issue #16, 2026-07-14), the agent made repeated identical-failure tool retries:

1. **GraphQL brace nesting** — A GitHub Projects v2 query had unbalanced/mis-nested `nodes{ ... }` blocks. The first call returned a GraphQL parse error ("Expected one of SCHEMA, SCALAR, TYPE..."). The agent re-sent a near-identical query without reading or fixing the nesting, got the same error, then finally fixed the nesting on the third attempt.
2. **JSON decode assumption** — When the Python helper failed to parse `gh api` output, the agent blamed the Python script instead of first checking the raw `gh` output, which contained the GraphQL error. Re-running with the same broken query wasted a second call.

## Root cause

The agent treated a failure as a transient/transport error and retried, rather than reading the error as a contract/syntax signal that required a change to the next payload.

## Prevention

- **Read the full error before the next call.** If the error is a syntax/parse/contract error (not a transient network/timeout error), the payload must change; a retry with the same payload is guaranteed to fail.
- **Check raw tool output before parsing.** When a downstream parser (Python, jq) fails on tool output, inspect the raw tool output first — the real error is often upstream of the parser.
- **One fix per error.** Identify the exact line/column the error names, fix that specific issue, and re-verify mentally before sending.
- **Escalate, don't loop.** If two attempts at the same syntax fail, stop and re-derive the approach from documentation or a known-good example rather than a third identical attempt.

## Related

- `lesson-delivery-patterns-are-not-domain-language` — same session, different axis (naming, not retry behavior).
