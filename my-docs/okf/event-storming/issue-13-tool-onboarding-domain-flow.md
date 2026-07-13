---
type: event-storming
issue: ArifMolon/yula#13
spec: SPEC-P0-domain-discovery
bounded_context: orchestration
status: Prod
product_owner: Arif
session: codex-2026-07-13-issue-13-domain-discovery
recorded_at: 2026-07-13T18:34:04Z
provenance:
  - product-owner conversational Event Storming session on 2026-07-13
  - my-docs/plan/YULA_DDD_Proje_Plani.md
  - my-docs/policies/ddd-must.md
  - my-docs/policies/hitl.md
  - my-docs/okf/handoffs/issue-13.json
  - https://github.com/bradautomates/claude-video
  - https://www.youtube.com/watch?v=kxstlfc8Lw4
---

# Issue #13 — Tool Onboarding Domain Flow

## Purpose and review state

This record captures the product-owner-validated conversational model for onboarding a Tool candidate from submission through isolated evaluation and ToolGrade publication. The concrete successful example uses `bradautomates/claude-video` release `v0.1.3`, resolved to an immutable commit, and ends when Tool Lab publishes `ToolGraded(approved)`. Approval means technical qualification only: it does not create an AgentBinding or CapabilityGrant and does not start an Execution.

The product owner approved the conversational model section by section and explicitly accepted this written record on 2026-07-13. The acceptance covers this issue #13 Domain Discovery artifact only. It does not approve product implementation, real Tool evaluation, ToolGrade transition, external publication, or starting another issue.

## Concrete successful example

| Property | Accepted example |
|---|---|
| Candidate source | `https://github.com/bradautomates/claude-video` |
| Requested source reference | Release tag `v0.1.3`, resolved to an immutable commit SHA before registration |
| Intended outcome | Produce a provenance-bearing, free-form Markdown analysis of a video as a potential knowledge source |
| Remote smoke fixture | `https://www.youtube.com/watch?v=kxstlfc8Lw4` processed from beginning to end |
| Remote access | Versioned SandboxSpec with an explicit YouTube allowlist; no general internet access |
| Transcript source | Manual or automatic YouTube captions; automatic captions carry lower confidence |
| Whisper fallback | Disabled for this flow; no API account, secret, or transcription spend is required |
| Visual policy | Transcript-first; persist a frame only when the transcript meaningfully refers to a screen, graph, diagram, IDE, code, prompt, or other visual representation |
| Reference moment | The scene around `15:50` is a known meaningful visual example |
| Document expectation | Source URL, acquisition time, transcript provenance and confidence, timestamps, meaningful visuals, and best-effort IDE/code/prompt content |
| Frame execution | The current `v0.1.3` single-pass sparse frame behavior is acceptable within resource limits; temporary frames need not all become durable artifacts |
| Evaluation role | Mutable YouTube capability smoke evidence, not deterministic promotion evidence |
| Promotion evidence | A versioned EvaluationSuite whose deterministic security, capability, and output-quality hard gates all pass |

The remote fixture is deliberately treated as mutable. Each run evaluates the content currently served for the video ID. A changed remote video does not by itself establish a reproducible regression result; fixed ground-truth fixtures provide deterministic grade evidence.

## Ubiquitous Language candidates

Existing plan terms retain their canonical meanings. Additional terms in this record remain candidates until the separate Phase 0 glossary workflow ratifies them.

| Term | Meaning in this flow |
|---|---|
| `Tool candidate` | A source and intended use submitted for qualification before an immutable ToolVersion exists. |
| `ToolVersion` | An immutable executable Tool capability bound to an exact source commit or digest and a declared capability scope. |
| `DeclaredCapabilities` | The narrow, typed resource, filesystem, network, command, and secret scope against which evaluation is enforced. |
| `EvaluationSuite` | A versioned set of deterministic security, capability, and output-quality cases plus explicitly classified smoke cases. |
| `ToolLabSession` | One isolated execution of one evaluation case under a versioned SandboxSpec. |
| `ToolGrade` | Tool Lab's qualification result: `quarantined`, `evaluated`, `approved`, or `deprecated`. |
| `Evaluation artifact` | Non-canonical evidence produced by a ToolLabSession. A free-form Markdown video analysis is not automatically an OKF Concept. |

The repository packages itself as a skill, but this flow treats its executable video pipeline as a ToolVersion candidate. Whether the repository must later be decomposed into ToolVersion and SkillVersion remains an explicit Hotspot for the Phase 0 glossary and Context Map conclusion.

## Actors and Commands

