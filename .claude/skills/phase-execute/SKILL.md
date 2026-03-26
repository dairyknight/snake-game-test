---
name: phase-execute
description: "Phase execution skill (Step 4 of the execution loop). Implements the tracer bullet first to prove interfaces connect, then dispatches sub-agents via the Task tool with worktree isolation to build remaining task groups in parallel, runs sequential integration after the parallel wave, then merges worktree branches into the phase branch. Invoke this skill after /phase-plan completes and before /phase-test. Trigger whenever the agent reaches the EXECUTE step of the main loop."
---

# Phase Execution: Tracer Bullet → Parallel Build

This skill covers Step 4 of the execution loop. You have a set of task groups with implementation plans, public interfaces, a tracer bullet definition, and a dependency graph from `/phase-plan`. Now build it.

## Execution Order

The build happens in three stages, always in this order:

### Stage 1: Tracer Bullet

Before fanning out to parallel sub-agents, implement the tracer bullet defined in `/phase-plan`. This is a minimal end-to-end path that proves the interfaces connect — one input through the system to one output, touching every boundary.

The main agent implements the tracer bullet directly (not via sub-agent) because it requires understanding the full interface surface. Commit the tracer bullet: `phase-{N}: tracer bullet — {what it proves}`.

If the tracer bullet fails, the interfaces are wrong. Fix them before proceeding. Do NOT fan out sub-agents on broken interfaces.

### Stage 2: Parallel Sub-Agents (INDEPENDENT tasks)

Dispatch sub-agents for all tasks classified as INDEPENDENT in the task graph. These run concurrently in isolated worktrees.

### Stage 3: Sequential Integration (SEQUENTIAL tasks)

After the parallel wave completes and merges, implement SEQUENTIAL tasks that depend on the parallel work. Then run the full test suite to verify integration.

## Sub-Agent Rules

All sub-agents are spawned via the `Task` tool.

1. **Sub-agents are stateless.** Each Task call creates a fresh process. The prompt is its entire world — no shared context, no inherited CLAUDE.md.

2. **You are the context broker.** Before every Task call, read the necessary files and paste their contents directly into the prompt. Give sub-agents only the spec sections relevant to their tasks — not the full spec.

3. **Use `isolation: "worktree"`** for every code-writing sub-agent. This gives each one its own git worktree on a temp branch.

4. **Parallelism is bounded.** No more than 4 concurrent Task calls per message.

5. **GStack skills work in sub-agents.** Slash commands (`/review`, `/investigate`, etc.) are available in any Claude Code process.

## Sub-Agent Prompt Template

Before calling Task, read `.agent/codebase-profile.md` and the detailed plan for this task group. Read only the relevant spec sections. Construct a self-contained prompt with all content inlined.

```
# Task tool call for execution sub-agent
# Use isolation: "worktree" for parallel execution safety

prompt: |
  You are an execution sub-agent. You write clean, tested,
  production-quality code. You have no prior context — everything
  you need is below.

  ## Task Group: {group_name}

  ## Public Interfaces
  {INLINE the interface definitions this group implements — the contracts it must satisfy}

  ## Implementation Plan
  {INLINE the full plan for this task group from /phase-plan}

  ## Product Context
  {INLINE only the relevant spec sections — not the full spec}

  ## Codebase Profile
  {INLINE the full contents of .agent/codebase-profile.md}

  ## Code Conventions
  - Test runner: {test_command}
  - Naming: {camelCase/snake_case/etc}
  - Commit format: "phase-{N}: {imperative description}"
  - Read neighboring files before writing new ones to match existing patterns

  ## Negative Constraints
  {INLINE what NOT to do — tests to skip, work to exclude}

  ## Instructions
  Execute the plan step by step. For each step:
  1. Write the code following existing patterns in the codebase
  2. Write the tests using the project's test framework
  3. Run the tests to verify they pass
  4. Commit with a clear message: "phase-{N}: {what this commit does}"

  If you hit a blocker, STOP. Do not guess. Report back with:
  - What you were trying to do
  - What went wrong
  - Your best theory on the fix

isolation: "worktree"
```

## Concurrency Model

To run sub-agents in parallel, issue multiple Task calls in a single message. Each gets its own worktree.

```
# In a SINGLE message, call Task multiple times:

Task(prompt: "...Task Group A...", isolation: "worktree")  ──→ Sub-Agent 1 ─┐
Task(prompt: "...Task Group B...", isolation: "worktree")  ──→ Sub-Agent 2 ─┤
                                                                             │
# Wait for both to complete, then:                                           │
                                                                             │
Task(prompt: "...Task Group C...", isolation: "worktree")  ──→ Sub-Agent 3 ─┘
```

## Merging Worktree Results

After parallel sub-agents complete, each has committed to its own worktree branch. The main agent must:

1. Check out the phase branch: `agent/phase-{N}-{description}`
2. Merge each worktree branch sequentially: `git merge {worktree-branch-name}`
3. If there are merge conflicts, resolve them manually or spin up a sub-agent to resolve.
4. Run the test suite after all merges to verify nothing broke during integration.

The merge order matters if task groups have dependencies — merge the dependency first.

## Commit After Execution

After all stages complete and tests pass, the main implementation should be in one commit (or the accumulated commits from sub-agents merged together):
`phase-{N}: {name} — {one-line summary}`
