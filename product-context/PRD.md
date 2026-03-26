# Snake Game — Product Requirements Document

## Overview

A classic Snake game delivered as a client-side web application. No backend required. The game runs entirely in the browser with all state, logic, and persistence handled client-side.

**Target users:** Casual players on desktop and mobile devices who want a responsive, accessible, and progressively challenging Snake experience.

---

## Goals

1. Deliver a fully playable, polished Snake game in the browser.
2. Support keyboard (desktop) and touch (mobile) input.
3. Persist high scores across sessions via localStorage.
4. Be fully accessible (WCAG AA, keyboard-only navigation).
5. Ship as a static build with zero backend dependencies.

---

## Epics & User Stories

### Epic 1: Core Gameplay

**US-01 — Start a Game**
- A "Start Game" button is visible on the landing screen.
- Clicking it (or pressing a defined key) initialises the game board and spawns the snake.
- The game does not begin moving until the player provides their first directional input.

**US-02 — Control the Snake**
- Arrow keys (↑ ↓ ← →) and WASD change the snake's direction.
- The snake cannot reverse 180° into itself.
- Direction input is responsive with no perceptible lag (< 50ms).

**US-03 — Eat Food**
- One food item is visible on the board at all times.
- When the snake's head occupies the same cell as food, the snake grows by one segment.
- A new food item spawns in a random unoccupied cell immediately after eating.
- Score increments by 10 points per food eaten.

**US-04 — Lose a Game**
- The game ends immediately when the snake's head hits the board boundary or its own body.
- Movement stops and a "Game Over" screen is displayed with the final score.
- The player is offered the option to restart.

**US-05 — Restart a Game**
- A "Play Again" button on the Game Over screen fully resets board, snake, score, and food.
- The new game enters the "waiting for first input" state (not auto-playing).
- Pressing Space/Enter also triggers restart.

---

### Epic 2: Scoring & Progression

**US-06 — View Current Score**
- Score is displayed persistently on-screen in a HUD overlay.
- Score updates in real time each time food is eaten.
- Score never obscures the game board.

**US-07 — Track High Score**
- High score is displayed alongside the current score.
- High score updates immediately when the current game's score exceeds it.
- High score persists across page reloads via localStorage (`snake_high_score`).
- High score resets only when the player explicitly clears it.

**US-08 — Increasing Difficulty**
- Snake movement speed increases at defined score thresholds (every 50 points).
- Speed increases are perceptible but not jarring.
- Maximum speed cap maintains playability.
- Current speed level/tier optionally indicated in UI.

---

### Epic 3: UI & Experience

**US-09 — Responsive Layout**
- Game board scales to fit viewport without cropping.
- On mobile/touch, on-screen directional controls (D-pad or swipe) are available.
- Text and UI elements remain legible at all supported screen sizes.

**US-10 — Pause and Resume**
- Pressing `P` or `Escape` pauses the game and displays a "Paused" overlay.
- Game board and score still visible (frozen) while paused.
- Same key or "Resume" button resumes gameplay from exact paused state.
- Game cannot be controlled while paused.

**US-11 — Visual Feedback on Events**
- Brief animation/colour flash on food eaten (< 500ms).
- Distinct visual effect on game-over (snake flashes red, board dims).
- Feedback animations do not disrupt gameplay flow.

---

### Epic 4: Accessibility

**US-12 — Keyboard-Only Navigation**
- All interactive elements (Start, Pause, Restart, Clear High Score) reachable via Tab and activatable via Enter/Space.
- Focus states visible on all interactive elements.
- No functionality requires mouse or pointer device.

**US-13 — Colour Contrast & Theming**
- All game elements meet WCAG AA contrast ratio (4.5:1 for text, 3:1 for UI components).
- Snake, food, and background are visually distinct.
- Dark mode or high-contrast mode option available in settings.

---

## Out of Scope (v1)

- Multiplayer (WebSocket)
- Global leaderboard (backend API)
- Sound effects
- Themes / skins
- Levels / obstacles

---

## Success Criteria

- All 8 build phases complete and merged.
- All acceptance criteria in US-01 through US-13 met.
- Vitest test suite passes with coverage on Snake, Board, ScoreManager.
- Build output is a deployable static bundle (`vite build` → `dist/`).