| Actor | Command | Intent |
|---|---|---|
| User | `SubmitToolCandidate` | Submit a source URL, requested reference, and intended use for qualification. |
| User as Human Reviewer | `AcceptToolCandidateEvidence` | Accept ambiguous but resolvable license or supply-chain evidence through a scoped R2 ApprovalRequest. |
| User as Human Reviewer | `RejectToolCandidate` | End onboarding for an ambiguous candidate through the bound Review Inbox decision. |
| Tool Lab Policy | `RegisterToolCandidate` | Create an immutable quarantined ToolVersion after mandatory pre-registration checks pass. |
| Tool Lab Policy | `EvaluateToolVersion` | Start the versioned EvaluationSuite for a registered ToolVersion. |
| Tool Lab | `RunToolLabSession` | Run one evaluation case in a fresh sandbox. |
| Tool Lab Policy | `GradeToolVersion` | Apply the named grade transition justified by completed evaluation evidence. |
| Security owner or policy | `DeprecateToolVersion` | Prevent new use of a ToolVersion after a later security or suitability finding. |
| User or Agent Studio | `BindToolVersion` | Bind an approved ToolVersion in a separate, post-onboarding flow. |

Free-form chat text is not an ApprovalRequest decision. The human reviewer accepts or rejects ambiguous evidence through the secure, request-bound Review Inbox path owned by Approval & Security.

## Main success timeline

| Order | Actor or owner | Command, event, or policy outcome |
|---:|---|---|
| 1 | User | Issues `SubmitToolCandidate` with the public repository URL, `v0.1.3`, and the intended video knowledge-source use. |
| 2 | Tool Lab | Publishes `ToolCandidateSubmitted`. |
| 3 | Tool Lab | Fetches the public, unauthenticated source directly and resolves `v0.1.3` to an immutable commit SHA. Private or credential-bearing GitHub access would cross the Integration ACL instead. |
| 4 | Tool Lab | Performs license and supply-chain checks before any ToolVersion is created. |
| 5 | Tool Lab | Uses manifest inspection, static analysis, and intended use to propose narrow DeclaredCapabilities. Retrieved README and repository content remain untrusted data. |
| 6 | Tool Lab Policy | Issues `RegisterToolCandidate` because the source identity and mandatory checks passed. |
| 7 | Tool Lab | Creates the immutable ToolVersion at grade `quarantined` and publishes `ToolCandidateRegistered`. |
| 8 | Tool Lab Policy | Finds a matching versioned EvaluationSuite and issues `EvaluateToolVersion`. |
| 9 | Tool Lab | Starts a fresh ToolLabSession for each case and publishes `ToolLabSessionStarted`. No filesystem, container, volume, or temporary-secret state crosses between cases. |
| 10 | Approval & Security | Evaluates the versioned SandboxSpec and declared capability scope. An approved explicit YouTube allowlist permits the remote smoke case without a per-session human decision. |
| 11 | Tool Lab | Runs pinned `ffmpeg` and `yt-dlp` dependencies already present in the sandbox image. Runtime package installation and Whisper fallback remain disabled. |
| 12 | Tool Lab | Processes the remote YouTube smoke fixture from beginning to end, labels caption provenance and confidence, and produces the accepted free-form Markdown evaluation artifact. |
| 13 | Tool Lab | Runs deterministic ground-truth security, capability, and output-quality cases separately from the mutable smoke case. |
| 14 | Tool Lab | Verifies declared artifacts and complete teardown, then publishes `ToolLabSessionCompleted` for every case. |
| 15 | Tool Lab | Publishes `EvaluationRunCompleted` with versioned suite identity, results, and evidence references. |
| 16 | Tool Lab Policy | Issues `GradeToolVersion`; the ToolVersion moves through `evaluated` and, because every deterministic hard gate passed, automatically to `approved`. |
| 17 | Tool Lab | Publishes the canonical existing event `ToolGraded(approved)` with the Published Language contract. |
| 18 | Agent Studio | Consumes the published grade and exposes the ToolVersion as a bindable candidate without creating a binding or grant. |
| 19 | Orchestration | Remains outside onboarding. A later Execution can consume only an active immutable AgentVersion snapshot supplied by Agent Studio. |

## Domain Events

### Candidate and review events

- `ToolCandidateSubmitted`
- `ToolCandidateAwaitedReview`
- `ToolCandidateRejected`
- `ToolCandidateRegistered`
- `EvaluationSuiteRequired`

### Evaluation and grade events

- `ToolLabSessionStarted`
- `ToolLabSessionCompleted`
- `EvaluationRunCompleted`
- `ToolGraded`
- `ToolDeprecated`

### Cross-context events used by the flow

