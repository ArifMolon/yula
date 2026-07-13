import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { boundedContexts, contextNames } from './domain-catalog.mjs';

export const projectConfig = Object.freeze({
  owner: 'ArifMolon',
  repository: 'ArifMolon/yula',
  title: 'YULA Development',
  fields: Object.freeze({
    Status: ['Todo', 'Progress', 'Review', 'Done'],
    Phase: ['0', '1', '2', '3', '4', '5', '6'],
    'Bounded Context': contextNames,
    Risk: ['R0', 'R1', 'R2', 'R3', 'R4'],
    Spec: { type: 'text' },
    'Human Review': ['Policy', 'Required'],
    Size: ['XS', 'S', 'M'],
  }),
});

export const labelConfig = Object.freeze({
  context: boundedContexts.map(context => `context:${context.slug}`),
  kind: ['kind:capability', 'kind:domain-discovery', 'kind:decision', 'kind:experiment', 'kind:defect', 'kind:lesson', 'kind:contract'],
  model: ['model:aggregate', 'model:domain-event', 'model:policy', 'model:value-object', 'model:published-language'],
  exception: ['blocked', 'security', 'human-required'],
});

export function buildDryRun() {
  const lines = [`ensure project ${projectConfig.owner}/${projectConfig.title}`, `link repository ${projectConfig.repository}`];
  for (const [name, definition] of Object.entries(projectConfig.fields)) {
    lines.push(`ensure field ${name}: ${Array.isArray(definition) ? definition.join('|') : definition.type}`);
  }
  for (const label of Object.values(labelConfig).flat()) lines.push(`ensure label ${label}`);
  return lines;
}

export function fieldDifferences(current, desired = projectConfig.fields) {
  const differences = [];
  for (const [name, definition] of Object.entries(desired)) {
    const field = current.find(candidate => candidate.name === name);
    if (!field) {
      differences.push({ name, reason: 'missing' });
      continue;
    }
    if (Array.isArray(definition)) {
      const actual = (field.options ?? []).map(option => option.name);
      if (JSON.stringify(actual) !== JSON.stringify(definition)) {
        differences.push({ name, reason: 'options', expected: definition, actual });
      }
    }
  }
  return differences;
}

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input, stdio: input ? ['pipe', 'pipe', 'inherit'] : ['ignore', 'pipe', 'inherit'] }).trim();
}

function updateSingleSelectField(field, options) {
  const colors = ['GRAY', 'BLUE', 'YELLOW', 'GREEN', 'RED', 'PURPLE', 'ORANGE'];
  const query = 'mutation($input:UpdateProjectV2FieldInput!){updateProjectV2Field(input:$input){projectV2Field{... on ProjectV2SingleSelectField{id name options{id name}}}}}';
  const variables = {
    query,
    variables: {
      input: {
        fieldId: field.id,
        name: field.name,
        singleSelectOptions: options.map((name, index) => ({ name, color: colors[index % colors.length], description: `${name} delivery state` })),
      },
    },
  };
  gh(['api', 'graphql', '--input', '-'], `${JSON.stringify(variables)}\n`);
}

function projects() {
  const output = gh(['project', 'list', '--owner', projectConfig.owner, '--format', 'json']);
  return JSON.parse(output).projects ?? [];
}

function ensureProject() {
  let project = projects().find(item => item.title === projectConfig.title);
  if (!project) {
    gh(['project', 'create', '--owner', projectConfig.owner, '--title', projectConfig.title]);
    project = projects().find(item => item.title === projectConfig.title);
  }
  if (!project) throw new Error('Project creation did not return YULA Development');
  return project;
}

function ensureFields(project) {
  const number = project.number;
  const current = JSON.parse(gh(['project', 'field-list', String(number), '--owner', projectConfig.owner, '--format', 'json'])).fields ?? [];
  const differences = fieldDifferences(current);
  const mismatched = differences.filter(item => item.reason === 'options');
  if (mismatched.length && project.items?.totalCount !== 0) {
    throw new Error(`Refusing to replace fields on a non-empty Project: ${mismatched.map(item => item.name).join(', ')}`);
  }
  for (const mismatch of mismatched) {
    const field = current.find(candidate => candidate.name === mismatch.name);
    updateSingleSelectField(field, mismatch.expected);
    field.options = mismatch.expected.map(name => ({ name }));
  }
  for (const [name, definition] of Object.entries(projectConfig.fields)) {
    if (current.some(field => field.name === name)) continue;
    const args = ['project', 'field-create', String(number), '--owner', projectConfig.owner, '--name', name];
    if (Array.isArray(definition)) args.push('--data-type', 'SINGLE_SELECT', '--single-select-options', definition.join(','));
    else args.push('--data-type', 'TEXT');
    gh(args);
  }
}

function ensureLabels() {
  for (const label of Object.values(labelConfig).flat()) {
    gh(['label', 'create', label, '--repo', projectConfig.repository, '--force', '--color', label.startsWith('context:') ? '0E8A16' : label.startsWith('kind:') ? '1D76DB' : label.startsWith('model:') ? '5319E7' : 'D93F0B']);
  }
}

export function applyProjectConfig() {
  const project = ensureProject();
  gh(['project', 'link', String(project.number), '--owner', projectConfig.owner, '--repo', projectConfig.repository]);
  ensureFields(project);
  ensureLabels();
  return project;
}

export function verifyProjectConfig() {
  const project = projects().find(item => item.title === projectConfig.title);
  if (!project) return [`missing project: ${projectConfig.title}`];
  const fields = JSON.parse(gh(['project', 'field-list', String(project.number), '--owner', projectConfig.owner, '--format', 'json'])).fields ?? [];
  const errors = fieldDifferences(fields).map(item => item.reason === 'missing' ? `missing field: ${item.name}` : `field options differ: ${item.name} expected ${item.expected.join('|')} actual ${item.actual.join('|')}`);
  const labels = JSON.parse(gh(['label', 'list', '--repo', projectConfig.repository, '--limit', '200', '--json', 'name'])).map(item => item.name);
  for (const label of Object.values(labelConfig).flat()) if (!labels.includes(label)) errors.push(`missing label: ${label}`);
  return errors;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const mode = process.argv[2] ?? '--dry-run';
  if (mode === '--dry-run') console.log(buildDryRun().join('\n'));
  else if (mode === '--apply') console.log(JSON.stringify(applyProjectConfig(), null, 2));
  else if (mode === '--verify') {
    const errors = verifyProjectConfig();
    if (errors.length) { console.error(`FAIL (${errors.length}):\n- ${errors.join('\n- ')}`); process.exitCode = 1; }
    else console.log('PASS: GitHub Project fields and labels match the operating model.');
  } else { console.error(`Unknown mode: ${mode}`); process.exitCode = 2; }
}
