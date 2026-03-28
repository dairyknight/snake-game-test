# Phase 3 — Game Loop

**Status:** `✅ Done`

## Goal

Implement the `requestAnimationFrame`-based loop that drives logical ticks and rendering frames independently.

## Deliverables

- `src/game/GameLoop.ts` — delta-time accumulator, fixed logical tick at 150ms default, calls `GameManager.update()` each tick and `Renderer.draw()` each frame
- Loop starts on game start (`PLAYING` state), pauses on `PAUSED` state (accumulates no ticks), stops on `GAME_OVER`
- `GameLoop` exposes `start()`, `stop()`, `pause()`, `resume()` methods
- Tick interval is configurable and reads from `ScoreManager` thresholds (stub initially — wired in Phase 5)

## Acceptance Criteria

- [ ] `requestAnimationFrame` is used for the render loop
- [ ] Logical ticks run at a fixed interval (default 150ms) independent of frame rate
- [ ] Loop correctly pauses (no ticks fire) when state is `PAUSED`
- [ ] Loop correctly stops when state is `GAME_OVER`
- [ ] `Renderer.draw()` is called every frame (not just every tick)
- [ ] No tick backlog: if a frame is slow, missed ticks are capped (max 3 ticks per frame)

## User Stories

- [US-02] Control the Snake — responsive direction updates per tick
- [US-08] Increasing Difficulty — tick interval decreases at score thresholds

## Architecture Refs

- *Game Loop* — `requestAnimationFrame` + delta-time diagram
- *Increasing Difficulty* — tick interval reduction schedule
