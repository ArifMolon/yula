# MarkItDown Document Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local-only, single-file MarkItDown ingestion flow that converts approved document types into canonical Knowledge with provenance, idempotent duplicate handling, and fail-closed error behavior.

**Architecture:** Interaction accepts one quarantined file and creates an Execution. Tool Lab runs a pinned, read-only MarkItDown ToolVersion in a local sandbox. Knowledge validates the converted artifact, persists canonical output only when the active Knowledge context is available, and deletes the original quarantined file after success or deletion. Exact duplicates return the existing Concept; changed re-ingestion creates a new Concept and supersession record.

**Tech Stack:** Existing YULA repository scripts and docs, Node.js test runner for contract verification, GitHub issue/project metadata, and the future YULA app runtime that owns Interaction, Orchestration, Tool Lab, Knowledge, and Approval & Security boundaries.

---

## Scope And Delivery Boundaries

This plan covers only the first tracer bullet for issue #15. It intentionally excludes batch upload, ZIP/archive ingestion, URL ingestion, cloud OCR, plugins, external network access, and any non-local MarkItDown deployment path.

The first slice is only complete when a single local file can be uploaded, converted, persisted canonically, and then deleted from quarantine under the approved local-only rules.

## File Map

### Canonical documentation to create or update

- Create `my-docs/okf/handoffs/issue-15.json`: current-state HandoffBrief for issue #15.
- Create `my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md`: canonical event-storming record for the approved issue #15 design.
- Create `my-docs/plan/2026-07-14-markitdown-document-ingestion-implementation.md`: this implementation plan.

### Future source files to create in the implementation worktree

- Create `src/interaction/document-upload/submit-document-source.*`: UI-facing command entry for a single local upload.
- Create `src/orchestration/executions/start-document-ingestion-execution.*`: execution bootstrap for the upload flow.
- Create `src/tool-lab/markitdown/markitdown-tool-version.*`: pinned tool metadata and sandbox invocation contract.
- Create `src/knowledge/document-ingestion/persist-converted-concept.*`: canonical persistence and supersession logic.
- Create `src/knowledge/document-ingestion/document-ingestion-deletion.*`: original file and concept deletion path.
- Create `tests/document-ingestion/*.test.*`: contract and behavior tests for accepted types, duplicate handling, failure modes, and deletion.

## Task 1: Lock The Published Language And Error Model

**Files:**
- Create: `my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md`
- Create: `my-docs/okf/handoffs/issue-15.json`
- Modify: `my-docs/plan/2026-07-14-markitdown-document-ingestion-implementation.md`

- [ ] **Step 1: Draft the failing domain contract**

Record the first-slice contract in the issue #15 event-storming artifact, including these exact decisions:

```markdown
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
```

- [ ] **Step 2: Validate the plan against the approved decisions**

Run:

```bash
rg -n "CSV|local-only|single-file|canonical persistence|fail closed|degraded|supersession" my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md my-docs/okf/handoffs/issue-15.json my-docs/plan/2026-07-14-markitdown-document-ingestion-implementation.md
```

Expected: every approved decision appears once in the canonical issue artifacts and the implementation plan reflects them without widening scope.

## Task 2: Pin The MarkItDown Tool Boundary

**Files:**
- Create: `src/tool-lab/markitdown/markitdown-tool-version.*`
- Create: `tests/document-ingestion/markitdown-tool-version.test.*`

- [ ] **Step 1: Write the failing tool-version test**

Create a test that asserts the MarkItDown tool metadata includes:

```js
{
  source: 'microsoft/markitdown',
  mode: 'local-only',
  network: 'none',
  plugins: 'disabled',
  input: 'single quarantined file',
  output: 'markdown artifact with provenance'
}
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
node --test tests/document-ingestion/markitdown-tool-version.test.*
```

Expected: fail because the tool boundary module does not exist yet.

- [ ] **Step 3: Implement the minimal pinned tool metadata**

Create the smallest tool-version contract that records the exact source, read-only local mode, and disabled plugin/network constraints, without adding any optional remote capability.

- [ ] **Step 4: Re-run the test**

Run:

```bash
node --test tests/document-ingestion/markitdown-tool-version.test.*
```

Expected: pass.

## Task 3: Build The Single-File Ingestion Execution

**Files:**
- Create: `src/interaction/document-upload/submit-document-source.*`
- Create: `src/orchestration/executions/start-document-ingestion-execution.*`
- Create: `tests/document-ingestion/submit-document-source.test.*`
- Create: `tests/document-ingestion/start-document-ingestion-execution.test.*`

