import test from 'node:test';
import assert from 'node:assert/strict';
import { access, lstat, mkdtemp, mkdir, readFile, readdir, readlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const modulePath = '../scripts/visual-mode.mjs';

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'yula-visual-mode-'));
  return path.join(directory, 'visual-mode.json');
}

test('missing and invalid visual state fail closed without creating state', async () => {
  const { readVisualMode } = await import(modulePath);
  const statePath = await fixture();

  assert.equal(await readVisualMode({ statePath }), 'off');
  await assert.rejects(access(statePath));

  await writeFile(statePath, '{broken');
  assert.equal(await readVisualMode({ statePath }), 'off');

  await writeFile(statePath, '{"mode":"ON"}');
  assert.equal(await readVisualMode({ statePath }), 'off');

  const unreadablePath = await fixture();
  await mkdir(unreadablePath);
  assert.equal(await readVisualMode({ statePath: unreadablePath }), 'off');
});

test('visual mode persists on and off through atomic state writes', async () => {
  const { readVisualMode, setVisualMode } = await import(modulePath);
  const statePath = await fixture();

  assert.equal(await setVisualMode('on', { statePath, now: () => '2026-07-14T00:00:00.000Z' }), 'on');
  assert.deepEqual(JSON.parse(await readFile(statePath, 'utf8')), {
    mode: 'on',
    updated_at: '2026-07-14T00:00:00.000Z',
  });
  assert.equal(await readVisualMode({ statePath }), 'on');

  assert.equal(await setVisualMode('off', { statePath, now: () => '2026-07-14T00:01:00.000Z' }), 'off');
  assert.equal(await readVisualMode({ statePath }), 'off');
});

test('concurrent visual writes remain valid and leave no temporary files', async () => {
  const { setVisualMode } = await import(modulePath);
  const statePath = await fixture();

  const results = await Promise.allSettled(Array.from({ length: 20 }, (_, index) => (
    setVisualMode(index % 2 ? 'on' : 'off', { statePath })
  )));

  assert.equal(results.filter(result => result.status === 'rejected').length, 0);
  assert.ok(['on', 'off'].includes(JSON.parse(await readFile(statePath, 'utf8')).mode));
  assert.deepEqual((await readdir(path.dirname(statePath))).filter(name => name.includes('.tmp')), []);
});

test('default visual state is anchored to ignored repository-local storage', async () => {
  const { defaultStatePath } = await import(modulePath);
  assert.equal(defaultStatePath, path.resolve('my-docs/.local/visual-mode.json'));

  const ignored = spawnSync('git', ['check-ignore', '-q', defaultStatePath], {
    cwd: process.cwd(),
  });
  assert.equal(ignored.status, 0);
});

test('visual mode CLI defaults off and supports on, status, and off', async () => {
  const statePath = await fixture();
  const run = command => spawnSync(process.execPath, ['scripts/visual-mode.mjs', command], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, YULA_VISUAL_MODE_STATE: statePath },
  });

  for (const [command, expected] of [['status', 'off'], ['on', 'on'], ['status', 'on'], ['off', 'off']]) {
    const result = run(command);
    assert.deepEqual(
      { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr },
      { status: 0, stdout: expected, stderr: '' },
    );
  }
  assert.notEqual(run('invalid').status, 0);
});

test('failed visual state write exits nonzero, prints no mode, and cleans temporary files', async () => {
  const statePath = await fixture();
  await mkdir(statePath);
  const result = spawnSync(process.execPath, ['scripts/visual-mode.mjs', 'on'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, YULA_VISUAL_MODE_STATE: statePath },
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual((await readdir(path.dirname(statePath))).filter(name => name.includes('.tmp')), []);
});

test('visual-off skill and Claude adapter preserve one canonical source', async () => {
  const off = await readFile('.agents/skills/visual-off/SKILL.md', 'utf8');
  assert.match(off, /name: visual-off/);
  assert.match(off, /node scripts\/visual-mode\.mjs off/);
  assert.match(off, /Do not start or update a companion server/i);
  assert.equal((await lstat('.claude/skills/visual-off')).isSymbolicLink(), true);
  assert.equal(await readlink('.claude/skills/visual-off'), '../../.agents/skills/visual-off');
});

test('visual-on skill and Claude adapter preserve one canonical source', async () => {
  const on = await readFile('.agents/skills/visual-on/SKILL.md', 'utf8');
  assert.match(on, /name: visual-on/);
  assert.match(on, /node scripts\/visual-mode\.mjs on/);
  assert.match(on, /does not start a companion server/i);
  assert.equal((await lstat('.claude/skills/visual-on')).isSymbolicLink(), true);
  assert.equal(await readlink('.claude/skills/visual-on'), '../../.agents/skills/visual-on');
});

test('agent instructions route visual policy through default-off local state', async () => {
  const agents = await readFile('AGENTS.md', 'utf8');
  assert.match(agents, /## Visual decision support/);
  assert.match(agents, /my-docs\/\.local\/visual-mode\.json/);
  assert.match(agents, /missing.*invalid.*off/is);
  assert.match(agents, /Context Map.*Published Language/is);
  assert.match(agents, /click.*does not start.*turn/is);
  assert.match(agents, /URL.*screen summary/is);
  assert.match(agents, /next user-triggered turn.*events/is);

  const claude = await readFile('CLAUDE.md', 'utf8');
  assert.match(claude, /# Visual Companion adapter/);
  assert.match(claude, /node scripts\/visual-mode\.mjs status/);
  assert.match(claude, /visual-companion\.md/);
  assert.match(claude, /mode is `off`.*do not/is);
});
