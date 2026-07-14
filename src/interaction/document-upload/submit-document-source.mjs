// SubmitDocumentSource — Interaction Published Language command for a single local upload.
//
// Accepts one quarantined local file of an approved type, marks the upload as
// local-only and single-file, and forwards provenance. Rejects non-accepted
// types, remote URLs, and more than one file.
//
// See: my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md

const ACCEPTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.pptx', '.xlsx', '.csv', '.txt', '.md', '.markdown',
]);

function extOf(filePath) {
  const i = filePath.lastIndexOf('.');
  return i >= 0 ? filePath.slice(i).toLowerCase() : '';
}

function isRemoteUrl(filePath) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(filePath);
}

export function submitDocumentSource({ filePath, filePaths, provenance } = {}) {
  // Single-file only: reject batch upload.
  if (filePaths !== undefined) {
    return { accepted: false, reason: 'single-file only: more than one file is not accepted in v1' };
  }
  if (!filePath || typeof filePath !== 'string') {
    return { accepted: false, reason: 'a single filePath is required' };
  }
  // Local-only: reject remote URLs.
  if (isRemoteUrl(filePath)) {
    return { accepted: false, reason: 'local-only: remote URLs are not accepted in v1' };
  }
  // Accepted file types only.
  const ext = extOf(filePath);
  if (!ACCEPTED_EXTENSIONS.has(ext)) {
    return { accepted: false, reason: `unsupported file type: ${ext || '(none)'} is not in the accepted set` };
  }
  return {
    accepted: true,
    filePath,
    mode: 'single-file',
    localOnly: true,
    requiresKnowledgeBundle: false,
    provenance,
  };
}
