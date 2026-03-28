# Phase 4 — Snake & Board Entities

**Status:** `✅ Done`

## Goal

Implement the Snake and Board domain objects with movement, growth, and collision detection.

## Deliverables

- `src/game/Board.ts` — grid dimensions (20×20), boundary collision check, exposes list of occupied cells
- `src/game/Snake.ts` — queue of `Vector2` positions (head is index 0), `move(direction)` method, growth on food eat, self-collision detection
- `src/game/Food.ts` — random unoccupied cell spawn, exposes `position: Vector2`, `respawn(occupied: Vector2[])` method
- Integration in `GameManager.update()`: calls `Snake.move()`, checks `Board.checkCollision()`, checks `Food.checkEat()`; triggers `GAME_OVER` on collision

## Acceptance Criteria

- [ ] Snake starts with 3 segments at board centre, moving right
- [ ] `Snake.move(direction)` computes new head, removes tail (unless growing)
- [ ] 180° direction reversal is blocked (ignored)
- [ ] `Board.checkCollision(pos)` returns `true` for wall hits and self-collision
- [ ] `Food.respawn()` never places food on an occupied cell
- [ ] When food is eaten, snake grows by exactly 1 segment; new food spawns immediately
- [ ] Self-collision detection triggers `GAME_OVER`
- [ ] Wall collision triggers `GAME_OVER`
- [ ] Unit tests cover: movement, growth, wall collision, self-collision, food spawn avoidance

## User Stories

- [US-02] Control the Snake — direction changes applied each tick; 180° reversal blocked
- [US-03] Eat Food — snake grows by one segment; new food spawns immediately
- [US-04] Lose a Game — wall and self-collision triggers `GAME_OVER`

## Architecture Refs

- *Snake Entity* — queue model, movement, collision rules
- *Food Spawning* — random unoccupied cell, full-board win condition
- *Data Flow* — `Snake.move()` → `Food.checkEat()` → `ScoreManager.add()` sequence
