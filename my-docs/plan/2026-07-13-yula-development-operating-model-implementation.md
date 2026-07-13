# YULA Development Operating Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish YULA's approved DDD-first development operating model, canonical knowledge layout, policy schemas, GitHub delivery controls, and spec-scoped worktree automation before progressively creating Phase 0 work.

**Architecture:** The main checkout owns durable documentation and OKF; code worktrees are spec-scoped and exclude those main-owned paths. Declarative Markdown/YAML schemas define the domain language and lifecycle contracts, while small Node.js validators and shell entrypoints enforce them locally and in GitHub Actions. GitHub Project state tracks delivery, but canonical knowledge remains git-versioned OKF and all persistent knowledge writes are serialized through the Core `KnowledgeWriter` contract.

**Tech Stack:** Markdown, YAML, JSON Schema draft 2020-12, Node.js built-ins, POSIX-compatible shell, Git/Git worktrees, GitHub Projects v2, GitHub Actions, `gh` CLI.

---

## Scope And Delivery Boundaries

This plan covers operating-model infrastructure and only the progressive creation of Phase 0 Spec Issues. It does not implement the YULA product, create Phase 1–6 issues, automatically select the next issue, or create tracer-bullet child issues before the user selects the first Phase 0 spec.

The implementation has two human gates:

1. The dashboard branch must be merged locally, kept separate, pushed, or discarded by an explicit user decision before its files are moved into `my-docs`.
2. After Phase 0 Spec Issues exist, the user selects the first spec before any child issues are created.

No GitHub issue may be created until both exported plan reviews are applied to the canonical plan and recorded as resolved.

## File Map

### Existing files modified or moved

- Modify `.gitignore`: ignore `my-docs/.local/` while retaining `.worktrees/` and `.superpowers/`.
- Move `okf/YULA_DDD_Proje_Plani.md` to `my-docs/plan/YULA_DDD_Proje_Plani.md`: canonical DDD plan with approved knowledge-architecture and tool-candidate revisions.
- Move `docs/superpowers/specs/2026-07-13-yula-development-operating-model-design.md` to `my-docs/plan/2026-07-13-yula-development-operating-model-design.md`: approved operating model.
- Move `docs/superpowers/specs/2026-07-13-yula-plan-dashboard-design.md` to `my-docs/plan/2026-07-13-yula-plan-dashboard-design.md`: dashboard design record.
- Move `docs/superpowers/plans/2026-07-13-yula-plan-dashboard.md` to `my-docs/plan/2026-07-13-yula-plan-dashboard-implementation.md`: dashboard delivery plan.
- Move `docs/superpowers/plans/plan-reviews.md` to `my-docs/plan/plan-reviews.md`: review provenance with both records marked resolved.
- Move this plan to `my-docs/plan/2026-07-13-yula-development-operating-model-implementation.md` during documentation migration.
- If the dashboard branch is integrated, move `okf/plan.html` to `my-docs/plan/plan.html` and retain `scripts/verify-plan-html.mjs` as its derived-view contract verifier.

### Canonical documentation and schemas created

- Create `my-docs/okf/index.md`: OKF entrypoint, lifecycle, claim rules, and canonical/derived boundaries.
- Create `my-docs/okf/log.md`: append-only knowledge update ledger.
- Create `my-docs/okf/concepts/.gitkeep`: canonical concept directory anchor.
- Create `my-docs/okf/contexts/<context>/lessons/.gitkeep` for all twelve full bounded-context slugs.
- Create `my-docs/okf/handoffs/.gitkeep`: current HandoffBrief storage anchor.
- Create `my-docs/okf/event-storming/.gitkeep`: discovery artifact anchor.
- Create `my-docs/adr/0001-development-operating-model.md`: hard-to-reverse operating-model decision record.
- Create `my-docs/templates/handoff-brief.md`: structured current-state template.
- Create `my-docs/templates/failure-observation.md`: trace-backed observation template.
- Create `my-docs/templates/lesson.md`: Candidate-to-Superseded lesson lifecycle template.
- Create `my-docs/templates/knowledge-update-requested.md`: issue-close knowledge request contract.
- Create `my-docs/policies/ddd-must.md`: merge-blocking Ubiquitous Language rules.
- Create `my-docs/policies/hitl.md`: RiskLevel and Review Inbox transition policy.
- Create `my-docs/policies/voice.md`: typed-command parity, confirmation, and audit rules.
- Create `my-docs/policies/worktree-boundaries.md`: main-owned versus code-worktree content.
- Create `schemas/handoff-brief.schema.json`, `schemas/failure-observation.schema.json`, `schemas/lesson.schema.json`, and `schemas/knowledge-update-requested.schema.json`: machine-readable contracts.

