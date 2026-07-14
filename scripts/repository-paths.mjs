import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

async function containsCanonicalDocs(root) {
  try {
    await access(path.join(root, 'my-docs'));
    return true;
  } catch {
    return false;
  }
}

export async function resolveCanonicalRoot(repositoryRoot) {
  if (await containsCanonicalDocs(repositoryRoot)) return repositoryRoot;

  const gitFile = await readFile(path.join(repositoryRoot, '.git'), 'utf8');
  const match = gitFile.match(/^gitdir:\s*(.+)$/m);
  if (!match) throw new Error(`cannot resolve linked worktree Git directory: ${repositoryRoot}`);

  const gitDirectory = path.resolve(repositoryRoot, match[1]);
  const mainRoot = path.dirname(path.resolve(gitDirectory, '..', '..'));
  if (!await containsCanonicalDocs(mainRoot)) {
    throw new Error(`canonical my-docs directory is unavailable from linked worktree: ${repositoryRoot}`);
  }
  return mainRoot;
}
