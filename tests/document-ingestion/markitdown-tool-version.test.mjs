import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markitdownToolVersion } from '../../src/tool-lab/markitdown/markitdown-tool-version.mjs';

test('markitdown tool version is sourced from microsoft/markitdown', () => {
  assert.equal(markitdownToolVersion.source, 'microsoft/markitdown');
});

test('markitdown tool version is local-only', () => {
  assert.equal(markitdownToolVersion.mode, 'local-only');
});

test('markitdown tool version has no network access', () => {
  assert.equal(markitdownToolVersion.network, 'none');
});

test('markitdown tool version has plugins disabled', () => {
  assert.equal(markitdownToolVersion.plugins, 'disabled');
});

test('markitdown tool version accepts a single quarantined file', () => {
  assert.equal(markitdownToolVersion.input, 'single quarantined file');
});

test('markitdown tool version outputs a markdown artifact with provenance', () => {
  assert.equal(markitdownToolVersion.output, 'markdown artifact with provenance');
});

test('markitdown tool version is pinned and read-only', () => {
  assert.equal(markitdownToolVersion.readOnly, true);
  assert.ok(markitdownToolVersion.pin, 'expected a pin identifier');
});
