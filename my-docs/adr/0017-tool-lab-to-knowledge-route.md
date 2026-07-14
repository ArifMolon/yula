# ADR-0017: Tool Lab → Knowledge Route

- Status: Accepted
- Date: 2026-07-14
- Provenance: Context Map conclusion deferred hotspots #2 and #6; glossary v1 (`EvaluationArtifactSnapshot`, `ConversionArtifact`); ratified in issue #3 grilling (2026-07-14).

## Decision

The Tool Lab → Knowledge route is a **direct Published Language route**, not an Integration ACL route. Tool Lab **publishes** the artifact contracts; Knowledge **consumes** them. The producer (Tool Lab) owns the contract.

- The Published Language artifacts are `EvaluationArtifactSnapshot` and `ConversionArtifact` (canonical names defined in glossary v1). They are immutable and provenance-bearing.
- Orchestration's role in promotion is to issue a **promotion Command that carries a reference, not a payload**. Orchestration sends the promotion intent plus a correlation reference to the artifact; it never copies the artifact body into the Command.
- The single `KnowledgeWriter` ingests the referenced artifact into a provenance-bearing Concept; the artifact's content is never duplicated into Orchestration state.
- Tool Lab's private evaluation/conversion models stay private; Knowledge consumes only the published artifact, never Tool Lab internals (DDD MUST: another context's internal model is private).

## Consequences

This resolves Context Map conclusion hotspot #6 (direct Published Language vs Integration ACL) in favor of the direct route, and ratifies the contract names already frozen by hotspot #2 / glossary v1. Orchestration stays intent-only ("işlemci") and does not become a second copy of memory ("hafıza") — it carries a reference, so KISS + DRY hold and there is one artifact body, owned by Tool Lab. Knowledge never reaches into Tool Lab internals, keeping the bounded-context boundary clean. A glossary v1.1 note records the shared Published Language status of these two terms without moving them between context columns.