### Local validation and automation created

- Create `scripts/validate-operating-model.mjs`: validates schemas, examples, context names, review resolution, forbidden numeric-only contexts, and documentation links.
- Create `scripts/worktree-policy.mjs`: computes safe bootstrap/cleanup decisions without mutating git state.
- Create `scripts/spec-worktree`: user-facing bootstrap and cleanup entrypoint around validated git operations.
- Create `scripts/project-config.mjs`: idempotent GitHub Project/field/label configuration data and command generation.
- Create `scripts/validate-project-item.mjs`: validates issue Project fields and Done eligibility from event payloads.
- Create `scripts/request-knowledge-update.mjs`: builds a deterministic knowledge-only branch payload from a closed issue.
- Create `scripts/validate-spec-cleanup.mjs`: detects remaining feature branches, worktrees, claims, and HITL requests.
- Create `tests/fixtures/`: valid and invalid lifecycle fixtures used by Node's built-in test runner.
- Create `tests/operating-model.test.mjs`, `tests/worktree-policy.test.mjs`, `tests/project-config.test.mjs`, and `tests/knowledge-automation.test.mjs`.
- Create `.github/ISSUE_TEMPLATE/spec.yml`, `.github/ISSUE_TEMPLATE/tracer-bullet.yml`, `.github/ISSUE_TEMPLATE/decision.yml`, and `.github/ISSUE_TEMPLATE/config.yml`.
- Create `.github/PULL_REQUEST_TEMPLATE.md`.
- Create `.github/workflows/operating-model-checks.yml`, `.github/workflows/issue-close-knowledge.yml`, and `.github/workflows/spec-cleanup.yml`.

## Task 1: Record The Baseline And Resolve Dashboard Integration

- [x] **Step 1: Reconfirm the clean baseline and branch topology**

Run:

```bash
git status --short --branch
git worktree list
git log --oneline --decorate --all -8
git diff --name-status main..feature/interactive-plan-dashboard
```

Expected: `main` is clean at `7ebd27d`; `.worktrees/interactive-plan-dashboard` is at `c138bc7`; the dashboard branch contains `okf/plan.html` and `scripts/verify-plan-html.mjs` and predates the local Matt skill commit.

- [x] **Step 2: Present the non-destructive integration choices**

Ask the user to select one of these outcomes: local merge into `main` (recommended because the dashboard and popup fix were accepted), keep the branch/worktree, push the branch, or discard it. Do not remove a branch or worktree without the explicit discard choice.

- [x] **Step 3: If local merge is selected, merge without deleting the worktree**

Run:

```bash
git merge --no-ff feature/interactive-plan-dashboard -m "merge: integrate interactive plan dashboard"
```

Expected: merge succeeds; `okf/plan.html` and `scripts/verify-plan-html.mjs` exist; `.agents`, `.claude`, and `.codex` skill files remain present.

- [x] **Step 4: Verify the integrated dashboard and newer main-owned files**

Run:

```bash
node scripts/verify-plan-html.mjs
test -f .agents/skills/matt-handoff/SKILL.md
git diff --check
git status --short --branch
```

Expected: dashboard verifier reports all checks passing; the skill file test exits zero; no whitespace errors exist.

- [x] **Step 5: If the branch is kept or pushed instead, record the decision**

Add a dated decision line under this task noting the selected outcome and branch commit. Subsequent migration steps must not claim `my-docs/plan/plan.html` exists unless the branch has been integrated.

## Task 2: Apply And Resolve The Exported Plan Reviews

- [x] **Step 1: Write a failing review-resolution test**

