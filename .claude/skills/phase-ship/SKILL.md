---
name: phase-ship
description: "Phase shipping skill (Step 7 of the execution loop). Runs quality gates (lint, format, typecheck, test, build), runs final /review and /ship, opens a PR with decision log and test results, and creates ADRs for architectural changes. No phase ships until all quality gates pass. Invoke this skill after tests pass and iteration is complete. Trigger whenever the agent reaches the SHIP step of the main loop."
---

# Phase Shipping: Quality Gates → PR + Decision Log

This skill covers Step 7 of the execution loop. Tests pass, issues are resolved. Now run quality gates and ship.

## Quality Gates

Before anything else, run every quality gate command from `.agent/codebase-profile.md` (the "Quality Gates" section populated by `/discover`). All must pass. No exceptions.

```bash
# Example quality gates (actual commands come from codebase-profile.md):
# 1. Lint:       eslint . --max-warnings 0  /  cargo clippy -- -D warnings  /  ruff check .
# 2. Format:     prettier --check .  /  cargo fmt --check  /  ruff format --check .
# 3. Typecheck:  tsc --noEmit  /  mypy .  /  pyright
# 4. Test:       npm test  /  cargo test  /  pytest
# 5. Build:      npm run build  /  cargo build --release
```

If any gate fails:
- Fix the issue.
- Commit the fix as part of the review fixes commit (if not already committed) or as a new fix commit.
- Re-run all gates from the beginning. They must all pass in one clean run.

## Branching Strategy

- Each phase gets its own branch: `agent/phase-{N}-{short-description}`
- Branch off the latest main (or off the previous phase branch if phases are sequential and unmerged).
- Never push directly to main. Always raise a PR.

## Shipping Protocol

### 1. Final Review
Run GStack `/review` one final time on all changes.

### 2. Push and Open PR
Run GStack `/ship` to sync, test, and push.

### 3. PR Template

Create the PR with this structure:

```markdown
## Phase {N}: {Phase Title}

### Summary
{2-3 sentences on what was built and why}

### Changes
{Grouped list of what changed, organized by area}

### Decisions Made
{Every autonomous decision the agent made, with reasoning}
| Decision | Options Considered | Choice | Reasoning |
|----------|-------------------|--------|-----------|
| ...      | ...               | ...    | ...       |

### Architecture Changes
{If any architectural changes were made, explain:}
- What changed
- Why it changed
- What alternatives were considered
- Impact on future phases

### Deviations from Spec
{Any deviations recorded during this phase — what was specified vs what was built, and why}

### Test Results
- Quality gates: all passed
- Unit/Integration: {pass/fail summary}
- QA: {pass/fail summary}
- Design Review: {pass/fail summary, if applicable}
- Security Audit: {pass/fail summary, if applicable}

### Known Issues / Tech Debt
{Anything deferred, with reasoning for deferral and which phase it's tracked in}

### ADRs Created
{Links to any new Architecture Decision Records}
```

### 4. Architecture Decision Records

If architectural changes were made during this phase, create an ADR in `product-context/decisions/`:

```markdown
# ADR-{NNN}: {Title}

## Status
Accepted

## Context
{What prompted this decision}

## Decision
{What was decided}

## Alternatives Considered
{What else was on the table}

## Consequences
{What this means for future work — both positive and negative}
```

### 5. Proceed

Do NOT wait for PR approval — proceed immediately to the next phase. PRs are reviewed asynchronously by humans.
