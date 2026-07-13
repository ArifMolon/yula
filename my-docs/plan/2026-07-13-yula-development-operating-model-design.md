# YULA Development Operating Model Design

**Date:** 2026-07-13  
**Status:** Approved for implementation planning  
**Scope:** GitHub Project, DDD work model, spec worktrees, handoffs, OKF lifecycle, self-learning, HITL, and voice control

## Purpose

Define a simple self-development operating model for building YULA one specification at a time. GitHub tracks delivery, OKF preserves canonical knowledge, bounded contexts own their lessons, worktrees isolate code, and YULA presents every genuine human decision through a unified Review Inbox. Users never need to edit Markdown status fields manually.

## Non-Negotiable Engineering Rule

Domain-Driven Design is a MUST rule for all YULA code and project language.

- Every module, aggregate, entity, value object, policy, event, command, method, function, variable, schema field, API contract, test, and domain-facing UI term uses the owning bounded context's Ubiquitous Language.
- Domain events use past tense; commands express intent; aggregate methods express named domain transitions.
- Ambiguous names such as `Manager`, `Helper`, `Utils`, `CommonService`, `process`, `updateData`, and unrestricted `setStatus` are prohibited.
- A new domain term requires a glossary change before merge.
- Contexts communicate only through Published Language, events, ports, or APIs. They never consume another context's internal model.
- KISS, DRY, SOLID, Clean Architecture, Clean Code, and design patterns support the domain model. They do not replace it, and a pattern is used only when it makes domain intent clearer.
- DDD violations block `Review -> Done` and become lessons in the owning context.

## GitHub Project

Create one user-level GitHub Project under `ArifMolon` named `YULA Development`, initially connected only to the `ArifMolon/yula` repository.

### Delivery State

```text
Todo -> Progress -> Review -> Done
           ^          |
           +----------+
          changes requested
```

- **Todo:** Defined work waiting for selection or dependencies.
- **Progress:** Active implementation. One active feature issue per spec worktree.
- **Review:** Implementation and automated checks are complete; human or agent acceptance is pending.
- **Done:** Required reviews passed, no HITL request is pending, the change is merged to its target branch, the feature branch is removed, and the issue is closed.

### Project Fields

- `Status`: Todo, Progress, Review, Done
- `Phase`: 0 through 6
- `Bounded Context`: full context name, never a numeric BC code
- `Risk`: R0 through R4
- `Spec`: parent spec identifier
- `Human Review`: Policy or Required
- `Size`: XS, S, or M; larger work must be decomposed

### Domain Labels

Context labels use full domain names:

```text
context:orchestration
context:agent-studio
context:tool-lab
context:knowledge
context:workspace
context:model-gateway
context:interaction
context:approval-security
context:integration
context:observability-cost
context:remote-access
context:identity-secrets
```

Work-kind labels describe domain intent:

```text
kind:capability
kind:domain-discovery
kind:decision
kind:experiment
kind:defect
kind:lesson
kind:contract
```

Optional model labels are used only when materially relevant:

```text
model:aggregate
model:domain-event
model:policy
model:value-object
model:published-language
```

Delivery and exception labels are limited to `blocked`, `security`, and `human-required`. Phase, risk, size, status, and context are not duplicated across labels and Project fields.

## Issue Hierarchy

A Spec Issue represents one coherent domain capability. Its child issues are end-to-end tracer bullets, decisions, experiments, defects, or lesson-driven prevention work.

Every Spec Issue defines:

- owning bounded context;
- user or system outcome;
- Ubiquitous Language;
- invariants;
- Published Language interactions;
- dependencies;
- HITL policy;
- exit criteria;
- child issue list.

A tracer-bullet issue crosses domain, application, port, adapter, UI, tests, and evaluation where those layers are required. Work is not divided into generic technical-layer issues such as “write repository” or “add endpoint.”

## Spec Worktrees And Feature Branches

Worktrees are spec-scoped, not issue-scoped.

```text
main
└── spec/<spec-name>          # checked out in .worktrees/spec-<spec-name>/
    ├── feature/<issue>-<name>
    └── feature/<issue>-<name>
```

- One spec has one `spec/<name>` branch and one worktree.
- One feature issue is active in a spec worktree at a time.
- The worktree switches between its spec branch and the currently active feature branch.
- A reviewed feature branch merges into the spec branch and is deleted immediately.
- Parallel work is allowed only across independent spec worktrees.
- When all child issues are Done, the spec is tested, evaluated, reviewed, and merged to `main`.
- Spec completion removes the spec branch and physical worktree, runs `git worktree prune`, and checks for stale branches, stashes, claims, artifacts, and pending reviews.
- Dirty or unmerged worktrees are never silently deleted. Cleanup uncertainty creates a Review Inbox request.

