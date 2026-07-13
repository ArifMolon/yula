import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contextNames } from '../scripts/domain-catalog.mjs';
import { resolveCanonicalRoot } from '../scripts/repository-paths.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = await resolveCanonicalRoot(repositoryRoot);
const repositoryFile = relativePath => path.join(
  relativePath === 'my-docs' || relativePath.startsWith('my-docs/') ? canonicalRoot : repositoryRoot,
  relativePath,
);

test('CLAUDE.md delegates shared project instructions to AGENTS.md', async () => {
  const adapter = await readFile(repositoryFile('CLAUDE.md'), 'utf8');
  assert.match(adapter, /\bMUST read and obey (?:the )?(?:repository )?root `AGENTS\.md`/i);
});

test('AGENTS.md links every canonical operating-model artifact', async () => {
  const instructions = await readFile(repositoryFile('AGENTS.md'), 'utf8');
  const requiredArtifacts = [
    ['DDD plan', 'my-docs/plan/YULA_DDD_Proje_Plani.md'],
    ['operating-model design', 'my-docs/plan/2026-07-13-yula-development-operating-model-design.md'],
    ['operating-model ADR', 'my-docs/adr/0001-development-operating-model.md'],
    ['DDD policy', 'my-docs/policies/ddd-must.md'],
    ['worktree policy', 'my-docs/policies/worktree-boundaries.md'],
    ['worktree command', 'scripts/spec-worktree'],
    ['HandoffBrief', 'my-docs/templates/handoff-brief.md'],
    ['HandoffBrief schema', 'schemas/handoff-brief.schema.json'],
    ['Lesson schema', 'schemas/lesson.schema.json'],
    ['KnowledgeUpdateRequested schema', 'schemas/knowledge-update-requested.schema.json'],
    ['HITL policy', 'my-docs/policies/hitl.md'],
    ['OKF index', 'my-docs/okf/index.md'],
    ['GitHub Project configuration', '.github/yula-project.json'],
    ['operating-model and Markdown-link verification', 'scripts/validate-operating-model.mjs'],
  ];

  for (const [name, artifact] of requiredArtifacts) {
    const destination = artifact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const canonicalLink = new RegExp(`\\]\\(\\s*<?(?:\\./)?${destination}>?(?:#[^)\\s]+)?\\s*\\)`);
    assert.match(instructions, canonicalLink, `AGENTS.md links the canonical ${name}: ${artifact}`);
    await assert.doesNotReject(
      access(repositoryFile(artifact)),
      `canonical ${name} link target exists: ${artifact}`,
    );
  }

  for (const match of instructions.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const destination = match[1].trim().replace(/^<|>$/g, '');
    if (!destination || destination.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(destination)) continue;
    const localTarget = destination.split('#', 1)[0];
    await assert.doesNotReject(
      access(repositoryFile(localTarget)),
      `AGENTS.md local link target exists: ${localTarget}`,
    );
  }

  const boundedContextSection = instructions.match(
    /Always use the full bounded-context name[^\n]*:\s*\n([\s\S]*?)(?=\n## )/,
  );
  assert.ok(boundedContextSection, 'AGENTS.md contains the canonical bounded-context list');
  const documentedContextNames = [...boundedContextSection[1].matchAll(/^\d+\.\s+(.+)$/gm)]
    .map(match => match[1].trim());
  assert.deepEqual(documentedContextNames, contextNames, 'AGENTS.md uses the exact canonical context catalog');
  for (const contextName of contextNames) {
    assert.doesNotMatch(
      boundedContextSection[1],
      new RegExp(`^\\d+\\.\\s+${contextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Context$`, 'm'),
      `AGENTS.md does not suffix the canonical ${contextName} value`,
    );
  }
});

test('CLAUDE.md does not copy shared project instruction sections', async () => {
  const adapter = await readFile(repositoryFile('CLAUDE.md'), 'utf8');
  const sharedHeadings = [
    'Product purpose',
    'Source of truth',
    'Session preflight',
    'Domain-driven design',
    'Delivery workflow',
    'Worktree workflow',
    'Knowledge and handoff',
    'Human-in-the-loop',
    'Verification and cleanup',
  ];

  for (const heading of sharedHeadings) {
    assert.doesNotMatch(adapter, new RegExp(`^#{1,6}\\s+${heading}(?:\\s|[:—-]|$)`, 'im'));
  }
});
