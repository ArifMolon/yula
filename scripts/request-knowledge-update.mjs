import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateDoneEligibility } from './validate-project-item.mjs';

function requestId(issue) {
  return `kur-${issue.replace(/[^A-Za-z0-9]+/g, '-')}`;
}

export function buildKnowledgeUpdate(item) {
  const errors = validateDoneEligibility(item);
  if (errors.length) throw new Error(errors.join('; '));
  const id = requestId(item.issue);
  const requestedAt = item.closed_at ?? item.handoff_brief.updated_at;
  const record = {
    request_id: id,
    issue: item.issue,
    spec: item.spec,
    bounded_context: item.bounded_context,
    capability: item.capability,
    pull_request: item.pull_request,
    events: item.events ?? [],
    lessons: item.lessons ?? [],
    verification: item.verification,
    requested_at: requestedAt,
  };
  const list = values => values.length ? values.join(', ') : 'none';
  const logEntry = `## ${requestedAt} — KnowledgeUpdateRequested\n\n- Request: ${id}\n- Issue: ${item.issue}\n- Spec: ${item.spec}\n- Bounded Context: ${item.bounded_context}\n- Pull Request: ${item.pull_request}\n- Capability: ${item.capability}\n- Events: ${list(record.events)}\n- Lessons: ${list(record.lessons)}\n- Verification: ${list(record.verification)}\n`;
  return { filename: `my-docs/okf/requests/${id}.json`, record, logEntry };
}

export async function writeKnowledgeUpdate(item, root = process.cwd()) {
  const result = buildKnowledgeUpdate(item);
  const recordPath = path.join(root, result.filename);
  const logPath = path.join(root, 'my-docs/okf/log.md');
  await mkdir(path.dirname(recordPath), { recursive: true });
  await mkdir(path.dirname(logPath), { recursive: true });
  await writeFile(recordPath, `${JSON.stringify(result.record, null, 2)}\n`, { flag: 'wx' });
  await appendFile(logPath, `\n${result.logEntry}`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fixtureIndex = process.argv.indexOf('--fixture');
  if (fixtureIndex < 0 || !process.argv[fixtureIndex + 1]) {
    console.error('Usage: request-knowledge-update.mjs --fixture <path> --dry-run');
    process.exitCode = 2;
  } else {
    const item = JSON.parse(await readFile(process.argv[fixtureIndex + 1], 'utf8'));
    const result = process.argv.includes('--write') ? await writeKnowledgeUpdate(item) : buildKnowledgeUpdate(item);
    console.log(JSON.stringify(result, null, 2));
  }
}
