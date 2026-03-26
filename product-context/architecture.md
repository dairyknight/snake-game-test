# Snake Game — Technical Architecture

---

## Overview

The Snake game is delivered as a client-side web application with no backend dependencies. All game state, logic, and persistence are handled entirely in the browser. The app is structured as a single-page application (SPA) using vanilla TypeScript with an HTML5 Canvas rendering surface, keeping the dependency footprint minimal and the deployment model simple (static file hosting).

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety, IDE support, compile-time error catching |
| Rendering | HTML5 Canvas 2D API | Low-level control, smooth animation via `requestAnimationFrame` |
| Bundler | Vite | Fast HMR for development, optimised production builds |
| Styling | CSS Modules | Scoped styles, no runtime overhead |
| Testing | Vitest + Testing Library | Co-located with Vite, fast unit/integration tests |
| Deployment | Static hosting (e.g. GitHub Pages, Netlify, Vercel) | No server required |

---

## Application Structure

```
snake-game/
├── index.html                  # Entry point
├── src/
│   ├── main.ts                 # App bootstrap, mounts GameManager
│   ├── game/
│   │   ├── GameManager.ts      # Orchestrates game loop, state transitions
│   │   ├── GameLoop.ts         # requestAnimationFrame tick, delta-time control
│   │   ├── Snake.ts            # Snake entity: position, direction, growth
│   │   ├── Food.ts             # Food entity: spawning, position
│   │   ├── Board.ts            # Board dimensions, collision detection
│   │   └── ScoreManager.ts     # Current score, high score, localStorage
│   ├── input/
│   │   ├── KeyboardInput.ts    # Arrow/WASD key handler
│   │   └── TouchInput.ts       # Swipe + on-screen D-pad for mobile
│   ├── renderer/
│   │   ├── Renderer.ts         # Canvas draw calls, clear/repaint cycle
│   │   ├── SnakeRenderer.ts    # Draws snake segments
│   │   ├── FoodRenderer.ts     # Draws food item
│   │   └── UIRenderer.ts       # Draws score HUD, overlays (pause, game-over)
│   ├── ui/
│   │   ├── StartScreen.ts      # Landing screen component
│   │   ├── GameOverScreen.ts   # End state component with final score
│   │   └── PauseOverlay.ts     # Pause state overlay
│   ├── state/
│   │   └── GameState.ts        # Enum + typed state machine (IDLE, PLAYING, PAUSED, GAME_OVER)
│   └── utils/
│       ├── EventEmitter.ts     # Lightweight pub/sub for decoupled communication
│       └── Vector2.ts          # 2D grid position type (x, y)
├── public/
│   └── assets/                 # Static assets (sounds, icons)
├── tests/
│   ├── Snake.test.ts
│   ├── Board.test.ts
│   └── ScoreManager.test.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Architecture

### Game Loop

The game loop uses `requestAnimationFrame` for smooth rendering, decoupled from a fixed logical tick rate for game state updates.

```
requestAnimationFrame
       │
       ▼
  GameLoop.tick(timestamp)
       │
       ├─── accumulate delta time
       │
       ├─── while (accumulated >= TICK_INTERVAL)
       │         │
       │         └─── GameManager.update()   ← logical game step
       │
       └─── Renderer.draw()                  ← visual frame
```

The tick interval (default 150ms) decreases as the player's score increases, producing the difficulty ramp. The renderer always runs at full frame rate, interpolating visuals between logical ticks if needed.

---

### State Machine

Game state is modelled as an explicit finite state machine with the following transitions:

```
         ┌──────────────────────────────────┐
         │                                  │
    [IDLE] ──── first input ────► [PLAYING]
                                      │
                           P/Esc ◄────┤────► P/Esc
                                      │
                                 [PAUSED]
                                      │
                              resume ─┘
                                      │
                              collision
                                      │
                                      ▼
                               [GAME_OVER]
                                      │
                               restart ──► [IDLE]
