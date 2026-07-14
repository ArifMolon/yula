// StartDocumentIngestionExecution — Orchestration bootstrap for the upload flow.
//
// Validates the upload through the Interaction command, pins the MarkItDown
// ToolVersion, and starts a coordinating Execution. Forwards the converted
// artifact boundary to Knowledge without exposing Knowledge internal models.
//
// See: my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md

import { submitDocumentSource } from '../../interaction/document-upload/submit-document-source.mjs';
import { markitdownToolVersion } from '../../tool-lab/markitdown/markitdown-tool-version.mjs';

let counter = 0;
function newExecutionId() {
  counter += 1;
  return `exec-doc-${Date.now().toString(36)}-${counter}`;
}

export function startDocumentIngestionExecution({ filePath, provenance, knowledgeBundleId } = {}) {
  const command = submitDocumentSource({ filePath, provenance });
  if (!command.accepted) {
    return {
      status: 'rejected',
      reason: command.reason,
      filePath,
    };
  }
  return {
    executionId: newExecutionId(),
    status: 'started',
    filePath: command.filePath,
    localOnly: command.localOnly,
    toolVersion: markitdownToolVersion,
    provenance: command.provenance,
    knowledgeBundleId,
  };
}

// Failure-state rendering for the document-ingestion execution.
//
// encrypted / corrupted -> fail-closed (no canonical write, end execution)
// ocr-required          -> degraded (partial persistence with degraded IndexState)
// retries-exhausted     -> suspend (no alternate converter first, then user input, then suspend)
const FAILURE_OUTCOMES = {
  encrypted: 'fail-closed',
  corrupted: 'fail-closed',
  'ocr-required': 'degraded',
  'retries-exhausted': 'suspend',
};

export function renderFailure(state) {
  const outcome = FAILURE_OUTCOMES[state];
  if (!outcome) throw new Error(`unknown failure state: ${state}`);
  return outcome;
}

// Retry resolution order for retries-exhausted, per the approved design.
// Do not introduce an alternate converter first; then allow provenance-bearing
// user input if available; otherwise suspend the execution.
export function retryPolicyOrder() {
  return ['no-alternate-converter', 'provenance-bearing-user-input', 'suspend'];
}
