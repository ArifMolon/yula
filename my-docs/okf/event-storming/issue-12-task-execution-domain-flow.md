---
type: event-storming
issue: ArifMolon/yula#12
spec: SPEC-P0-domain-discovery
bounded_context: orchestration
status: Prod
product_owner: Arif
session: codex-2026-07-13-issue-12-domain-discovery
recorded_at: 2026-07-13T16:15:49Z
provenance:
  - product-owner conversational Event Storming session on 2026-07-13
  - my-docs/plan/YULA_DDD_Proje_Plani.md
  - my-docs/policies/ddd-must.md
  - my-docs/policies/hitl.md
  - my-docs/okf/handoffs/issue-12.json
---

# Issue #12 — Task Execution Domain Flow

## Purpose and review state

This record captures the product-owner-validated model for recalling progress across many projects and continuing an eligible Task through a controlled Execution. The successful scenario begins with “Bu projede en son hangi adımda kaldık, sıradaki görev nedir ve benden beklenen bir onay var mı?” and continues by publishing verified development for review through a branch push and draft pull request.

The product owner approved the conversational model and explicitly accepted this written record on 2026-07-13. The acceptance covers this issue #12 domain-discovery artifact only. It does not approve product implementation, deployment, or starting another issue.

## Ubiquitous Language candidates

These terms were accepted for this flow but remain candidates until the Phase 0 glossary work ratifies them:

| Term | Meaning in this flow |
|---|---|
| `Task` | A project-scoped unit of intended work with dependencies, priority, acceptance criteria, and a lifecycle owned by Orchestration. A GitHub Issue is an external record that Integration may map to a Task; it is not the Orchestration model. |
| `Execution` | One runtime attempt to carry out a Task. One Task may have multiple Executions. |
| `ProjectProgressReport` | A provenance-bearing view of the last completed step, active Task, eligible next Tasks, blockers, pending human decisions, source conflicts, and source freshness. |
| `Delegated Execution` | Scoped, expiring authority for YULA to choose and start eligible Tasks within a project or spec, risk ceiling, and concurrency limit. “YOLO Mode” may be a UI alias but is not the canonical term. |
| `ProjectProgressSource` | A Project-configured authoritative or optional source used to establish delivery or implementation state. |

Delivery mechanics such as tracer bullets, feature branches, and spec worktrees remain operating-model language. They are not Orchestration Ubiquitous Language.

## Actors and Commands

| Actor | Command | Intent |
|---|---|---|
| User | `ReportProjectProgress` | Produce a fresh, verified ProjectProgressReport without changing project state. |
| User | `SelectProject` | Resolve an ambiguous project reference before reporting or execution begins. |
| User | `ExecuteTask` | Start an eligible Task manually. |
| User | `PublishDevelopmentForReview` | Push a verified feature branch and open a draft pull request without merging or releasing it. |
| User as Human Reviewer | `GrantApproval` / `DenyApproval` | Decide one scoped, expiring ApprovalRequest through its secure approval surface. |
| User | `PauseExecution` / `ResumeExecution` / `CancelExecution` | Control one selected Execution. |
| User | `DelegateTaskExecution` | Grant scoped Delegated Execution authority. |
| User | `RevokeDelegatedExecution` | Remove Delegated Execution authority. |
| Delegated Execution Policy | `ExecuteTask` | Start an eligible Task within the active delegation scope and concurrency limit. |
| User or Approval & Security | `TriggerEmergencyStop` | Stop system-wide worker and container execution and suspend all delegation. |

Free-form chat text is not an approval decision. Mobile Interaction may embed a secure ApprovalRequest-bound card; the resulting decision still follows the Approval & Security command, policy, transition, and audit path. R4 retains explicit UI and any configured biometric confirmation.

## Main success timeline

