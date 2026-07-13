import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { planBootstrap, planFeatureStart, planCleanup } from '../scripts/worktree-policy.mjs';

const exec = promisify(execFile);

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

test('feature commands use the plan interface without a spec argument', async () => {
  const started = await exec('scripts/spec-worktree', ['--dry-run', 'start-feature', '12', 'execution-lifecycle']);
  assert.match(started.stdout, /feature\/12-execution-lifecycle/);
  const finished = await exec('scripts/spec-worktree', ['--dry-run', 'finish-feature', '12']);
  assert.match(finished.stdout, /finish reviewed feature issue 12/);
});

test('feature branches are associated with their owning spec', async () => {
  const script = await readFile('scripts/spec-worktree', 'utf8');
  assert.match(script, /branch\.\$branch\.yulaSpec/);
  assert.match(script, /branch\.\$candidate\.yulaSpec/);
});
