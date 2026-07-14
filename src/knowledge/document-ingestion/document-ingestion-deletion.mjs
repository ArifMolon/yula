// Document ingestion deletion — quarantined original file lifecycle.
//
// Registers a quarantined original file against a content digest so that
// successful persistence and Concept deletion can clear it. The canonical
// concept store and quarantine registry live in persist-converted-concept.mjs;
// this module is the deletion-path contract surface for the first tracer bullet.
//
// See: my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md

import { _quarantineRegistry } from './persist-converted-concept.mjs';

export function registerQuarantinedFile(filePath, digest) {
  const quarantine = _quarantineRegistry();
  quarantine.set(digest, { filePath, present: true });
}

export function resetQuarantine() {
  const quarantine = _quarantineRegistry();
  quarantine.clear();
}
