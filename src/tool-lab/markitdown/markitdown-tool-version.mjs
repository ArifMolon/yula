// MarkItDown ToolVersion — pinned, read-only, local-only conversion boundary.
//
// This is the Tool Lab Published Language contract for the first document-ingestion
// tracer bullet. It records the exact source, read-only local mode, and disabled
// plugin/network constraints without adding any optional remote capability.
//
// See: my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md

export const markitdownToolVersion = Object.freeze({
  source: 'microsoft/markitdown',
  pin: 'markitdown@0.0.1',
  mode: 'local-only',
  readOnly: true,
  network: 'none',
  plugins: 'disabled',
  input: 'single quarantined file',
  output: 'markdown artifact with provenance',
});
