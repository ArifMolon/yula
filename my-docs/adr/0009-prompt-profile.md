# ADR-0009: Prompt Profile

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

Default system prompts are managed as versioned `PromptProfile`/`PromptVersion` records. Activation is atomic: draft → activate → rollback is a single transaction, so a prompt prompt swaps with no window where two versions are partially active. Autonomous prompt activation is prohibited: YULA may draft a `PromptVersion`, but only a human R3 decision activates it.

## Consequences

Prompt changes are auditable and reversible. The atomic activation removes partial-activation races. The activation prohibition is a hard human-control boundary (R3) and pairs with ADR-0010's self-evolution limit.