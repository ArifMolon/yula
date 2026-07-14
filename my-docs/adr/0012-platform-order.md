# ADR-0012: Platform Order

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

macOS on Apple Silicon is the primary platform. Windows and Linux builds are kept live in CI (compiled, smoke-tested) but their distribution comes later. The first release targets the macOS Apple Silicon desktop; other platforms follow once the Desktop Alpha stabilizes.

## Consequences

Engineering focus is concentrated on one platform to reach a usable Alpha. CI still catches Windows/Linux regressions early, so distribution is a packaging/launch decision, not a porting crisis.