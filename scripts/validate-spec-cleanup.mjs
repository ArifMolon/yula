import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function validateSpecCleanup(state) {
  const errors = [];
  if (!state.merged_to_main) errors.push('spec is not merged to main');
  if (!state.final_acceptance) errors.push('final acceptance is missing');
  if (!state.final_handoff) errors.push('final HandoffBrief is missing');
  if ((state.feature_branches ?? []).length) errors.push('feature branches remain');
  if ((state.stale_worktrees ?? []).length) errors.push('stale worktree remains');
  if ((state.active_claims ?? []).length) errors.push('OKF claim remains');
  if ((state.pending_hitl ?? []).length) errors.push('pending HITL remains');
  if ((state.stashes ?? []).length) errors.push('stash remains');
  if ((state.artifacts ?? []).length) errors.push('local artifact remains');
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fixtureIndex = process.argv.indexOf('--fixture');
  if (fixtureIndex < 0 || !process.argv[fixtureIndex + 1]) {
    console.error('Usage: validate-spec-cleanup.mjs --fixture <path>');
    process.exitCode = 2;
  } else {
    const state = JSON.parse(await readFile(process.argv[fixtureIndex + 1], 'utf8'));
    if (process.env.YULA_FEATURE_BRANCHES) state.feature_branches = process.env.YULA_FEATURE_BRANCHES.split('\n').filter(Boolean);
    if (process.env.YULA_STASHES) state.stashes = process.env.YULA_STASHES.split('\n').filter(Boolean);
    const errors = validateSpecCleanup(state);
    if (errors.length) { console.error(JSON.stringify({ ok: false, errors }, null, 2)); process.exitCode = 1; }
    else console.log(JSON.stringify({ ok: true, recommendation: 'cleanup may remove the worktree, delete merged branches, then run git worktree prune' }, null, 2));
  }
}
