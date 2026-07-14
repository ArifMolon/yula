import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { contextSlugs as contexts, contextNames } from '../scripts/domain-catalog.mjs';
import { resolveCanonicalRoot } from '../scripts/repository-paths.mjs';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const canonicalRoot = await resolveCanonicalRoot(repositoryRoot);
const canonicalFile = relativePath => path.join(canonicalRoot, relativePath);

test('all exported reviews are resolved with provenance', async () => {
  const reviews = await readFile(canonicalFile('my-docs/plan/plan-reviews.md'), 'utf8');

  assert.doesNotMatch(reviews, /^status: (open|revision-required)$/m);
  assert.equal((reviews.match(/^status: resolved$/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolution:/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolved_at:/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolved_by:/gm) ?? []).length, 2);
});

test('canonical documentation lives under my-docs', async () => {
  const required = [
    'my-docs/plan/YULA_DDD_Proje_Plani.md',
    'my-docs/plan/2026-07-13-yula-development-operating-model-design.md',
    'my-docs/plan/2026-07-13-yula-plan-dashboard-design.md',
    'my-docs/plan/2026-07-13-yula-plan-dashboard-implementation.md',
    'my-docs/plan/2026-07-13-yula-development-operating-model-implementation.md',
    'my-docs/plan/plan-reviews.md',
    'my-docs/plan/plan.html',
    'my-docs/okf/index.md',
    'my-docs/okf/log.md',
  ];

  await Promise.all(required.map(relativePath => access(canonicalFile(relativePath))));
});

test('operating model schemas expose the approved contracts', async () => {
  const expected = {
    'handoff-brief': ['issue', 'spec', 'bounded_context', 'status', 'next_action'],
    'failure-observation': ['observation_id', 'bounded_context', 'evidence', 'trace_id'],
    lesson: ['lesson_id', 'bounded_context', 'lifecycle', 'validation_evidence'],
    'knowledge-update-requested': ['request_id', 'issue', 'spec', 'bounded_context'],
  };

  for (const [name, required] of Object.entries(expected)) {
    const schema = JSON.parse(await readFile(`schemas/${name}.schema.json`, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.deepEqual(schema.properties.bounded_context.enum, contexts);
    for (const field of required) assert.ok(schema.required.includes(field), `${name} requires ${field}`);
  }
});

test('policies codify DDD, HITL, voice, and worktree boundaries', async () => {
  const ddd = await readFile(canonicalFile('my-docs/policies/ddd-must.md'), 'utf8');
  for (const name of ['Manager', 'Helper', 'Utils', 'CommonService', 'process', 'updateData', 'setStatus']) {
    assert.match(ddd, new RegExp(`\\b${name}\\b`));
  }
  assert.match(ddd, /glossary change before merge/i);
  assert.match(ddd, /my-docs\/okf\/glossary\.md/i);

  const hitl = await readFile(canonicalFile('my-docs/policies/hitl.md'), 'utf8');
  assert.match(hitl, /R3 and R4 always require human approval/i);
  assert.match(hitl, /Pending required HITL blocks.*Done/i);

  const voice = await readFile(canonicalFile('my-docs/policies/voice.md'), 'utf8');
  assert.match(voice, /second voice confirmation/i);
  assert.match(voice, /R4.*explicit UI.*biometric/is);

  const boundaries = await readFile(canonicalFile('my-docs/policies/worktree-boundaries.md'), 'utf8');
  assert.match(boundaries, /one spec.*one worktree/i);
  assert.match(boundaries, /mutable shared `node_modules`.*prohibited/i);

  await Promise.all(contexts.map(context => access(canonicalFile(`my-docs/okf/contexts/${context}/lessons/.gitkeep`))));
});

test('the canonical glossary covers all twelve bounded contexts and Phase 0 terms', async () => {
  const glossary = await readFile(canonicalFile('my-docs/okf/glossary.md'), 'utf8');
  for (const name of contextNames) assert.match(glossary, new RegExp(`\\b${name.replace(/&/g, '\\&')}\\b`), `glossary names ${name}`);
  for (const term of ['AgentVersion', 'ToolVersion', 'Execution', 'Task', 'KnowledgeWriter', 'Published Language', 'EvaluationArtifactSnapshot', 'ConversionArtifact', 'IndexState', 'Provenance']) {
    assert.match(glossary, new RegExp(`\\b${term}\\b`), `glossary defines ${term}`);
  }
  assert.match(glossary, /\bcurrent\b.*\bpending\b.*\bdegraded\b/s);
});

test('operating model validator reports no contract errors', async () => {
  const { validateOperatingModel } = await import('../scripts/validate-operating-model.mjs');
  assert.deepEqual(await validateOperatingModel(), []);
});

test('relative Markdown links must resolve', async () => {
  const { validateMarkdownLinks } = await import('../scripts/validate-operating-model.mjs');
  const directory = await mkdtemp(path.join(tmpdir(), 'yula-links-'));
  const markdown = path.join(directory, 'source.md');
  await writeFile(markdown, '[missing](./missing.md)\n');
  assert.deepEqual(await validateMarkdownLinks([markdown]), [`${markdown}: missing link target ./missing.md`]);
});
