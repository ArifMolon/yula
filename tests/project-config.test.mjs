import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectConfig, labelConfig, buildDryRun, fieldDifferences } from '../scripts/project-config.mjs';

const contexts = [
  'Orchestration', 'Agent Studio', 'Tool Lab', 'Knowledge', 'Workspace',
  'Model Gateway', 'Interaction', 'Approval & Security', 'Integration',
  'Observability & Cost', 'Remote Access', 'Identity & Secrets',
];

test('project configuration uses the approved domain vocabulary', () => {
  assert.equal(projectConfig.title, 'YULA Development');
  assert.deepEqual(projectConfig.fields.Status, ['Todo', 'Progress', 'Review', 'Done']);
  assert.deepEqual(projectConfig.fields.Phase, ['0', '1', '2', '3', '4', '5', '6']);
  assert.deepEqual(projectConfig.fields['Bounded Context'], contexts);
  assert.deepEqual(projectConfig.fields.Risk, ['R0', 'R1', 'R2', 'R3', 'R4']);
  assert.deepEqual(projectConfig.fields['Human Review'], ['Policy', 'Required']);
  assert.deepEqual(projectConfig.fields.Size, ['XS', 'S', 'M']);
  assert.equal(projectConfig.fields.Spec.type, 'text');
});

test('labels do not duplicate project delivery fields', () => {
  assert.equal(labelConfig.context.length, 12);
  assert.equal(labelConfig.kind.length, 7);
  assert.equal(labelConfig.model.length, 5);
  assert.deepEqual(labelConfig.exception, ['blocked', 'security', 'human-required']);
  const all = Object.values(labelConfig).flat();
  assert.ok(all.every(label => !/^(phase|risk|size|status):/i.test(label)));
});

test('dry run is deterministic and non-mutating', () => {
  const first = buildDryRun();
  assert.deepEqual(first, buildDryRun());
  assert.ok(first.some(line => line.includes('YULA Development')));
  assert.ok(first.some(line => line.includes('context:orchestration')));
});

test('field comparison detects mismatched single-select options', () => {
  const current = [{ name: 'Status', options: [{ name: 'Todo' }, { name: 'In Progress' }, { name: 'Done' }] }];
  assert.deepEqual(fieldDifferences(current, { Status: ['Todo', 'Progress', 'Review', 'Done'] }), [
    { name: 'Status', reason: 'options', expected: ['Todo', 'Progress', 'Review', 'Done'], actual: ['Todo', 'In Progress', 'Done'] },
  ]);
});

test('GitHub templates collect domain outcomes and invariants', async () => {
  const spec = await readFile('.github/ISSUE_TEMPLATE/spec.yml', 'utf8');
  for (const phrase of ['Bounded Context', 'Outcome', 'Ubiquitous Language', 'Invariants', 'Published Language', 'Dependencies', 'HITL Policy', 'Exit Criteria', 'Child Issues']) {
    assert.match(spec, new RegExp(phrase, 'i'));
  }
  assert.doesNotMatch(spec, /BC-[0-9]+/);

  const tracer = await readFile('.github/ISSUE_TEMPLATE/tracer-bullet.yml', 'utf8');
  for (const layer of ['Domain', 'Application', 'Ports', 'Adapters', 'UI', 'Tests', 'Evaluation']) {
    assert.match(tracer, new RegExp(layer, 'i'));
  }

  const pullRequest = await readFile('.github/PULL_REQUEST_TEMPLATE.md', 'utf8');
  for (const phrase of ['glossary', 'DDD', 'verification', 'HandoffBrief', 'claim', 'HITL']) {
    assert.match(pullRequest, new RegExp(phrase, 'i'));
  }
});
