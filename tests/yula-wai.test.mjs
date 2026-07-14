import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat, mkdtemp, mkdir, readFile, readlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const skillDir = '.agents/skills/yula-wai';

test('yula-wai skill stays terse and points at the resume script', async () => {
  const skill = await readFile(`${skillDir}/SKILL.md`, 'utf8');
  assert.match(skill, /name: yula-wai/);
  assert.match(skill, /Use when returning to YULA after a long break/i);
  assert.match(skill, /Run `node \.agents\/skills\/yula-wai\/scripts\/yula-wai\.mjs`/);
  assert.match(skill, /Read-only\. Never write OKF, HandoffBrief, Git, or SQLite state\./i);
  assert.match(skill, /STATE`, `ANCHOR`, `BLOCKERS`, `NEXT`, `SOURCES`/i);
});

test('openai metadata matches the skill trigger', async () => {
  const yaml = await readFile(`${skillDir}/agents/openai.yaml`, 'utf8');
  assert.match(yaml, /display_name: "YULA Where Am I"/);
  assert.match(yaml, /short_description: "Fast YULA project resume packet"/);
  assert.match(yaml, /default_prompt: "Use \$yula-wai to get a terse YULA resume packet and the next concrete action\."/);
});

test('claude adapter points at the canonical skill source', async () => {
  assert.equal((await lstat('.claude/skills/yula-wai')).isSymbolicLink(), true);
  assert.equal(await readlink('.claude/skills/yula-wai'), '../../.agents/skills/yula-wai');
});

test('caveman skill is linked for Claude and stays ultra terse', async () => {
  assert.equal((await lstat('.claude/skills/caveman')).isSymbolicLink(), true);
  assert.equal(await readlink('.claude/skills/caveman'), '../../.agents/skills/caveman');

  const { buildResumePacket, renderCavemanPacket } = await import('../.agents/skills/yula-wai/scripts/yula-wai.mjs');
  const packet = await buildResumePacket(process.cwd());
  const rendered = renderCavemanPacket(packet);
  assert.ok(rendered.split('\n').length <= 4);
  assert.match(rendered, /^STATE:/m);
  assert.match(rendered, /^NEXT:/m);
  assert.match(rendered, /^SOURCES:/m);
  assert.doesNotMatch(rendered, /^DONE:/m);
  assert.doesNotMatch(rendered, /^BLOCKERS:/m);
});

test('resume packet prefers the latest handoff and keeps the output terse', async () => {
  const { buildResumePacket, renderResumePacket } = await import('../.agents/skills/yula-wai/scripts/yula-wai.mjs');
  const root = await mkdtemp(path.join(tmpdir(), 'yula-wai-'));
  await mkdir(path.join(root, 'my-docs/okf/handoffs'), { recursive: true });
  await mkdir(path.join(root, 'my-docs/okf'), { recursive: true });
  await writeFile(path.join(root, 'my-docs/okf/index.md'), '# YULA OKF\n');
  await writeFile(path.join(root, 'my-docs/okf/log.md'), '# YULA OKF Log\n');
  await writeFile(path.join(root, 'my-docs/okf/handoffs/issue-99.json'), JSON.stringify({
    issue: 'owner/repo#99',
    spec: 'SPEC-resume',
    bounded_context: 'Knowledge',
    status: 'Progress',
    implementation_state: 'Latest durable state',
    blockers: ['none'],
    next_action: 'Do the next concrete thing',
    updated_at: '2026-07-14T00:00:00Z',
  }));

  const packet = await buildResumePacket(root);
  const rendered = renderResumePacket(packet);
  assert.match(rendered, /STATE: .* \| .* \| .*$/m);
  assert.match(rendered, /ANCHOR: owner\/repo#99 \| SPEC-resume \| Knowledge \| Progress/);
  assert.match(rendered, /DONE: Latest durable state/);
  assert.match(rendered, /NEXT: Do the next concrete thing/);
  assert.match(rendered, /SOURCES: git, my-docs\/okf\/handoffs\/issue-99\.json, my-docs\/okf\/index\.md, my-docs\/okf\/log\.md/);
  assert.ok(rendered.split('\n').length <= 6);
});
