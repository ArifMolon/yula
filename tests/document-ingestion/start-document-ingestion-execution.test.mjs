import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startDocumentIngestionExecution } from '../../src/orchestration/executions/start-document-ingestion-execution.mjs';

test('bootstraps an execution for an accepted single file', () => {
  const execution = startDocumentIngestionExecution({
    filePath: '/tmp/report.pdf',
    provenance: { user: 'arif' },
  });
  assert.ok(execution.executionId, 'expected an execution id');
  assert.equal(execution.status, 'started');
  assert.equal(execution.filePath, '/tmp/report.pdf');
  assert.equal(execution.toolVersion.source, 'microsoft/markitdown');
  assert.equal(execution.localOnly, true);
});

test('knowledgeBundleId is optional', () => {
  const execution = startDocumentIngestionExecution({
    filePath: '/tmp/report.pdf',
    provenance: { user: 'arif' },
    knowledgeBundleId: undefined,
  });
  assert.equal(execution.knowledgeBundleId, undefined);
  assert.equal(execution.status, 'started');
});

test('passes knowledgeBundleId through when provided', () => {
  const execution = startDocumentIngestionExecution({
    filePath: '/tmp/report.pdf',
    provenance: { user: 'arif' },
    knowledgeBundleId: 'kb-001',
  });
  assert.equal(execution.knowledgeBundleId, 'kb-001');
});

test('captures provenance on the execution', () => {
  const provenance = { user: 'arif', acquiredAt: '2026-07-14T05:00:00Z' };
  const execution = startDocumentIngestionExecution({
    filePath: '/tmp/report.pdf',
    provenance,
  });
  assert.deepEqual(execution.provenance, provenance);
});

test('rejects a non-accepted file type by not starting', () => {
  const execution = startDocumentIngestionExecution({
    filePath: '/tmp/archive.zip',
    provenance: { user: 'arif' },
  });
  assert.equal(execution.status, 'rejected');
  assert.ok(execution.reason, 'expected a rejection reason');
});