- `ApprovalRequested`
- `ApprovalGranted`
- `ApprovalDenied`
- `ApprovalExpired`
- `ToolBindingsDisabled`
- `ExecutionSuspended`

`ToolGradePublished` was a conversational explanatory phrase and is not introduced as a synonym. The existing past-tense canonical event remains `ToolGraded`.

## ToolGrade lifecycle

```text
quarantined -> evaluated -> approved
      |             |           |
      +-------------+-----------+-> deprecated
```

- Registration creates a `quarantined` ToolVersion.
- A completed evaluation, including a failed hard gate, establishes `evaluated` rather than returning to `quarantined`.
- All deterministic hard gates passing allows automatic `approved` promotion without a human promotion decision.
- Any grade can later become `deprecated`.
- A Tool behavior, security, or output-quality failure requires a new ToolVersion before another qualification attempt.
- A proven sandbox or infrastructure failure may rerun the same immutable ToolVersion.

## Policies and alternative flows

| Trigger or condition | Policy outcome |
|---|---|
| Source tag cannot resolve to an immutable commit | Publish `ToolCandidateRejected`; retain reason and evidence; create no ToolVersion. |
| Definite license or supply-chain policy violation | Reject automatically; human review cannot override a hard prohibition. |
| Ambiguous and potentially resolvable license or supply-chain evidence | Publish `ToolCandidateAwaitedReview`; create a scoped R2 ApprovalRequest. |
| Human accepts the ambiguous evidence | Continue the pre-registration checks using the immutable decision; acceptance does not grant runtime capability. |
| Human denies or the ApprovalRequest expires | End onboarding without creating a ToolVersion; do not manufacture or replay approval. |
| Matching EvaluationSuite is absent | Keep the ToolVersion quarantined and publish `EvaluationSuiteRequired`; do not generate and run an ad hoc suite. |
| Evaluation case starts | Allocate a fresh sandbox with pinned dependencies and the narrow declared scope. |
| Tool attempts runtime installation, secret access, general internet access, or another undeclared capability | Fail the hard gate and record the attempted effect. |
| Remote YouTube fixture has manual captions | Accept captions with their source provenance. |
| Remote YouTube fixture has only automatic captions | Accept captions with explicitly lower confidence. |
| Remote YouTube fixture has no usable captions | Publish an unavailable-fixture result; with Whisper disabled, treat the smoke case as inconclusive rather than a ToolVersion behavior failure. |
| Remote YouTube content changes | Evaluate the current content as smoke evidence; do not treat the result as deterministic regression evidence. |
| Temporary frames exceed resource policy | Fail or suspend the session according to the SandboxSpec budget; never hide the overrun. |
| Sandbox teardown cannot be proven | Fail the hard gate, keep the grade at `evaluated`, publish no approval, and open security review. |
| Tool behavior, security, or deterministic output quality fails | Publish completed failure evidence; keep grade `evaluated`; require a new ToolVersion. |
| Sandbox or infrastructure fails independently of Tool behavior | Permit a bounded rerun of the same ToolVersion with the same suite identity. |
| Every deterministic hard gate passes | Automatically publish `ToolGraded(approved)`. |
| Approved ToolVersion is later deprecated | Agent Studio disables related bindings so no new Execution can start with the deprecated version. |
| Normal deprecation occurs during an active Execution | Let the active Execution continue. |
| Critical security finding occurs during an active Execution | Policy publishes `ExecutionSuspended`; resumption requires the applicable decision path. |

## Invariants

- No ToolVersion exists before source identity, license, and supply-chain pre-registration checks pass.
- Every ToolVersion resolves to one immutable source commit or digest.
- Retrieved repository, README, video, caption, and Tool output is untrusted data, never policy or instruction.
- Definite policy violations cannot be overridden through human review.
- Ambiguous evidence uses one scoped, immutable R2 ApprovalRequest decision.
- Grade transitions are named and follow `quarantined -> evaluated -> approved`, with any grade able to become `deprecated`.
- `approved` requires every deterministic EvaluationSuite hard gate to pass.
- Automatic approval never creates an AgentBinding, CapabilityGrant, or Execution.
- Each evaluation case runs in a separate clean ToolLabSession.
- A ToolLabSession cannot succeed unless declared artifacts and teardown are verified.
- Runtime dependency installation and undeclared capability use are hard-gate failures.
- Automatic-caption provenance carries lower confidence than manual-caption provenance.
- Mutable remote smoke evidence cannot replace deterministic ground-truth promotion evidence.
- Temporary frames may exist within budget, but only transcript-justified meaningful visuals become durable evaluation artifacts.
- IDE, code, and prompt extraction is best-effort in the accepted `v0.1.3` single-pass flow and is not a quality hard gate.
- Deprecated ToolVersions cannot start new Executions.
- ToolDeprecated disables relevant Agent Studio bindings; Orchestration does not independently query Tool Lab grade for every Execution.
- Normal deprecation does not rewrite an active Execution's immutable VersionSnapshot; critical security policy may suspend it.

