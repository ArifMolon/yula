import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDoneEligibility } from '../scripts/validate-project-item.mjs';
import { buildKnowledgeUpdate } from '../scripts/request-knowledge-update.mjs';
import { validateSpecCleanup } from '../scripts/validate-spec-cleanup.mjs';

const fixture = async name => JSON.parse(await readFile(`tests/fixtures/${name}.json`, 'utf8'));

test('Done issue produces a deterministic knowledge request and log entry', async () => {
  const issue = await fixture('done-feature-issue');
  assert.deepEqual(validateDoneEligibility(issue), []);
  const first = buildKnowledgeUpdate(issue);
  assert.deepEqual(first, buildKnowledgeUpdate(issue));
  assert.equal(first.record.request_id, 'kur-ArifMolon-yula-10');
  for (const value of [issue.issue, issue.pull_request, issue.spec, issue.bounded_context, issue.capability, ...issue.events, ...issue.verification]) {
    assert.ok(first.logEntry.includes(value));
  }
});

for (const [name, message] of [
  ['missing-handoff', 'HandoffBrief'],
  ['unresolved-claim', 'OKF claim'],
  ['pending-hitl', 'HITL'],
  ['non-done-issue', 'Done'],
]) {
  test(`${name} is rejected`, async () => {
    assert.ok(validateDoneEligibility(await fixture(name)).some(error => error.includes(message)));
  });
}

test('completed spec passes every cleanup invariant', () => {
  assert.deepEqual(validateSpecCleanup({
    merged_to_main: true,
    final_acceptance: true,
    final_handoff: true,
    feature_branches: [],
    stale_worktrees: [],
    active_claims: [],
    pending_hitl: [],
  }), []);
});

for (const [field, value] of [
  ['merged_to_main', false], ['final_acceptance', false], ['final_handoff', false],
  ['feature_branches', ['feature/1-x']], ['stale_worktrees', ['.worktrees/spec-x']],
  ['active_claims', ['concept-x']], ['pending_hitl', ['approval-x']],
]) {
  test(`spec cleanup rejects ${field}`, () => {
    const state = { merged_to_main: true, final_acceptance: true, final_handoff: true, feature_branches: [], stale_worktrees: [], active_claims: [], pending_hitl: [], [field]: value };
    assert.ok(validateSpecCleanup(state).length > 0);
  });
}
