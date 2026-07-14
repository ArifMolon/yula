# ADR-0014: Voice

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

Voice starts with push-to-talk plus local speech-to-text. Wake-word, always-on listening, and cloud STT are deferred to Faz 5+ behind a separate privacy design, because an always-listing microphone is a distinct privacy boundary that must be designed on its own, not bundled into the first voice slice. Voice uses the same typed-command, policy, ApprovalRequest, transition, and audit path as text (no parallel privileged path).

## Consequences

The first voice slice carries no always-on microphone risk and runs locally. Privacy-sensitive modes are designed deliberately later rather than shipped by accident. R3 voice requires explicit read-back and second confirmation; R4 voice requires explicit UI confirmation where specified.