| Order | Actor or owner | Command, event, or policy outcome |
|---:|---|---|
| 1 | User through Interaction | Issues `ReportProjectProgress` for “this project.” |
| 2 | Interaction | Resolves the active Project automatically when it is unambiguous; otherwise requests `SelectProject`. |
| 3 | Interaction → Orchestration | Publishes `ProjectProgressReportRequested`. |
| 4 | Orchestration | Starts a read-only R0 Execution and publishes `ExecutionStarted`. |
| 5 | Workspace | Supplies the Project-configured required and optional ProjectProgressSources. |
| 6 | Integration, Knowledge, Approval & Security | Supply delivery snapshots, the current HandoffBrief, and pending human decisions through Published Language contracts. |
| 7 | Orchestration | Reconciles provenance, freshness, missing sources, conflicts, active Task, eligible next Tasks, blockers, and pending decisions. |
| 8 | Agent Studio | Supplies an immutable AgentVersion snapshot for narration. |
| 9 | Rust Agent Runtime | Turns only the reconciled facts into a user-appropriate narrative. It cannot add facts or conceal conflicts. |
| 10 | Interaction | Displays the result and only then publishes `ProjectProgressReported`. |
| 11 | Orchestration | Publishes `ExecutionCompleted`. If narration failed but the structured report was displayed, completion carries a warning rather than inventing another Execution state. |
| 12 | User, or Delegated Execution Policy within a valid grant | Issues `PublishDevelopmentForReview` for the eligible Task. |
| 13 | Orchestration | Starts an Execution, classifies the external write as R3, and publishes `ExecutionStarted` followed by `ExecutionSuspended(reason: approval)`. |
| 14 | Approval & Security | Creates a single-use ApprovalRequest and publishes `ApprovalRequested`, including repository, source branch, expected commit, target branch, draft PR effect, expiry, Execution, and trace. |
| 15 | User through the bound approval card | Grants the request; Approval & Security publishes `ApprovalGranted`. |
| 16 | Orchestration | Publishes `ExecutionResumed` and asks the worker/Integration boundary to publish the development for review. |
| 17 | Integration | Pushes the branch, opens the draft pull request, then reads GitHub again to verify the expected remote commit and target branch. |
| 18 | Orchestration | Publishes `DevelopmentPublishedForReview` and then `ExecutionCompleted`. |
| 19 | Observability & Cost | Records the minimum trace needed for audit and diagnosis. A detailed cost UI is outside the MVP. |

## Domain Events

### Project progress and delegation

- `ProjectProgressReportRequested`
- `ProjectProgressConflictDetected`
- `ProjectProgressReported`
- `TaskExecutionDelegated`
- `DelegatedExecutionSuspended`
- `DelegatedExecutionResumed`
- `DelegatedExecutionRevoked`
- `DelegatedExecutionExpired`

### Task lifecycle

- `TaskPlanned`
- `TaskBecameReady`
- `TaskActivated`
- `TaskAwaitedReview`
- `TaskReactivated`
- `TaskCompleted`
- `TaskCancelled`

`Blocked` is not a Task state. It is an eligibility condition with a reason such as an unmet dependency, pending approval, exhausted budget, source conflict, or uncertain external effect.

### Existing Execution and Approval & Security events used by the flow

- `ExecutionStarted`
- `ExecutionSuspended`
- `ExecutionResumed`
- `ExecutionCompleted`
- `ExecutionCancelled`
- `WorkerCrashed`
- `ApprovalRequested`
- `ApprovalGranted`
- `ApprovalDenied`
- `ApprovalExpired`
- `EmergencyStopTriggered`
- `DevelopmentPublishedForReview`

## Policies and alternative flows

| Trigger or condition | Policy outcome |
|---|---|
| Project reference is ambiguous | Do not start the Execution; request `SelectProject`. |
| A configured progress source is unavailable | Report the verifiable partial result and identify the unavailable source and freshness boundary. |
| Authoritative sources conflict | Publish `ProjectProgressConflictDetected`; expose the conflict and do not infer a next Task until human review resolves it. |
| AgentVersion or Rust Agent Runtime is unavailable | Display the structured reconciled report with a warning; do not fail an otherwise complete read-only Execution. |
| Manual mode has exactly one eligible Task | “Continue” may issue `ExecuteTask` for that Task. |
| Manual mode has multiple eligible Tasks | Present the choices and require the user to select one. |
| Delegated Execution is active | Choose only dependency-ready Tasks in plan priority order and start equal-priority independent work only up to the configured concurrency limit. |
| A Task is blocked while delegation is active | Keep it waiting for review; continue only independent eligible work. For YULA development, a waiting feature issue retains its spec-worktree lock, so parallel work occurs in another independent spec. |
| Approval is denied or expires | Keep the Execution suspended. Do not retry or manufacture a new request. A materially changed scope or plan may produce a new ApprovalRequest. |
| Budget is exhausted | Publish `ExecutionSuspended(reason: budget)` and wait for an explicit budget or scope decision. Independent work may continue only within its own and global budgets. |
| Worker crashes | Allow the initial attempt plus at most three retries. |
| A worker crash leaves an external effect uncertain | Reconcile using the correlation/idempotency identity. If the effect cannot be established safely, stop retries and wait for review. |
| Emergency Stop is triggered | Stop all workers and containers, suspend every Delegated Execution grant, and require an explicit decision before any delegation resumes. |

## Task lifecycle and invariants

The accepted lifecycle is:

```text
Planned -> Ready -> Active -> WaitingForReview -> Active -> Completed
                         \                              /
                          +----------> Cancelled <-----+
```

