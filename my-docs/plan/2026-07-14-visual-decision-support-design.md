# Visual Decision Support Design

**Date:** 2026-07-14
**Status:** Approved for implementation
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

### User-controlled visual mode

Visual support is governed by a YULA-local preference:

- `/visual-on` enables Visual Companion for qualifying decisions.
- `/visual-off` disables Visual Companion and prevents new companion servers, screens, or event reads.
- The preference persists across YULA sessions but is local, ignored by Git, and does not affect other repositories.
- The state lives at `my-docs/.local/visual-mode.json` and is managed only through the repository `scripts/visual-mode.mjs` command.
- Missing, unreadable, or invalid state is treated as `off`. The default is therefore token-safe.
- `status` reads the effective state without creating or changing the file.

The repository exposes `visual-on` and `visual-off` as project skills under `.agents/skills/` and mirrors them into `.claude/skills/` using the repository's existing symlink convention. Each skill is concise and delegates state mutation to the shared script.

### When enabled visual support is required

When visual mode is `on`, an agent must use an available visual companion during brainstorming, domain modeling, or technical design when a visual materially improves understanding. This includes:

- Context Map, bounded-context ownership, or Published Language decisions;
- architecture or data/event flows with at least three components;
- state machines, timelines, dependencies, hierarchies, or layouts;
- comparison of two or more technical approaches whose trade-offs are easier to understand side by side.

Purely textual requirements, terminology questions, and simple one-step choices remain in the terminal. When the conversation returns to text, the companion displays a waiting screen so stale options do not imply an active decision. When visual mode is `off`, all questions remain in the terminal and no companion lifecycle work occurs.

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

- the default-off, user-controlled mode and local state contract;
- the mandatory trigger conditions;
- the terminal-versus-visual routing rule;
- the interaction and authority boundaries;
- the cross-client fallback.

### `CLAUDE.md`

Add a `Visual Companion adapter` section that requires Claude Code to:

- follow the canonical `AGENTS.md` rule first;
- resolve the effective mode through `node scripts/visual-mode.mjs status` before starting companion work;
- load the current available `visual-companion.md` guide;
- show visual screens for qualifying decisions and waiting screens for textual steps;
- repeat the URL and screen summary at every visual step;
- disclose the no-push event limitation and read events on the next user-triggered turn.

### Skills and deterministic state command

Create:

- `scripts/visual-mode.mjs`: `on`, `off`, and `status` commands with atomic local-state writes and fail-closed reads;
- `tests/visual-mode.test.mjs`: focused state transition, default, invalid-state, and repository-scope tests;
- `.agents/skills/visual-on/SKILL.md`: explicit user-triggered enable workflow;
- `.agents/skills/visual-off/SKILL.md`: explicit user-triggered disable workflow, including stopping an active companion session through the available guide when one exists;
- `.claude/skills/visual-on` and `.claude/skills/visual-off`: symlinks to the canonical project skills.

## Non-goals

- Making every question visual.
- Starting or continuing Visual Companion while effective mode is `off`.
- Treating browser interaction as approval or canonical knowledge.
- Replacing terminal explanations or durable Markdown artifacts.
- Persisting tool-specific absolute paths in cross-tool instructions.
- Changing YULA runtime Interaction, Approval & Security, or Review Inbox behavior.

## Verification

The instruction change must pass:

1. `node scripts/validate-operating-model.mjs`
2. `node --test tests/*.test.mjs`
3. `git diff --check`
4. `node scripts/visual-mode.mjs status` in a temporary local-state fixture.
5. `quick_validate.py` for each skill folder.
6. Focused inspection confirming the cross-tool rule exists once in `AGENTS.md`, Claude-specific behavior remains in `CLAUDE.md`, visual mode defaults to `off`, and neither file implies that a visual click is approval.

## Acceptance criteria

- Missing or invalid local state resolves to `off` without writing a file.
- `/visual-on` persists `on`; `/visual-off` persists `off` and prevents further companion lifecycle work.
- Enabled technical decisions with material spatial or comparative structure trigger visual support.
- Text-only questions use the terminal and clear stale companion content with a waiting screen.
- Users are told that clicks do not start agent turns and must be repeated in the terminal.
- Terminal feedback and canonical artifacts remain authoritative.
- The instruction hierarchy remains `AGENTS.md` canonical and `CLAUDE.md` adapter-specific.
- Repository verification passes with fresh evidence.

## Approval record

The product owner selected the canonical-rule-plus-thin-adapter approach, approved the behavior design and file placement, required explicit `/visual-on` and `/visual-off` control, selected repository-scoped persistent local state, selected default `off`, and directed implementation to finish without further design questions on 2026-07-14.
