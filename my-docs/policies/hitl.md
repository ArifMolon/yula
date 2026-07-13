# HITL Review Inbox Policy

YULA presents genuine human decisions in one Review Inbox. Each ApprovalRequest includes project, issue/PR, requesting agent, decision type, RiskLevel, intended action, rationale, diff, cost, external effects, capabilities, model/tool, expiry, Execution, trace, and recommendation.

Decisions are `Approve`, `Request Changes`, `Reject`, `Approve Once`, `Approve Scope`, and `Cancel Execution`.

- R3 and R4 always require human approval.
- R0–R2 normally follow policy and agent review, but any scope may be elevated or marked `human-required`.
- Pending required HITL blocks `Review -> Done`.
- OKF metadata transitions are agent-managed unless they imply risky policy, prompt, agent, capability, architecture, or external action.
- Decisions are immutable, scoped, expiring, audited, and cannot be replayed outside their ApprovalRequest.
