# ADR-0005: Vector Search

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

Vector search uses `sqlite-vec` (subject to license validation) embedded in the same SQLite database as the FTS5 full-text index. Hybrid scoring combines lexical (FTS5) and semantic (sqlite-vec) signals. Embeddings are produced by the Model Gateway (`EmbeddingProduced`) and stored only as derived references; the Knowledge context owns no model and writes no embedding state directly except through the single `KnowledgeWriter`.

## Consequences

Hybrid search is served from one embeddable database with no external vector service. The embedding/reference store is derived and rebuildable: if it is lost, it is regenerated from provenance-bearing Concepts, so memory is never silently lost.