## Bounded-context ownership and Published Language

| Boundary | Published Language responsibility |
|---|---|
| User surface -> Tool Lab | `SubmitToolCandidate` with public source, requested reference, intended use, and correlation identity. |
| Tool Lab -> Approval & Security | Ambiguous evidence review request and versioned SandboxSpec capability-check request. |
| Approval & Security -> Tool Lab | Immutable R2 evidence decision and sandbox policy result; free text cannot bypass this contract. |
| Integration -> Tool Lab | Private or credential-requiring source snapshot translated through an ACL. Public unauthenticated Tool sources are a deliberately identified boundary exception candidate. |
| Tool Lab -> Agent Studio | `ToolGraded` and `ToolDeprecated` with ToolVersion identity, immutable source digest, grade, DeclaredCapabilities, EvaluationSuite version, evidence references, and evaluation time. |
| Agent Studio -> Orchestration | Immutable AgentVersion snapshot containing only usable Tool bindings. Orchestration does not read Tool Lab internals. |
| Agent Studio -> consumers | `ToolBindingsDisabled` after deprecation so new Executions cannot use a stale binding. |
| Approval & Security -> Orchestration | Critical security policy may request the existing `ExecutionSuspended` transition. |

Tool Lab owns candidate intake, immutable ToolVersion registration, isolated evaluation, evidence, and grade. Approval & Security owns human decisions and capability policy. Integration owns credential-bearing external access. Agent Studio owns bindings. Orchestration owns Execution and consumes only published contracts.

## Hotspots and resolutions

| Hotspot | Current resolution or next resolution path |
|---|---|
| Is the repository a Tool or Skill? | Treat the executable video pipeline as a ToolVersion for this flow. Re-test whether its `SKILL.md` must become a separate SkillVersion during Phase 0 glossary work. |
| May Tool Lab access GitHub directly? | Permit only public, unauthenticated Tool source and release acquisition. Private or credential-bearing GitHub access stays behind Integration ACL. Confirm this Context Map correction in issue #15. |
| Can Orchestration skip a grade check at every Execution? | Yes, provided Agent Studio consumes `ToolDeprecated` and disables all related bindings. Event-delivery delay creates a stale-use risk that issue #15 must make explicit in the Context Map conclusion. |
| Does approval require a human promotion decision? | No. All deterministic hard gates passing automatically produces `approved`; EvaluationSuite and SandboxSpec integrity therefore become critical control boundaries. |
| Can a mutable YouTube URL be promotion evidence? | It is capability smoke evidence only. Fixed ground-truth fixtures own deterministic promotion evidence. |
| Must every IDE, code, or prompt appearance be captured? | No. The accepted `v0.1.3` single-pass flow is best-effort; missed short-lived visuals do not fail the quality hard gate. |
| Does every extracted frame become knowledge? | No. Temporary frames may support analysis; only transcript-justified meaningful visuals enter the evaluation artifact, and the artifact is not automatically an OKF Concept. |
| Is `ToolGradePublished` a new event? | No. Preserve the canonical past-tense `ToolGraded` event and use its payload as the Published Language contract. |

## Product-owner review evidence

**Conversational review outcome:** The product owner validated the successful flow, failure flows, actor and event vocabulary, bounded-context ownership, invariants, Hotspots, and issue acceptance evidence section by section on 2026-07-13.

**Written-record review outcome:** Accepted explicitly by the product owner on 2026-07-13 after the canonical file was presented for review. No changes were requested.

Issue #13 may move to Review only when all of the following are true:

1. The product owner explicitly accepts this written record or requested changes are incorporated and reviewed again.
2. Actors, intent-expressing Commands, past-tense Domain Events, Policies, Hotspots, invariants, grade lifecycle, and Published Language boundaries remain explicit.
3. The `claude-video v0.1.3` example and remote YouTube smoke fixture retain their accepted source, caption, network, Whisper, visual, artifact, and evidence classifications.
4. Tool Lab ownership and the boundaries with Approval & Security, Integration, Agent Studio, and Orchestration remain explicit.
5. Repository tests, operating-model and Markdown-link validation, and `git diff --check` pass with fresh evidence.
6. The HandoffBrief records the written review outcome, verification evidence, open loops, pending HITL requests, and exactly one next action.
