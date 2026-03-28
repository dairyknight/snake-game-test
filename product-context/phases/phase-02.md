# Phase 2 — Game State Machine & Event System

**Status:** `✅ Done`

## Goal

Establish the core state machine and pub/sub event system that all other modules communicate through.

## Deliverables

- `src/state/GameState.ts` — `IDLE | PLAYING | PAUSED | GAME_OVER` enum and typed transitions
- `src/utils/EventEmitter.ts` — lightweight pub/sub for decoupled inter-module communication
- `src/utils/Vector2.ts` — 2D grid position type used by Snake and Board
- `src/game/GameManager.ts` — owns state machine, wires together all subsystems, exposes `update()` and state transition methods (`startGame()`, `pauseGame()`, `resumeGame()`, `endGame()`, `restartGame()`)

## Acceptance Criteria

- [ ] `GameState` enum has exactly four values: `IDLE`, `PLAYING`, `PAUSED`, `GAME_OVER`
- [ ] Transitions: `IDLE → PLAYING`, `PLAYING ↔ PAUSED`, `PLAYING → GAME_OVER`, `GAME_OVER → IDLE`
- [ ] Invalid transitions (e.g. `IDLE → PAUSED`) are silently ignored or throw a typed error
- [ ] `EventEmitter` supports `on(event, handler)`, `off(event, handler)`, `emit(event, data)` with TypeScript generics
- [ ] `Vector2` has `x`, `y` properties and an `equals(other: Vector2)` method
- [ ] `GameManager` emits events on each state transition
- [ ] Unit tests cover all valid and invalid state transitions

## User Stories

- [US-01] Start a Game — IDLE → PLAYING transition
- [US-04] Lose a Game — PLAYING → GAME_OVER transition
- [US-05] Restart a Game — GAME_OVER → IDLE transition
- [US-10] Pause and Resume — PLAYING ↔ PAUSED transitions

## Architecture Refs

- *State Machine* — full FSM diagram and transition rules
- *Data Flow* — `GameManager.update()` as central orchestrator
