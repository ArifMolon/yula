import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  persistConvertedConcept,
  recordSupersession,
  resetConceptStore,
} from '../../src/knowledge/document-ingestion/persist-converted-concept.mjs';

test('persists a new concept with complete provenance', () => {
  resetConceptStore();
  const result = persistConvertedConcept({
    digest: 'abc',
    content: '# Report\n',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  assert.ok(result.conceptId, 'expected a concept id');
  assert.equal(result.duplicate, false);
  assert.equal(result.digest, 'abc');
});

test('exact duplicate returns the existing concept idempotently', () => {
  resetConceptStore();
  const first = persistConvertedConcept({
    digest: 'abc',
    content: '# Report\n',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  const second = persistConvertedConcept({
    digest: 'abc',
    content: '# Report\n',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  assert.equal(second.conceptId, first.conceptId);
  assert.equal(second.duplicate, true);
});

test('meaningfully changed content creates a new concept', () => {
  resetConceptStore();
  const first = persistConvertedConcept({
    digest: 'abc',
    content: '# Report v1\n',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  const second = persistConvertedConcept({
    digest: 'xyz',
    content: '# Report v2\n',
    previousDigest: 'abc',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  assert.notEqual(second.conceptId, first.conceptId);
  assert.equal(second.duplicate, false);
});

test('recordSupersession links the old digest to the new', () => {
  resetConceptStore();
  const ok = recordSupersession('abc', 'xyz');
  assert.equal(ok, true);
});

test('rejects persistence with incomplete provenance', () => {
  resetConceptStore();
  assert.throws(
    () => persistConvertedConcept({ digest: 'abc', content: '# x\n', provenance: {} }),
    /provenance/i,
  );
});
