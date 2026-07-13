import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectConfig = Object.freeze({
  owner: 'ArifMolon',
  repository: 'ArifMolon/yula',
  title: 'YULA Development',
  fields: Object.freeze({
    Status: ['Todo', 'Progress', 'Review', 'Done'],
    Phase: ['0', '1', '2', '3', '4', '5', '6'],
    'Bounded Context': ['Orchestration', 'Agent Studio', 'Tool Lab', 'Knowledge', 'Workspace', 'Model Gateway', 'Interaction', 'Approval & Security', 'Integration', 'Observability & Cost', 'Remote Access', 'Identity & Secrets'],
    Risk: ['R0', 'R1', 'R2', 'R3', 'R4'],
    Spec: { type: 'text' },
    'Human Review': ['Policy', 'Required'],
    Size: ['XS', 'S', 'M'],
  }),
});

export const labelConfig = Object.freeze({
  context: ['context:orchestration', 'context:agent-studio', 'context:tool-lab', 'context:knowledge', 'context:workspace', 'context:model-gateway', 'context:interaction', 'context:approval-security', 'context:integration', 'context:observability-cost', 'context:remote-access', 'context:identity-secrets'],
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

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input, stdio: input ? ['pipe', 'pipe', 'inherit'] : ['ignore', 'pipe', 'inherit'] }).trim();
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

function ensureFields(number) {
  const current = JSON.parse(gh(['project', 'field-list', String(number), '--owner', projectConfig.owner, '--format', 'json'])).fields ?? [];
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
  ensureFields(project.number);
  ensureLabels();
  return project;
}

export function verifyProjectConfig() {
  const project = projects().find(item => item.title === projectConfig.title);
  if (!project) return [`missing project: ${projectConfig.title}`];
  const fields = JSON.parse(gh(['project', 'field-list', String(project.number), '--owner', projectConfig.owner, '--format', 'json'])).fields ?? [];
  const errors = [];
  for (const name of Object.keys(projectConfig.fields)) if (!fields.some(field => field.name === name)) errors.push(`missing field: ${name}`);
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
