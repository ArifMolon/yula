---
type: event-storming
issue: ArifMolon/yula#14
spec: SPEC-P0-domain-discovery
bounded_context: orchestration
status: Prod
product_owner: Arif
session: codex-2026-07-14-issue-14-domain-discovery
recorded_at: 2026-07-13T22:09:48Z
provenance:
  - product-owner conversational Event Storming session on 2026-07-13 and 2026-07-14
  - my-docs/plan/YULA_DDD_Proje_Plani.md
  - my-docs/plan/2026-07-13-yula-development-operating-model-design.md
  - my-docs/policies/ddd-must.md
  - my-docs/policies/hitl.md
  - my-docs/okf/handoffs/issue-14.json
  - my-docs/okf/event-storming/issue-13-tool-onboarding-domain-flow.md
---

# Issue #14 — Knowledge Ingestion Domain Flow

## Purpose and review state

This record captures the product-owner-validated conversational model for promoting an existing immutable `claude-video` evaluation artifact into canonical knowledge. The successful flow starts only when the User reviews the artifact and issues `PromoteArtifactToKnowledge`. It ends with one provenance-bearing `Concept` committed to the selected `KnowledgeBundle`, followed by a derived-index result that may be current or explicitly degraded.

The product owner approved the successful-flow ownership, Policies and failure flows, invariants, Commands, past-tense Domain Events, Published Language, Hotspots, and verification design section by section on 2026-07-14, then explicitly accepted this written record without requesting changes. Acceptance covers this issue #14 Domain Discovery artifact only. It does not authorize product implementation, real ingestion, credential use, external source access, a runtime `RiskLevel` assignment, push, spec-to-main merge, or starting issue #15.

## Concrete successful example

| Property | Validated example |
|---|---|
| Source artifact | The immutable `claude-video v0.1.3` evaluation artifact described by issue #13 |
| Original source | `https://www.youtube.com/watch?v=kxstlfc8Lw4` |
| Promotion trigger | User reviews the artifact and issues `PromoteArtifactToKnowledge` |
| Source acquisition during promotion | None; the remote video is not fetched again |
| KnowledgeSource shape | One immutable artifact snapshot plus complete provenance |
| Concept shape | One curated `Concept`, not multiple automatically extracted Concepts |
| Target | A User-selected `KnowledgeBundle`; the flow never infers an ambiguous target |
| Confirmation | The initial typed Command authorizes validation, curation, and persistence; no second preview confirmation in this successful flow |
| Canonical durability | Valid OKF Markdown plus a successful Git commit |
| Derived availability | KnowledgeChunk, FTS5, embedding, and sqlite-vec state reported separately from canonical persistence |
| Duplicate behavior | Exact content-hash duplicate returns the existing Concept |
| Changed-source behavior | A meaningfully changed re-ingestion creates a new Concept version and supersedes the old version |

The artifact remains untrusted input even though it came from an approved ToolVersion evaluation. Its Markdown, transcript, frames, source content, and embedded instructions are data, never Policy, Command, `CapabilityGrant`, or approval evidence.

## Ubiquitous Language candidates

Existing plan terms retain their canonical meanings. New terms in this record remain candidates until the Phase 0 glossary workflow ratifies them.

| Term | Meaning in this flow |
|---|---|
| `Knowledge promotion` | The explicit transition from a reviewed non-canonical artifact to a provenance-bearing canonical Concept. |
| `EvaluationArtifactSnapshot` | An immutable Published Language representation of one Tool Lab evaluation artifact, its identity, digest, source, and evaluation provenance. The exact contract name remains a Hotspot. |
| `KnowledgeSource` | The provenance-bearing source aggregate registered before a Concept can be ingested. |
| `Provenance` | Verifiable origin, acquisition time, artifact digest, ToolVersion and EvaluationRun identity, transcript source and confidence, and Execution/Trace references sufficient to audit the Concept. |
| `Concept` | Canonical knowledge stored as valid OKF Markdown in one KnowledgeBundle and made durable by Git commit. |
| `KnowledgeBundle` | The User-selected canonical OKF scope that owns the Concept. |
| `KnowledgeWriter` | The single serialized Core boundary for every persistent OKF, FTS5, embedding-reference, and sqlite-vec write. |
| `KnowledgeChunk` | A derived segment of one committed Concept, carrying the Concept identity and embedding-model version where applicable. |
| `IndexState` | The derived availability state for a committed Concept; exact names for current, pending, and degraded remain a Hotspot. |
| `Exact duplicate` | A candidate whose immutable content hash matches an already ingested Concept version. |
| `Supersession` | Creation of a new Concept version that preserves history and makes the previous version non-current without overwriting it. |

