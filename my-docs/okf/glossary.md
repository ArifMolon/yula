---
type: glossary
version: v1.1
spec: SPEC-P0-ubiquitous-language
issue: ArifMolon/yula#2
revision_issue: ArifMolon/yula#3
bounded_context: agent-studio
status: Prod
product_owner: Arif
ratified_at: 2026-07-14T08:30:00Z
session: pi-2026-07-14-issue-2-freeze-glossary
recorded_at: 2026-07-14T08:00:00Z
provenance:
  - my-docs/plan/YULA_DDD_Proje_Plani.md (§3.2 seed glossary; §3.3 bounded contexts)
  - my-docs/policies/ddd-must.md
  - my-docs/okf/context-map/conclusion.md (deferred hotspots #2-#5)
  - my-docs/okf/event-storming/issue-12-task-execution-domain-flow.md
  - my-docs/okf/event-storming/issue-13-tool-onboarding-domain-flow.md
  - my-docs/okf/event-storming/issue-14-knowledge-ingestion-domain-flow.md
  - my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md
  - my-docs/okf/handoffs/issue-16.json
  - my-docs/okf/handoffs/issue-2.json
  - my-docs/adr/0017-tool-lab-to-knowledge-route.md (issue #3, glossary v1.1 note)
---

# Glossary v1 — Phase 0 Ubiquitous Language

## Purpose and review state

This is the binding Phase 0 glossary for YULA. It is the single canonical reference for domain terms used in code, tests, schemas, and Project language. Terms are written in English and used verbatim in code; the definition sentence is binding.

This record is in `Review` status pending product-owner ratification (R1 HITL). It does not become canonical (`Prod`) until the product owner ratifies it. No agent may infer, manufacture, or replay that ratification. New domain terms added after ratification require a glossary change before merge, per the DDD MUST policy.

## How to use this glossary

- Code, tests, schemas, migration, and domain-facing UI copy use the **Term (EN)** verbatim. Deriving synonyms is prohibited (`Task` exists; `Job` is not invented).
- Each term has exactly one **owning bounded context**. A term used across contexts keeps its owning-context meaning; if a word takes a different meaning in another context, that is a bounded-context boundary and this glossary records which meaning applies where.
- Numeric-only context identifiers (`BC-1`) are excluded from daily work; use the full bounded-context name (e.g. `Orchestration`).
- Prohibited domain names per the DDD MUST policy: `Manager`, `Helper`, `Utils`, `CommonService`, `process`, `updateData`, and unrestricted `setStatus`. They do not appear in the domain layer.

## Bounded contexts (12)

These twelve full names are binding. The order is canonical and matches `AGENTS.md` and the DDD plan §3.3.

| # | Bounded Context (full name) | Owning code unit | Phase |
|---:|---|---|---|
| 1 | Orchestration | Elixir/OTP umbrella `orchestration/` | Core (Phase 0+) |
| 2 | Agent Studio | Elixir/OTP umbrella `agent_studio/` + Tauri UI | Core (Phase 0+) |
| 3 | Tool Lab | Elixir domain + Rust tool runner + Podman | Core (Phase 0+) |
| 4 | Knowledge | Rust module + Elixir API | Core (Phase 0+) |
| 5 | Workspace | Elixir domain + Tauri UI | Supporting (Phase 0+) |
| 6 | Model Gateway | Elixir + provider adapters | Supporting (Phase 0+) |
| 7 | Interaction | Tauri UI + Rust voice module | Supporting (Phase 0+) |
| 8 | Approval & Security | Elixir | Supporting-critical (Phase 0+) |
| 9 | Integration | Elixir adapters | Supporting/generic (Phase 0+) |
| 10 | Observability & Cost | Elixir + SQLite/JSONL | Supporting (Phase 0+) |
| 11 | Remote Access | (deferred) E2EE relay | Phase 6 |
| 12 | Identity & Secrets | OS keychain integration | Generic (Phase 0+) |

## Seed terms (Phase 0 core, from plan §3.2)

These terms are carried from the plan's §3.2 seed glossary. Their definitions are binding. The owning context is recorded for each.

| Term (EN) | Definition | Owning context |
|---|---|---|
| Workspace | The top-level working context representing one user persona (Home, Work, Learn, R&D, Mim-R, Author, Journalist). Carries its own KnowledgeBundle, agent bindings, and policies. | Workspace |
| Project | A working unit under a Workspace that can connect to connectors and carries files and Tasks. | Workspace |
| AgentDefinition / AgentVersion | A versioned declarative definition of an expert worker: persona, instruction, model policy, skill list, permissions, memory access, budget, eval criteria. Immutable version. | Agent Studio |
| AgentBinding | The binding of an AgentVersion to a global, Workspace, or Project scope. | Agent Studio |
| Skill / SkillVersion | A versioned method package describing *how* to do a job (manifest + instruction + test). | Agent Studio |
| Tool / ToolVersion | An executable capability: MCP server, CLI, HTTP service, or container image; carries license + security grade. | Tool Lab |
| ToolGrade | The result of Tool Lab evaluation: `quarantined` → `evaluated` → `approved` → `deprecated`. | Tool Lab |
| ToolLabSession | One isolated test run of a Tool candidate in a Podman sandbox. | Tool Lab |
| Workflow / WorkflowVersion | A versioned flow definition composed of nodes/edges, retry, parallelism, and approval points. | Agent Studio |
| Execution / StepExecution | The runtime record of a Workflow/Agent run; all bound versions are immutable for that Execution. | Orchestration |
| Task | A Project-scoped unit of intended work with dependencies, priority, acceptance criteria, and a lifecycle owned by Orchestration. A GitHub Issue is an external record that Integration may map to a Task; it is not the Orchestration model. | Orchestration |
| Delegated Execution | Scoped, expiring authority for YULA to choose and start eligible Tasks within a project or spec, risk ceiling, and concurrency limit. UI alias "YOLO Mode" may exist but is not canonical. | Orchestration |
| ProjectProgressReport | A provenance-bearing view of the last completed step, active Task, eligible next Tasks, blockers, pending human decisions, source conflicts, and source freshness. | Orchestration |
| ProjectProgressSource | A Project-configured authoritative or optional source used to establish delivery or implementation state. | Workspace |
| ApprovalRequest | The submission of an R2+ risky action to a human decision: summary, RiskLevel, diff, duration, decision. | Approval & Security |
| RiskLevel (R0–R4) | The action risk class: R0 read-only … R4 financial/destructive (analysis §12.2). Runtime domain language in Approval & Security; distinct from GitHub Project `Risk` (delivery metadata). | Approval & Security |
| CapabilityGrant | A narrowed permission granted to an agent/skill: command family, folder, domain, secret scope. | Approval & Security |
| ModelProvider / ModelProfile | The provider endpoint and the single model's capability/cost/data-policy profile. | Model Gateway |
| ModelPolicy | The agent's model selection strategy: quality-first, local-only, cheap, fast. | Model Gateway |
| PromptProfile / PromptVersion | Versioned, atomically-activated management of default system prompts (draft → active → rollback). | Model Gateway |
| KnowledgeBundle | A Workspace's OKF v0.1-compliant, git-versioned markdown knowledge repository (canonical record). | Knowledge |
| Concept | A single knowledge document inside a KnowledgeBundle (frontmatter `type` required; Concept ID = file path). | Knowledge |
| KnowledgeChunk | A derived segment of a committed Concept, carrying Concept identity and embedding-model version where applicable. Derived; rebuildable at any time. | Knowledge |
| IndexState | The derived availability state for a committed Concept. Canonical names: `current`, `pending`, `degraded`. | Knowledge |
| Provenance | Verifiable origin of knowledge: URL/file/execution + timestamp + confidence + ToolVersion/EvaluationRun identity. No sourceless knowledge may be written. | Knowledge |
| EvaluationArtifactSnapshot | An immutable Published Language representation of one Tool Lab evaluation artifact: identity, digest, source, and evaluation provenance. Candidate contract name; confirmed here as the Phase 0 canonical name for the Tool Lab → Knowledge evaluation-artifact contract. | Knowledge |
| ConversionArtifact | An immutable Published Language representation of one MarkItDown ToolVersion conversion output: content digest, ToolVersion identity, conversion provenance. Canonical Phase 0 name for the Tool Lab → Knowledge document-conversion contract. | Knowledge |
| KnowledgeSource | The provenance-bearing source aggregate registered before a Concept can be ingested. | Knowledge |
| KnowledgeWriter | The single serialized Core boundary for every persistent OKF, FTS5, embedding-reference, and sqlite-vec write. Agents, workers, and ingestion tools never write shared SQLite state directly. | Knowledge |
| KnowledgePromotion | The explicit transition from a reviewed non-canonical artifact to a provenance-bearing canonical Concept. | Knowledge |
| Exact duplicate | A candidate whose immutable content hash matches an already-ingested Concept version. | Knowledge |
| Supersession | Creation of a new Concept version that preserves history and makes the previous version non-current without overwriting it. | Knowledge |
| SessionJournal | A structured summary of one interaction session; the carrier of context continuity (§6.4). | Knowledge |
| HandoffBrief | The compact context packet handed from one agent to another (or session to session). | Knowledge |
| EvaluationSuite / EvaluationRun | The test set and run result for an agent/skill/tool; the evidence for promotion decisions. | Agent Studio |
| AuditEvent | An immutable action record: who, which agent, which model, which tool, which parameters. | Approval & Security |
| SecretReference | Not the secret itself; an OS keychain reference + scope. | Identity & Secrets |
| Device / Pairing | Desktop/mobile device identity, key, and revocation state (Remote Access phase). | Remote Access |
| Published Language | The contracts, events, ports, or APIs through which bounded contexts communicate. Another context's internal model is private. | (cross-cutting) |
| Hotspot | An open question surfaced during Event Storming, classified as resolved (with an explicit decision), deferred to a named later issue, or recorded as a Context Map correction. | Orchestration |
| Context Map | The canonical record of bounded-context boundaries, Published Language relationships, and confirmed corrections. | Orchestration |

## Boundary markers

These rules disambiguate words that could take different meanings across contexts.

- **Agent**: used only in the AgentDefinition/AgentVersion context. Operating-system processes are "worker". Agents on the Mastra/CARB side are "CARB agent". If the same word takes a different meaning in another context, the bounded-context boundary decides and this glossary records which meaning applies where.
- **Risk**: GitHub Project `Risk` is delivery metadata. Approval & Security `RiskLevel` is runtime domain language. They are different models and must not be inferred from one another.
- **Tool vs Skill**: A `ToolVersion` is an executable capability (MCP/CLI/HTTP/container). A `SkillVersion` is a versioned method package (manifest + instruction + test). The repository packages itself as a skill, but an executable pipeline is evaluated as a ToolVersion candidate; whether its `SKILL.md` must later be decomposed into a separate `SkillVersion` is a resolved hotspot (deferred re-test is closed by this glossary: both terms are binding and distinct).
- **Blocked**: not a Task state; an eligibility condition with an explicit cause (unmet dependency, pending approval, exhausted budget, source conflict, uncertain external effect).
- **Knowledge durability**: OKF Markdown with provenance and Git history is canonical; FTS5, embeddings, sqlite-vec, KnowledgeChunk, and IndexState are derived and rebuildable.

## Glossary v1.1 note (issue #3 — Tool Lab → Knowledge Published Language)

Issue #3 resolved Context Map conclusion hotspot #6 in favor of a direct Published Language route (ADR-0017). To record the resulting shared status without moving any term out of its owning context, this note applies to two existing terms:

- `EvaluationArtifactSnapshot` — **shared Published Language**; Tool Lab publishes it, Knowledge consumes it. The owning context for the term definition stays Knowledge.
- `ConversionArtifact` — **shared Published Language**; Tool Lab publishes it, Knowledge consumes it. The owning context for the term definition stays Knowledge.

No term is moved between bounded-context columns by this note. The producer/consumer split reflects ADR-0017: Tool Lab owns the contract and publishes the immutable artifact; Knowledge consumes it through the single `KnowledgeWriter`; Orchestration carries only a promotion `Command` with a reference, never the payload.

## Deferred-hotspot names resolved here (from Context Map conclusion)

Issue #16 deferred four naming hotspots to this glossary. They are resolved here:

| # | Deferred hotspot (from #16) | Resolution in Glossary v1 |
|---:|---|---|
| 1 | Tool Lab → Knowledge contract name and schema (evaluation artifact) | `EvaluationArtifactSnapshot` is the canonical Phase 0 name for the Tool Lab → Knowledge evaluation-artifact contract. |
| 2 | Tool Lab → Knowledge conversion artifact contract name | `ConversionArtifact` is the canonical Phase 0 name for the MarkItDown ToolVersion → Knowledge document-conversion contract. |
| 3 | Minimum provenance schema | Provenance requires: source identity (URL/file/execution), acquisition time, content digest, ToolVersion identity, EvaluationRun identity (for evaluation artifacts) or conversion time (for document conversion), transcript source and confidence (where applicable), and Execution/Trace references. This is the binding Phase 0 minimum; tactical design may extend it but may not reduce it. |
| 4 | "Meaningfully changed" semantic threshold | Exact content-hash equality is deterministic and defines an Exact duplicate. "Meaningfully changed" is the threshold above which a re-ingestion creates a new Concept version and Supersession. The Phase 0 binding: any change to the curated Concept content hash beyond exact equality is treated as meaningfully changed and triggers Supersession; a narrower semantic threshold and human-escalation rule may be refined in tactical design but cannot weaken this default. |
| 5 | IndexState canonical names | `current`, `pending`, `degraded` are the binding canonical IndexState names. |

(Note: Context Map conclusion hotspot #5 was named "IndexState canonical names" and is resolved as row 5 above; it corresponds to deferred-hotspot line item 5 in the conclusion's deferred table.)

## Terms explicitly out of scope for Glossary v1

These remain candidates or tactical-design decisions and are **not** ratified in Glossary v1. They were owned by issue #3 (architecture ADRs) or later tactical design, per the Context Map conclusion. Issue #3 resolved the three architecture-ADR items; each now points to its canonical ADR:

- Runtime `RiskLevel` assignment policy for specific actions — **resolved by ADR-0006** (issue #3). Ingestion of the local OKF canonical record + derived index is R2; credential/external ingestion is R3;Approval & Security owns and applies the policy, Orchestration sends intent only.
- Direct Published Language vs Integration ACL route for Tool Lab → Knowledge — **resolved by ADR-0017** (issue #3) as a direct Published Language route; Tool Lab publishes, Knowledge consumes. See the v1.1 note above.
- OKF file write and Git commit partial-failure recovery protocol — **resolved by ADR-0015** (issue #3). The Git commit is the sole durable fence, covering only the Concept-write order (file → commit); index rebuild is out of the fence; external side-effects are out of scope of this fence (separate R3 + rule).

Tactical-design refinements (semantiği narroving, human escalation) may follow these ADRs but cannot weaken them.

## Exit criteria for issue #2

This Glossary v1 satisfies issue #2's exit criteria:

1. **Glossary v1 covers Phase 0 terms and all twelve context names** — yes: 12 bounded contexts listed; seed terms from §3.2 plus the deferred-hotspot names are defined.
2. **DDD MUST validator references the canonical glossary** — to be satisfied by a test that asserts `my-docs/policies/ddd-must.md` (or the operating-model validator) references `my-docs/okf/glossary.md`.

## Product-owner review (ratified)

This glossary was presented to the product owner and explicitly ratified on 2026-07-14 through the HITL Review Inbox. No changes were requested. Ratification is a genuine, scoped R1 human decision; it was not inferred, manufactured, or replayed by any agent.

The ratification confirms: the 12 bounded-context names, the ~40 seed terms from plan §3.2, the 4 deferred-hotspot resolutions (EvaluationArtifactSnapshot, ConversionArtifact, IndexState names, minimum provenance schema, meaningfully-changed threshold), and the boundary markers. Glossary v1 is canonical as of 2026-07-14.
