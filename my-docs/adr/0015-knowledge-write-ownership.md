# ADR-0015: Knowledge Write Ownership

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; Context Map conclusion deferred hotspot #7; ratified in issue #3 grilling (2026-07-14).

## Decision

There is a single serialized Core `KnowledgeWriter`. Every persistent OKF, FTS5, embedding-reference, and sqlite-vec write crosses it; agents, workers, and ingestion tools never write shared SQLite state directly. The writer uses a WAL so concurrent reads proceed while writes serialize. Execution scratch memory is temporary; there is no durable per-agent micro-brain.

Hotspot C (KnowledgeWriter recovery — resolves Context Map conclusion hotspot #7):

- **The durable fence is a Git commit, and it is the only one.** The fenced operation is solely the Concept-write order: write the Markdown file, then commit. A crash before the commit writes nothing durable — there is no partial written state to reconcile, so no partial-failure recovery protocol is needed for the canonical record.
- **Index rebuild is out of the fence.** The FTS5/embedding/sqlite-vec index is derived and rebuildable; losing or rebuilding it is not a durability event and is not fenced by a commit.
- **External side-effects are out of scope of this fence.** Any external effect triggered by a promotion is a separate R3 decision and a separate rule; it is not covered by the git-commit fence.
- **The `KnowledgeWriter` lives in the Elixir Core**, because Core is the control-plane single writer and the security-boundary single place that owns durable writes.

## Consequences

This realizes the "biri hafıza, biri işlemci" stance for write integrity: the commit is the single point at which memory becomes durable, and a pre-commit crash leaves memory untouched rather than partially written. Index loss is recoverable (rebuild), so derived memory is never silently lost, while canonical memory is protected by one atomic commit. Locating the writer in Elixir Core keeps the security and control-plane write boundary in exactly one place, matching ADR-0006 policy ownership.