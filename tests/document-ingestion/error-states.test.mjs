import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFailure, retryPolicyOrder } from '../../src/orchestration/executions/start-document-ingestion-execution.mjs';

test('encrypted files fail closed', () => {
  assert.equal(renderFailure('encrypted'), 'fail-closed');
});

test('corrupted files fail closed', () => {
  assert.equal(renderFailure('corrupted'), 'fail-closed');
});

test('ocr-required scans are degraded', () => {
  assert.equal(renderFailure('ocr-required'), 'degraded');
});

test('retries-exhausted with no user input suspends', () => {
  assert.equal(renderFailure('retries-exhausted'), 'suspend');
});

test('retry policy does not introduce an alternate converter first', () => {
  const order = retryPolicyOrder();
  assert.equal(order[0], 'no-alternate-converter');
});

test('retry policy then allows provenance-bearing user input', () => {
  const order = retryPolicyOrder();
  assert.equal(order[1], 'provenance-bearing-user-input');
});

test('retry policy suspends execution last', () => {
  const order = retryPolicyOrder();
  assert.equal(order[2], 'suspend');
});
