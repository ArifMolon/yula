import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('all exported reviews are resolved with provenance', async () => {
  const reviews = await readFile('docs/superpowers/plans/plan-reviews.md', 'utf8');

  assert.doesNotMatch(reviews, /^status: (open|revision-required)$/m);
  assert.equal((reviews.match(/^status: resolved$/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolution:/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolved_at:/gm) ?? []).length, 2);
  assert.equal((reviews.match(/^resolved_by:/gm) ?? []).length, 2);
});
