# Shared Agent Instructions Design

**Date:** 2026-07-13
**Status:** Approved for implementation planning

## Objective

Give Claude Code, Codex, Pi, and other LLM-based development tools the same reliable understanding of YULA's product architecture and development operating model without duplicating instructions across tool-specific files.

## Canonical instruction boundary

`AGENTS.md` is the single canonical entry point for shared project instructions. It describes:

- YULA's product purpose and authoritative project references;
- the current delivery model and GitHub Project source of truth;
- the DDD MUST rule and full bounded-context vocabulary;
- the Spec Issue, tracer-bullet, spec-worktree, and feature-branch workflow;
- OKF, HandoffBrief, lesson, and knowledge-write boundaries;
- HITL, risk, voice, security, verification, and cleanup constraints;
- how an agent discovers current work without relying on stale embedded status.

The file links to canonical plans, policies, schemas, scripts, and tracker state rather than copying their full contents. Mutable state such as the active issue, branch, or latest commit is discovered from Git, GitHub Project, and the current HandoffBrief.

## Claude-specific adapter

`CLAUDE.md` remains a thin Claude Code adapter. It must load and obey `AGENTS.md` first, then add only Claude-specific context-mode routing rules. Shared YULA rules must not be duplicated in `CLAUDE.md`.

## Cross-tool behavior

Instructions describe required outcomes and repository commands without assuming every client exposes the same tools. Each client may use its available equivalent, but must preserve the same authorization, DDD, worktree, HITL, and verification boundaries.

If instructions conflict, direct user instructions have highest priority, followed by the nearest applicable `AGENTS.md`, then tool-specific additions that do not weaken shared rules.

## Safety and maintenance

- Never embed secrets or tokens in instruction files.
- Never treat generated indexes as canonical knowledge; OKF Markdown remains canonical.
- Never let agents start the next issue, invent lessons, or impersonate human approval.
- Update shared rules once in `AGENTS.md`; update `CLAUDE.md` only for Claude-specific routing.
- Keep the instruction files concise enough to be loaded at the start of every agent session.

## Verification

Implementation is complete when:

1. `AGENTS.md` exists and points to every authoritative operating-model artifact needed to resume work.
2. `CLAUDE.md` explicitly loads `AGENTS.md` and retains its context-mode routing rules without shared-rule duplication.
3. Markdown links resolve, repository validators pass, and `git diff --check` is clean.
4. Neither file contains mutable status presented as timeless truth or any secret value.
