---
name: phase-plan
description: "Phase planning skill covering analysis and task decomposition (Steps 2-3 of the execution loop). Runs GStack strategic reviews, reviews accumulated deviations from prior phases, produces public interfaces, classifies tasks as INDEPENDENT vs SEQUENTIAL, defines a tracer bullet, sets negative constraints, and dispatches planning sub-agents via the Task tool. Invoke this skill after reading the phase plan (Step 1) and before executing code (Step 4). Trigger whenever the agent reaches the ANALYZE or PLAN step of the main loop."
---

# Phase Planning: Analyze + Decompose

This skill covers Steps 2 (ANALYZE) and 3 (PLAN) of the execution loop. You've already read the phase plan, product context, and prior phase ledgers (including their deviations) in Step 1. Now pressure-test the plan and break it into executable task groups.

## Step 2: Analyze with GStack

### Review Accumulated Deviations

Before running any GStack reviews, cross-reference the current phase plan against all deviations from prior phases:
- Are any tasks in this phase blocked by a deferred task from an earlier phase?
- Does this phase depend on a stub that was left in place? If so, is it scoped to fill that stub?
- Did a prior spec divergence change an assumption this phase builds on?
- Were any tests deferred to this phase?

Adjust your understanding of the phase plan based on these findings. If a deviation materially changes the scope, note it — it will go in the PR.

### GStack Reviews

- Run `/plan-eng-review` to validate architecture, identify edge cases, and flag technical risks.
- If the phase involves UI: run `/plan-design-review` to score design dimensions.
- If the phase touches auth, data storage, or external APIs: run `/cso` for a security review.

**Decision authority:** You MAY adjust the implementation approach based on these reviews and deviation analysis. You must NOT change the phase's stated goal or acceptance criteria. If the reviews reveal that the phase plan is fundamentally flawed, document this in a `BLOCKED.md` file and stop.

**Output:** An annotated version of the phase plan with: confirmed scope, technical approach, risks identified, deviations accounted for, and any adjustments you are making (with reasoning).

## Step 3: Produce the Plan

Before decomposing into task groups, produce these four artifacts. Do NOT write code yet.

### 3a. Public Interfaces
Define the public interfaces this phase will create or modify: structs, types, traits, function signatures, API endpoints, database schema changes. These become the contracts that sub-agents code against and that the tracer bullet will verify.

### 3b. Task Graph with Dependency Classification
List every task and classify it:
- **INDEPENDENT** — can run in parallel with other independent tasks (no shared files, interfaces are defined)
- **SEQUENTIAL** — depends on another task completing first (shares interfaces, data models, or test fixtures)

This classification directly determines what runs in parallel vs. what waits.

### 3c. Tracer Bullet Definition
Define a minimal end-to-end path through this phase's deliverables: one input, one output, touching every interface boundary. The tracer bullet proves the interfaces connect before you invest in the full build.

Example: "Parse one PPTX with one text_box → produce valid NDJSON output" or "Create one user via API → verify JWT returned → access protected endpoint."

### 3d. Negative Constraints
Explicitly state what this phase should NOT do:
- Tests NOT to write here (e.g., "Do not test enrichment quality — that's Phase 5")
- Work NOT to include (e.g., "No performance optimization — that's Phase 9B")
- Parallelism constraints (e.g., "No sub-agents for this phase — execute sequentially")

These prevent the agent from over-building.

## Dispatching Planning Sub-Agents

After producing the four artifacts above, decompose into task groups and dispatch planning sub-agents.

### How to Decompose

- Group tasks by **co-dependency** — things that must be built together because they share interfaces, data models, or test fixtures.
- Each task group should be completable by a single sub-agent in one session.
- Target 3-7 task groups per phase. If you have more than 7, the phase is too big — flag it.
- Each task group gets: a clear objective, the files it will touch, the tests it must pass, and its dependencies on other groups.

### Sub-Agent Prompt

Before calling Task, you MUST:
1. Read `.agent/codebase-profile.md` and extract its contents.
2. Read the relevant product context files and extract the sections pertinent to this task group — not the full spec, only the sections relevant to this group's tasks.
3. Construct a self-contained prompt that includes all of this content inline.

```
# Task tool call for planning sub-agent

prompt: |
  You are a planning sub-agent. Your job is to create a detailed
  implementation plan for a task group. You have no prior context —
  everything you need is below.

  ## Task Group: {group_name}
  **Objective:** {what this group delivers}
  **Files to touch:** {explicit file paths}
  **Dependencies:** {other task groups this depends on or that depend on it}
  **Acceptance criteria:** {how we know this is done}
  **Negative constraints:** {what NOT to do}

  ## Public Interfaces
  {INLINE the interface definitions from Step 3a that this group implements or depends on}

  ## Product Context
  {INLINE only the relevant sections from specs — not the full spec}

  ## Codebase Profile
  {INLINE the full contents of .agent/codebase-profile.md}

  ## Relevant Deviations from Prior Phases
  {INLINE any deviations that affect this task group}

  ## Instructions
  Create a step-by-step implementation plan. For each step, specify:
  1. What to do
  2. Which file(s) to modify or create
  3. What tests to write (use the test runner: {test_command from profile})
  4. What could go wrong

  Do NOT write code. Only plan.
```

### Output

An ordered list of task groups with dependency graph, the four planning artifacts (interfaces, task graph, tracer bullet, negative constraints), ready for `/phase-execute`.
