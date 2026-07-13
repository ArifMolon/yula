import test from 'node:test';
import assert from 'node:assert/strict';
import { phase0Specs, renderSpecBody } from '../scripts/phase0-specs.mjs';

test('Phase 0 catalog contains only bounded Spec Issues', () => {
  assert.equal(phase0Specs.length, 9);
  assert.ok(phase0Specs.every(spec => spec.phase === '0'));
  assert.ok(phase0Specs.every(spec => ['S', 'M'].includes(spec.size)));
  assert.ok(phase0Specs.every(spec => !/BC-[0-9]+/.test(spec.context)));
  assert.equal(new Set(phase0Specs.map(spec => spec.id)).size, phase0Specs.length);
});

test('every Spec Issue body declares the complete domain contract and no children', () => {
  for (const spec of phase0Specs) {
    const body = renderSpecBody(spec);
    for (const heading of ['Outcome', 'Bounded Context', 'Ubiquitous Language', 'Invariants', 'Published Language', 'Dependencies', 'HITL Policy', 'Exit Criteria', 'Child Issues']) {
      assert.match(body, new RegExp(`## ${heading}`));
    }
    assert.match(body, /## Child Issues\n\nNone — child issues are created only after this spec is selected\./);
    assert.doesNotMatch(body, /Phase: [1-6]/);
  }
});
