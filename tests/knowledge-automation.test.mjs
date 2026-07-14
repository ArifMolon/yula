import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildValidatedProjectItem, validateDoneEligibility } from '../scripts/validate-project-item.mjs';
import { buildKnowledgeUpdate, writeKnowledgeUpdate } from '../scripts/request-knowledge-update.mjs';
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

test('Project delivery state overrides untrusted HandoffBrief status', async () => {
  const handoff = { ...(await fixture('done-feature-issue')), status: 'Progress' };
  const project = { items: [{ content: { number: 10 }, status: 'Done', phase: '0', spec: handoff.spec, 'bounded Context': 'Orchestration' }] };
  const validated = buildValidatedProjectItem(handoff, project, 10);
  assert.equal(validated.status, 'Done');
  assert.deepEqual(validateDoneEligibility(validated), []);
});

test('write mode creates the request and appends the OKF log', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'yula-knowledge-'));
  const result = await writeKnowledgeUpdate(await fixture('done-feature-issue'), root);
  const record = JSON.parse(await readFile(path.join(root, result.filename), 'utf8'));
  const log = await readFile(path.join(root, 'my-docs/okf/log.md'), 'utf8');
  assert.equal(record.request_id, result.record.request_id);
  assert.ok(log.includes(result.record.request_id));
});

test('issue-close workflow reads Project state and gates knowledge auto-merge', async () => {
  const workflow = await readFile('.github/workflows/issue-close-knowledge.yml', 'utf8');
  for (const phrase of ['project item-list', 'validate-project-item.mjs', 'validate-operating-model.mjs', 'provenance', 'links', 'gh pr merge', 'failure-artifact']) {
    assert.match(workflow, new RegExp(phrase));
  }
  assert.doesNotMatch(workflow, /start.*next issue/i);
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

test('doc-only merge with merge_commit and no pull_request is Done-eligible', async () => {
  const issue = await fixture('done-doc-only-issue');
  assert.deepEqual(validateDoneEligibility(issue), []);
});

test('Done eligibility requires pull_request OR merge_commit', async () => {
  const issue = await fixture('done-feature-issue');
  delete issue.pull_request;
  const errors = validateDoneEligibility(issue);
  assert.ok(errors.some(error => /pull_request|merge_commit/i.test(error)));
});

test('merge_commit-only knowledge request uses Merge Commit anchor and omits Pull Request line', async () => {
  const issue = await fixture('done-doc-only-issue');
  const result = buildKnowledgeUpdate(issue);
  assert.equal(result.record.merge_commit, '9380df8');
  assert.equal(result.record.pull_request, undefined);
  assert.match(result.logEntry, /Merge Commit: 9380df8/);
  assert.doesNotMatch(result.logEntry, /Pull Request:/);
});

test('pull_request-only knowledge request keeps Pull Request anchor and omits Merge Commit line', async () => {
  const issue = await fixture('done-feature-issue');
  const result = buildKnowledgeUpdate(issue);
  assert.equal(result.record.pull_request, issue.pull_request);
  assert.equal(result.record.merge_commit, undefined);
  assert.match(result.logEntry, /Pull Request:/);
  assert.doesNotMatch(result.logEntry, /Merge Commit:/);
});

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
  ['stashes', ['stash@{0}']], ['artifacts', ['coverage']],
]) {
  test(`spec cleanup rejects ${field}`, () => {
    const state = { merged_to_main: true, final_acceptance: true, final_handoff: true, feature_branches: [], stale_worktrees: [], active_claims: [], pending_hitl: [], [field]: value };
    assert.ok(validateSpecCleanup(state).length > 0);
  });
}