```

All state transitions are handled by `GameManager`, which emits events via `EventEmitter` so UI components can react without being tightly coupled to game logic.

---

### Snake Entity

The snake is represented as a queue of `Vector2` positions (grid cells), where the head is the first element.

- **Movement:** Each tick, a new head position is computed based on the current direction, and the tail cell is removed — unless the snake just ate food, in which case the tail is retained (growth).
- **Self-collision:** On each tick, the new head position is checked against all existing body positions.
- **Wall collision:** The new head position is checked against board boundaries.

---

### Food Spawning

Food is placed in a random cell that is not currently occupied by any snake segment. If no valid cells remain (the board is full — a win condition), the game ends with a victory state.

---

### Score & Persistence

`ScoreManager` maintains:
- `currentScore` (in-memory, reset on new game)
- `highScore` (synced to `localStorage` under key `snake_high_score`)

Score increments on food consumption. The high score is updated immediately if `currentScore` exceeds it.

---

### Input Handling

**Keyboard (`KeyboardInput.ts`):**
- Listens to `keydown` events on `window`.
- Maps Arrow/WASD keys to direction vectors.
- Buffers one pending direction change per tick to prevent double-reversals from rapid inputs.

**Touch (`TouchInput.ts`):**
- Listens to `touchstart` / `touchend` to detect swipe direction.
- Renders a virtual D-pad overlay on viewports narrower than 768px.
- Swipe threshold: 30px minimum travel.

---

### Rendering

The canvas is sized to the largest square that fits the viewport (maintaining a fixed grid cell count, e.g. 20×20). On resize, the canvas dimensions and cell pixel size are recalculated.

The render cycle each frame:
1. Clear the canvas.
2. Draw the board grid (optional, toggled by settings).
3. Draw food.
4. Draw snake segments (head styled differently from body).
5. Draw HUD (score, high score, speed level).
6. Draw overlay if state is PAUSED or GAME_OVER.

---

## Data Flow

```
User Input
    │
    ▼
InputHandler ──► queues direction
                      │
                      ▼
               GameManager.update()
                      │
                ┌─────┴──────┐
                ▼            ▼
           Snake.move()   Board.checkCollision()
                │            │
                ▼            ▼
         Food.checkEat()  → emit GAME_OVER
                │
                ▼
         ScoreManager.add()
                │
                ▼
           Renderer.draw()
```

---

## Responsiveness & Mobile

- The canvas fills 90vmin (the smaller of viewport width/height) to maintain a square on any orientation.
- On portrait mobile, the virtual D-pad is rendered below the canvas.
- `meta viewport` is set to `width=device-width, initial-scale=1` to prevent unintended scaling.
- Touch event `preventDefault()` is called to suppress scroll interference during gameplay.

---

## Accessibility

- All non-canvas UI (start screen, game-over, pause overlay) is HTML/CSS, not drawn on canvas, to remain accessible to screen readers.
- `aria-live` regions announce score changes and game state transitions.
- All interactive HTML buttons have visible focus rings and keyboard activation.
- Colour palette checked against WCAG AA contrast requirements.

---

## Deployment

The app is a fully static build output (`vite build` → `dist/`). It can be deployed to:
- **GitHub Pages** — via `gh-pages` branch or GitHub Actions CI.
- **Netlify / Vercel** — connect repo, set build command to `vite build`, publish dir to `dist`.

No server, database, or environment variables are required.

---

## Future Considerations

- **Multiplayer** — WebSocket-based server to synchronise two snakes on a shared board.
- **Leaderboard** — Backend API (e.g. Supabase) to persist high scores globally.
- **Sound effects** — Web Audio API for eat/game-over sounds, toggled by a mute button.
- **Themes / Skins** — Configurable colour palettes stored in localStorage.
- **Levels / Obstacles** — Predefined wall layouts loaded from JSON config files.