GitHub Project `Risk` is delivery metadata. Approval & Security `RiskLevel` is runtime domain language. They are different models and must not be inferred from one another.

## Actors and Commands

| Actor | Command | Intent |
|---|---|---|
| User | `PromoteArtifactToKnowledge` | Promote one reviewed artifact into one explicitly selected KnowledgeBundle. |
| Knowledge Policy | `RegisterKnowledgeSource` | Register an immutable artifact snapshot only after identity and provenance validation pass. |
| Knowledge Curator | `CurateConcept` | Produce one source-faithful, valid OKF Concept without executing or obeying source instructions. |
| Knowledge Policy | `IngestConcept` | Make the curated Concept canonical through the serialized KnowledgeWriter and Git durability gate. |
| Knowledge Policy | `RefreshKnowledgeIndex` | Derive KnowledgeChunk, FTS5, embedding, and sqlite-vec state from a committed Concept. |
| Knowledge Policy | `RebuildKnowledgeIndex` | Deterministically rebuild derived state from canonical OKF after failure or model change. |
| User | `DeleteConcept` | Remove one Concept and all derived state while retaining the auditable deletion fact. |

Interaction transports the User's typed intent. Orchestration coordinates the Execution. Neither owns Knowledge aggregates or writes canonical knowledge directly.

## Main success timeline

| Order | Actor or owner | Command, event, or Policy outcome |
|---:|---|---|
| 1 | User | Reviews the existing `claude-video` evaluation artifact and selects the target KnowledgeBundle. |
| 2 | User through Interaction | Issues `PromoteArtifactToKnowledge` with artifact identity and target KnowledgeBundle identity. |
| 3 | Orchestration | Starts the coordinating Execution and publishes `KnowledgePromotionRequested`. |
| 4 | Approval & Security | Applies its Policy. The accepted direct-User flow creates no additional ApprovalRequest; the exact runtime RiskLevel remains a Hotspot. |
| 5 | Orchestration → Knowledge | Delivers the typed promotion request without exposing or mutating Knowledge internal models. |
| 6 | Knowledge → Tool Lab | Requests the immutable evaluation artifact through the Published Language boundary. |
| 7 | Tool Lab → Knowledge | Supplies the artifact snapshot, content digest, source identity, ToolVersion, EvaluationRun evidence, transcript provenance and confidence, and Execution/Trace references. |
| 8 | Knowledge | Verifies artifact identity, content hash, provenance completeness, target KnowledgeBundle identity, and source availability without re-fetching the remote video. |
| 9 | Knowledge Policy | Issues `RegisterKnowledgeSource`; Knowledge publishes `KnowledgeSourceRegistered`. |
| 10 | Knowledge | Checks exact content-hash identity and semantic supersession candidates before curation. |
| 11 | Knowledge Curator | Executes `CurateConcept`, treating all source content as untrusted data, and produces one source-faithful Concept. |
| 12 | Knowledge | Validates OKF frontmatter, provenance links, source references, content shape, and target KnowledgeBundle rules. |
| 13 | Knowledge Policy | Issues `IngestConcept` through the single Core KnowledgeWriter. |
| 14 | KnowledgeWriter | Serializes the promotion, writes the canonical OKF change, and creates the required Git commit. |
| 15 | Knowledge | Publishes `ConceptIngested` only after the Git commit succeeds. |
| 16 | Knowledge | If this is a meaningfully changed version, marks the prior version non-current and publishes `ConceptSuperseded` without rewriting history. |
| 17 | Knowledge Policy | Issues `RefreshKnowledgeIndex` for the committed Concept. |
| 18 | Knowledge | Derives KnowledgeChunk and FTS5 data from canonical OKF through KnowledgeWriter. |
| 19 | Knowledge → Model Gateway | Publishes `EmbeddingRequested` with chunk identity, content digest, and model-profile requirements. |
| 20 | Model Gateway → Knowledge | Returns `EmbeddingProduced` with model and version metadata; Model Gateway writes no canonical or shared index state. |
| 21 | Knowledge | Writes embedding references and sqlite-vec rows through KnowledgeWriter and publishes `KnowledgeIndexed`. |
| 22 | Knowledge → Orchestration/Interaction | Returns `KnowledgePromotionResult` with Concept identity, canonical Git commit, provenance summary, and IndexState. |
| 23 | Interaction | Shows the persisted, deletable Concept and its derived availability to the User. |
| 24 | Orchestration | Completes the coordinating Execution without treating derived-index availability as canonical durability. |

## Domain Events

### Promotion and source events

- `KnowledgePromotionRequested`
- `KnowledgeSourceRegistered`
- `KnowledgePromotionRejected`
- `ConceptIngestionDeduplicated`

### Canonical knowledge events

- `ConceptIngested`
- `ConceptSuperseded`
- `ConceptDeleted`

