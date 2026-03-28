# Phase 8 — UI Screens (HTML/CSS)

**Status:** `✅ Done`

## Goal

Build the three HTML overlay screens (Start, Game Over, Pause) and wire accessibility features.

## Deliverables

- `src/ui/StartScreen.ts` — "Start Game" button, renders over canvas at `IDLE` state
- `src/ui/GameOverScreen.ts` — final score display, "Play Again" button; visible at `GAME_OVER` state
- `src/ui/PauseOverlay.ts` — "Paused" text overlay, "Resume" button; game board + score still visible behind it
- All screens are HTML/CSS (not drawn on canvas) for screen-reader accessibility
- `aria-live` regions announce score changes and state transitions
- All interactive buttons have visible focus rings (not removed via `outline: none`)
- All buttons are Tab-navigable and activatable via Enter/Space
- A "Clear High Score" button in the Start or Game Over screen that calls `ScoreManager.clearHighScore()`
- WCAG AA colour contrast across all UI elements

## Acceptance Criteria

- [ ] `StartScreen` visible only in `IDLE` state; hidden in all other states
- [ ] `GameOverScreen` visible only in `GAME_OVER` state; shows correct final score
- [ ] `PauseOverlay` visible only in `PAUSED` state; canvas still visible behind it
- [ ] "Play Again" button triggers `restartGame()` and returns to `IDLE`
- [ ] "Resume" button triggers `resumeGame()` and returns to `PLAYING`
- [ ] All buttons reachable by Tab from any screen state
- [ ] Focus rings visible on all interactive elements
- [ ] Score `aria-live` region updates on each food eat
- [ ] State transitions announced to screen readers
- [ ] "Clear High Score" button resets high score display and localStorage

## User Stories

- [US-01] Start a Game — Start screen with button
- [US-04] Lose a Game — Game Over screen with final score
- [US-05] Restart a Game — "Play Again" button resets full state
- [US-10] Pause and Resume — Pause overlay with Resume button
- [US-12] Keyboard-Only Navigation — Tab + Enter/Space on all controls
- [US-13] Colour Contrast & Theming — WCAG AA on all UI elements

## Architecture Refs

- *Accessibility* — HTML/CSS screens, focus rings, aria-live
- *State Machine* — screen visibility tied to FSM state
