# Phase 7 — Input Handling

**Status:** `✅ Done`

## Goal

Wire up keyboard controls and a direction-change buffer so input is responsive and safe.

## Deliverables

- `src/input/KeyboardInput.ts`:
  - `keydown` listener on `window`
  - Arrow + WASD → direction `Vector2` mapping
  - One-pending-direction buffer per tick (prevents double-reversals from rapid inputs)
  - 180° reversal rejection (same logic as `Snake.move()` guard)
  - `P` / `Escape` → trigger `GameManager.pauseGame()` / `resumeGame()`
  - `Space` / `Enter` on `IDLE` or `GAME_OVER` → trigger `startGame()` / `restartGame()`
  - `destroy()` method to remove event listeners (cleanup)
- `src/input/TouchInput.ts`:
  - `touchstart` / `touchend` swipe detection (30px minimum threshold)
  - Renders virtual D-pad overlay on viewports < 768px wide
  - Calls same direction-change method as keyboard input
  - `preventDefault()` on touch events to suppress scroll interference
  - `destroy()` method to remove event listeners (cleanup)

## Acceptance Criteria

- [ ] All Arrow and WASD keys change direction
- [ ] 180° reversals are ignored (pressing Left while moving Right is a no-op)
- [ ] Only one direction change is applied per tick (buffer queues at most one pending)
- [ ] `P` and `Escape` toggle pause correctly from `PLAYING`
- [ ] `Space`/`Enter` starts a new game from `IDLE` or restarts from `GAME_OVER`
- [ ] Swipe gestures on mobile change direction
- [ ] D-pad renders on viewports < 768px
- [ ] Touch events do not cause page scroll during gameplay
- [ ] Input listeners are properly removed on `destroy()`

## User Stories

- [US-02] Control the Snake — Arrow/WASD, < 50ms response, no 180° reversal
- [US-09] Responsive Layout — touch/swipe and D-pad for mobile
- [US-10] Pause and Resume — P/Esc toggles pause

## Architecture Refs

- *Input Handling — Keyboard* — `keydown`, direction buffer, reversal guard
- *Input Handling — Touch* — swipe threshold, D-pad overlay, `preventDefault`