### Derived-index events

- `EmbeddingRequested`
- `EmbeddingProduced`
- `KnowledgeIndexed`
- `IndexRefreshDeferred`
- `IndexRebuilt`

The plan's existing `ConceptIngested`, `ConceptSuperseded`, `ConceptDeleted`, and `IndexRebuilt` names remain canonical. Other event names above are candidates pending the Phase 0 glossary and Context Map conclusion.

## Policies and alternative flows

| Trigger or condition | Policy outcome |
|---|---|
| Target KnowledgeBundle is missing or ambiguous | Request explicit selection; do not register a KnowledgeSource or infer scope. |
| Artifact identity is missing, digest does not match, or immutable snapshot is unavailable | Publish `KnowledgePromotionRejected`; write no canonical knowledge. |
| Required provenance is incomplete or unverifiable | Reject promotion before KnowledgeSource registration; retain failure only in Execution/Trace evidence. |
| Artifact contains instructions, prompts, code, or requests for capabilities | Treat them only as quoted source data. They cannot become Policy, Command, approval, or CapabilityGrant. |
| Safe separation of data from executable instruction cannot be established | Reject promotion and expose the unsafe-content reason. |
| Curated output fails OKF, provenance, source-link, or KnowledgeBundle validation | Write no Concept and return a correctable validation result. |
| Exact content hash already maps to a Concept version | Publish `ConceptIngestionDeduplicated`; return the existing Concept and create no new canonical write. |
| Content is meaningfully changed | Create a new Concept version, preserve the prior version, and publish `ConceptSuperseded`. |
| KnowledgeWriter queue contains concurrent writes | Serialize them; no agent, worker, ingestion tool, container, or Model Gateway bypasses the queue. |
| OKF file write or Git commit fails | Publish no `ConceptIngested`; block later conflicting writes until recovery establishes one durable canonical state. |
| Git commit succeeds but FTS5 refresh fails | Keep the Concept canonical, publish `IndexRefreshDeferred`, report degraded availability, and schedule idempotent recovery. |
| Model Gateway is unavailable or embedding fails | Keep the Concept and any valid FTS5 state; report vector availability as pending or degraded and retry safely. |
| A retry sees the expected current Concept digest and model version | Resume derived indexing idempotently without rewriting canonical OKF. |
| Embedding model version changes | Execute `RebuildKnowledgeIndex` from canonical OKF; publish `IndexRebuilt` only after deterministic completion. |
| User issues `DeleteConcept` | Remove Concept, KnowledgeChunk, FTS5, embedding references, and sqlite-vec rows together, then publish `ConceptDeleted`. |
| Promotion would require new remote access | End this flow and start a separately authorized Integration ingestion or Tool Lab evaluation flow. |

## Invariants

- No Concept exists without a registered KnowledgeSource and complete provenance.
- OKF Markdown with provenance and Git history is canonical; FTS5, embeddings, sqlite-vec, KnowledgeChunk, and IndexState are derived.
- A Concept is not durably ingested until its valid OKF change has a successful Git commit.
- `ConceptIngested` is never published before the Git durability gate.
- All persistent canonical and derived writes cross the single Core KnowledgeWriter boundary.
- WAL enables concurrent reads; it does not create multiple durable writers.
- Source content is always untrusted data and cannot authorize effects or alter Policy.
- One accepted artifact produces one curated Concept in this flow.
- The initial typed User Command authorizes validation, curation, and persistence in this successful flow; artifact production alone authorizes nothing.
- Exact duplicates are idempotent and never create a second Concept version.
- Meaningfully changed content creates a new version and preserves superseded history.
- Derived-index failure cannot roll back or invalidate a committed Concept.
- Model Gateway produces embeddings but cannot write OKF, FTS5, or sqlite-vec state.
- Promotion never re-fetches the remote video; new acquisition is a separate flow.
- Deleting a Concept removes its chunks and every derived index entry together.
- Runtime RiskLevel cannot be inferred from GitHub Project Risk.

## Bounded-context ownership and Published Language

| Boundary | Published Language responsibility |
|---|---|
| User surface → Interaction | Typed `PromoteArtifactToKnowledge` with artifact and target KnowledgeBundle identities. |
| Interaction → Orchestration | User intent and correlation identity; no Knowledge internal model. |
| Orchestration → Approval & Security | Intended action, scope, effects, Execution and Trace for Policy evaluation. |
| Approval & Security → Orchestration | Policy result and, if ever required outside the accepted success path, an immutable ApprovalRequest decision. |
| Orchestration → Knowledge | Typed promotion request and correlation identity. |
| Tool Lab → Knowledge | Immutable EvaluationArtifactSnapshot with artifact, source, ToolVersion, EvaluationRun, provenance and confidence data. |
| Integration → Knowledge | New external source snapshot only in a separate acquisition flow; Integration is inactive in the accepted success path. |
| Knowledge → Model Gateway | EmbeddingRequested with chunk digest and model requirements, never a direct database write request. |
| Model Gateway → Knowledge | EmbeddingProduced with vector, model identity and model version. |
| Knowledge → Orchestration/Interaction | KnowledgePromotionResult with Concept identity, Git commit, provenance summary and IndexState. |

