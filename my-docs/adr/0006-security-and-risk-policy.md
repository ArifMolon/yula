# ADR-0006: Security and Risk Policy

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; Context Map conclusion deferred hotspot #1; ratified in issue #3 grilling (2026-07-14).

## Decision

Security follows default-deny `CapabilityGrant`: an agent/skill receives only explicitly granted command families, folders, domains, and secret scopes. Runtime risk is classified `RiskLevel` R0–R4 (R0 read-only … R4 financial/destructive), owned by Approval & Security and distinct from GitHub Project `Risk` (delivery metadata). There is a single approval surface: an `ApprovalRequest` the human decides through the Review Inbox. Every action produces an immutable `AuditEvent` (who, which agent, which model, which tool, which parameters).

Hotspot A (risk assignment for knowledge/document ingestion — resolves Context Map conclusion hotspot #1):

- Knowledge/document ingestion that writes the local OKF canonical record plus its derived index is **R2** (not R1), because it performs a local persistent write. OKF and its derived index are written together as one local persistent effect.
- Credential-bearing or external-network ingestion is **R3** as a separate risk row, not collapsed into R2.
- Approval & Security **owns and applies** the risk policy: it reads the `RiskLevel` cap and decides the approval gate. Orchestration only sends intent; it never reads or evaluates the policy itself.

## Consequences

Policy ownership is single: Approval & Security is the one place that reads and applies risk/policy, so Orchestration stays intent-only and cannot become a second policy evaluator. Default-deny grants keep capabilities minimal. Treating local persistent ingestion as R2 (avoiding the over-permissive R1 read-only class) keeps the calibrated risk boundary without escalation. The audit trail is complete and immutable.