Code worktrees contain only the codebase, permanent tests, and required manifests and lockfiles. They do not carry OKF, plans, handoffs, human documentation, or generated artifacts. Sparse checkout or the worktree bootstrap command enforces this boundary.

## Documentation And Local Artifacts

The main checkout owns canonical project information:

```text
my-docs/
├── plan/
├── okf/
│   ├── index.md
│   ├── log.md
│   ├── concepts/
│   ├── contexts/<context>/lessons/
│   ├── handoffs/
│   └── event-storming/
├── adr/
├── sessions/
└── templates/
```

Local and generated material is isolated and ignored:

```text
my-docs/.local/
├── pnpm-store/
├── cargo-cache/
├── build-cache/
├── test-results/
├── coverage/
├── playwright/
└── artifacts/
```

Dependencies share a pnpm content-addressed store, not a mutable shared `node_modules`. Each worktree retains lockfile-safe pnpm links while avoiding repeated package downloads.

## HandoffBrief

Every active issue has one current structured HandoffBrief containing:

- issue, spec, context, kind, status, branch, and spec worktree;
- objective and Ubiquitous Language;
- invariants and decisions;
- current implementation state and changed code;
- fresh verification evidence;
- active lessons;
- open loops, next concrete action, blockers, and pending HITL requests;
- updater, session, and timestamp.

A new session must validate the HandoffBrief, branch, worktree, context glossary, and active lessons before modifying code. A closing session updates verification, failure observations, claims, open loops, and the next action. A handoff is current state, not a transcript or narrative journal.

## OKF Document Lifecycle

OKF documents use an agent-managed lifecycle distinct from GitHub delivery state:

```text
Todo -> Progress -> Review -> Prod
```

- Agents claim documents through YULA UI/API by writing owner, session, issue, claim time, and lease expiry metadata.
- Other agents do not modify a document with an active Progress claim.
- The default lease is two hours and may be renewed by an active execution.
- An expired claim requires handoff and execution inspection plus a stale-claim recovery record before reassignment.
- Review means automated schema, provenance, source, and optional agent review; it does not normally require HITL.
- Prod means canonical, reviewed, released, and available for a new claim.
- Users inspect state through UI and never need to edit Markdown metadata manually.

Issue and OKF state machines remain separate. An issue cannot become Done with an unresolved required OKF claim or failed knowledge update.

## Failure Learning

Every bounded context owns a learning loop:

```text
FailureObserved
-> FailureLearningProcessManager
-> FailureObservation with trace evidence
-> Lesson Candidate
-> semantic deduplication
-> validation/evaluation
-> Active Lesson in OKF
-> sqlite-vec indexing
-> preflight retrieval for similar work
```

A normal agent reports a structured observation: operation, symptom, evidence, cause hypothesis or unknown cause, workaround, execution and trace IDs, and confidence. Agent text is evidence, not canonical truth.

Lesson lifecycle:

```text
Candidate -> Validated -> Active -> Superseded
                 |
                 -> Rejected
```

- A lesson belongs to one primary bounded context; cross-context lessons are published once and referenced, not copied.
- Activation requires provenance, execution evidence, bounded context, prevention guidance, confidence, and validation or evaluation evidence.
- Before a step, YULA retrieves Active Lessons by bounded context, operation, tool, input class, and semantic similarity.
- A lesson can add a guardrail or Known Lessons brief. If the error repeats, lesson effectiveness is reevaluated.
- Descriptive lessons may activate automatically. Agent/prompt changes, permanent grants, weaker security, external writes, and R3/R4 consequences require HITL.
- The system reduces recurrence risk; it does not claim that semantic retrieval can guarantee an error never repeats.

## Knowledge Architecture Revisions

- OKF Markdown with provenance and git history is permanent canonical memory.
- Embedding models create semantic representations; sqlite-vec stores and searches vectors. sqlite-vec is not the neural network or canonical memory.
- All persistent writes go through one `KnowledgeWriter` in the Core. Agents and workers never write the shared SQLite database directly.
- SQLite uses WAL for concurrent reads and serialized writes. Containerization does not remove SQLite's single-writer property.
- Each execution may have ephemeral sandbox scratch memory. A Knowledge Curator either discards it or promotes sourced knowledge into OKF.
- Per-agent permanent micro-brains are excluded from v1 to avoid fragmentation and inconsistency.
- Workspace sharding is deferred until measured contention proves it necessary.

## Tool Candidates