Create `tests/operating-model.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('all exported reviews are resolved with provenance', async () => {
  const reviews = await readFile('docs/superpowers/plans/plan-reviews.md', 'utf8');
  assert.doesNotMatch(reviews, /^status: (open|revision-required)$/m);
  assert.equal((reviews.match(/^status: resolved$/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolution:/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolved_at:/gm) ?? []).length, 2);
});
```

- [x] **Step 2: Run the test and verify red state**

Run: `node --test tests/operating-model.test.mjs`

Expected: FAIL because the two records still have `status: open` and no resolution metadata.

- [x] **Step 3: Revise the canonical DDD plan**

Modify `okf/YULA_DDD_Proje_Plani.md` so it explicitly states:

```markdown
- OKF Markdown with provenance and git history is permanent canonical memory.
- The embedding model creates semantic representations; sqlite-vec only stores and searches the derived vectors.
- All persistent writes pass through one Core KnowledgeWriter; agents and workers never write shared SQLite directly.
- SQLite WAL permits concurrent reads but persistent writes remain serialized.
- Per-execution scratch memory is ephemeral and is discarded or promoted by a Knowledge Curator.
- Per-agent permanent micro-brains are excluded from v1; sharding waits for measured contention.
- Crawl4AI and MarkItDown remain quarantined Tool Lab candidates and bind only through evaluated Web Ingestion and Document Ingestion Skills.
```

Update the relevant Knowledge Context, knowledge architecture, Tool Lab, risks, and ADR seed sections rather than adding a disconnected appendix.

- [x] **Step 4: Mark both review records resolved while preserving their original text**

For each record in `docs/superpowers/plans/plan-reviews.md`, change `status` to `resolved` and append machine-readable fields:

```text
resolution: Applied to the canonical DDD plan and operating-model design; original review preserved below.
resolved_at: 2026-07-13T00:00:00+03:00
resolved_by: coding-agent
```

Use the actual completion timestamp instead of the example timestamp.

- [x] **Step 5: Run the test and inspect the semantic diff**

Run:

```bash
node --test tests/operating-model.test.mjs
git diff -- okf/YULA_DDD_Proje_Plani.md docs/superpowers/plans/plan-reviews.md
git diff --check
```

Expected: PASS; the diff covers all four approved decisions and retains review IDs, targets, timestamps, and note bodies.

- [x] **Step 6: Commit the review resolution gate**

```bash
git add okf/YULA_DDD_Proje_Plani.md docs/superpowers/plans/plan-reviews.md tests/operating-model.test.mjs
git commit -m "docs: resolve canonical plan reviews"
```

## Task 3: Migrate Durable Documentation Into `my-docs`

- [x] **Step 1: Extend the failing test with canonical-layout assertions**

Add to `tests/operating-model.test.mjs`:

```js
import { access } from 'node:fs/promises';

test('canonical documentation lives under my-docs', async () => {
  const required = [
    'my-docs/plan/YULA_DDD_Proje_Plani.md',
    'my-docs/plan/2026-07-13-yula-development-operating-model-design.md',
    'my-docs/plan/plan-reviews.md',
    'my-docs/okf/index.md',
    'my-docs/okf/log.md',
  ];
  await Promise.all(required.map(path => access(path)));
});
```

- [x] **Step 2: Run the test and verify missing `my-docs` paths**

Run: `node --test tests/operating-model.test.mjs`

Expected: FAIL with `ENOENT` for `my-docs/plan/...`.

- [x] **Step 3: Move the approved artifacts with git history**

Use `git mv` for the files listed in the File Map. If the dashboard is integrated, also run:

```bash
git mv okf/plan.html my-docs/plan/plan.html
```

Update source links inside the moved Markdown and `scripts/verify-plan-html.mjs` to use `my-docs/plan/YULA_DDD_Proje_Plani.md` and `my-docs/plan/plan.html`.

- [x] **Step 4: Create the OKF skeleton and local-artifact boundary**

Create `my-docs/okf/index.md` with the `Todo -> Progress -> Review -> Prod` lifecycle, two-hour claim lease, stale-claim recovery, `KnowledgeWriter` serialization, OKF-as-canonical rule, and sqlite-vec-as-derived-index rule. Create `my-docs/okf/log.md` with a heading and append-only entry format. Add `.gitkeep` anchors for the directories in the File Map.

