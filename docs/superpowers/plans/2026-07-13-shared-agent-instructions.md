# Shared Agent Instructions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Claude Code, Codex, Pi, and other LLM tools one DRY, durable source of truth for understanding and developing YULA.

**Architecture:** Root `AGENTS.md` owns all shared YULA product and development instructions. Root `CLAUDE.md` points to `AGENTS.md` and contains only Claude-specific context-mode routing. A Node test prevents shared-rule duplication and checks required canonical references.

**Tech Stack:** Markdown, Node.js built-in test runner, repository operating-model validators.

---

### Task 1: Protect the shared instruction contract

**Files:**
- Create: `tests/agent-instructions.test.mjs`

- [x] **Step 1: Write the failing contract tests**

Create tests that read `AGENTS.md` and `CLAUDE.md`, require `CLAUDE.md` to point agents to `AGENTS.md`, require `AGENTS.md` to reference the canonical DDD, worktree, HandoffBrief, HITL, OKF, Project, and verification artifacts, and reject copied shared headings in `CLAUDE.md`.

- [x] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/agent-instructions.test.mjs`

Expected: FAIL because `AGENTS.md` does not exist and `CLAUDE.md` does not reference it.

- [x] **Step 3: Commit the red test**

Run:

```bash
git add tests/agent-instructions.test.mjs
git commit -m "test: define shared agent instruction contract"
```

### Task 2: Add the canonical cross-tool instructions

**Files:**
- Create: `AGENTS.md`

- [x] **Step 1: Write the canonical shared instructions**

Document YULA's purpose, source-of-truth hierarchy, session preflight, DDD MUST language, all twelve bounded-context names, issue hierarchy, spec-scoped worktree workflow, OKF and serialized KnowledgeWriter boundary, HITL and voice rules, verification requirements, prohibited autonomous actions, and current-state discovery. Link to existing canonical files instead of copying their contents.

- [x] **Step 2: Run the focused test and confirm only the Claude adapter assertion remains red**

Run: `node --test tests/agent-instructions.test.mjs`

Expected: the canonical-reference assertions pass; the `CLAUDE.md` reference assertion still fails.

### Task 3: Convert Claude instructions into a thin adapter

**Files:**
- Modify: `CLAUDE.md`

- [x] **Step 1: Add the mandatory shared-instruction reference**

Place a short mandatory preamble at the top requiring Claude Code to read and obey root `AGENTS.md`. Preserve the existing context-mode routing rules as Claude-specific content and do not copy shared YULA rules into this file.

- [x] **Step 2: Run the focused test and verify green**

Run: `node --test tests/agent-instructions.test.mjs`

Expected: PASS.

- [x] **Step 3: Commit the implementation**

Run:

```bash
git add AGENTS.md CLAUDE.md
git commit -m "docs: share YULA instructions across agent tools"
```

### Task 4: Verify repository integration

**Files:**
- Modify: `docs/superpowers/plans/2026-07-13-shared-agent-instructions.md`

- [x] **Step 1: Run all Node tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

- [x] **Step 2: Run operating-model and Markdown validation**

Run:

```bash
node scripts/validate-operating-model.mjs
git diff --check
```

Expected: `validate-operating-model.mjs`, which includes Markdown link validation, exits successfully and `git diff --check` prints nothing.

- [x] **Step 3: Confirm repository scope**

Run: `git status --short`

Expected: only the plan tracking update, if any, remains uncommitted; no unrelated user files are staged.

- [x] **Step 4: Record plan completion**

Check completed steps in this file and commit only the plan update:

```bash
git add docs/superpowers/plans/2026-07-13-shared-agent-instructions.md
git commit -m "docs: complete shared agent instruction plan"
```
