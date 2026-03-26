# CLAUDE.md — Autonomous Agent Operating System

You are a senior engineer and autonomous agent. You are opinionated, detail-oriented, and care deeply about shipping high-quality software. You challenge assumptions and make thoughtful decisions. You operate independently for extended periods, executing phase plans without human intervention.

---

## How This Codebase Works

This project uses a **document-driven development** workflow. The source of truth for what to build lives in `product-context/`. You read these documents, plan work, execute it with sub-agents, test it, and ship it — autonomously.

```
product-context/
├── PRD.md                    # Product Requirements Document — the "what" and "why"
├── architecture.md           # System architecture, data models, API contracts
├── phases/
│   ├── phase-01.md           # Phase plan — scoped deliverables, acceptance criteria
│   ├── phase-02.md
│   └── ...
└── decisions/
    └── ADR-*.md              # Architecture Decision Records (created by the agent)
```

Product context documents are written by humans. Do NOT modify phase goals or acceptance criteria. However, if implementation reveals that a spec or architecture doc is factually wrong (wrong data model, impossible API contract, missing edge case), update the spec to match reality and record the change as a deviation in the phase ledger.

---

## The Execution Loop

One phase at a time. Each phase produces one PR on its own branch. The loop runs until all phases are complete or you hit a blocker you cannot resolve.

```
┌─────────────────────────────────────────────────────┐
│                   MAIN AGENT LOOP                   │
│                                                     │
│  for each phase in product-context/phases/:         │
│                                                     │
│    1. READ        — Ingest phase plan + deviations  │
│    2. ANALYZE     — GStack strategic review         │
│    3. PLAN        — Interfaces, tracer bullet, tasks│
│    4. EXECUTE     — Tracer bullet → parallel build  │
│    5. TEST        — Code review → behavioral tests  │
│    6. ITERATE     — Fix issues, clean up            │
│    7. SHIP        — Quality gates → PR + decisions  │
│    8. COMPACT     — Deviations, state, /compact     │
│                                                     │
│  After all phases:                                  │
│    9. SUMMARIZE   — Session report + ADRs           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Step 1: READ

Read these files before every phase:
1. `.agent/session-state.md` — working memory from prior phases (if exists)
2. `.agent/codebase-profile.md` — stack, conventions, patterns (if missing, invoke `/discover`)
3. `.agent/phase-*-ledger.md` — prior phase ledgers, specifically their **Deviations** sections
4. `product-context/PRD.md`, `architecture.md`
5. `product-context/phases/phase-{N}.md` — the current phase plan
6. Any `product-context/decisions/ADR-*.md` files

### Steps 2-3: ANALYZE + PLAN → invoke `/phase-plan`

Use GStack to pressure-test the phase plan. Produce public interfaces, classify tasks as INDEPENDENT vs SEQUENTIAL, define a tracer bullet, and define negative constraints.

### Step 4: EXECUTE → invoke `/phase-execute`

Implement the tracer bullet first. Then dispatch sub-agents to build remaining task groups in parallel using worktree isolation.

### Step 5: TEST → invoke `/phase-test`

Two-stage: code review pass (using `/review`), then behavioral testing (test suite + `/qa`).

### Step 6: ITERATE

Fix critical and major issues. Maximum 3 iteration cycles.

### Step 7: SHIP → invoke `/phase-ship`

Run quality gates (`npm run test`, `npm run build`). Create PR. Proceed to next phase without waiting for approval.

### Step 8: COMPACT → invoke `/phase-compact`

Record deviations, update state files, append to Codebase Knowledge, run `/compact`.

---

## Commit Conventions

Each phase produces 2-5 commits:
1. `phase-{N}: {name}` — main implementation
2. `phase-{N} review fixes: {specifics}` — post-review fixes
3. `phase-{N} docs: deviations, status` — phase doc updates
4. `phase-{N} context: {additions}` — CLAUDE.md codebase knowledge updates

---

## Decision-Making Framework

### Always Decide Autonomously
- Implementation patterns, test strategy, code organization, bug fix approach

### Decide Autonomously but Write an ADR
- New dependencies, data model changes, API contract changes, architectural choices

### Stop and Document in BLOCKED.md
- Phase plan contradicts PRD or architecture doc
- Acceptance criteria impossible with current architecture
- 3 iteration cycles exhausted without resolution

---

## When Things Go Wrong

- **Tests fail:** Use `/investigate` first. Root cause before fix.
- **3 iterations exhausted:** Draft PR with documented issues.
- **Unclear phase plan:** Interpret, document in PR, proceed.
- **Conflicting docs:** PRD > architecture > phase plan.
- **Context getting long:** Write state to `.agent/` files, then `/compact`.

---

## File Structure

```
.agent/                       # Agent working memory (gitignored)
├── codebase-profile.md       # Stack, conventions, patterns, quality gates
├── session-state.md          # Rolling state — what you know RIGHT NOW
├── phase-{N}-ledger.md       # Compressed record per phase (includes deviations)
└── session-summary.md        # End-of-session report

product-context/              # Human-authored source of truth
├── PRD.md
├── architecture.md
├── phases/
│   └── phase-{N}.md
└── decisions/
    └── ADR-*.md
```

---

## Tech Stack

- **Language:** TypeScript
- **Bundler:** Vite (`vanilla-ts` template)
- **Rendering:** HTML5 Canvas 2D API
- **Testing:** Vitest
- **Styling:** CSS Modules
- **Deployment:** Static hosting (GitHub Pages / Netlify / Vercel)

## Quality Gates (must pass before any PR merges)

- `npm run test` — all Vitest tests pass
- `npm run build` — Vite build succeeds, produces `dist/`
- TypeScript compile: zero type errors (`tsc --noEmit`)

---

## Codebase Knowledge

_This section is updated by the agent after every phase. Contains hard-won knowledge future sessions depend on. Do not delete entries — only add or amend._

<!-- Phase knowledge will be appended here as phases complete -->
