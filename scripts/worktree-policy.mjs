const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validSlug(slug) {
  if (!slugPattern.test(slug)) throw new Error(`invalid spec slug: ${slug}`);
}

export function planBootstrap(spec, state = {}) {
  validSlug(spec);
  const worktree = `.worktrees/spec-${spec}`;
  const reasons = [];
  if ((state.existingWorktrees ?? []).includes(worktree)) reasons.push(`spec worktree already exists: ${worktree}`);
  return {
    allowed: reasons.length === 0,
    reasons,
    branch: `spec/${spec}`,
    worktree,
    pnpmStore: 'my-docs/.local/pnpm-store',
    excluded: ['my-docs', '.worktrees', '.superpowers'],
  };
}

export function planFeatureStart(issue, name, state = {}) {
  validSlug(name);
  const reasons = [];
  if (!Number.isInteger(Number(issue)) || Number(issue) < 1) reasons.push('issue number must be positive');
  if ((state.activeFeatures ?? []).length) reasons.push('one active feature issue is already checked out');
  return { allowed: reasons.length === 0, reasons, branch: `feature/${issue}-${name}` };
}

export function planCleanup(spec, state = {}) {
  validSlug(spec);
  const reasons = [];
  if (state.dirty) reasons.push('dirty worktree blocks cleanup');
  if ((state.unmergedBranches ?? []).length) reasons.push('unmerged feature branches block cleanup');
  if ((state.stashes ?? []).length) reasons.push('stash blocks cleanup');
  if ((state.activeClaims ?? []).length) reasons.push('active OKF claim blocks cleanup');
  if ((state.pendingHitl ?? []).length) reasons.push('pending HITL blocks cleanup');
  if ((state.artifacts ?? []).length) reasons.push('local artifact requires review before cleanup');
  return {
    allowed: reasons.length === 0,
    reasons,
    actions: [`remove .worktrees/spec-${spec}`, `delete spec/${spec}`, 'git worktree prune'],
  };
}
