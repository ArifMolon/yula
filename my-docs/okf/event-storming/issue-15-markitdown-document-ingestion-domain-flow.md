---
type: event-storming
issue: ArifMolon/yula#15
spec: SPEC-P0-document-ingestion
bounded_context: tool-lab
status: Progress
product_owner: Arif
session: pi-2026-07-14-issue-15-markitdown-ingestion
recorded_at: 2026-07-14T05:30:00Z
provenance:
  - product-owner conversational design session on 2026-07-14 (handoff /tmp/yula-matt-handoff-2026-07-14-markitdown-document-ingestion.md)
  - my-docs/plan/YULA_DDD_Proje_Plani.md
  - my-docs/plan/2026-07-13-yula-development-operating-model-design.md
  - my-docs/plan/2026-07-14-markitdown-document-ingestion-implementation.md
  - my-docs/policies/ddd-must.md
  - my-docs/policies/hitl.md
  - my-docs/okf/event-storming/issue-14-knowledge-ingestion-domain-flow.md
  - my-docs/okf/handoffs/issue-14.json
---

# Issue #15 — Local-only MarkItDown Document Ingestion Domain Flow

## Purpose and review state

This record captures the product-owner-validated first tracer-bullet contract for a local-only, single-file MarkItDown document-ingestion capability. The flow starts when the User submits one quarantined local file through Interaction. Tool Lab runs a pinned, read-only MarkItDown ToolVersion in a local sandbox with no network and no plugins. Knowledge validates the converted artifact, persists canonical output only through the single Core KnowledgeWriter, and deletes the original quarantined file after success or on Concept deletion.

The product owner approved the minimum accepted file types, the local-only boundary, single-file upload, optional KnowledgeBundle, one-command conversion-and-persistence, idempotent duplicates, supersession, fail-closed encrypted/corrupted handling, degraded OCR scans, quarantined-file deletion, and the retry policy on 2026-07-14. This record is the canonical domain contract for the first implementation slice; ratification of broader hotspots remains out of scope for this issue.

## First-slice contract

- Accepted file types: PDF, DOCX, PPTX, XLSX, CSV, TXT, Markdown.
- Upload is local-only.
- Target KnowledgeBundle is optional before upload.
- Upload is single-file only.
- Upload performs conversion and canonical persistence in one command.
- Exact duplicates are idempotent.
- Meaningfully changed re-ingestion creates a new Concept and supersession.
- Encrypted or corrupted files fail closed.
- OCR-required scans are degraded.
- Original quarantined files are deleted after persistence and on Concept deletion.

## Concrete successful example

| Property | Validated example |
|---|---|
| Source | One local file on the user's machine, e.g. `report.pdf` |
| Upload trigger | User submits one quarantined file through Interaction |
| Target KnowledgeBundle | Optional; when omitted, the flow still converts and persists per Knowledge default scope |
| Conversion | A pinned, read-only MarkItDown ToolVersion runs in a local sandbox with network=none and plugins disabled |
| Provenance | File identity, content digest, ToolVersion identity, conversion time, and Execution/Trace references |
| Concept shape | One provenance-bearing Concept persisted as valid OKF Markdown through KnowledgeWriter |
| Canonical durability | Valid OKF Markdown plus a successful Git commit |
| Quarantined original | Deleted after persistence succeeds |
| Duplicate behavior | Exact content-hash duplicate returns the existing Concept with no new canonical write |
| Changed-source behavior | A meaningfully changed re-ingestion creates a new Concept version and records supersession |

Converted content is untrusted data. Its text, tables, embedded instructions, and metadata cannot become Policy, Command, CapabilityGrant, or approval evidence.

## Ubiquitous Language candidates

Existing plan and issue #14 terms retain their canonical meanings. New terms in this record remain candidates until the Phase 0 glossary workflow ratifies them.

