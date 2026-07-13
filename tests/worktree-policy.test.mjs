import test from 'node:test';
import assert from 'node:assert/strict';
import { planBootstrap, planFeatureStart, planCleanup } from '../scripts/worktree-policy.mjs';

test('bootstrap creates one spec worktree with shared pnpm store', () => {
  const plan = planBootstrap('phase-0-foundation', { existingWorktrees: [] });
  assert.equal(plan.allowed, true);
  assert.equal(plan.branch, 'spec/phase-0-foundation');
  assert.equal(plan.worktree, '.worktrees/spec-phase-0-foundation');
  assert.equal(plan.pnpmStore, 'my-docs/.local/pnpm-store');
  assert.ok(plan.excluded.includes('my-docs'));
});

test('bootstrap rejects a second worktree for the same spec', () => {
  const plan = planBootstrap('phase-0-foundation', { existingWorktrees: ['.worktrees/spec-phase-0-foundation'] });
  assert.equal(plan.allowed, false);
});

test('only one feature issue can be active per spec worktree', () => {
  assert.equal(planFeatureStart(12, 'execution-lifecycle', { activeFeatures: [] }).allowed, true);
  assert.equal(planFeatureStart(12, 'execution-lifecycle', { activeFeatures: ['feature/11-other'] }).allowed, false);
});

for (const [state, reason] of [
  [{ dirty: true }, 'dirty'],
  [{ unmergedBranches: ['feature/1-x'] }, 'unmerged'],
  [{ stashes: ['stash@{0}'] }, 'stash'],
  [{ activeClaims: ['concept-x'] }, 'claim'],
  [{ pendingHitl: ['approval-x'] }, 'HITL'],
  [{ artifacts: ['coverage'] }, 'artifact'],
]) {
  test(`cleanup rejects ${reason}`, () => {
    assert.ok(planCleanup('phase-0-foundation', state).reasons.some(value => value.includes(reason)));
  });
}

test('clean merged spec can be removed and pruned', () => {
  const plan = planCleanup('phase-0-foundation', {});
  assert.equal(plan.allowed, true);
  assert.deepEqual(plan.actions, ['remove .worktrees/spec-phase-0-foundation', 'delete spec/phase-0-foundation', 'git worktree prune']);
});
