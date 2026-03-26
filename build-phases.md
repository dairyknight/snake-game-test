# Snake Game — Build Phases

Each phase references the relevant user stories and technical architecture sections it delivers. On completion, an agent should update the `**Status:**` field to `✅ Done`.

---

## Phase 1 — Project Scaffolding

**Status:** `⬜ Not Started`

**Goal:** Establish the project skeleton so all subsequent phases have a working foundation to build on.

**Delivers:**
- Initialise repo with Vite + TypeScript (`npm create vite@latest`)
- Configure `tsconfig.json` and `vite.config.ts`
- Create directory structure as defined in architecture (`src/game`, `src/input`, `src/renderer`, `src/ui`, `src/state`, `src/utils`)
- Add `index.html` with a `<canvas>` element and `meta viewport` tag
- Add `src/main.ts` bootstrap entry point
- Confirm dev server runs (`npm run dev`)

**User Stories:** None (foundational — no user-facing behaviour)

**Architecture Refs:**
- *Application Structure* — full directory layout
- *Technology Stack* — TypeScript, Vite, CSS Modules
- *Deployment* — static build output via `vite build`

---

## Phase 2 — Game State Machine & Event System

**Status:** `⬜ Not Started`

**Goal:** Establish the core state machine and pub/sub event system that all other modules communicate through.

**Delivers:**
- `src/state/GameState.ts` — `IDLE | PLAYING | PAUSED | GAME_OVER` enum and typed transitions
- `src/utils/EventEmitter.ts` — lightweight pub/sub for decoupled inter-module communication
- `src/utils/Vector2.ts` — 2D grid position type used by Snake and Board
- `src/game/GameManager.ts` — owns state machine, wires together all subsystems, exposes `update()` and state transition methods

**User Stories:**
- [US-01] Start a Game — IDLE → PLAYING transition
- [US-04] Lose a Game — PLAYING → GAME_OVER transition
- [US-05] Restart a Game — GAME_OVER → IDLE transition
- [US-10] Pause and Resume — PLAYING ↔ PAUSED transitions

**Architecture Refs:**
- *State Machine* — full FSM diagram and transition rules
- *Data Flow* — `GameManager.update()` as central orchestrator

---

## Phase 3 — Game Loop

**Status:** `⬜ Not Started`

**Goal:** Implement the `requestAnimationFrame`-based loop that drives logical ticks and rendering frames independently.

**Delivers:**
- `src/game/GameLoop.ts` — delta-time accumulator, fixed logical tick at 150ms, calls `GameManager.update()` each tick and `Renderer.draw()` each frame
- Loop starts on game start, pauses on PAUSED state, stops on GAME_OVER

**User Stories:**
- [US-02] Control the Snake — responsive direction updates per tick
- [US-08] Increasing Difficulty — tick interval decreases at score thresholds

**Architecture Refs:**
- *Game Loop* — `requestAnimationFrame` + delta-time diagram
- *Increasing Difficulty* — tick interval reduction schedule

---

## Phase 4 — Snake & Board Entities

**Status:** `⬜ Not Started`

**Goal:** Implement the Snake and Board domain objects with movement, growth, and collision detection.

**Delivers:**
- `src/game/Board.ts` — grid dimensions, boundary collision check, exposes list of occupied cells
- `src/game/Snake.ts` — queue of `Vector2` positions, `move(direction)`, growth on food eat, self-collision detection
- `src/game/Food.ts` — random unoccupied cell spawn, exposes current position
- Integration: `GameManager.update()` calls `Snake.move()`, checks `Board.checkCollision()`, checks `Food.checkEat()`

**User Stories:**
- [US-02] Control the Snake — direction changes applied each tick; 180° reversal blocked
- [US-03] Eat Food — snake grows by one segment; new food spawns immediately
- [US-04] Lose a Game — wall and self-collision triggers GAME_OVER

**Architecture Refs:**
- *Snake Entity* — queue model, movement, collision rules
- *Food Spawning* — random unoccupied cell, full-board win condition
- *Data Flow* — `Snake.move()` → `Food.checkEat()` → `ScoreManager.add()` sequence

---

## Phase 5 — Scoring & Difficulty

**Status:** `⬜ Not Started`

**Goal:** Track score, persist high score to localStorage, and increase speed as score grows.

**Delivers:**
- `src/game/ScoreManager.ts` — `currentScore`, `highScore`, `add(points)`, `reset()`, localStorage sync under key `snake_high_score`
- Score increments by 10 points on food eat
- High score updates immediately when exceeded
- `GameLoop` reads score thresholds from `ScoreManager` to reduce tick interval (speed ramp)
- Expose `clearHighScore()` for settings UI

**User Stories:**
- [US-06] View Current Score — `currentScore` exposed for HUD
- [US-07] Track High Score — `highScore` persists across sessions via localStorage
- [US-08] Increasing Difficulty — speed ramp tied to score thresholds

**Architecture Refs:**
- *Score & Persistence* — `currentScore`, `highScore`, `localStorage` key
- *Game Loop* — tick interval reduction schedule

---

## Phase 6 — Rendering

**Status:** `⬜ Not Started`

**Goal:** Implement the full canvas rendering pipeline — board, snake, food, and HUD.

**Delivers:**
- `src/renderer/Renderer.ts` — clear/repaint cycle, orchestrates sub-renderers
- `src/renderer/SnakeRenderer.ts` — draws body segments, head styled distinctly
- `src/renderer/FoodRenderer.ts` — draws food cell
- `src/renderer/UIRenderer.ts` — draws score/high score HUD; brief flash animation on food eat; game-over visual effect (snake flashes red, board dims)
- Canvas sizing: fills `90vmin`, recalculates cell size on viewport resize
- Optional grid overlay (toggled by settings flag)

