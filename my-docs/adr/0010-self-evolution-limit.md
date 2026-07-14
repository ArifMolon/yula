# ADR-0010: Self-Evolution Limit

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ADR-0007 CARB lesson; ratified in issue #3 grilling (2026-07-14).

## Decision

Self-evolution is asymmetric. Descriptive knowledge (recipes, anti-patterns, observations) may be written autonomously by YULA. Agent definition and prompt changes are never autonomously activated: YULA may only draft an `AgentVersion`/`PromptVersion`, and a human R3 decision is required before activation. The capability bound (what an agent may do) is never widened by self-evolution.

## Consequences

YULA can learn and record lessons without becoming its own operator. The activation gate keeps the agent/prompt capability boundary under human control, matching ADR-0009 and the ADR-0007 CARB lesson that an agent's prompt/activation must never be autonomously committed.