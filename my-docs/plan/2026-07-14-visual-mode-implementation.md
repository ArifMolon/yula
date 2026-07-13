# Visual Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add token-safe, repository-scoped `/visual-on` and `/visual-off` skills and enforce the resulting Visual Companion mode in YULA agent instructions.

**Architecture:** A single Node.js command owns the ignored local state at `my-docs/.local/visual-mode.json`; missing or invalid state resolves to `off`. Two canonical project skills delegate state changes to that command, and Claude discovers them through the repository's existing `.claude/skills` symlink convention. `AGENTS.md` owns cross-tool policy while `CLAUDE.md` contains only Claude-specific adapter behavior.

**Tech Stack:** Node.js ESM, `node:test`, Markdown agent skills, Git symlinks.

---

## File map

- Create `scripts/visual-mode.mjs`: read and atomically mutate the effective local mode.
- Create `tests/visual-mode.test.mjs`: prove default-off, invalid-state fallback, state transitions, CLI behavior, skills, symlinks, and instruction routing.
- Create `.agents/skills/visual-off/SKILL.md`: explicit disable workflow.
- Create `.agents/skills/visual-on/SKILL.md`: explicit enable workflow.
- Create `.claude/skills/visual-off`: symlink to the canonical project skill.
- Create `.claude/skills/visual-on`: symlink to the canonical project skill.
- Modify `AGENTS.md`: add canonical Visual decision support policy.
- Modify `CLAUDE.md`: add Claude-specific Visual Companion adapter.
- Modify `my-docs/plan/2026-07-14-visual-decision-support-design.md`: retain the final toggle decision and implementation authority.

### Task 1: Deterministic local visual-mode state

**Files:**
- Create: `tests/visual-mode.test.mjs`
- Create: `scripts/visual-mode.mjs`

- [ ] **Step 1: Write failing state tests**

Create tests that import `readVisualMode` and `setVisualMode`, use a temporary `statePath`, and assert:

```js
assert.equal(await readVisualMode({ statePath }), 'off');
await assert.rejects(access(statePath));
await writeFile(statePath, '{broken');
assert.equal(await readVisualMode({ statePath }), 'off');
assert.equal(await setVisualMode('on', { statePath, now: () => '2026-07-14T00:00:00.000Z' }), 'on');
assert.equal(JSON.parse(await readFile(statePath, 'utf8')).mode, 'on');
assert.equal(await setVisualMode('off', { statePath }), 'off');
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/visual-mode.test.mjs`
Expected: FAIL because `scripts/visual-mode.mjs` does not exist.

- [ ] **Step 3: Implement minimal state command**

Implement exports and CLI:

```js
export const defaultStatePath = path.join(root, 'my-docs/.local/visual-mode.json');

export async function readVisualMode({ statePath = defaultStatePath } = {}) {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    return state.mode === 'on' ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

export async function setVisualMode(mode, { statePath = defaultStatePath, now = () => new Date().toISOString() } = {}) {
  if (!['on', 'off'].includes(mode)) throw new Error(`Unsupported visual mode: ${mode}`);
  await mkdir(path.dirname(statePath), { recursive: true });
  const temporary = `${statePath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify({ mode, updated_at: now() }, null, 2)}\n`);
  await rename(temporary, statePath);
  return mode;
}
```

CLI commands are `on`, `off`, and `status`; tests override the path with `YULA_VISUAL_MODE_STATE`.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/visual-mode.test.mjs`
Expected: all focused tests pass.

### Task 2: `visual-off` skill

**Files:**
- Create: `.agents/skills/visual-off/SKILL.md`
- Create: `.claude/skills/visual-off`
- Test: `tests/visual-mode.test.mjs`

- [ ] **Step 1: Run RED pressure scenarios without the skill**

Use fresh subagents with prompts combining token pressure, an active companion session, and a request to disable visual output. Capture whether they persist state, stop further visual lifecycle work, and avoid treating a browser click as sufficient.

- [ ] **Step 2: Add failing repository assertions**

Assert the canonical skill exists, contains `node scripts/visual-mode.mjs off`, states that no further companion lifecycle work may occur, and `.claude/skills/visual-off` resolves to `../../.agents/skills/visual-off`.

- [ ] **Step 3: Run RED**

Run: `node --test tests/visual-mode.test.mjs`
Expected: FAIL because the skill and symlink do not exist.

- [ ] **Step 4: Initialize and write the minimal skill**

Use `init_skill.py visual-off --path .agents/skills` and replace the generated body with a concise workflow:

```markdown
---
name: visual-off
description: Use when the user asks to disable, stop, pause, or avoid Visual Companion and visual brainstorming in the current YULA repository.
---

