#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function trimOneLine(text, limit = 120) {
  const compact = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!compact) return 'UNKNOWN';
  return compact.length > limit ? `${compact.slice(0, limit - 1)}…` : compact;
}

function runGit(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function parseStatus(root, statusText) {
  if (!statusText) {
    return { branch: 'UNKNOWN', head: runGit(root, ['rev-parse', '--short', 'HEAD']) || 'UNKNOWN', clean: null };
  }

  const lines = statusText.split('\n').filter(Boolean);
  const header = lines[0] ?? '';
  const branch = header.replace(/^##\s*/, '').split('...')[0].trim() || 'UNKNOWN';
  const head = runGit(root, ['rev-parse', '--short', 'HEAD']) || 'UNKNOWN';
  const clean = lines.length <= 1;
  return { branch, head, clean };
}

async function listHandoffs(root) {
  const dir = path.join(root, 'my-docs/okf/handoffs');
  let entries = [];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const items = [];
  for (const entry of entries.filter(name => name.endsWith('.json'))) {
    const fullPath = path.join(dir, entry);
    try {
      const [raw, fileStat] = await Promise.all([readFile(fullPath, 'utf8'), stat(fullPath)]);
      const parsed = JSON.parse(raw);
      items.push({ file: entry, path: fullPath, stat: fileStat, data: parsed });
    } catch {
      continue;
    }
  }

  items.sort((a, b) => {
    const aTime = Date.parse(a.data.updated_at ?? '') || a.stat.mtimeMs;
    const bTime = Date.parse(b.data.updated_at ?? '') || b.stat.mtimeMs;
    return bTime - aTime;
  });
  return items;
}

function summarizeHandoff(handoff) {
  if (!handoff) {
    return {
      anchor: 'UNKNOWN',
      state: 'UNKNOWN',
      blockers: [],
      next: 'Restore or create the current HandoffBrief',
    };
  }

  const issue = trimOneLine(handoff.issue ?? 'UNKNOWN', 40);
  const spec = trimOneLine(handoff.spec ?? 'UNKNOWN', 40);
  const context = trimOneLine(handoff.bounded_context ?? 'UNKNOWN', 40);
  const status = trimOneLine(handoff.status ?? 'UNKNOWN', 20);
  const anchor = [issue, spec, context, status].filter(value => value !== 'UNKNOWN').join(' | ') || 'UNKNOWN';
  const state = trimOneLine(handoff.implementation_state ?? 'UNKNOWN', 140);
  const blockers = Array.isArray(handoff.blockers)
    ? handoff.blockers
      .filter(Boolean)
      .map(item => trimOneLine(item, 100))
      .filter(item => item.toLowerCase() !== 'none')
    : [];
  const next = trimOneLine(handoff.next_action ?? 'Restore or create the current HandoffBrief', 160);
  return { anchor, state, blockers, next };
}

function formatPacket({ git, handoff, sources }) {
  const blockers = handoff.blockers.length ? handoff.blockers.join('; ') : 'none';
  const status = git.clean === null ? 'UNKNOWN' : git.clean ? 'clean' : 'dirty';
  return [
    `STATE: ${git.branch} | ${status} | ${git.head}`,
    `ANCHOR: ${handoff.anchor}`,
    `DONE: ${handoff.state}`,
    `BLOCKERS: ${blockers}`,
    `NEXT: ${handoff.next}`,
    `SOURCES: ${sources.join(', ')}`,
  ].join('\n');
}

function formatCavemanPacket({ git, handoff, sources }) {
  const status = git.clean === null ? 'UNKNOWN' : git.clean ? 'clean' : 'dirty';
  return [
    `STATE: ${git.branch} | ${status} | ${git.head}`,
    `ANCHOR: ${handoff.anchor}`,
    `NEXT: ${handoff.next}`,
    `SOURCES: ${sources.join(', ')}`,
  ].join('\n');
}

export async function buildResumePacket(root = process.cwd()) {
  const statusText = runGit(root, ['status', '--short', '--branch']);
  const git = parseStatus(root, statusText);
  const handoffs = await listHandoffs(root);
  const handoff = summarizeHandoff(handoffs[0]?.data);
  const sources = ['git'];
  if (handoffs[0]?.file) sources.push(`my-docs/okf/handoffs/${handoffs[0].file}`);
  sources.push('my-docs/okf/index.md', 'my-docs/okf/log.md');
  return { git, handoff, sources };
}

export function renderResumePacket(packet) {
  return formatPacket(packet);
}

export function renderCavemanPacket(packet) {
  return formatCavemanPacket(packet);
}

async function main() {
  const packet = await buildResumePacket();
  const args = new Set(process.argv.slice(2));
  const caveman = args.has('--caveman') || args.has('--style=caveman') || (args.has('--style') && process.argv.includes('caveman'));
  const rendered = caveman ? renderCavemanPacket(packet) : renderResumePacket(packet);
  process.stdout.write(`${rendered}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`${error?.message ?? String(error)}\n`);
    process.exitCode = 1;
  });
}