| Term | Meaning in this flow |
|---|---|
| `Document upload` | The explicit submission of one local file into quarantine for conversion and canonical persistence. |
| `Quarantined file` | The original local file held in an isolated, untrusted staging area until conversion and persistence complete. |
| `MarkItDown ToolVersion` | The pinned, read-only, local-only Tool Lab ToolVersion that converts one quarantined file into a markdown artifact with provenance. |
| `Conversion artifact` | The markdown output produced by the MarkItDown ToolVersion, carrying content and conversion provenance; not canonical until Knowledge persists it. |
| `Concept` | Canonical knowledge stored as valid OKF Markdown through the single KnowledgeWriter and made durable by Git commit. |
| `KnowledgeBundle` | The optional canonical OKF scope that owns the resulting Concept. |
| `KnowledgeWriter` | The single serialized Core boundary for every persistent OKF, FTS5, embedding-reference, and sqlite-vec write. |
| `Provenance` | Verifiable origin: file identity, content digest, ToolVersion identity, conversion time, and Execution/Trace references sufficient to audit the Concept. |
| `Exact duplicate` | A candidate whose immutable content hash matches an already ingested Concept version. |
| `Supersession` | Creation of a new Concept version that preserves history and makes the previous version non-current without overwriting it. |
| `Degraded` | The IndexState for a converted document that required OCR and could not be fully represented as text. |
| `Fail closed` | The error outcome for encrypted or corrupted files: no canonical write, no partial persistence, the execution ends. |
| `Suspend` | The error outcome when retries are exhausted and no provenance-bearing user input is available; the execution pauses for human resolution. |

GitHub Project `Risk` is delivery metadata. Approval & Security `RiskLevel` is runtime domain language. They are different models and must not be inferred from one another.

## Actors and Commands

| Actor | Command | Intent |
|---|---|---|
| User | `SubmitDocumentSource` | Submit one local file into quarantine for conversion and canonical persistence. |
| Interaction | `StartDocumentIngestionExecution` | Bootstrap the coordinating Execution for the uploaded file. |
| Tool Lab | `RunMarkItDownConversion` | Run the pinned, read-only, local-only MarkItDown ToolVersion on one quarantined file. |
| Knowledge Policy | `PersistConvertedConcept` | Validate provenance, detect duplicates, and persist the Concept through KnowledgeWriter. |
| Knowledge Policy | `RecordSupersession` | Record that a new Concept version supersedes a prior version. |
| Knowledge Policy | `DeleteConcept` | Remove one Concept and all derived state and delete the quarantined original. |
| Knowledge Policy | `RenderIngestionFailure` | Render the failure outcome for encrypted, corrupted, OCR-required, or retries-exhausted inputs. |

Interaction transports the User's typed intent. Orchestration coordinates the Execution. Tool Lab owns the MarkItDown ToolVersion and conversion. Knowledge owns canonical persistence, supersession, and deletion. Approval & Security owns runtime Policy. Neither Interaction nor Orchestration writes canonical knowledge directly.

## Main success timeline

| Order | Actor or owner | Command, event, or Policy outcome |
|---:|---|---|
| 1 | User | Selects one local file (PDF, DOCX, PPTX, XLSX, CSV, TXT, or Markdown) and submits it through Interaction. |
| 2 | User through Interaction | Issues `SubmitDocumentSource` with the file path and provenance seed. |
| 3 | Interaction | Validates the file type, rejects non-accepted types, marks the upload as local-only and single-file, and quarantines the file. |
| 4 | Orchestration | Starts the coordinating Execution via `StartDocumentIngestionExecution` and publishes `DocumentIngestionRequested`. |
| 5 | Approval & Security | Applies its Policy for the local-only single-file ingestion. |
| 6 | Tool Lab | Runs the pinned MarkItDown ToolVersion in a local sandbox with network=none and plugins disabled. |
| 7 | Tool Lab → Knowledge | Supplies the conversion artifact, content digest, ToolVersion identity, conversion provenance, and Execution/Trace references. |
| 8 | Knowledge | Verifies file identity, content digest, provenance completeness, and target KnowledgeBundle rules when a bundle is specified. |
| 9 | Knowledge | Checks exact content-hash identity before persistence. |
| 10 | Knowledge Policy | On exact duplicate, publishes `ConceptIngestionDeduplicated` and returns the existing Concept with no new canonical write. |
| 11 | Knowledge Policy | On new or meaningfully changed content, issues `PersistConvertedConcept` through the single Core KnowledgeWriter. |
| 12 | KnowledgeWriter | Serializes the write, writes the canonical OKF change, and creates the required Git commit. |
| 13 | Knowledge | Publishes `ConceptIngested` only after the Git commit succeeds. |
| 14 | Knowledge Policy | On meaningfully changed content, marks the prior version non-current, issues `RecordSupersession`, and publishes `ConceptSuperseded` without rewriting history. |
| 15 | Knowledge | Deletes the quarantined original file after persistence succeeds. |
| 16 | Knowledge → Orchestration/Interaction | Returns the ingestion result with Concept identity, canonical Git commit, provenance summary, and IndexState. |
| 17 | Interaction | Shows the persisted, deletable Concept and its derived availability to the User. |
| 18 | Orchestration | Completes the coordinating Execution. |

