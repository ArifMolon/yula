import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contextSlugByName, contextSlugs } from './domain-catalog.mjs';

const contexts = new Set(contextSlugs);

export function buildValidatedProjectItem(handoff, projectItems, issueNumber) {
  const projectItem = (projectItems.items ?? []).find(item => item.content?.number === Number(issueNumber));
  if (!projectItem) throw new Error(`issue #${issueNumber} is missing from YULA Development Project`);
  if (projectItem.spec && handoff.spec !== projectItem.spec) throw new Error('HandoffBrief spec does not match Project Spec');
  const contextName = projectItem['bounded Context'] ?? projectItem['Bounded Context'];
  return { ...handoff, status: projectItem.status, spec: projectItem.spec ?? handoff.spec, bounded_context: contextSlugByName.get(contextName) ?? handoff.bounded_context };
}

export function validateDoneEligibility(item) {
  const errors = [];
  if (item.status !== 'Done') errors.push('Project status must be Done');
  if (!item.handoff_brief) errors.push('latest HandoffBrief is required');
  if (!contexts.has(item.bounded_context)) errors.push('full Bounded Context is required');
  if (!item.issue || !item.spec || !item.capability || !item.pull_request) errors.push('issue, spec, capability, and pull request are required');
  if (!Array.isArray(item.verification) || item.verification.length === 0) errors.push('fresh verification evidence is required');
  if ((item.active_claims ?? []).length) errors.push('unresolved OKF claim blocks Done');
  if ((item.pending_hitl ?? []).length) errors.push('pending required HITL blocks Done');
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = name => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; };
  const [handoffPath, projectItemsPath, issueNumber, outputPath] = ['--handoff', '--project-items', '--issue-number', '--output'].map(arg);
  if (!handoffPath || !projectItemsPath || !issueNumber || !outputPath) {
    console.error('Usage: validate-project-item.mjs --handoff <json> --project-items <json> --issue-number <n> --output <json>');
    process.exitCode = 2;
  } else {
    const item = buildValidatedProjectItem(JSON.parse(await readFile(handoffPath, 'utf8')), JSON.parse(await readFile(projectItemsPath, 'utf8')), issueNumber);
    const errors = validateDoneEligibility(item);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
    else await writeFile(outputPath, `${JSON.stringify(item, null, 2)}\n`);
  }
}
