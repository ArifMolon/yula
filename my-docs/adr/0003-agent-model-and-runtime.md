# ADR-0003: Agent Model and Shared Runtime

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

An agent is a declarative `AgentDefinition` (persona, instruction, model policy, skill list, permissions, memory access, budget, eval criteria), versioned as an immutable `AgentVersion`. A single shared Rust runtime executes all agent workflows; a per-agent invocation is a runtime configuration, not a separate binary. Per-Execution all bound versions are immutable.

## Consequences

Versioning is deterministic and comparable. Runtime cost stays low because there is one runtime, not one binary per agent. `AgentBinding` scopes an `AgentVersion` to a global, Workspace, or Project scope without copying the definition. This closes the "is the repository a Tool or Skill" boundary by keeping agents declarative and tools executable.