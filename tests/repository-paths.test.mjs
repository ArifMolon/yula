import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { resolveCanonicalRoot } from '../scripts/repository-paths.mjs';

const exec = promisify(execFile);

test('canonical files resolve to the main checkout from a sparse linked worktree', async () => {
  const main = await mkdtemp(path.join(tmpdir(), 'yula-canonical-root-'));
  await exec('git', ['init', '--initial-branch=main'], { cwd: main });
  await exec('git', ['config', 'user.email', 'test@yula.local'], { cwd: main });
  await exec('git', ['config', 'user.name', 'YULA Test'], { cwd: main });
  await mkdir(path.join(main, 'my-docs'), { recursive: true });
  await writeFile(path.join(main, 'my-docs', 'canonical.md'), 'canonical\n');
  await exec('git', ['add', '.'], { cwd: main });
  await exec('git', ['commit', '-m', 'fixture'], { cwd: main });

  const worktree = path.join(main, '.worktrees/spec-example');
  await exec('git', ['worktree', 'add', worktree, '-b', 'spec/example'], { cwd: main });
  await exec('git', ['sparse-checkout', 'set', '--no-cone', '/*', '!/my-docs/'], { cwd: worktree });

  assert.equal(await resolveCanonicalRoot(worktree), await realpath(main));
});
