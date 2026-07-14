# ADR-0013: UI Style Layer

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

The UI style layer is StyleX. Design tokens are the single source of truth for color, spacing, and typography, consumed as StyleX-generated styles. This ADR authorizes one decision only: the styling technology and token source.

The broader product design vision — Japon minimalism, mockups, a Design System, Agent Characters, Skill Icons, and a visual approval loop — is **out of scope for this ADR**. It belongs to a separate design-direction document scoped to **Faz 1 Desktop Alpha** (see `my-docs/plan/2026-07-14-yula-design-direction.md`, a pointer to be expanded by a later Faz 1 task). ADRs stay single-decision records: the design vision is not stuffed into ADR-0013.

## Consequences

The styling decision is made now so Faz 1 UI work can begin; the design vision is tracked separately and does not bloat this ADR. StyleX keeps tokens as the single source and avoids runtime CSS-in-JS cost on the Tauri shell. The deferred design-direction document is named and pointed to here so it is not lost.