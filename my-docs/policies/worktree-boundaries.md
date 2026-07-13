# Spec Worktree Boundaries

One spec has one `spec/<name>` branch and one worktree at `.worktrees/spec-<name>/`. One active feature issue is allowed in that spec worktree at a time.

The main checkout owns `my-docs`, OKF, plans, ADRs, handoffs, session records, and generated artifacts. Code worktrees contain only source code, permanent tests, and required manifests/lockfiles.

- A mutable shared `node_modules` is prohibited. Worktrees use lockfile-safe links and the shared pnpm content-addressed store at `my-docs/.local/pnpm-store`.
- Dirty or unmerged worktrees are never silently deleted.
- Cleanup checks feature branches, stashes, OKF claims, local artifacts, and pending HITL requests before removing a worktree.
- GitHub Actions never select or start the next issue and never force-delete worktrees.