Append to `.gitignore`:

```gitignore
my-docs/.local/
```

- [x] **Step 5: Run layout and dashboard verification**

Run:

```bash
node --test tests/operating-model.test.mjs
node scripts/verify-plan-html.mjs
git diff --check
```

Expected: PASS. If the dashboard was not integrated, omit its verifier and record that the derived HTML remains on its feature branch.

- [x] **Step 6: Commit the documentation migration**

```bash
git add .gitignore my-docs scripts/verify-plan-html.mjs tests/operating-model.test.mjs
git commit -m "docs: establish canonical my-docs layout"
```

## Task 4: Add DDD, Handoff, Learning, HITL, And Voice Contracts

- [x] **Step 1: Add failing schema and policy tests**

Extend `tests/operating-model.test.mjs` to assert that all four schema files parse as JSON, each declares `$schema` as `https://json-schema.org/draft/2020-12/schema`, each requires its identity and lifecycle fields, all twelve full context slugs have lesson directories, and policy documents contain the prohibited generic names, R3/R4 approval rules, voice confirmation rules, and main/worktree boundary rules.

- [x] **Step 2: Run the tests and verify red state**

Run: `node --test tests/operating-model.test.mjs`

Expected: FAIL because schemas, templates, policies, ADR, and context lesson directories do not exist.

- [x] **Step 3: Create the DDD MUST policy and ADR**

Define commands as intent, events in past tense, aggregate transitions by domain name, glossary-before-merge, Published Language boundaries, and merge-blocking rejection of `Manager`, `Helper`, `Utils`, `CommonService`, `process`, `updateData`, unrestricted `setStatus`, and numeric-only bounded-context identifiers.

The ADR must record: one spec worktree, one active feature issue per spec, main-owned durable knowledge, serialized `KnowledgeWriter`, separate GitHub/OKF state machines, agent-managed OKF review, unified Review Inbox for genuine human decisions, and voice parity with typed commands.

- [x] **Step 4: Create JSON Schemas and matching Markdown templates**

Use these required domain fields:

```text
HandoffBrief: issue, spec, bounded_context, kind, status, branch, spec_worktree, objective, ubiquitous_language, invariants, decisions, implementation_state, changed_code, verification, active_lessons, open_loops, next_action, blockers, pending_hitl, updater, session, updated_at
FailureObservation: observation_id, bounded_context, operation, symptom, evidence, cause_hypothesis, workaround, execution_id, trace_id, confidence, observed_at
Lesson: lesson_id, bounded_context, lifecycle, provenance, prevention_guidance, confidence, validation_evidence, operations, tools, input_classes
KnowledgeUpdateRequested: request_id, issue, spec, bounded_context, capability, pull_request, events, lessons, verification, requested_at
```

Constrain `bounded_context` to the twelve full slugs and constrain lifecycle values to the approved state machines.

- [x] **Step 5: Create HITL and voice policies**

Define ApprovalRequest presentation fields, decisions (`Approve`, `Request Changes`, `Reject`, `Approve Once`, `Approve Scope`, `Cancel Execution`), mandatory R3/R4 human review, pending-HITL Done block, second voice confirmation for R3, UI/biometric confirmation for R4, low-confidence rejection, no bulk R3/R4 approval, and transcript/confidence/audit recording.

- [x] **Step 6: Implement `scripts/validate-operating-model.mjs`**

The validator must use Node built-ins only, parse every JSON schema, verify required policy phrases and context slugs, reject `BC-<number>` as an operational context value in fixtures/templates, ensure both review records are resolved, and verify all relative Markdown links resolve.

- [x] **Step 7: Run all contract checks and commit**

Run:

```bash
node --test tests/operating-model.test.mjs
node scripts/validate-operating-model.mjs
git diff --check
```

Expected: all tests pass and the validator prints a zero-error summary.

```bash
git add my-docs schemas scripts/validate-operating-model.mjs tests/operating-model.test.mjs
git commit -m "feat: codify YULA operating model contracts"
```

## Task 5: Configure The GitHub Project And Domain Labels

- [x] **Step 1: Write a failing configuration contract test**

