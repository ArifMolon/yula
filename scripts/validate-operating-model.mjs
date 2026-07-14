import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveCanonicalRoot } from './repository-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = await resolveCanonicalRoot(root);
const schemaNames = ['handoff-brief', 'failure-observation', 'lesson', 'knowledge-update-requested'];
const policyFiles = ['ddd-must.md', 'hitl.md', 'voice.md', 'worktree-boundaries.md'];
const templateFiles = ['handoff-brief.md', 'failure-observation.md', 'lesson.md', 'knowledge-update-requested.md'];

async function text(relativePath) {
  const owningRoot = relativePath === 'my-docs' || relativePath.startsWith('my-docs/') ? canonicalRoot : root;
  return readFile(path.join(owningRoot, relativePath), 'utf8');
}

async function filesUnder(directory, suffix) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesUnder(target, suffix));
    else if (entry.name.endsWith(suffix)) found.push(target);
  }
  return found;
}

export async function validateMarkdownLinks(files) {
  const errors = [];
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = match[1].trim().replace(/^<|>$/g, '').split('#')[0];
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      try { await access(path.resolve(path.dirname(file), target)); }
      catch { errors.push(`${file}: missing link target ${target}`); }
    }
  }
  return errors;
}

async function validateKnowledgeRequests() {
  const directory = path.join(canonicalRoot, 'my-docs/okf/requests');
  let files = [];
  try { files = await filesUnder(directory, '.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const errors = [];
  const required = ['request_id', 'issue', 'spec', 'bounded_context', 'capability', 'events', 'lessons', 'verification', 'requested_at'];
  for (const file of files) {
    try {
      const request = JSON.parse(await readFile(file, 'utf8'));
      for (const field of required) if (request[field] == null) errors.push(`${file}: missing provenance field ${field}`);
      if (!request.pull_request && !request.merge_commit) errors.push(`${file}: pull_request or merge_commit provenance anchor is required`);
      if (!Array.isArray(request.verification) || request.verification.length === 0) errors.push(`${file}: verification provenance is empty`);
    } catch (error) { errors.push(`${file}: ${error.message}`); }
  }
  return errors;
}

export async function validateOperatingModel() {
  const errors = [];

  for (const name of schemaNames) {
    try {
      const schema = JSON.parse(await text(`schemas/${name}.schema.json`));
      if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
        errors.push(`${name}: unsupported JSON Schema dialect`);
      }
      if (!schema.properties?.bounded_context?.enum?.length) errors.push(`${name}: bounded_context enum missing`);
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }

  const reviews = await text('my-docs/plan/plan-reviews.md');
  if (/^status: (open|revision-required)$/m.test(reviews)) errors.push('plan reviews remain unresolved');
  if ((reviews.match(/^status: resolved$/gm) ?? []).length !== 2) errors.push('expected two resolved plan reviews');

  for (const file of [...policyFiles.map(name => `my-docs/policies/${name}`), ...templateFiles.map(name => `my-docs/templates/${name}`)]) {
    try {
      const content = await text(file);
      if (/bounded_context:\s*BC-\d+\s*$/m.test(content)) errors.push(`${file}: numeric-only bounded context value`);
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }

  for (const target of ['my-docs/okf/index.md', 'my-docs/okf/log.md', 'my-docs/adr/0001-development-operating-model.md']) {
    try {
      await access(path.join(canonicalRoot, target));
    } catch {
      errors.push(`${target}: missing`);
    }
  }

  errors.push(...await validateMarkdownLinks(await filesUnder(path.join(canonicalRoot, 'my-docs'), '.md')));
  errors.push(...await validateKnowledgeRequests());

  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = await validateOperatingModel();
  if (errors.length) {
    console.error(`FAIL (${errors.length}):\n- ${errors.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${schemaNames.length} schema, ${policyFiles.length} policy, ${templateFiles.length} template, 2 resolved review.`);
  }
}