**User Stories:**
- [US-06] View Current Score — score HUD always visible and legible
- [US-11] Visual Feedback on Events — eat flash < 500ms; game-over effect
- [US-13] Colour Contrast & Theming — snake, food, background visually distinct; WCAG AA contrast

**Architecture Refs:**
- *Rendering* — canvas sizing, render cycle steps 1–6
- *Responsiveness & Mobile* — `90vmin` canvas, resize recalculation

---

## Phase 7 — Input Handling

**Status:** `⬜ Not Started`

**Goal:** Wire up keyboard controls and a direction-change buffer so input is responsive and safe.

**Delivers:**
- `src/input/KeyboardInput.ts` — `keydown` listener on `window`, Arrow + WASD → direction vector mapping, one-per-tick input buffer, 180° reversal rejection
- `P` / `Escape` keys trigger PLAYING ↔ PAUSED transition via `GameManager`
- `Space` / `Enter` on IDLE or GAME_OVER screens trigger start / restart

**User Stories:**
- [US-02] Control the Snake — Arrow/WASD, < 50ms response, no 180° reversal
- [US-10] Pause and Resume — P/Esc toggles pause
- [US-12] Keyboard-Only Navigation — all controls reachable without mouse

**Architecture Refs:**
- *Input Handling — Keyboard* — `keydown`, direction buffer, reversal guard

---

## Phase 8 — UI Screens (HTML/CSS)

**Status:** `⬜ Not Started`

**Goal:** Build the three HTML overlay screens (Start, Game Over, Pause) so they are accessible to screen readers and keyboard users.

**Delivers:**
- `src/ui/StartScreen.ts` — "Start Game" button, renders over canvas at IDLE state
- `src/ui/GameOverScreen.ts` — final score display, "Play Again" button
- `src/ui/PauseOverlay.ts` — "Paused" overlay, "Resume" button, game board/score still visible behind
- All screens are HTML/CSS (not drawn on canvas) with visible focus rings, Tab-navigable buttons
- `aria-live` region announces state transitions (game over, paused, score updates)

**User Stories:**
- [US-01] Start a Game — Start screen with button
- [US-04] Lose a Game — Game Over screen with final score
- [US-05] Restart a Game — "Play Again" button resets full state
- [US-10] Pause and Resume — Pause overlay with Resume button
- [US-12] Keyboard-Only Navigation — Tab + Enter/Space activates all buttons

**Architecture Refs:**
- *Accessibility* — HTML/CSS screens, `aria-live`, focus rings
- *State Machine* — screen visibility tied to FSM state

---

## Phase 9 — Mobile & Responsive Support

**Status:** `⬜ Not Started`

**Goal:** Make the game fully playable on touch devices with swipe detection and a virtual D-pad.

**Delivers:**
- `src/input/TouchInput.ts` — `touchstart`/`touchend` swipe detection (30px threshold), virtual D-pad rendered on viewports < 768px wide
- `preventDefault()` on touch events to suppress scroll interference
- Canvas and UI scale correctly in portrait and landscape orientations
- D-pad hidden on desktop

**User Stories:**
- [US-09] Responsive Layout — board scales to viewport; on-screen controls on mobile

**Architecture Refs:**
- *Input Handling — Touch* — swipe threshold, D-pad overlay
- *Responsiveness & Mobile* — `90vmin`, D-pad below canvas in portrait, viewport meta tag

---

## Phase 10 — Accessibility Polish

**Status:** `⬜ Not Started`

**Goal:** Ensure the game meets WCAG AA standards and is fully operable without a mouse.

**Delivers:**
- Audit and fix all colour contrast ratios (4.5:1 text, 3:1 UI components)
- Dark mode / high-contrast toggle stored in localStorage
- All interactive elements reachable by Tab, activated by Enter/Space
- Screen reader announcements for score increments and state changes via `aria-live`
- Manual keyboard-only walkthrough of full game flow (start → play → pause → resume → game over → restart)

**User Stories:**
- [US-12] Keyboard-Only Navigation — full Tab + Enter/Space operability
- [US-13] Colour Contrast & Theming — WCAG AA, dark/high-contrast mode

**Architecture Refs:**
- *Accessibility* — `aria-live`, focus rings, HTML/CSS screens
- *Rendering* — colour palette contrast requirements

---

## Phase 11 — Testing

**Status:** `⬜ Not Started`

**Goal:** Establish a unit test suite covering core game logic to prevent regressions.

**Delivers:**
- `tests/Snake.test.ts` — movement, growth, self-collision, 180° reversal rejection
- `tests/Board.test.ts` — boundary collision detection, occupied cell tracking
- `tests/ScoreManager.test.ts` — increment, high score update, localStorage persistence, reset
- All tests pass via `npm run test` (Vitest)
- CI workflow (GitHub Actions) runs tests on every push to `main`

**User Stories:** All stories — tests guard against regressions in all implemented behaviour

**Architecture Refs:**
- *Technology Stack* — Vitest + Testing Library
- *Application Structure* — `tests/` directory

---

## Phase 12 — Deployment

**Status:** `⬜ Not Started`

**Goal:** Publish the game as a live, publicly accessible web app.

**Delivers:**
- Production build confirmed clean (`npm run build` → `dist/`)
- GitHub Actions workflow deploys `dist/` to GitHub Pages on merge to `main`
- Live URL verified: game loads, plays, and scores correctly in Chrome, Firefox, and Safari
- README updated with live URL and local dev instructions

**User Stories:** All stories — confirms the full product is live and working end-to-end

**Architecture Refs:**
- *Deployment* — `vite build`, GitHub Pages via `gh-pages` / GitHub Actions
- *Technology Stack* — static hosting, no server required