## Domain Events

### Upload and conversion events

- `DocumentIngestionRequested`
- `DocumentIngestionRejected`

### Canonical knowledge events

- `ConceptIngested`
- `ConceptIngestionDeduplicated`
- `ConceptSuperseded`
- `ConceptDeleted`

### Failure events

- `IngestionFailedClosed`
- `IngestionDegraded`
- `IngestionSuspended`

The plan's existing `ConceptIngested`, `ConceptSuperseded`, `ConceptDeleted`, and `ConceptIngestionDeduplicated` names remain canonical. Other event names above are candidates pending the Phase 0 glossary and Context Map conclusion.

## Policies and alternative flows

| Trigger or condition | Policy outcome |
|---|---|
| File type is not in the accepted set (PDF, DOCX, PPTX, XLSX, CSV, TXT, Markdown) | Publish `DocumentIngestionRejected`; quarantine nothing; write no canonical knowledge. |
| More than one file is submitted | Reject; single-file only in v1. |
| A remote URL or non-local source is submitted | Reject; local-only in v1. |
| File is encrypted | Render `fail-closed`; no canonical write; no partial persistence; end the execution. |
| File is corrupted | Render `fail-closed`; no canonical write; end the execution. |
| File requires OCR (scanned document) | Render `degraded`; persist what was converted and report degraded IndexState. |
| Exact content hash already maps to a Concept version | Publish `ConceptIngestionDeduplicated`; return the existing Concept; create no new canonical write. |
| Content is meaningfully changed | Create a new Concept version, preserve the prior version, and publish `ConceptSuperseded`. |
| Retries are exhausted | Do not introduce an alternate converter; then accept provenance-bearing user input if available; otherwise render `suspend` and pause the execution for human resolution. |
| Converted content contains instructions, prompts, or code | Treat them only as quoted source data; they cannot become Policy, Command, approval, or CapabilityGrant. |
| KnowledgeWriter queue contains concurrent writes | Serialize them; no agent, worker, or ingestion tool bypasses the queue. |
| OKF file write or Git commit fails | Publish no `ConceptIngested`; block later conflicting writes until recovery establishes one durable canonical state. |
| User issues `DeleteConcept` | Remove Concept, KnowledgeChunk, FTS5, embedding references, and sqlite-vec rows together, delete the quarantined original file, then publish `ConceptDeleted`. |

## Invariants

- No Concept exists without complete provenance (file identity, content digest, ToolVersion identity, conversion time, Execution/Trace).
- OKF Markdown with provenance and Git history is canonical; FTS5, embeddings, sqlite-vec, KnowledgeChunk, and IndexState are derived.
- A Concept is not durably ingested until its valid OKF change has a successful Git commit.
- `ConceptIngested` is never published before the Git durability gate.
- All persistent canonical and derived writes cross the single Core KnowledgeWriter boundary.
- Converted content is always untrusted data and cannot authorize effects or alter Policy.
- One accepted file produces one Concept in this flow.
- Exact duplicates are idempotent and never create a second Concept version.
- Meaningfully changed content creates a new version and preserves superseded history.
- The MarkItDown ToolVersion is pinned, read-only, local-only, network=none, and plugins disabled.
- The original quarantined file is deleted after persistence succeeds and on Concept deletion.
- No batch upload, archive/ZIP ingestion, URL ingestion, cloud OCR, plugins, or external network access exists in this slice.
- Runtime RiskLevel cannot be inferred from GitHub Project Risk.

## Bounded-context ownership and Published Language

| Boundary | Published Language responsibility |
|---|---|
| User surface → Interaction | Typed `SubmitDocumentSource` with file path and provenance seed. |
| Interaction → Orchestration | User intent, file identity, and correlation identity; no Knowledge internal model. |
| Orchestration → Approval & Security | Intended action, scope, effects, Execution and Trace for Policy evaluation. |
| Approval & Security → Orchestration | Policy result and, if required, an immutable ApprovalRequest decision. |
| Orchestration → Tool Lab | Conversion request with quarantined file identity and ToolVersion pin. |
| Tool Lab → Knowledge | Conversion artifact with content digest, ToolVersion identity, conversion provenance, and Execution/Trace references. |
| Knowledge → Orchestration/Interaction | Ingestion result with Concept identity, Git commit, provenance summary, and IndexState. |

