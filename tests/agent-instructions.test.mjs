import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('CLAUDE.md delegates shared project instructions to AGENTS.md', async () => {
  const adapter = await readFile('CLAUDE.md', 'utf8');
  assert.match(adapter, /\bMUST read and obey (?:the )?(?:repository )?root `AGENTS\.md`/i);
});

test('AGENTS.md links every canonical operating-model artifact', async () => {
  const instructions = await readFile('AGENTS.md', 'utf8');
  const requiredArtifacts = [
    ['DDD plan', 'my-docs/plan/YULA_DDD_Proje_Plani.md'],
    ['DDD policy', 'my-docs/policies/ddd-must.md'],
    ['worktree policy', 'my-docs/policies/worktree-boundaries.md'],
    ['worktree command', 'scripts/spec-worktree'],
    ['HandoffBrief', 'my-docs/templates/handoff-brief.md'],
    ['HITL policy', 'my-docs/policies/hitl.md'],
    ['OKF index', 'my-docs/okf/index.md'],
    ['GitHub Project configuration', '.github/yula-project.json'],
    ['operating-model verification', 'scripts/validate-operating-model.mjs'],
    ['Markdown-link verification', 'scripts/validate-markdown-links.mjs'],
  ];

  for (const [name, artifact] of requiredArtifacts) {
    const destination = artifact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const canonicalLink = new RegExp(`\\]\\(\\s*<?(?:\\./)?${destination}>?(?:#[^)\\s]+)?\\s*\\)`);
    assert.match(instructions, canonicalLink, `AGENTS.md links the canonical ${name}: ${artifact}`);
  }
});

test('CLAUDE.md does not copy shared project instruction sections', async () => {
  const adapter = await readFile('CLAUDE.md', 'utf8');
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
