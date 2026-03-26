# Phase 5 — Scoring & Difficulty

**Status:** `⬜ Not Started`

## Goal

Track score, persist high score to localStorage, and increase speed as score grows.

## Deliverables

- `src/game/ScoreManager.ts`:
  - `currentScore: number` (in-memory, reset on new game)
  - `highScore: number` (synced to localStorage under key `snake_high_score`)
  - `add(points: number)` — increments score, updates high score if exceeded, emits events
  - `reset()` — resets `currentScore` to 0 (does not touch `highScore`)
  - `clearHighScore()` — clears `highScore` from localStorage and in-memory
  - `getTickInterval(): number` — returns current tick interval based on score thresholds
- Score increments by 10 points per food eaten
- Speed ramp schedule:
  - 0–49 pts → 150ms
  - 50–99 pts → 130ms
  - 100–149 pts → 110ms
  - 150–199 pts → 90ms
  - 200+ pts → 75ms (minimum/cap)
- `GameLoop` reads `ScoreManager.getTickInterval()` on each tick to apply current speed
- Wire `ScoreManager.add(10)` into `GameManager.update()` on food eat

## Acceptance Criteria

- [ ] Score increments by 10 each time food is eaten
- [ ] High score updates in real-time when `currentScore` exceeds it
- [ ] High score survives page reload (localStorage)
- [ ] `clearHighScore()` removes the localStorage key
- [ ] `getTickInterval()` returns correct interval for each score bracket
- [ ] `GameLoop` uses current tick interval (dynamically reads it each tick cycle)
- [ ] `ScoreManager.reset()` zeros `currentScore` without clearing high score
- [ ] Unit tests cover: scoring, high score update, persistence mock, speed thresholds

## User Stories

- [US-06] View Current Score — `currentScore` exposed for HUD
- [US-07] Track High Score — `highScore` persists via localStorage
- [US-08] Increasing Difficulty — speed ramp tied to score thresholds

## Architecture Refs

- *Score & Persistence* — `currentScore`, `highScore`, `localStorage` key
- *Game Loop* — tick interval reduction schedule