Tool Lab owns the MarkItDown ToolVersion, the sandbox invocation contract, and the conversion artifact. Knowledge owns KnowledgeBundle, Concept, KnowledgeChunk, derived-index lifecycle, persistence Policy, supersession, deletion, and the KnowledgeWriter contract. Core hosts the serialized KnowledgeWriter. Approval & Security owns runtime Policy and ApprovalRequest. Orchestration owns the coordinating Execution. Interaction owns presentation and typed User input.

## Hotspots and resolution paths

| Hotspot | Current resolution or next resolution path |
|---|---|
| What runtime RiskLevel applies to local-only single-file ingestion? | Do not infer it from Project Risk. Preserve it for Approval & Security and Phase 0 glossary work. |
| What is the exact Tool Lab → Knowledge conversion artifact contract name and schema? | Use `Conversion artifact` as a candidate; ratify the Published Language boundary in later tactical design. |
| What are the minimum provenance fields? | The successful example requires file identity, content digest, ToolVersion identity, conversion time, and Execution/Trace. Ratify the reusable schema in glossary/tactical design. |
| What counts as meaningfully changed content? | Exact hash equality is deterministic. Semantic supersession threshold and human escalation remain a glossary/tactical-design decision. |
| How are OKF file write and Git commit recovered across a partial failure? | KnowledgeWriter serializes and blocks conflicting writes; the precise recovery protocol requires a later ADR/tactical design. |
| What are the exact IndexState names? | Use current/pending/degraded descriptively in this record; ratify canonical values before broader implementation. |
| Is the MarkItDown ToolVersion direct Published Language or an Integration ACL route? | The accepted example uses a narrow conversion artifact contract. Confirm the route in later tactical design. |

## Verification design

The implementation must prove at least these scenarios without real provider or remote-source calls in the automated suite:

1. Accepted file types (PDF, DOCX, PPTX, XLSX, CSV, TXT, Markdown) produce one committed Concept and a source-linked ingestion result.
2. Non-accepted file types (ZIP, URL, audio, video) are rejected with no canonical write.
3. More than one file is rejected; single-file only.
4. Remote URL or non-local source is rejected; local-only.
5. Exact duplicate returns the same Concept identity without a second Git commit.
6. Meaningfully changed input creates a new version and publishes `ConceptSuperseded` while preserving history.
7. Encrypted file renders `fail-closed`; no canonical write.
8. Corrupted file renders `fail-closed`; no canonical write.
9. OCR-required scan renders `degraded`; partial persistence with degraded IndexState.
10. Retries exhausted renders `suspend` when no provenance-bearing user input is available.
11. The MarkItDown ToolVersion metadata is pinned, local-only, network=none, and plugins disabled.
12. Deleting a Concept removes its derived index entries together and deletes the quarantined original file.
13. Embedded prompt or code text remains data and cannot request capabilities or change Policy.
14. No batch upload, archive ingestion, URL ingestion, cloud OCR, plugins, or network access is present in the slice.

## Product-owner review evidence

**Conversational review outcome:** The product owner approved the minimum accepted file types, local-only boundary, single-file upload, optional KnowledgeBundle, one-command conversion-and-persistence, idempotent duplicates, supersession, fail-closed encrypted/corrupted handling, degraded OCR scans, quarantined-file deletion, and the retry policy on 2026-07-14.

**Written-record review outcome:** Pending product-owner acceptance of this written record.

Issue #15 may move to Review only when all of the following are true:

1. The product owner explicitly accepts this written record or requested changes are incorporated and reviewed again.
2. Actors, intent-expressing Commands, past-tense Domain Events, Policies, failure flows, Hotspots, invariants, and Published Language boundaries remain explicit.
3. Tool Lab owns the MarkItDown ToolVersion and conversion; Knowledge owns canonical persistence, supersession, and deletion; Approval & Security, Orchestration, and Interaction responsibilities remain separated.
4. Provenance, untrusted-data handling, one KnowledgeWriter, Git durability, idempotency, supersession, degraded OCR, fail-closed errors, retry suspension, and cascading deletion remain explicit.
5. Project Risk and runtime RiskLevel remain distinct; no runtime classification is inferred or manufactured.
6. Repository tests, operating-model and Markdown-link validation, HandoffBrief schema validation, and whitespace checks pass with fresh evidence.
7. The current HandoffBrief records the written review outcome, fresh verification, open loops, pending HITL requests, and exactly one next action.