Create `tests/project-config.test.mjs` that imports `scripts/project-config.mjs` and asserts the project title, four Status options, Phase 0–6, all twelve full Bounded Context names, Risk R0–R4, Human Review values, Size XS/S/M, seven kind labels, three optional model labels, and only `blocked`, `security`, `human-required` as delivery exception labels.

- [x] **Step 2: Run the test and verify red state**

Run: `node --test tests/project-config.test.mjs`

Expected: FAIL because `scripts/project-config.mjs` does not exist.

- [x] **Step 3: Implement declarative, idempotent project configuration**

Export immutable configuration arrays and a command generator. Commands must create or locate the user-level `YULA Development` Project under `ArifMolon`, link only `ArifMolon/yula`, create missing fields/options, and create/update labels without duplicating Project field concepts as labels.

- [x] **Step 4: Run tests before external mutation**

Run:

```bash
node --test tests/project-config.test.mjs
node scripts/project-config.mjs --dry-run
```

Expected: PASS; dry-run lists intended project, fields, options, and labels and creates no remote state.

- [x] **Step 5: Apply the configuration with authenticated `gh`**

Run the script's `--apply` mode only after `gh auth status` succeeds. Capture the Project number/ID and field IDs into a generated configuration file that contains identifiers but no tokens or secrets.

- [x] **Step 6: Verify idempotency and remote state**

Run `--apply` a second time and then `--verify`.

Expected: second apply creates nothing; verification confirms one linked repository, exact field options, and exact domain label vocabulary.

- [x] **Step 7: Commit configuration code and non-secret identifiers**

```bash
git add scripts/project-config.mjs tests/project-config.test.mjs .github
git commit -m "feat: configure YULA delivery project"
```

## Task 6: Add Issue, Pull Request, And Handoff Intake Templates

- [x] **Step 1: Add failing template assertions**

Extend `tests/project-config.test.mjs` to require the Spec Issue sections: bounded context, outcome, Ubiquitous Language, invariants, Published Language, dependencies, HITL policy, exit criteria, and child issues. Require tracer-bullet coverage of domain, application, ports, adapters, UI, tests, and evaluation where applicable. Require PR confirmation of glossary, DDD boundary, fresh verification, HandoffBrief, claims, and HITL state.

- [x] **Step 2: Run tests and confirm the templates are missing**

Run: `node --test tests/project-config.test.mjs`

Expected: FAIL on missing `.github/ISSUE_TEMPLATE/*.yml`.

- [x] **Step 3: Create typed GitHub form templates**

Use dropdowns for the twelve full bounded-context names, RiskLevel, Human Review, and Size. Do not expose numeric-only context choices. Include issue-form validation for required domain outcomes and invariants; leave operational state transitions to Project/API automation rather than editable Markdown status fields.

- [x] **Step 4: Create the PR template and verify**

Run:

```bash
node --test tests/project-config.test.mjs
node scripts/validate-operating-model.mjs
git diff --check
```

Expected: PASS with no numeric-only context identifiers in issue form values.

- [x] **Step 5: Commit the intake contracts**

```bash
git add .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md tests/project-config.test.mjs
git commit -m "feat: add domain delivery templates"
```

## Task 7: Add Issue-Close Knowledge Automation

- [x] **Step 1: Write failing deterministic payload tests**

Create `tests/knowledge-automation.test.mjs` with a fixture for a Done feature issue and assertions that `request-knowledge-update.mjs` produces one `KnowledgeUpdateRequested` record and one append-only OKF log entry containing issue, PR, spec, full context, capability, events, lessons, and verification. Add invalid fixtures for missing HandoffBrief, unresolved claim, pending HITL, and non-Done Project status.

- [x] **Step 2: Run tests and verify red state**

Run: `node --test tests/knowledge-automation.test.mjs`

Expected: FAIL because the validator and payload builder do not exist.

- [x] **Step 3: Implement pure validation and payload generation**

`validate-project-item.mjs` must return structured errors and never mutate state. `request-knowledge-update.mjs` must derive deterministic filenames and Markdown from validated event input; it must never invent lessons, modify plans/ADRs, activate prompts, choose the next issue, or represent agent action as human approval.