# Visual Off

Run `node scripts/visual-mode.mjs off` from the repository root and require stdout `off`.
Do not start or update a companion server, write screens, or read companion events while disabled.
If a companion session is active, stop it through the current Visual Companion guide when possible; the persisted `off` state remains authoritative even if cleanup is unavailable.
Report the effective mode without claiming that a browser click is approval.
```

Create the relative `.claude/skills/visual-off` symlink.

- [ ] **Step 5: Validate and GREEN-test**

Run the skill validator and focused tests. Expected: both pass.

- [ ] **Step 6: Run GREEN pressure scenarios**

Repeat the RED prompts with the skill and verify the agent persists `off`, stops new visual work, and preserves terminal authority.

### Task 3: `visual-on` skill

**Files:**
- Create: `.agents/skills/visual-on/SKILL.md`
- Create: `.claude/skills/visual-on`
- Test: `tests/visual-mode.test.mjs`

- [ ] **Step 1: Run RED pressure scenarios without the skill**

Use fresh subagents with prompts asking to enable visual technical decisions while avoiding automatic visualization of simple text questions. Capture whether they persist state and respect the qualifying-decision threshold.

- [ ] **Step 2: Add failing repository assertions and run RED**

Assert the skill calls `node scripts/visual-mode.mjs on`, enabling does not itself start a server, and the Claude symlink resolves correctly. Run the focused test and observe failure.

- [ ] **Step 3: Initialize and write the minimal skill**

```markdown
---
name: visual-on
description: Use when the user asks to enable, resume, or turn on Visual Companion for technical decisions in the current YULA repository.
---

# Visual On

Run `node scripts/visual-mode.mjs on` from the repository root and require stdout `on`.
Enabling changes preference only; start Visual Companion later only when a qualifying decision materially benefits from a visual.
Follow the current Visual Companion guide, keep terminal feedback authoritative, and disclose that clicks do not start agent turns.
```

Create the relative `.claude/skills/visual-on` symlink.

- [ ] **Step 4: Validate, GREEN-test, and forward-test**

Run the skill validator, focused tests, and GREEN pressure scenarios. Expected: persisted `on` without unnecessary server startup.

### Task 4: Canonical and Claude-specific instruction routing

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Test: `tests/visual-mode.test.mjs`

- [ ] **Step 1: Add failing instruction tests and run RED**

Assert `AGENTS.md` contains the default-off state contract, mode command, qualifying visual triggers, fallback, and authority boundary. Assert `CLAUDE.md` delegates to `AGENTS.md`, checks status before companion work, loads `visual-companion.md` only when on, and explains the no-push click behavior.

- [ ] **Step 2: Add the minimal canonical policy**

Add `## Visual decision support` to `AGENTS.md` after Domain-driven design. Keep cross-tool behavior there and do not duplicate Claude routing.

- [ ] **Step 3: Add the thin Claude adapter**

Add `# Visual Companion adapter` near the top of `CLAUDE.md`. It must use `node scripts/visual-mode.mjs status`, skip all companion work when `off`, and follow the available guide when `on`.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/visual-mode.test.mjs`
Expected: all focused tests pass.

### Task 5: Completion verification and commits

**Files:** all files above.

- [ ] **Step 1: Run focused validation**

```bash
node --test tests/visual-mode.test.mjs
python3 /Users/senzey/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/visual-off
python3 /Users/senzey/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/visual-on
```

- [ ] **Step 2: Run repository gates**

```bash
node scripts/validate-operating-model.mjs
node --test tests/*.test.mjs
git diff --check
```

- [ ] **Step 3: Exercise CLI transitions in an isolated fixture**

Use `YULA_VISUAL_MODE_STATE=$(mktemp -u)` to prove default `off`, then `on`, then `off`, without mutating the real preference.

- [ ] **Step 4: Set the requested effective default**

Stop the current Visual Companion session, leave the real state file absent or set to `off`, and confirm `node scripts/visual-mode.mjs status` prints `off`.

- [ ] **Step 5: Commit intentionally**

Commit only the design revision, implementation plan, script, tests, skills, symlinks, and instruction changes. Preserve `.vscode/`; do not push.
