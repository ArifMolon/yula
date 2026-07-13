# YULA Plan Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `my-docs/plan/plan.html` that visualizes the complete YULA DDD plan and supports persistent, portable Markdown reviews.

**Architecture:** A single semantic HTML document embeds its styles, normalized plan data, diagrams, and browser-only interaction layer. The canonical Markdown remains read-only; local progress and reviews are versioned separately in `localStorage`, while review interchange uses a validated Markdown schema.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, browser File/Blob/localStorage APIs, Node.js verification scripts, Playwright browser QA.

---

## File Map

- Create `my-docs/plan/plan.html`: complete standalone dashboard, embedded plan data, CSS, diagrams, review and progress application logic.
- Create `scripts/verify-plan-html.mjs`: static contract and source-coverage verification using Node built-ins.
- Create `my-docs/plan/2026-07-13-yula-plan-dashboard-implementation.md`: implementation record and execution checklist.

### Task 1: Establish The Static Contract

- [x] Create `scripts/verify-plan-html.mjs` with assertions for a doctype, Turkish language declaration, viewport metadata, embedded style/script, no remote resource URLs, plan version, all six phases, all twelve bounded-context IDs, seven risk titles, fourteen ADR IDs, review controls, Markdown import/export controls, and storage keys.
- [x] Run `node scripts/verify-plan-html.mjs` and confirm it fails because `my-docs/plan/plan.html` does not exist.
- [x] Create the semantic shell in `my-docs/plan/plan.html`: skip link, header, sticky navigation, main sections, review drawer, review dialog, import input, toast region, and embedded CSS/JS boundaries.
- [x] Run the verifier and use its remaining failures as the implementation checklist.

### Task 2: Render The Canonical Plan

- [x] Encode plan metadata and normalized arrays for phases, bounded contexts, risks, ADRs, glossary items, DDD steps, Definition of Done, guardrails, and CARB-46 mappings inside the document.
- [x] Render the executive summary, stable six-phase timeline, DDD loop, layered context map, context matrix, knowledge pipeline, execution protocol, risk matrix, ADR index, and dogfooding alignment.
- [x] Add stable `data-review-target` identifiers to every phase, context, risk, ADR, and major section.
- [x] Run `node scripts/verify-plan-html.mjs`; expect all source coverage and static safety assertions to pass.

### Task 3: Add Navigation And Inspection Interactions

- [x] Implement sticky navigation, active-section highlighting, global search, context classification filters, accessible disclosures, phase selection, diagram-to-detail navigation, and Escape-key handling.
- [x] Implement responsive CSS with stable diagram tracks, horizontal overflow where needed, visible focus styles, mobile navigation, print styling, and `prefers-reduced-motion` behavior.
- [x] Verify keyboard traversal and browser console output through the local page.

### Task 4: Add Review And Progress Persistence

- [x] Implement versioned storage adapters for `yula-plan-reviews-v1` and `yula-plan-progress-v1`, including graceful handling when local storage is unavailable.
- [x] Implement review create, edit, status update, delete confirmation, drawer filtering, count summaries, and source navigation using safe DOM text rendering.
- [x] Implement Markdown export with the approved YAML frontmatter and machine-readable review fields.
- [x] Implement Markdown import with schema validation, status validation, per-record errors, merge-by-ID semantics, and no raw imported HTML insertion.
- [x] Implement phase and Definition of Done progress controls plus confirmed progress reset; keep progress out of review exports.
- [x] Round-trip an exported review file and confirm note text, status, timestamps, plan version, and anchors survive unchanged.

### Task 5: Browser And Content Verification

- [x] Run `node scripts/verify-plan-html.mjs` and confirm zero failures.
- [x] Serve the workspace locally and open `my-docs/plan/plan.html` in the browser.
- [x] Exercise search, filters, timeline selection, review CRUD, status filtering, reload persistence, Markdown export/import, progress tracking, reset confirmation, keyboard navigation, and reduced-motion behavior.
- [x] Capture desktop and mobile screenshots; inspect first viewport, diagrams, long labels, drawer/dialog layering, clipping, overflow, and text overlap.
- [x] Compare every major source heading and all phase exit criteria with `my-docs/plan/YULA_DDD_Proje_Plani.md`; correct omissions before completion.
- [x] Run `git diff --check` and inspect `git diff --stat` before committing.

### Task 6: Record The Delivery

- [x] Update this checklist to reflect completed tasks and record any verified limitation explicitly.
- [x] Stage `my-docs/plan/plan.html`, `scripts/verify-plan-html.mjs`, this plan, and the approved design specification.
- [x] Commit with `feat: add interactive YULA plan dashboard` only after all verification commands pass.
