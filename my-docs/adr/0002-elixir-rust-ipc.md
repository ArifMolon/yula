# ADR-0002: Elixir–Rust IPC

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

Elixir Core and the Rust worker communicate through an Erlang Port over stdin/stdout using length-prefixed framed messages. The initial message set is JSON (human-readable, debuggable); a binary frame optimization is deferred to tactical design when JSON framing becomes a measured bottleneck. Every frame carries mandatory fields: a correlation id, a message type, and a payload. NIF is prohibited (see ADR-0001); the Port is the only Rust boundary.

## Consequences

Debuggability is maximized by starting with text framing. The Port boundary keeps a Rust crash from taking down Core/UI. Mandatory correlation ids make every request traceable to an Execution and an AuditEvent. The deferred binary optimization is a tactical, non-architectural change that does not reopen this ADR.