- [x] **Step 4: Create the knowledge-only GitHub workflow**

The workflow must trigger on feature issue closure, read Project fields, validate the latest HandoffBrief, create a `knowledge/issue-<number>` branch, append the OKF log entry, add the request record, open a documentation-only PR, run schema/provenance/link checks, and auto-merge only after those checks pass. Failure must emit a Review Inbox integration event or a clearly structured artifact until that adapter exists.

- [x] **Step 5: Test legal and illegal transitions**

Run:

```bash
node --test tests/knowledge-automation.test.mjs
node scripts/request-knowledge-update.mjs --fixture tests/fixtures/done-feature-issue.json --dry-run
node scripts/validate-operating-model.mjs
```

Expected: valid fixture passes; each invalid fixture fails for its specific invariant; dry-run produces no branch or file mutation.

- [x] **Step 6: Commit the automation**

```bash
git add .github/workflows/issue-close-knowledge.yml scripts/validate-project-item.mjs scripts/request-knowledge-update.mjs tests
git commit -m "feat: request knowledge updates on issue close"
```

## Task 8: Add Spec-Scoped Worktree Bootstrap And Cleanup

- [x] **Step 1: Write failing worktree-policy tests**

Create `tests/worktree-policy.test.mjs` for: valid `spec/<name>` creation at `.worktrees/spec-<name>`, one active `feature/<issue>-<name>` branch, shared pnpm store at `my-docs/.local/pnpm-store`, forbidden main-owned paths in code worktrees, dirty-worktree cleanup rejection, unmerged-branch rejection, stale claim/pending HITL rejection, and safe cleanup approval.

- [x] **Step 2: Run tests and verify red state**

Run: `node --test tests/worktree-policy.test.mjs`

Expected: FAIL because `scripts/worktree-policy.mjs` does not exist.

- [x] **Step 3: Implement the pure policy module**

Return planned actions or named blocking reasons. Never silently delete dirty/unmerged work, stashes, claims, artifacts, or pending Review Inbox items. Enforce one worktree per spec rather than one per issue and one active feature branch in that worktree.

- [x] **Step 4: Implement `scripts/spec-worktree` commands**

Support:

```text
scripts/spec-worktree bootstrap <spec-name>
scripts/spec-worktree start-feature <issue-number> <feature-name>
scripts/spec-worktree finish-feature <issue-number>
scripts/spec-worktree inspect <spec-name>
scripts/spec-worktree cleanup <spec-name>
```

Bootstrap must create the spec branch/worktree, configure the shared pnpm content-addressed store, and exclude main-owned `my-docs`, handoffs, plans, generated artifacts, and OKF content from the code worktree without sharing mutable `node_modules`.

- [x] **Step 5: Exercise behavior in a disposable repository fixture**

Run:

```bash
node --test tests/worktree-policy.test.mjs
scripts/spec-worktree --dry-run bootstrap phase-0-foundation
scripts/spec-worktree --dry-run cleanup phase-0-foundation
```

Expected: policy tests pass; dry runs print exact git actions but do not modify the current repository.

- [x] **Step 6: Commit worktree tooling**

```bash
git add scripts/spec-worktree scripts/worktree-policy.mjs tests/worktree-policy.test.mjs my-docs/policies/worktree-boundaries.md
git commit -m "feat: add spec-scoped worktree lifecycle"
```

## Task 9: Add Spec Completion Validation And Continuous Checks

- [x] **Step 1: Add failing completion fixtures**

Extend `tests/knowledge-automation.test.mjs` with valid and invalid spec completion fixtures covering main merge, final acceptance, final HandoffBrief, remaining feature branches, stale worktree, unresolved OKF claim, and pending HITL request.

- [x] **Step 2: Implement `validate-spec-cleanup.mjs`**

The validator must produce a machine-readable report and exit non-zero for any unsafe cleanup condition. It may recommend `git worktree prune` only after the physical worktree and branches are safely removed; it must never force-delete them.

- [x] **Step 3: Add CI workflows**

`operating-model-checks.yml` runs Node tests, schema/policy/link validation, numeric-context rejection, and `git diff --check` on PRs. `spec-cleanup.yml` runs only when spec completion is requested and blocks Done until every cleanup invariant passes.

