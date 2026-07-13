# Voice Command Policy

Voice and UI use the same typed command, policy, ApprovalRequest, transition, and audit paths. Voice never mutates issue or OKF state directly.

- R0–R2 may execute under the same policy used by typed commands.
- R3 requires YULA to read back action, scope, and effect followed by explicit second voice confirmation.
- R4 may be prepared by voice but requires explicit UI confirmation and, where configured, biometric confirmation.
- Low-confidence recognition cannot authorize an action.
- Bulk voice approval is prohibited for R3–R4.
- The decision records transcript, recognition confidence, timestamp, Execution, trace, and ApprovalRequest.
