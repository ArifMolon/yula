const contexts = new Set(['orchestration', 'agent-studio', 'tool-lab', 'knowledge', 'workspace', 'model-gateway', 'interaction', 'approval-security', 'integration', 'observability-cost', 'remote-access', 'identity-secrets']);

export function validateDoneEligibility(item) {
  const errors = [];
  if (item.status !== 'Done') errors.push('Project status must be Done');
  if (!item.handoff_brief) errors.push('latest HandoffBrief is required');
  if (!contexts.has(item.bounded_context)) errors.push('full Bounded Context is required');
  if (!item.issue || !item.spec || !item.capability || !item.pull_request) errors.push('issue, spec, capability, and pull request are required');
  if (!Array.isArray(item.verification) || item.verification.length === 0) errors.push('fresh verification evidence is required');
  if ((item.active_claims ?? []).length) errors.push('unresolved OKF claim blocks Done');
  if ((item.pending_hitl ?? []).length) errors.push('pending required HITL blocks Done');
  return errors;
}