- [x] **Step 4: Run the complete local suite**

Run:

```bash
node --test tests/*.test.mjs
node scripts/validate-operating-model.mjs
node scripts/project-config.mjs --verify
git diff --check
```

Expected: all tests pass, remote configuration matches, and no whitespace errors exist.

- [x] **Step 5: Commit continuous enforcement**

```bash
git add .github/workflows/operating-model-checks.yml .github/workflows/spec-cleanup.yml scripts/validate-spec-cleanup.mjs tests
git commit -m "feat: enforce spec completion invariants"
```

## Task 10: Create Only Phase 0 Spec Issues

- [x] **Step 1: Verify every prerequisite gate**

Run:

```bash
node --test tests/*.test.mjs
node scripts/validate-operating-model.mjs
node scripts/project-config.mjs --verify
git status --short --branch
```

Expected: all checks pass; both plan reviews are resolved; Project fields and labels exist; no Phase 1–6 creation command is queued.

- [x] **Step 2: Derive Phase 0 Spec Issue drafts from the canonical plan**

Each draft must represent one coherent domain capability and contain the owning full bounded-context name, outcome, Ubiquitous Language, invariants, Published Language interactions, dependencies, HITL policy, exit criteria, and an initially empty child-issue list. Use `matt-to-tickets` only for this bounded Phase 0 scope.

- [x] **Step 3: Review the draft set against progressive-rollout constraints**

Reject any draft that is a generic technical layer, exceeds Size M, belongs to Phase 1–6, duplicates another spec outcome, uses `BC-<number>` as its working name, or already contains tracer-bullet child issues.

- [x] **Step 4: Publish Phase 0 Spec Issues and add them to the Project**

Create only the approved Phase 0 Spec Issues with `Status=Todo`, `Phase=0`, full `Bounded Context`, Risk, Spec identifier, Human Review, and Size. Do not create child issues and do not move a spec to Progress.

- [x] **Step 5: Verify remote issue scope**

Query the Project and repository issues. Expected: every newly created issue is Phase 0 and a Spec Issue; there are zero Phase 1–6 issues and zero tracer-bullet child issues.

- [x] **Step 6: Commit any generated non-operational catalog record**

If the Project IDs or Phase 0 spec identifiers are stored locally, commit only non-secret identifiers and links:

```bash
git add my-docs/plan .github
git commit -m "docs: record Phase 0 specification backlog"
```

## Task 11: Select The First Spec And Stop At The Child-Issue Gate

- [x] **Step 1: Present the Phase 0 Spec Issues to the user**

Summarize outcome, bounded context, dependencies, Risk, Human Review, and Size for each spec. Recommend a first spec based on dependency order and tracer-bullet learning value, but do not select it automatically.

- [x] **Step 2: Record the user's selected spec**

Update only that Spec Issue's Project state from Todo to Progress after explicit selection. All other Phase 0 specs remain Todo.

- [x] **Step 3: End this implementation plan at the agreed boundary**

Do not create child issues in this task. The next session uses `matt-to-tickets` for the selected spec only, validates its tracer-bullet edges, creates its spec worktree, and starts one feature issue with a fresh HandoffBrief.

## Final Verification Checklist

- [x] `node --test tests/*.test.mjs` passes.
- [x] `node scripts/validate-operating-model.mjs` reports zero errors.
- [x] `node scripts/project-config.mjs --verify` matches the remote Project and labels.
- [x] `node scripts/verify-plan-html.mjs` passes if the dashboard was integrated.
- [x] `git diff --check` reports no whitespace errors.
- [x] Both exported reviews are resolved with provenance and the canonical plan contains all approved revisions.
- [ ] `my-docs/.local/` is ignored; durable OKF, plans, handoffs, and generated artifacts are absent from code worktrees.
- [x] DDD generic names and numeric-only context identifiers are rejected by validation.
- [x] R3/R4 and voice confirmation policies match the approved operating model.
- [x] No GitHub Action starts the next issue, invents lessons, impersonates approval, or force-deletes worktrees.
- [x] GitHub contains only Phase 0 Spec Issues; child issue count remains zero until the next user-approved session.
