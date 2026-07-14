import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  persistConvertedConcept,
  deleteConcept,
  resetConceptStore,
} from '../../src/knowledge/document-ingestion/persist-converted-concept.mjs';
import {
  registerQuarantinedFile,
  resetQuarantine,
} from '../../src/knowledge/document-ingestion/document-ingestion-deletion.mjs';

test('deleting a concept also deletes the quarantined original file', () => {
  resetConceptStore();
  resetQuarantine();
  registerQuarantinedFile('/tmp/report.pdf', 'abc');
  const result = persistConvertedConcept({
    digest: 'abc',
    content: '# Report\n',
    provenance: { file: 'report.pdf', toolVersion: 'markitdown@0.0.1' },
  });
  const deletion = deleteConcept(result.conceptId);
  assert.equal(deletion.deleted, true);
  assert.equal(deletion.quarantinedFilePath, '/tmp/report.pdf');
  assert.equal(deletion.quarantinedFileDeleted, true);
});

test('deleting a concept removes derived evidence tied only to that concept', () => {
  resetConceptStore();
  resetQuarantine();
  registerQuarantinedFile('/tmp/notes.md', 'def');
  const result = persistConvertedConcept({
    digest: 'def',
    content: '# Notes\n',
    provenance: { file: 'notes.md', toolVersion: 'markitdown@0.0.1' },
  });
  const deletion = deleteConcept(result.conceptId);
  assert.equal(deletion.deleted, true);
  assert.deepEqual(deletion.removedDerivedEvidence, ['chunks', 'fts5', 'embeddings', 'sqlite-vec']);
});

test('deleting an unknown concept returns deleted false', () => {
  resetConceptStore();
  resetQuarantine();
  const deletion = deleteConcept('does-not-exist');
  assert.equal(deletion.deleted, false);
});
