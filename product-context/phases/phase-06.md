# Phase 6 — Rendering

**Status:** `✅ Done`

## Goal

Implement the full canvas rendering pipeline — board, snake, food, and HUD.

## Deliverables

- `src/renderer/Renderer.ts` — orchestrates clear/repaint cycle, delegates to sub-renderers
- `src/renderer/SnakeRenderer.ts` — draws body segments; head styled distinctly (different colour/shape)
- `src/renderer/FoodRenderer.ts` — draws food cell (distinct colour, optionally with pulsing or shape)
- `src/renderer/UIRenderer.ts`:
  - Draws score and high score HUD (always visible)
  - Brief flash animation on food eat (< 500ms colour flash)
  - Game-over visual effect: snake flashes red, board dims with overlay
- Canvas sizing: fills `90vmin` (largest square fitting viewport); recalculates cell size on `resize` event
- Optional grid overlay toggled by a `showGrid: boolean` setting flag
- Render cycle order per frame:
  1. Clear canvas
  2. Draw board (optional grid)
  3. Draw food
  4. Draw snake (body then head)
  5. Draw HUD (score, high score, speed tier)
  6. Draw overlay if `PAUSED` or `GAME_OVER`

## Acceptance Criteria

- [ ] Canvas resizes correctly when viewport changes; cell size recalculates
- [ ] Snake head is visually distinct from body segments
- [ ] Food is clearly distinguishable from snake and board
- [ ] HUD displays current score and high score at all times
- [ ] Eat flash animation fires and completes within 500ms
- [ ] Game-over effect fires on `GAME_OVER` state (board dim + snake flash)
- [ ] Grid overlay renders when `showGrid` is `true`
- [ ] All visual elements meet WCAG AA colour contrast

## User Stories

- [US-06] View Current Score — score HUD always visible and legible
- [US-11] Visual Feedback on Events — eat flash < 500ms; game-over effect

## Architecture Refs

- *Rendering* — canvas sizing, render cycle steps 1–6
