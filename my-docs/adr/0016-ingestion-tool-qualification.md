# ADR-0016: Ingestion Tool Qualification

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

Crawl4AI (web) and MarkItDown (document) are quarantined ingestion tool candidates. They connect to Knowledge only through an evaluated Web or Document Ingestion Skill that carries a narrow `CapabilityGrant`, never directly. Each is evaluated as a `ToolVersion` (Tool Lab flow) before it is trusted with ingestion. A conversion or crawl output becomes a `ConversionArtifact` (document) or an evaluation artifact only through a provenance-bearing path into the single `KnowledgeWriter`.

## Consequences

Untrusted ingestion tools never touch shared state directly. Quarantine plus narrow capability keeps the blast radius small if a candidate misbehaves. Provenance on every artifact keeps Knowledge sourceless-free, consistent with the glossary `Provenance` minimum schema.