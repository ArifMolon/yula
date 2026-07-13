---
name: visual-on
description: Use when the user asks to enable, resume, or turn on Visual Companion, browser diagrams, visual brainstorming, or visual technical-decision support in the current YULA repository.
---

# Visual On

Persist visual mode without spending tokens until a qualifying decision appears.

## Workflow

1. From the repository root, run `node scripts/visual-mode.mjs on`.
2. Require exit code `0` and stdout exactly `on`.
3. Enabling does not start a companion server. Start one later only when a Context Map, multi-component flow, state/sequence, hierarchy, layout, or technical trade-off materially benefits from a visual.
4. For simple textual questions, stay in the terminal. If a companion session is already visible, use its waiting-screen procedure.
5. Follow the current Visual Companion guide. State that clicks are recorded but do not start agent turns; terminal feedback remains authoritative.

## Quick reference

| Situation | Action |
|---|---|
| `/visual-on` requested | Persist `on`; do not start a server yet |
| Qualifying visual decision | Use the available companion guide |
| Simple text question | Stay in terminal |
| Command fails | Report failure; do not claim enabled |

## Common mistakes

- Starting a server merely because mode changed to `on`.
- Visualizing every question instead of applying the decision threshold.
- Treating a click as human acceptance, HITL, or canonical evidence.
- Changing global or other-repository preferences.
