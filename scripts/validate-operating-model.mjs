import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaNames = ['handoff-brief', 'failure-observation', 'lesson', 'knowledge-update-requested'];
const policyFiles = ['ddd-must.md', 'hitl.md', 'voice.md', 'worktree-boundaries.md'];
const templateFiles = ['handoff-brief.md', 'failure-observation.md', 'lesson.md', 'knowledge-update-requested.md'];

async function text(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
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
      await access(path.join(root, target));
    } catch {
      errors.push(`${target}: missing`);
    }
  }

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
