import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitDocumentSource } from '../../src/interaction/document-upload/submit-document-source.mjs';

test('accepts a single PDF file', () => {
  const command = submitDocumentSource({ filePath: '/tmp/report.pdf', provenance: { user: 'arif' } });
  assert.equal(command.accepted, true);
  assert.equal(command.filePath, '/tmp/report.pdf');
});

test('accepts DOCX, PPTX, XLSX, CSV, TXT, and Markdown files', () => {
  for (const filePath of ['deck.pptx', 'sheet.xlsx', 'notes.csv', 'plain.txt', 'draft.md', 'doc.docx']) {
    const command = submitDocumentSource({ filePath: `/tmp/${filePath}`, provenance: { user: 'arif' } });
    assert.equal(command.accepted, true, `expected ${filePath} accepted`);
  }
});

test('rejects a ZIP archive', () => {
  const command = submitDocumentSource({ filePath: '/tmp/archive.zip', provenance: { user: 'arif' } });
  assert.equal(command.accepted, false);
  assert.match(command.reason, /not.*accepted|unsupported/i);
});

test('rejects a remote URL', () => {
  const command = submitDocumentSource({ filePath: 'https://example.com/file.pdf', provenance: { user: 'arif' } });
  assert.equal(command.accepted, false);
  assert.match(command.reason, /local|remote|url/i);
});

test('rejects audio and video files', () => {
  for (const filePath of ['audio.mp3', 'video.mp4']) {
    const command = submitDocumentSource({ filePath: `/tmp/${filePath}`, provenance: { user: 'arif' } });
    assert.equal(command.accepted, false, `expected ${filePath} rejected`);
  }
});

test('rejects more than one file', () => {
  const command = submitDocumentSource({ filePaths: ['/tmp/a.pdf', '/tmp/b.pdf'], provenance: { user: 'arif' } });
  assert.equal(command.accepted, false);
  assert.match(command.reason, /single.file|one file|too many/i);
});

test('accepted command is single-file and local-only', () => {
  const command = submitDocumentSource({ filePath: '/tmp/report.pdf', provenance: { user: 'arif' } });
  assert.equal(command.mode, 'single-file');
  assert.equal(command.localOnly, true);
});

test('accepted command does not require a KnowledgeBundle', () => {
  const command = submitDocumentSource({ filePath: '/tmp/report.pdf', provenance: { user: 'arif' } });
  assert.equal(command.requiresKnowledgeBundle, false);
});

test('captured provenance is carried through', () => {
  const provenance = { user: 'arif', acquiredAt: '2026-07-14T05:00:00Z' };
  const command = submitDocumentSource({ filePath: '/tmp/report.pdf', provenance });
  assert.deepEqual(command.provenance, provenance);
});
