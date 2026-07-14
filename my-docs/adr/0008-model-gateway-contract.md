# ADR-0008: Model Gateway Contract

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

The Model Gateway contract is owned by YULA. Provider adapters implement that contract; OmniRoute is only an optional sidecar adapter POC, not a dependency. The gateway exposes `ModelProvider`/`ModelProfile` and `ModelPolicy` and emits `EmbeddingProduced` to consumers. The gateway writes no OKF, FTS5, or sqlite-vec state; it returns vectors and leaves all persistent writes to the single `KnowledgeWriter`.

## Consequences

Provider selection is decoupled from consumers (Orchestration, Agent Studio, Knowledge). Keeping the contract ours means adapters can be added, swapped, or removed (including OmniRoute) without architectural change. The gateway remains a pure processor with no memory-write side effects.