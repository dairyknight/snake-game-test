---
name: phase-compact
description: "Phase compaction skill (Step 8 of the execution loop). All referenced sub-skills are local autonomized copies. Records deviations in the phase ledger, updates session state and codebase profile, appends new gotchas and conventions to CLAUDE.md's Codebase Knowledge section, updates spec docs if implementation diverged, commits doc updates, then runs /compact to free context. Invoke this skill after shipping a phase PR and before starting the next phase. Trigger whenever the agent reaches the COMPACT step of the main loop."
---

# Phase Compaction: Deviations + State + Context

This skill covers Step 8 of the execution loop. You've shipped the phase. Now record what you learned, update all living documents, and free context for the next phase.

**The order matters:** Write to disk FIRST, then run `/compact`. Compaction summarizes your context window. Anything not written to disk may be lost.

## Actions

### 1. Write the Phase Ledger (with Deviations)

Save to `.agent/phase-{N}-ledger.md`. The Deviations section is critical — it is the connective tissue between phases. Future phases will read this.

```markdown
# Phase {N} Ledger

## What Was Built
{3-5 sentences summarizing deliverables}

## Key Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| ...      | ...    | ...       |

## Architecture Changes
{One-liner per change, or "None"}

## Deviations
Every divergence from the spec. Each entry must include what was specified, what was actually implemented, why, and where deferred work is tracked.

### Deferred Tasks
{Work that needs a later phase to exist}
- {description} — deferred to Phase {X} because {reason}

### Spec Divergences
{Implementation discovered the spec was wrong or incomplete}
- Spec said: {X}. Implemented: {Y}. Reason: {why}. Spec updated: yes/no.

### Stubs
{Methods/functions returning empty/default values}
- {function_name} returns {default} — needs Phase {X} for full implementation

### Test Deferrals
{Tests that need cross-phase infrastructure}
- {test description} — deferred to Phase {X} because {reason}

## Patterns Established
{New code patterns, conventions, or utilities introduced that future phases should reuse}
```

### 2. Update Session State

Update `.agent/session-state.md`:

```markdown
# Session State

## Current Phase
Phase {N} — complete

## Completed Phases
{One-liner per completed phase with PR link}

## Active Architecture
{Current state of the system — updated after each phase, NOT append-only. Keep under 30 lines.}

## Carry-Forward Issues
{Open items from previous phases that affect current/future work}

## Established Patterns
{Accumulated list of patterns/utilities you've created and should reuse}
```

### 3. Update Codebase Profile

If you discovered new patterns, conventions, or tooling during this phase, update `.agent/codebase-profile.md`.

### 4. Update CLAUDE.md Codebase Knowledge

Append new entries to the "Codebase Knowledge" section at the bottom of CLAUDE.md. This section is always loaded in future sessions. Add:
- **Gotchas** — hard-won knowledge about the codebase that would trip up a fresh session (e.g., "RwLock upgrade required — never use .lock().unwrap() in the graph module")
- **Cross-cutting conventions** — error handling patterns, async patterns, ID schemes, serialization approaches that emerged during this phase
- **Module layout changes** — new directories or modules added

Commit: `phase-{N} context: {specific additions}`

### 5. Update Specs if Implementation Diverged

If implementation proved any spec wrong or incomplete, update the spec to match reality. The code and the spec must agree. Do NOT update phase goals or acceptance criteria — only factual errors in specs (wrong data models, impossible API contracts, missing edge cases).

Commit: `phase-{N} docs: deviations, status`

### 6. Run /compact

```
/compact focus on: current session state, established patterns, carry-forward issues, accumulated deviations. Discard sub-agent reports and test output details.
```

## Compaction Rules

- The session-state file is authoritative. When starting a new phase, read `session-state.md` + prior phase ledgers (for deviations) + the current phase plan + product-context docs.
- Phase ledgers are the canonical source for deviations. Read all prior ledgers' Deviations sections when starting a new phase.
- Session state is updated, not appended. The "Active Architecture" section reflects CURRENT state, not a changelog.
- The `.agent/` directory is gitignored. These files are working memory, not project artifacts.
