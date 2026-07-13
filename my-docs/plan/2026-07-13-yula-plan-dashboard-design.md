# YULA Plan Dashboard Design

**Date:** 2026-07-13  
**Status:** Approved for implementation planning  
**Source:** `my-docs/plan/YULA_DDD_Proje_Plani.md` v1.0

## Purpose

Create `my-docs/plan/plan.html`, a standalone interactive visualization of the canonical YULA DDD project plan. The page must serve two audiences in one continuous experience:

1. Provide an executive overview of vision, phases, duration, dependencies, decisions, and risks.
2. Provide an implementation workspace where technical readers can inspect bounded contexts, work packages, exit criteria, Definition of Done, and agent operating rules.

The Markdown plan remains canonical. The HTML is a derived visualization and review surface.

## Delivery Shape

- One self-contained HTML file with embedded CSS and JavaScript.
- No CDN, package install, build step, network request, or runtime server.
- Responsive desktop and mobile layout.
- Turkish interface copy, preserving English Ubiquitous Language terms from the source.
- Accessible semantic structure, keyboard navigation, visible focus states, and reduced-motion support.

## Information Architecture

The page uses a sticky section navigator and full-width content bands rather than a collection of decorative cards.

1. **Executive overview:** product vision, plan version, six implementation phases, estimated duration, core outcomes, and v1 boundary.
2. **Roadmap:** interactive phase timeline with duration, bounded contexts, work packages, dependencies, and exit criteria.
3. **DDD operating loop:** Event Storming through measurement and learning, rendered as a cyclic process diagram.
4. **System architecture:** layered context map across Tauri Desktop, Elixir Core, Rust Runtime, Tool Lab, external integrations, security, and observability.
5. **Bounded contexts:** filterable matrix for all twelve contexts, including purpose, ownership, exclusions, process, and strategic classification.
6. **Knowledge flow:** canonical OKF to ingestion, hybrid retrieval, session continuity, and self-improvement loop.
7. **Execution protocol:** session ritual, tracer-bullet sequence, Definition of Done, and MUST NOT guardrails.
8. **Risks and decisions:** impact-oriented risk matrix, mitigations, scope exclusions, and seed ADR index.
9. **CARB-46 dogfooding:** phase alignment and feedback path into YULA's domain model.

## Visual Direction

- Light neutral canvas with dark green system layers.
- Orange for decisions, approvals, and warnings.
- Yellow for knowledge and measurement paths.
- Muted red only for critical risks and MUST NOT constraints.
- Compact typography for operational content; large type only for the true page header.
- Stable diagram dimensions and responsive overflow handling prevent labels or nodes from overlapping.
- Diagrams are built with semantic HTML and CSS; SVG is limited to connectors where necessary.

## Interaction Model

- Phase selection updates the visible phase detail without shifting the timeline.
- Bounded contexts can be filtered by Core, Supporting, Generic, and Deferred classifications.
- Long technical sections use accessible disclosure controls.
- Diagram nodes link or scroll to their detailed section.
- Global search filters phases, contexts, ADRs, risks, and glossary entries.
- Progress controls locally track phase and Definition of Done completion.
- A reset command clears only local progress after confirmation.

## Review Model

Every phase, bounded context, risk, ADR, and major plan section exposes a `Review ekle` command. A review has:

- stable section identifier;
- section title;
- free-form note;
- status: `open`, `accepted`, `revision-required`, or `resolved`;
- creation and update timestamps;
- source plan version.

Reviews are stored in browser `localStorage`. A Reviews drawer lists and filters all notes, reports counts by status, and navigates to the anchored source section. Deleting a review requires confirmation.

## Markdown Contract

`Markdown disari aktar` creates a portable `plan-reviews.md` file with YAML frontmatter:

```yaml
---
type: yula-plan-review
schema_version: 1
plan_version: "1.0"
plan_source: "YULA_DDD_Proje_Plani.md"
exported_at: "ISO-8601 timestamp"
---
```

Each review is represented as a heading followed by stable machine-readable fields and the note body. Import accepts only this schema, validates required fields and statuses, and merges by review ID. Invalid records are rejected with a visible error summary; valid records in the same file still import.

The HTML never rewrites the canonical plan automatically. A coding agent applies `revision-required` reviews to the source Markdown, records architectural changes through ADRs where required, and regenerates the HTML.

## Local State Boundaries

- Reviews and progress use separate versioned `localStorage` keys.
- Review export includes reviews only; progress remains device-local.
- If storage is unavailable, the page remains readable and shows a non-blocking persistence warning.
- Import/export uses browser File and Blob APIs and requires no network access.
- HTML text is rendered through safe DOM APIs; imported Markdown is never inserted as raw HTML.

## Verification

1. Compare all major source headings, phases, contexts, risks, ADRs, and exit criteria against the canonical Markdown.
2. Open directly from the filesystem and confirm no network requests or console errors.
3. Test navigation, search, filtering, disclosures, review CRUD, status changes, progress controls, reset, Markdown export, and Markdown re-import.
4. Verify persistence after reload.
5. Verify keyboard-only operation and reduced-motion behavior.
6. Capture desktop and mobile screenshots and inspect for clipping, overflow, blank diagrams, and overlapping text.
7. Confirm malformed imports cannot execute HTML or scripts and produce actionable validation feedback.

## Non-Goals

- Editing the canonical plan directly from the browser.
- Multi-user collaboration or synchronization.
- A backend, database, authentication system, or hosted review service.
- Automatic architectural decisions from review notes.
- Replacing the Markdown plan as the source of truth.
