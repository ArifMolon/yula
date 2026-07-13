# DDD MUST Policy

Domain-Driven Design is a merge-blocking rule for every YULA module, contract, test, schema, and domain-facing UI term.

- Use the owning bounded context's Ubiquitous Language verbatim. A new domain term requires a glossary change before merge.
- Commands express intent, domain events use past tense, and aggregate methods name domain transitions.
- Contexts communicate only through Published Language, events, ports, or APIs; another context's internal model is private.
- `Manager`, `Helper`, `Utils`, `CommonService`, `process`, `updateData`, and unrestricted `setStatus` are prohibited domain names.
- Full bounded-context names are mandatory in daily work and Project data. Numeric-only context identifiers are rejected.
- KISS, DRY, SOLID, Clean Architecture, and patterns support the domain model; they never replace it.
- A DDD violation blocks `Review -> Done` and creates a trace-backed FailureObservation for the owning context.
