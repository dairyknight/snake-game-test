---
name: autonomous-decisions
description: |
  Canonical autonomous decision format. Referenced by all skills that make decisions
  without human interaction (cso, design-review, plan-design-review, plan-eng-review,
  ship). Not invoked directly — skills reference this format inline.
---

# Autonomous Decision Format

When making decisions autonomously during extended operation, document each decision:

```
DECISION: [What was decided]
CONTEXT: [Why this decision point arose — 1-2 sentences]
OPTIONS: [Options considered, if multiple]
CHOICE: [Which option was selected]
REASONING: [Why — reference decision principles where applicable]
CONFIDENCE: [HIGH/MEDIUM/LOW — omit for routine decisions]
```