- [ ] **Step 1: Write tests for accepted and rejected uploads**

Cover these cases explicitly:

```js
// accepted
['report.pdf', 'deck.pptx', 'sheet.xlsx', 'notes.csv', 'draft.md']

// rejected
['archive.zip', 'remote-url', 'audio.mp3', 'video.mp4']
```

Also assert the following:

```js
assert.equal(command.mode, 'single-file');
assert.equal(command.localOnly, true);
assert.equal(command.requiresKnowledgeBundle, false);
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --test tests/document-ingestion/submit-document-source.test.*
node --test tests/document-ingestion/start-document-ingestion-execution.test.*
```

Expected: fail because the upload and execution modules do not exist yet.

- [ ] **Step 3: Implement the minimal execution path**

Add the smallest upload command and execution bootstrap that:

```js
// pseudocode
acceptsOneFileOnly();
startsLocalOnlyExecution();
routes to MarkItDown tool version;
captures provenance;
forwards the converted artifact to Knowledge;
```

- [ ] **Step 4: Re-run the tests**

Run:

```bash
node --test tests/document-ingestion/submit-document-source.test.*
node --test tests/document-ingestion/start-document-ingestion-execution.test.*
```

Expected: pass.

## Task 4: Persist Canonical Knowledge And Deletion Semantics

**Files:**
- Create: `src/knowledge/document-ingestion/persist-converted-concept.*`
- Create: `src/knowledge/document-ingestion/document-ingestion-deletion.*`
- Create: `tests/document-ingestion/persist-converted-concept.test.*`
- Create: `tests/document-ingestion/document-ingestion-deletion.test.*`

- [ ] **Step 1: Write duplicate and supersession tests**

Assert these behaviors:

```js
assert.equal(persistConvertedConcept({ digest: 'abc' }), 'existing-concept-id');
assert.equal(persistConvertedConcept({ digest: 'xyz', previousDigest: 'abc' }), 'new-concept-id');
assert.equal(recordSupersession('abc', 'xyz'), true);
```

- [ ] **Step 2: Write deletion tests**

Assert that deleting a persisted Concept also deletes the quarantined original file and any derived evidence tied only to that Concept.

- [ ] **Step 3: Implement canonical persistence**

Implement the minimal Knowledge write path that:

```js
validates provenance;
detects exact duplicates by digest;
creates a new Concept for meaningful change;
records supersession;
deletes original quarantined input after success;
```

- [ ] **Step 4: Re-run the tests**

Run:

```bash
node --test tests/document-ingestion/persist-converted-concept.test.*
node --test tests/document-ingestion/document-ingestion-deletion.test.*
```

Expected: pass.

## Task 5: Add Failure States And Retry Resolution

**Files:**
- Create: `tests/document-ingestion/error-states.test.*`
- Modify: `src/orchestration/executions/start-document-ingestion-execution.*`
- Modify: `src/knowledge/document-ingestion/persist-converted-concept.*`

- [ ] **Step 1: Write the failure-state tests**

Cover these explicit outcomes:

```js
assert.equal(renderFailure('encrypted'), 'fail-closed');
assert.equal(renderFailure('corrupted'), 'fail-closed');
assert.equal(renderFailure('ocr-required'), 'degraded');
assert.equal(renderFailure('retries-exhausted'), 'suspend');
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --test tests/document-ingestion/error-states.test.*
```

Expected: fail until the state machine and rendered outcomes exist.

- [ ] **Step 3: Implement the narrow retry policy**

Keep retry handling in this order:

```js
no-alternate-converter;
then provenance-bearing user input if available;
then execution suspension;
```

- [ ] **Step 4: Re-run the tests**

Run:

```bash
node --test tests/document-ingestion/error-states.test.*
```

Expected: pass.

## Task 6: Verify The Slice End To End

**Files:** all files above.

- [ ] **Step 1: Run focused validation**

```bash
node --test tests/document-ingestion/*.test.*
git diff --check
```

- [ ] **Step 2: Run repository gates**

```bash
node scripts/validate-operating-model.mjs
node --test tests/*.test.mjs
```

- [ ] **Step 3: Confirm the scope is still bounded**

Review the final diff for accidental support of batch upload, ZIP/archive ingestion, URL ingestion, cloud OCR, plugins, or network access.

- [ ] **Step 4: Record the handoff state**

Update the issue #15 HandoffBrief with the implemented state, fresh verification evidence, and one concrete next action.
