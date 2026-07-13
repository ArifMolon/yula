---
name: visual-off
description: Use when the user asks to disable, stop, pause, or avoid Visual Companion, browser diagrams, visual brainstorming, or visual technical-decision support in the current YULA repository.
---

# Visual Off

Persist token-safe visual mode before claiming it is disabled.

## Workflow

1. From the repository root, run `node scripts/visual-mode.mjs off`.
2. Require exit code `0` and stdout exactly `off`.
3. Do not start or update a companion server, write screens, or read companion events while disabled.
4. If this conversation has an active companion session, stop that session through the current Visual Companion guide when possible. Never kill unrelated processes. Persisted `off` remains authoritative if cleanup is unavailable.
5. Report that YULA-local visual mode is off. Do not treat a browser click as approval or proof.

## Quick reference

| Situation | Action |
|---|---|
| `/visual-off` requested | Persist `off`, then stop active companion work |
| Command fails | Report failure; do not claim disabled |
| State is missing or invalid | Effective mode is already `off` |
| User later requests visuals | Require `/visual-on` |

## Common mistakes

- Saying “off” without running the command.
- Changing global or other-repository preferences.
- Continuing to generate waiting screens while off.
- Inventing autostart hooks or event subscriptions that the repository does not define.
