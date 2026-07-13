# Visual Decision Support Design

**Date:** 2026-07-14
**Status:** Conversational design approved; written-record review pending
**Scope:** Repository agent instructions for Visual Companion use during technical design

## Purpose

Make difficult technical decisions easier for the product owner to understand by using a visual companion for relationships, sequences, state changes, boundaries, and approach comparisons. Terminal text remains the authoritative conversational record, and canonical project artifacts remain the durable source of truth.

## Context

During issue #15 brainstorming, the product owner selected evidence-bounded Context Map ratification and reported that technical decisions are often difficult to understand through terminal text alone. A Visual Companion selection was correctly written to the local event stream but did not start a new agent turn. The selection became visible only after the product owner sent a terminal message and the agent read the event stream, matching the current Visual Companion interaction model.

## Decisions

### Canonical rule and adapter split

- `AGENTS.md` owns the cross-tool behavior, decision threshold, authority boundaries, and fallback requirements.
- `CLAUDE.md` contains only the Claude-specific adapter that maps the canonical rule to an available `visual-companion.md` workflow.
- The full rule is not duplicated across both files.
- No Codex-specific absolute user path is persisted in repository instructions.

### When visual support is required

An agent must offer and, after user consent, use an available visual companion during brainstorming, domain modeling, or technical design when a visual materially improves understanding. This includes:

- Context Map, bounded-context ownership, or Published Language decisions;
- architecture or data/event flows with at least three components;
- state machines, timelines, dependencies, hierarchies, or layouts;
- comparison of two or more technical approaches whose trade-offs are easier to understand side by side.

Purely textual requirements, terminology questions, and simple one-step choices remain in the terminal. When the conversation returns to text, the companion displays a waiting screen so stale options do not imply an active decision.

### Interaction contract

For every visual step, the agent:

1. provides the local URL and a short description of the current screen;
2. states that a click is recorded but does not start a new agent turn;
3. asks the user to repeat the decision in the terminal;
4. reads the companion event stream on the next turn and reconciles it with the terminal message;
5. treats the terminal message as primary feedback if the two signals differ.

A visual click is not a human acceptance record, HITL decision, ApprovalRequest decision, or canonical project update. Required acceptance is recorded in the relevant issue, HandoffBrief, or canonical artifact through the normal YULA workflow.

### Availability and fallback

Each client uses its available equivalent visual capability and current guide. If Visual Companion is unavailable, the agent uses the smallest useful in-message visualization, such as Mermaid, a compact table, a flow, or a state diagram, and states the limitation. The absence of the visual capability must not silently remove the decision-support requirement.

## Planned instruction changes

### `AGENTS.md`

Add a `Visual decision support` section that defines:

- the mandatory trigger conditions;
- the terminal-versus-visual routing rule;
- the interaction and authority boundaries;
- the cross-client fallback.

### `CLAUDE.md`

Add a `Visual Companion adapter` section that requires Claude Code to:

- follow the canonical `AGENTS.md` rule first;
- load the current available `visual-companion.md` guide;
- show visual screens for qualifying decisions and waiting screens for textual steps;
- repeat the URL and screen summary at every visual step;
- disclose the no-push event limitation and read events on the next user-triggered turn.

## Non-goals

- Making every question visual.
- Treating browser interaction as approval or canonical knowledge.
- Replacing terminal explanations or durable Markdown artifacts.
- Persisting tool-specific absolute paths in cross-tool instructions.
- Changing YULA runtime Interaction, Approval & Security, or Review Inbox behavior.

## Verification

The instruction change must pass:

1. `node scripts/validate-operating-model.mjs`
2. `node --test tests/*.test.mjs`
3. `git diff --check`
4. A focused inspection confirming the cross-tool rule exists once in `AGENTS.md`, Claude-specific behavior remains in `CLAUDE.md`, and neither file implies that a visual click is approval.

## Acceptance criteria

- Technical decisions with material spatial or comparative structure trigger visual support after user consent.
- Text-only questions use the terminal and clear stale companion content with a waiting screen.
- Users are told that clicks do not start agent turns and must be repeated in the terminal.
- Terminal feedback and canonical artifacts remain authoritative.
- The instruction hierarchy remains `AGENTS.md` canonical and `CLAUDE.md` adapter-specific.
- Repository verification passes with fresh evidence.

## Approval record

The product owner selected the canonical-rule-plus-thin-adapter approach, approved the behavior design, and approved the file-placement and verification design in the Visual Companion and terminal conversation on 2026-07-14. Written-record acceptance remains pending until this file is presented for review.