Knowledge owns KnowledgeSource, Provenance, KnowledgeBundle, Concept, KnowledgeChunk, derived-index lifecycle, curation Policy, and the KnowledgeWriter contract. Core hosts the serialized KnowledgeWriter. Tool Lab owns the evaluation artifact and its evidence. Model Gateway owns embedding production. Integration owns separately authorized external acquisition. Approval & Security owns runtime Policy and ApprovalRequest. Orchestration owns the coordinating Execution. Interaction owns presentation and typed User input.

## Hotspots and resolution paths

| Hotspot | Current resolution or next resolution path |
|---|---|
| What runtime RiskLevel applies to PromoteArtifactToKnowledge? | Do not infer it from Project Risk. Preserve it for Approval & Security and Phase 0 glossary work. |
| What is the exact Tool Lab → Knowledge contract name and schema? | Use EvaluationArtifactSnapshot as a candidate; ratify the Published Language boundary in issue #15. |
| What are the minimum provenance fields? | The successful example requires artifact/source identity, acquisition time, digest, ToolVersion, EvaluationRun, transcript source/confidence and Execution/Trace. Ratify the reusable schema in glossary/tactical design. |
| What counts as meaningfully changed content? | Exact hash equality is deterministic. Semantic supersession threshold and human escalation remain a glossary/tactical-design decision. |
| How are OKF file write and Git commit recovered across a partial failure? | KnowledgeWriter serializes and blocks conflicting writes; the precise recovery protocol requires a later ADR/tactical design because filesystem and Git are not one database transaction. |
| What are the exact IndexState names? | Use current/pending/degraded descriptively in this record; ratify canonical values before implementation. |
| May Tool Lab publish directly to Knowledge? | The accepted example uses a narrow immutable artifact contract. Confirm whether this is direct Published Language or an Integration ACL route in issue #15. |

## Verification design

The later implementation must prove at least these scenarios without real provider or remote-source calls in the automated suite:

1. Valid artifact and provenance produce one committed Concept and a source-linked promotion result.
2. Missing provenance, digest mismatch, ambiguous KnowledgeBundle, or unsafe source handling produces no canonical write.
3. Embedded prompt or code text remains data and cannot request capabilities or change Policy.
4. Exact duplicate returns the same Concept identity without a second Git commit.
5. Meaningfully changed input creates a new version and publishes `ConceptSuperseded` while preserving history.
6. Concurrent promotions serialize through one KnowledgeWriter.
7. OKF write or Git commit failure publishes no `ConceptIngested` and enters an observable recovery state.
8. FTS5, Model Gateway, or sqlite-vec failure preserves the Concept and reports pending or degraded availability.
9. Rebuild from canonical OKF is deterministic and records the embedding-model version.
10. `DeleteConcept` removes the Concept and every KnowledgeChunk and derived index entry together.
11. Promotion performs no remote fetch; any attempted network acquisition exits to a separately authorized flow.

## Product-owner review evidence

**Conversational review outcome:** The product owner selected the artifact-first controlled-promotion approach and approved the successful flow, bounded-context ownership, Policies, failure flows, invariants, Commands, past-tense Domain Events, Published Language, Hotspots, and verification design section by section on 2026-07-14.

**Written-record review outcome:** Explicitly accepted by the product owner on 2026-07-14 without requested changes.

Issue #14 may move to Review only when all of the following are true:

1. The product owner explicitly accepts this written record or requested changes are incorporated and reviewed again.
2. Actors, intent-expressing Commands, past-tense Domain Events, Policies, failure flows, Hotspots, invariants, and Published Language boundaries remain explicit.
3. Knowledge owns canonical knowledge; Tool Lab, Integration, Model Gateway, Approval & Security, Orchestration, and Interaction responsibilities remain separated.
4. Provenance, untrusted-data handling, one KnowledgeWriter, Git durability, idempotency, supersession, derived-index recovery, rebuild, and cascading deletion remain explicit.
5. Project Risk and runtime RiskLevel remain distinct; no runtime classification is inferred or manufactured.
6. Repository tests, operating-model and Markdown-link validation, HandoffBrief schema validation, and whitespace checks pass with fresh evidence.
7. The current HandoffBrief records the written review outcome, fresh verification, open loops, pending HITL requests, and exactly one next action.
