#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultStatePath = path.join(root, 'my-docs/.local/visual-mode.json');

export async function readVisualMode({ statePath = defaultStatePath } = {}) {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    return state.mode === 'on' ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

export async function setVisualMode(
  mode,
  { statePath = defaultStatePath, now = () => new Date().toISOString() } = {},
) {
  if (!['on', 'off'].includes(mode)) throw new Error(`Unsupported visual mode: ${mode}`);

  await mkdir(path.dirname(statePath), { recursive: true });
  const temporary = `${statePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify({ mode, updated_at: now() }, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });
    await rename(temporary, statePath);
  } finally {
    await rm(temporary, { force: true });
  }
  return mode;
}

async function main() {
  const command = process.argv[2] ?? 'status';
  const statePath = process.env.YULA_VISUAL_MODE_STATE || defaultStatePath;

  if (command === 'status') {
    console.log(await readVisualMode({ statePath }));
    return;
  }
  if (command === 'on' || command === 'off') {
    console.log(await setVisualMode(command, { statePath }));
    return;
  }

  throw new Error(`Usage: node scripts/visual-mode.mjs [on|off|status]`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
