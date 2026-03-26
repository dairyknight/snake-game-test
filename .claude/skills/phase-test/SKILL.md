---
name: phase-test
description: "Phase testing skill (Step 5 of the execution loop). Two-stage verification: first a code review pass on the diff using /review (findings fixed in a separate commit), then behavioral testing via the test suite and GStack /qa, /design-review, /cso. Testing sub-agents run on the merged phase branch (not in worktrees). Invoke this skill after merging all worktree results and before the iterate step. Trigger whenever the agent reaches the TEST step of the main loop."
---

# Phase Testing: Code Review → Behavioral Tests

This skill covers Step 5 of the execution loop. All task groups have been built and merged into the phase branch. Now verify the work in two stages.

The key principle: review commits and build commits are separate. The main build is one commit; review fixes are a separate commit.

## Stage 1: Code Review (diff-level quality)

Run GStack `/review` on all changes in this phase. This catches quality issues that tests won't find: N+1 queries, race conditions, stale reads, broken trust boundaries, forgotten enum handlers.

**What `/review` produces:**
- Auto-fixes for mechanical issues (formatting, obvious bugs)
- Flags for ambiguous issues that need judgment

After the review:
- Fix all findings that are clearly correct.
- Commit review fixes separately: `phase-{N} review fixes: {specific fixes}`
- If a finding is ambiguous or would require significant rearchitecting, document it as tech debt — do not fix it in this commit.

For phases where you want a deeper investigation (e.g., between major phases, or when you suspect pre-existing issues), also run `/investigate` for a systematic debugging audit.

## Stage 2: Behavioral Testing (does it work?)

After review fixes are committed, run behavioral tests. This stage uses both automated tests and GStack QA.

### Testing Layers

Run in order:
1. **Unit/Integration tests** — Run the full test suite using the project's test runner. All existing tests must pass. New code must have tests.
2. **GStack `/qa`** — Browser-based testing of user-facing flows. Catches visual regressions, broken interactions, edge cases.
3. **GStack `/design-review`** — If the phase includes UI work, run the 80-item visual audit.
4. **GStack `/cso`** — If the phase touches security-sensitive code, run the OWASP audit.

### Dispatching Testing Sub-Agents

Testing sub-agents run on the merged phase branch — do NOT use `isolation: "worktree"`. They need to see the integrated state including review fixes.

Before calling Task, gather:
- The acceptance criteria from the phase plan
- The test command from `.agent/codebase-profile.md`
- The list of changed files: `git diff --name-only main`
- A summary of what was built

```
# Task tool call for testing sub-agent
# Do NOT use isolation: "worktree"

prompt: |
  You are a testing sub-agent. You are adversarial — your job is
  to find problems, not to confirm that things work. You have no
  prior context — everything you need is below.

  ## Phase: {phase_name}
  ## What Was Built
  {summary of what was built across all task groups}

  ## Acceptance Criteria
  {INLINE the acceptance criteria from the phase plan}

  ## Test Command
  {test_command from .agent/codebase-profile.md}

  ## Changed Files
  {list of all files changed in this phase}

  ## Instructions
  Run the following checks in order:
  1. Execute the full test suite with: {test_command}. Report any failures.
  2. Run /qa to test user-facing flows in a real browser.
  3. If UI was changed: run /design-review for visual audit.
  4. If security-sensitive: run /cso for threat modeling.

  GStack slash commands (/qa, /design-review, /cso) are available
  to you directly — just invoke them.

  Report back with:
  - PASS/FAIL for each check
  - For each failure: what failed, severity (critical/major/minor), and suggested fix
  - Any code smells or patterns that should be refactored
```

## Output

A structured test report. The main agent uses this to decide whether to iterate (Step 6) or ship (Step 7).

```
## Test Report — Phase {N}

### Code Review: COMPLETE
- Auto-fixes applied: {count}
- Issues deferred as tech debt: {count}
- Commit: phase-{N} review fixes: {specifics}

### Unit/Integration Tests: PASS/FAIL
{details}

### QA (Browser Testing): PASS/FAIL
{details}

### Design Review: PASS/FAIL/SKIPPED
{details}

### Security Audit: PASS/FAIL/SKIPPED
{details}

### Summary
- Critical issues: {count}
- Major issues: {count}
- Minor issues: {count}
```