- Crawl4AI is a quarantined candidate for a Web Ingestion Skill.
- MarkItDown is a quarantined candidate for a Document Ingestion Skill.
- claude-video remains a candidate for a Video Ingestion Skill.
- Candidates pass Tool Lab license, supply-chain, sandbox, capability, security, output-quality, and evaluation gates before becoming approved ToolVersions.
- Tools bind through Skills only to agents that need them. They are not granted globally.
- MarkItDown receives the narrowest read-only input scope. Crawl4AI runs with explicit network/domain policy and a pinned reviewed version.

## HITL Review Inbox

The YULA Dashboard provides one Review Inbox across workspaces and projects. Genuine human decisions are separate from agent-managed OKF review.

Each ApprovalRequest shows project, issue/PR, requesting agent, decision type, RiskLevel, intended action, rationale, diff, cost, external effects, capabilities, model/tool, expiry, execution, trace, and recommendation.

Decisions include Approve, Request Changes, Reject, Approve Once, Approve Scope, and Cancel Execution.

- R3 and R4 always require human approval.
- R0 through R2 normally use policy and agent review but may be elevated.
- Any issue, agent, workflow step, or project may be explicitly `human-required`.
- Pending required HITL blocks `Review -> Done`.
- OKF metadata transitions do not require HITL unless they imply a risky policy, prompt, agent, capability, architecture, or external action.

## Voice Control

Voice and UI share the same typed command, policy, approval, and audit paths. Voice never mutates issue or OKF state directly.

- R0–R2 commands may execute by voice under policy.
- R3 requires YULA to read back action, scope, and effect, followed by explicit second voice confirmation.
- R4 may be prepared by voice but requires explicit UI and, where configured, biometric confirmation.
- Low-confidence recognition cannot authorize an action.
- Bulk voice approval is prohibited for R3–R4.
- Voice decisions record transcript, confidence, timestamp, execution, and ApprovalRequest.

## GitHub Automation

Automation enforces integrity but does not orchestrate autonomous backlog progression.

When a feature issue closes at Done:

1. Validate Project fields and the latest HandoffBrief.
2. Create a structured `KnowledgeUpdateRequested` record.
3. Append an issue-close entry to `my-docs/okf/log.md` on a knowledge-only branch.
4. Reference PR, spec, context, capability, events, lessons, and verification.
5. Open a documentation-only PR and run schema, provenance, and link checks.
6. Auto-merge only if those checks pass; otherwise create a Review Inbox failure.

The action does not invent lessons, modify plans or ADRs, activate prompts, start the next issue, force-delete worktrees, or impersonate human approval.

Spec closure additionally verifies main-branch merge, final acceptance, final handoff, no remaining feature branches, no stale worktree, no claim, and no pending HITL request.

## Progressive Rollout

No GitHub issue is created until the two exported plan reviews are resolved and the canonical plan is revised.

Implementation order:

1. Apply approved plan-review decisions.
2. Move canonical documents into `my-docs`.
3. Add this operating model, DDD MUST rule, lesson model, HITL policy, and voice policy to canonical documentation.
4. Create the `YULA Development` GitHub Project and fields.
5. Create domain labels and issue/spec/handoff templates.
6. Add issue-close OKF automation and spec cleanup validation.
7. Add spec worktree bootstrap and cleanup commands.
8. Create only Phase 0 Spec Issues.
9. Select the first spec together.
10. Create only that spec's child tracer-bullet issues.
11. Start one issue in a new session using its HandoffBrief.

Phases 1–6 remain roadmap concepts until Phase 0 evidence is available.

## Verification

- Validate all templates and Markdown schemas.
- Exercise legal and illegal state transitions.
- Verify DDD labels and full context names; reject numeric-only context identifiers.
- Simulate session handoff, stale OKF claim recovery, lesson deduplication, and lesson preflight retrieval.
- Exercise R0–R4 UI and voice approval paths, including low-confidence and expired requests.
- Verify issue-close automation creates only documentation changes and cannot progress the backlog.
- Create and close a disposable spec to verify feature-branch deletion, spec merge, worktree removal, and prune behavior.
- Verify sparse worktrees exclude `my-docs` and generated artifacts remain under ignored `my-docs/.local`.

## Non-Goals

- Complex GitHub workflow engines or automatic next-issue selection.
- One worktree per issue.
- Manual Markdown status management by the user.
- Globally granting every tool to every agent.
- Treating agent failure narration as validated knowledge.
- Guaranteeing that vector retrieval makes recurrence impossible.
- Creating detailed issues for Phases 1–6 before Phase 0 completes.
