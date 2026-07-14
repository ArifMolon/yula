---
name: caveman
description: Use when asking for the shortest possible YULA resume packet, caveman mode, or a one-screen next-action summary.
---

# Caveman

## Overview

`caveman` is the shortest YULA status surface.

## Quick start

Run `node .agents/skills/yula-wai/scripts/yula-wai.mjs --caveman` from the repo root.

## Rules

- Read-only.
- Prefer Git, then the latest HandoffBrief, then OKF index/log.
- Do not invent missing state.
- Keep output to the smallest useful packet.

## Output shape

- `STATE`
- `ANCHOR`
- `NEXT`
- `SOURCES`
