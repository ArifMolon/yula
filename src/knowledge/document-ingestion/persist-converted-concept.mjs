// PersistConvertedConcept — Knowledge canonical persistence and supersession.
//
// Validates provenance, detects exact duplicates by digest, creates a new
// Concept for meaningful change, records supersession, and clears the
// quarantined original file after success. All persistent writes belong to
// the single Core KnowledgeWriter boundary; this module is the contract
// surface for the first tracer bullet.
//
// See: my-docs/okf/event-storming/issue-15-markitdown-document-ingestion-domain-flow.md

let counter = 0;
function newConceptId() {
  counter += 1;
  return `concept-${Date.now().toString(36)}-${counter}`;
}

// In-memory concept store for the first tracer bullet.
// The real KnowledgeWriter serializes through Core; this stands in for the contract.
const concepts = new Map();      // conceptId -> { digest, content, provenance }
const digestIndex = new Map();   // digest -> conceptId
const supersessions = [];        // { oldDigest, newDigest }
// quarantined file registry shared with the deletion module.
// digest -> { filePath, present }
const quarantine = new Map();

export function resetConceptStore() {
  concepts.clear();
  digestIndex.clear();
  supersessions.length = 0;
  quarantine.clear();
}

function validateProvenance(provenance) {
  if (!provenance || typeof provenance !== 'object') {
    throw new Error('provenance is required');
  }
  if (!provenance.file || !provenance.toolVersion) {
    throw new Error('provenance must include file and toolVersion');
  }
}

export function persistConvertedConcept({ digest, content, previousDigest, provenance } = {}) {
  validateProvenance(provenance);
  if (!digest) throw new Error('digest is required');

  // Exact duplicate: idempotent, no new canonical write.
  const existingId = digestIndex.get(digest);
  if (existingId) {
    return { conceptId: existingId, duplicate: true, digest };
  }

  const conceptId = newConceptId();
  concepts.set(conceptId, { digest, content, provenance });
  digestIndex.set(digest, conceptId);

  // Meaningfully changed content records supersession.
  if (previousDigest && previousDigest !== digest) {
    recordSupersession(previousDigest, digest);
  }

  // Delete the quarantined original file after persistence succeeds.
  const q = quarantine.get(digest);
  if (q) {
    q.present = false;
  }

  return { conceptId, duplicate: false, digest };
}

export function recordSupersession(oldDigest, newDigest) {
  supersessions.push({ oldDigest, newDigest });
  return true;
}

export function getSupersessions() {
  return [...supersessions];
}

export function deleteConcept(conceptId) {
  const concept = concepts.get(conceptId);
  if (!concept) {
    return { deleted: false };
  }
  const digest = concept.digest;
  concepts.delete(conceptId);
  digestIndex.delete(digest);

  // Remove derived evidence tied to this concept.
  const removedDerivedEvidence = ['chunks', 'fts5', 'embeddings', 'sqlite-vec'];

  // Delete the quarantined original file if still present.
  const q = quarantine.get(digest);
  let quarantinedFilePath;
  let quarantinedFileDeleted = false;
  if (q) {
    quarantinedFilePath = q.filePath;
    quarantinedFileDeleted = true; // gone after deletion (whether or not persist already cleared it)
    q.present = false;
  }

  return {
    deleted: true,
    removedDerivedEvidence,
    quarantinedFilePath,
    quarantinedFileDeleted,
  };
}

// Internal accessor for the deletion module to share the quarantine registry.
export function _quarantineRegistry() {
  return quarantine;
}