- Dependencies and plan policy move a Task from `Planned` to `Ready`.
- Starting its Execution moves it to `Active`.
- A required human decision moves it to `WaitingForReview`; approval may reactivate it.
- `ExecutionCompleted` does not imply `TaskCompleted`.
- A Task becomes `Completed` only after its acceptance criteria are verified and no required human decision remains pending.
- A Project must resolve uniquely before `ReportProjectProgress` begins.
- The report uses only Project-configured, provenance-bearing sources.
- Missing sources and source conflicts are never hidden by narration.
- `ProjectProgressReported` occurs only after the user can observe the report.
- An Execution's VersionSnapshot is immutable after `ExecutionStarted`.
- Delegated Execution is scoped, expiring, risk-ceiling-limited, and concurrency-limited. It never bypasses R3/R4 approval.
- `DelegateTaskExecution` is R2. Each Task and external effect receives its own risk evaluation.
- Tasks with unresolved dependencies cannot start.
- Emergency Stop cannot auto-resume delegation.
- `DevelopmentPublishedForReview` requires verified remote commit and draft PR target evidence.

## Bounded-context ownership and Published Language

| Boundary | Published Language responsibility |
|---|---|
| Interaction → Orchestration | `ReportProjectProgress` with user identity, resolved Project reference, channel, and correlation information. |
| Workspace → Orchestration | Project identity and configured progress-source set, including required/optional classification. Workspace owns Project; it does not own Task execution. |
| Integration → Orchestration | Provenance-bearing external delivery snapshots and access failures translated through an anticorruption layer. GitHub Issue remains external language. |
| Knowledge → Orchestration | Current HandoffBrief contract with implementation state, open loops, and next action. |
| Approval & Security ↔ Orchestration | ApprovalRequest and immutable decision contracts. Free text cannot bypass this boundary. |
| Agent Studio → Orchestration | Immutable AgentVersion snapshot. Orchestration never reads Agent Studio internals. |
| Orchestration ↔ Rust Agent Runtime | Existing versioned framed protocol with `execution_id`, `correlation_id`, deadline, and trace identifiers. Runtime narration is constrained to reconciled facts. |
| Orchestration → Interaction | ProjectProgressReport containing completed, active, and eligible work; blockers; pending decisions; conflicts; provenance; and freshness. |
| Orchestration → Observability & Cost | Execution lifecycle events and the minimum trace required for audit and diagnosis. |
| Orchestration ↔ Integration | `PublishDevelopmentForReview` request and a verified result containing repository, remote commit, source branch, target branch, draft status, and PR reference. |

Orchestration owns Task, dependency eligibility, Delegated Execution, reconciliation policy, and Execution lifecycle. Other contexts publish contracts and keep their internal models private.

## Hotspots and resolutions

| Hotspot | Resolution |
|---|---|
| Is “Where did we leave off?” a Query or Command? | It is `ReportProjectProgress`, a read-only R0 Command because it initiates a fresh, observable verification Execution. |
| Are GitHub, Git, and HandoffBrief mandatory for every Project? | No. Workspace supplies a Project-specific required/optional source set. |
| Can chat text approve an action? | No. Mobile chat may host an ApprovalRequest-bound secure card, but the decision still crosses the Approval & Security contract. |
| Does “YOLO Mode” remove safety boundaries? | No. The canonical term is Delegated Execution; R3/R4 and other human-decision boundaries remain intact. |
| Does a runtime narration failure add a new Execution state? | No. A displayed structured report completes with a warning. |
| Are GitHub Issue and spec worktree Orchestration terms? | No. `Task` is the domain term; GitHub Issue is an Integration mapping and spec worktree is delivery policy. |
| Is `Blocked` a Task state? | No. It is an eligibility condition with an explicit cause. |
| Does an Execution completion finish its Task? | Not unless Task acceptance criteria and required review gates also pass. |
| Can a crash retry an uncertain external write? | Only after the prior effect is safely reconciled; otherwise human review is required. |

No unresolved actor ownership, Command intent, event tense, policy outcome, aggregate invariant, bounded-context ownership, Published Language responsibility, or R3/R4 approval rule remained at the end of the conversational model review. The candidate vocabulary still requires the separate Phase 0 glossary workflow before becoming canonical project-wide language.

## Product-owner acceptance evidence

**Review outcome:** Accepted by the product owner on 2026-07-13 after the canonical file was presented for written-record review. No changes were requested.

Issue #12 may move to Review only when all of the following are true:

1. This written record is reviewed by the product owner after creation and the outcome is recorded without inferring approval.
2. Actors, Commands, past-tense Domain Events, Policies, Hotspots, invariants, and Published Language boundaries remain explicit.
3. The main success path and alternative paths cover ambiguous project selection, partial source availability, source conflict, approval denial/expiry, budget suspension, worker crash and retry, uncertain external effects, issue-level control, Delegated Execution, and Emergency Stop.
4. Repository operating-model validation, Markdown-link validation, and `git diff --check` pass with fresh evidence.
5. The current HandoffBrief records the written review outcome, verification evidence, open loops, and exactly one next action.
