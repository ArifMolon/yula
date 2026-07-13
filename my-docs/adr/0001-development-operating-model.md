# ADR-0001: Development Operating Model

- Status: Accepted
- Date: 2026-07-13

## Decision

YULA uses DDD as a MUST rule, one spec worktree with one active feature issue, main-owned durable knowledge, separate GitHub and OKF state machines, a serialized Core `KnowledgeWriter`, agent-managed OKF review, and a unified Review Inbox for genuine human decisions. Voice uses the same typed command and policy path.

OKF Markdown is canonical; embeddings and sqlite-vec are derived. Handoffs describe current state rather than conversation transcripts. R3/R4 actions require human approval.

## Consequences

Delivery is progressive and auditable. Parallelism occurs across independent specs, not through competing writers or issue-per-worktree proliferation. Extra validators and cleanup gates are accepted in exchange for recoverability and domain-language integrity.
