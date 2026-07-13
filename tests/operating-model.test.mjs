import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('all exported reviews are resolved with provenance', async () => {
  const reviews = await readFile('my-docs/plan/plan-reviews.md', 'utf8');

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

  await Promise.all(required.map(path => access(path)));
});
