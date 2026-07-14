# ADR-0011: Test Discipline

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

The automated test suite makes zero real provider calls. LLM, model, embedding, network, and tool behavior is exercised through fake adapters and fixtures in CI. Real-provider validation happens only through a manually approved smoke run, never as part of the green-suite gate.

## Consequences

Tests are hermetic, deterministic, and free to run locally at no cost. The green suite never depends on an external service or spend. Real provider behavior is verified by an explicit, human-approved smoke step that is not allowed to gate routine merges.