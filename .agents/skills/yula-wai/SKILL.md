---
name: yula-wai
description: Use when returning to YULA after a long break, asking where the project stands, needing the next concrete action, or wanting a terse resume packet from Git, HandoffBrief, OKF, or a future sqlite-vec knowledge index.
---

# Yula Wai

## Overview

`/yula-wai` answers one question fast: where am I, and what should I do next?

## Quick start

Run `node .agents/skills/yula-wai/scripts/yula-wai.mjs` from the repo root.

## Rules

- Read-only. Never write OKF, HandoffBrief, Git, or SQLite state.
- Prefer canonical sources in this order: current Git state, latest HandoffBrief, OKF index/log, then any local semantic index if one exists.
- Do not invent a status when a source is missing. Say `UNKNOWN` and give the next recovery step.
- Keep the first answer terse. Use `STATE`, `ANCHOR`, `BLOCKERS`, `NEXT`, `SOURCES`.
- Use the default terse style first. Expand only if the user asks.

## Output shape

- 1 to 6 lines.
- One concrete next action.
- No background unless it explains a blocker.
- If the semantic index is unavailable, do not mention it unless the user asked about it.

## Common use

The script should surface the latest durable anchor and its next action, not narrate the whole project history.
