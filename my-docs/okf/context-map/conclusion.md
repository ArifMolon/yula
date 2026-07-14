---
type: context-map-conclusion
issue: ArifMolon/yula#16
spec: SPEC-P0-domain-discovery
bounded_context: orchestration
status: Review
product_owner: Arif
session: pi-2026-07-14-issue-16-ratify-context-map
recorded_at: 2026-07-14T07:00:00Z
provenance:
  - product-owner-approved event-storming records for issues #12, #13, #14, and #15
  - my-docs/okf/event-storming/issue-12-task-execution-domain-flow.md
  - my-docs/okf/event-storming/issue-13-tool-onboarding-domain-flow.md
  - my-docs/okf/event-storming/issue-14-knowledge-ingestion-domain-flow.md
  - my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md
  - my-docs/plan/YULA_DDD_Proje_Plani.md
  - my-docs/policies/ddd-must.md
  - my-docs/policies/hitl.md
  - my-docs/okf/handoffs/issue-16.json
---

# Context Map Conclusion — Phase 0 Domain Discovery

## Purpose and review state

This record aggregates the hotspots and Context Map corrections accumulated across the four Phase 0 domain-discovery event-storming records (issues #12–15) into one canonical Context Map conclusion. It is the artifact that satisfies exit criterion #2 of parent spec issue #1 (`[Spec] Validate YULA domain flows and Context Map`).

This record is in `Review` status. It is presented to the product owner for explicit ratification under the HITL Review Inbox policy. It does not become canonical (`Prod`) until the product owner ratifies it. No agent may infer, manufacture, or replay that ratification. Ratification is R1 human-required.

The status of every hotspot below is carried verbatim from the accepted event-storming records. This record confirms, defers, or records; it does not reopen resolved decisions or invent new ones.

## Scope and method

Each event-storming record closed with a Hotspots table. This conclusion classifies each hotspot into exactly one of:

- **Resolved — confirmed as-is:** the event-storming record contains an explicit resolution. This record confirms it without change.
- **Deferred to a named later issue:** the event-storming record explicitly deferred the hotspot. This record records the named destination (`ArifMolon/yula#2` Ubiquitous Language freeze, `ArifMolon/yula#3` architecture ADRs, or later tactical design) and does not resolve it here.
- **Context Map correction — confirmed:** issue #13 named two boundary corrections. This record confirms them as Context Map facts.

Invariant: every hotspot is either resolved with an explicit decision or deferred to a named later issue. No hotspot is left unclassified. No runtime `RiskLevel` is inferred from GitHub Project `Risk`; they are different models.

## Context Map corrections — confirmed (from issue #13)

These two boundary corrections were named in the issue #13 record and are confirmed here as Context Map facts.

| Correction | Confirmed fact |
|---|---|
| Tool Lab GitHub access boundary | Tool Lab may access only public, unauthenticated Tool source and release acquisition directly. Private or credential-bearing GitHub access stays behind the Integration ACL. This is a deliberately identified boundary exception for public unauthenticated Tool sources. |
| Orchestration grade-check skip and stale-use risk | Orchestration may skip a per-Execution Tool grade check provided Agent Studio consumes `ToolDeprecated` and disables all related bindings. Event-delivery delay creates a stale-use risk that this Context Map records explicitly: a deprecated ToolVersion can start a new Execution during the propagation window unless `ToolBindingsDisabled` has been observed by Agent Studio. |

## Resolved hotspots — confirmed as-is

### Issue #12 — task execution domain flow (9 hotspots)

| Hotspot | Confirmed resolution |
|---|---|
| Is "Where did we leave off?" a Query or Command? | It is `ReportProjectProgress`, a read-only R0 Command because it initiates a fresh, observable verification Execution. |
| Are GitHub, Git, and HandoffBrief mandatory for every Project? | No. Workspace supplies a Project-specific required/optional source set. |
| Can chat text approve an action? | No. Mobile chat may host an ApprovalRequest-bound secure card, but the decision still crosses the Approval & Security contract. |
| Does "YOLO Mode" remove safety boundaries? | No. The canonical term is Delegated Execution; R3/R4 and other human-decision boundaries remain intact. |
| Does a runtime narration failure add a new Execution state? | No. A displayed structured report completes with a warning. |
| Are GitHub Issue and spec worktree Orchestration terms? | No. `Task` is the domain term; GitHub Issue is an Integration mapping and spec worktree is delivery policy. |
| Is `Blocked` a Task state? | No. It is an eligibility condition with an explicit cause. |
| Does an Execution completion finish its Task? | Not unless Task acceptance criteria and required review gates also pass. |
| Can a crash retry an uncertain external write? | Only after the prior effect is safely reconciled; otherwise human review is required. |

### Issue #13 — tool onboarding domain flow (8 hotspots)

| Hotspot | Confirmed resolution |
|---|---|
| Is the repository a Tool or Skill? | Treat the executable video pipeline as a ToolVersion for this flow. The re-test of whether its `SKILL.md` must become a separate SkillVersion is deferred to issue #2 (Ubiquitous Language freeze); this deferral is the explicit resolution and is confirmed here. |
| May Tool Lab access GitHub directly? | Resolved as the Tool Lab GitHub access boundary Context Map correction above (public unauthenticated only; private/credential behind Integration ACL). |
| Can Orchestration skip a grade check at every Execution? | Resolved as the grade-check skip Context Map correction above, with the stale-use risk recorded. |
| Does approval require a human promotion decision? | No. All deterministic hard gates passing automatically produces `approved`; EvaluationSuite and SandboxSpec integrity are therefore critical control boundaries. |
| Can a mutable YouTube URL be promotion evidence? | It is capability smoke evidence only. Fixed ground-truth fixtures own deterministic promotion evidence. |
| Must every IDE, code, or prompt appearance be captured? | No. The accepted `v0.1.3` single-pass flow is best-effort; missed short-lived visuals do not fail the quality hard gate. |
| Does every extracted frame become knowledge? | No. Temporary frames may support analysis; only transcript-justified meaningful visuals enter the evaluation artifact, and the artifact is not automatically an OKF Concept. |
| Is `ToolGradePublished` a new event? | No. Preserve the canonical past-tense `ToolGraded` event and use its payload as the Published Language contract. |

## Deferred hotspots — explicit named destinations

These hotspots were explicitly deferred by their originating records. This conclusion records the named destination for each. Resolving them is out of scope for issue #16; they belong to issue #2, issue #3, or later tactical design.

| # | Hotspot (issue #14 and #15 share these) | Deferred to |
|---:|---|---|
| 1 | What runtime `RiskLevel` applies to knowledge/document ingestion? (Do not infer from Project Risk.) | `ArifMolon/yula#3` (architecture ADRs) and Approval & Security tactical design. |
| 2 | Exact Tool Lab → Knowledge contract name and schema (`EvaluationArtifactSnapshot` / `Conversion artifact` are candidates). | `ArifMolon/yula#2` (Ubiquitous Language freeze). |
| 3 | Minimum provenance schema (reusable fields across artifact/document ingestion). | `ArifMolon/yula#2` (Ubiquitous Language freeze) and tactical design. |
| 4 | "Meaningfully changed" semantic threshold (exact hash equality is deterministic; semantic supersession threshold and human escalation are not). | `ArifMolon/yula#2` (Ubiquitous Language freeze) and tactical design. |
| 5 | `IndexState` canonical names (current/pending/degraded used descriptively). | `ArifMolon/yula#2` (Ubiquitous Language freeze). |
| 6 | Direct Published Language vs Integration ACL route for Tool Lab → Knowledge. | `ArifMolon/yula#3` (architecture ADRs) and Context Map tactical design. |
| 7 | OKF file write and Git commit recovery across a partial failure (KnowledgeWriter serializes and blocks conflicting writes; the precise recovery protocol is not one database transaction). | Later tactical design / a dedicated KnowledgeWriter recovery ADR under issue #3's scope (architecture ADRs). |

Hotspot #7 appears in both the issue #14 and issue #15 hotspot tables. It is recorded here once and deferred to the same named destination so that no hotspot is left unclassified, satisfying the conclusion invariant.

## Summary inventory

- Total hotspots aggregated: 31 across four records (9 in #12, 8 in #13, 7 in #14, 7 in #15; the 7 deferred hotspots are shared between #14 and #15).
- Resolved and confirmed as-is: 17 (9 from #12, 8 from #13).
- Context Map corrections confirmed: 2 (from #13).
- Deferred to named later issues: 7 (to `#2`, `#3`, or later tactical design).
- Unresolved hotspots remaining after this conclusion: 0 within issue #16's scope; 7 explicitly owned by later issues.

## Context Map (Phase 0 confirmed boundaries)

This Context Map reflects only what the four records established. It is not a full system map; deeper relationships and the Integration ACL route decision (deferred hotspot #6) are ratified later.

```text
                       +-------------------+
   User surface -----> | Interaction       | typed User intent, correlation
                       +-------------------+
                              |
                              v
                       +-------------------+
                       | Orchestration     | Task, Execution, Delegated Execution,
                       |                   | reconciliation policy, ProjectProgressReport
                       +-------------------+
                          |     |     |
        +-----------------+     |     +------------------+
        v                       v                        v
+----------------+    +-------------------+    +-----------------------+
| Approval &     |    | Agent Studio      |    | Knowledge             |
| Security       |    | AgentVersion,     |    | KnowledgeSource,     |
| ApprovalRequest|    | Tool bindings,    |    | Concept,             |
| R3/R4 policy   |    | ToolBindingsDisabled|   | KnowledgeBundle,     |
+----------------+    +-------------------+    | KnowledgeWriter,     |
        ^                     ^              | KnowledgeChunk,      |
        |                     |              | IndexState (derived)  |
        |                     |              +-----------------------+
        |                     |                       ^
        v                     |                       |
+----------------+            | published contracts   |
| Tool Lab       |------------+ (ToolGraded,           |
| ToolVersion,   |             ToolDeprecated)         |
| EvaluationSuite|                                   |
| ToolLabSession |---- Conversion / Evaluation ----->|
| artifact       |    artifact contract (name TBD #2) |
+----------------+                                    |
        |  public unauthenticated GitHub: direct       |
        |  private / credential: via Integration ACL   |
        v                                              |
+----------------+   ACL for credential-bearing access |
| Integration    |------------------------------------+
+----------------+

+-------------------+   +-------------------+
| Model Gateway     |   | Observability &   |
| EmbeddingProduced |   | Cost              |
| (no shared writes)|   | (audit trace)     |
+-------------------+   +-------------------+
```

Confirmed boundary facts carried into this map:

- Orchestration never reads Tool Lab or Agent Studio internals; it consumes only published contracts.
- Tool Lab → Knowledge uses a narrow immutable artifact contract; whether it is direct Published Language or an Integration ACL route is deferred (hotspot #6).
- Knowledge → Model Gateway requests embeddings; Model Gateway returns vectors and writes no OKF, FTS5, or sqlite-vec state.
- All persistent canonical and derived writes cross the single Core KnowledgeWriter.
- Project `Risk` (delivery metadata) and runtime `RiskLevel` (Approval & Security domain language) are distinct and never inferred from each other.

## Exit criteria for parent spec issue #1

Upon product-owner ratification of this record, parent spec issue #1 (`[Spec] Validate YULA domain flows and Context Map`) may move to Done because:

1. Domain flows for task execution, tool onboarding, knowledge ingestion, and MarkItDown document ingestion were validated and accepted as event-storming records (issues #12–15).
2. This Context Map conclusion record aggregates all hotspots, confirms resolved ones, explicitly defers unresolved ones to named later issues, and confirms the two issue-#13 Context Map corrections — satisfying exit criterion #2.

## Product-owner review (pending)

This record is presented for product-owner ratification. The outcome is recorded only when the product owner decides through the HITL Review Inbox. Until then this record remains in `Review`; it is not canonical and issue #16 and parent #1 do not move to Done.

Issue #16 may move to Done only when all of the following are true:

1. The product owner explicitly ratifies this written record, or requested changes are incorporated and reviewed again.
2. Every hotspot is classified as resolved, deferred to a named later issue, or recorded as a confirmed Context Map correction.
3. The two issue-#13 Context Map corrections remain explicit.
4. No runtime `RiskLevel` is inferred from GitHub Project `Risk`.
5. Repository operating-model validation, Markdown-link validation, and `git diff --check` pass with fresh evidence.
6. The HandoffBrief records the ratification outcome, verification evidence, open loops, and exactly one next action.
