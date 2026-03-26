# Snake Game — User Stories

---

## Epic 1: Core Gameplay

### US-01 — Start a Game
**As a** player,
**I want to** start a new game with a single action,
**so that** I can begin playing immediately without friction.

**Acceptance Criteria:**
- A "Start Game" button or prompt is visible on the landing screen.
- Clicking it (or pressing a defined key) initialises the game board and spawns the snake.
- The game does not begin moving until the player provides their first directional input.

---

### US-02 — Control the Snake
**As a** player,
**I want to** control the snake's direction using keyboard arrow keys (or WASD),
**so that** I can navigate the board to collect food.

**Acceptance Criteria:**
- Arrow keys (↑ ↓ ← →) and WASD all change the snake's direction.
- The snake cannot reverse 180° into itself (e.g. pressing Left while moving Right is ignored).
- Direction input is responsive with no perceptible lag (< 50ms).

---

### US-03 — Eat Food
**As a** player,
**I want to** guide the snake over food items that appear on the board,
**so that** the snake grows and my score increases.

**Acceptance Criteria:**
- One food item is visible on the board at all times.
- When the snake's head occupies the same cell as food, the snake grows by one segment.
- A new food item spawns in a random unoccupied cell immediately after the previous one is eaten.
- The player's score increments by a defined amount (e.g. 10 points) each time food is eaten.

---

### US-04 — Lose a Game
**As a** player,
**I want to** receive a clear game-over state when the snake collides with a wall or itself,
**so that** I know the round has ended and can act accordingly.

**Acceptance Criteria:**
- The game ends immediately when the snake's head hits the board boundary or any of its own body segments.
- Movement stops and a "Game Over" screen is displayed.
- The final score is shown on the Game Over screen.
- The player is offered the option to restart.

---

### US-05 — Restart a Game
**As a** player,
**I want to** restart the game quickly after a game-over,
**so that** I can try to beat my score without reloading the page.

**Acceptance Criteria:**
- A "Play Again" button is displayed on the Game Over screen.
- Pressing the button (or a defined key, e.g. Space/Enter) fully resets board state, snake, score, and food.
- The new game enters the "waiting for first input" state (not auto-playing).

---

## Epic 2: Scoring & Progression

### US-06 — View Current Score
**As a** player,
**I want to** see my current score while playing,
**so that** I can track my progress during a session.

**Acceptance Criteria:**
- The score is displayed persistently on-screen (e.g. header or HUD overlay).
- The score updates in real time each time food is eaten.
- The score is always legible and does not obscure the game board.

---

### US-07 — Track High Score
**As a** player,
**I want to** see my personal high score across sessions,
**so that** I have a goal to beat each time I play.

**Acceptance Criteria:**
- The high score is displayed alongside the current score.
- If the current game's score exceeds the stored high score, the high score updates immediately.
- The high score persists across page reloads using browser local storage.
- The high score resets only when the player explicitly chooses to clear it.

---

### US-08 — Increasing Difficulty
**As a** player,
**I want to** the game to gradually speed up as my score increases,
**so that** the game remains challenging as I improve.

**Acceptance Criteria:**
- The snake's movement speed increases at defined score thresholds (e.g. every 50 points).
- Speed increases are perceptible but not jarring.
- There is a defined maximum speed cap so the game remains playable.
- The current speed level or tier is optionally indicated in the UI.

---

## Epic 3: UI & Experience

### US-09 — Responsive Layout
**As a** player on any device,
**I want to** the game to display correctly on different screen sizes,
**so that** I can play comfortably on desktop or mobile.

**Acceptance Criteria:**
- The game board scales to fit the viewport without cropping or overflow.
- On mobile/touch devices, on-screen directional controls (D-pad or swipe) are available.
- Text and UI elements remain legible at all supported screen sizes.

---

### US-10 — Pause and Resume
**As a** player,
**I want to** pause the game mid-session,
**so that** I can take a break without losing my progress.

**Acceptance Criteria:**
- Pressing `P` or `Escape` pauses the game and displays a "Paused" overlay.
- The game board and score are still visible (but frozen) while paused.
- Pressing the same key (or a "Resume" button) resumes gameplay from the exact state it was paused.
- The game cannot be controlled while paused.

---

### US-11 — Visual Feedback on Events
**As a** player,
**I want to** receive visual feedback when I eat food or the game ends,
**so that** key events feel satisfying and clear.

**Acceptance Criteria:**
- A brief animation or colour flash occurs when food is eaten.
- A distinct visual effect plays on game-over (e.g. snake flashes red, board dims).
- Feedback animations complete in < 500ms and do not disrupt gameplay flow.

---

## Epic 4: Accessibility

### US-12 — Keyboard-Only Navigation
**As a** player who relies on keyboard navigation,
**I want to** access all game controls and menus without a mouse,
**so that** the game is fully usable for me.

**Acceptance Criteria:**
- All interactive elements (Start, Pause, Restart, Clear High Score) are reachable via Tab and activatable via Enter/Space.
- Focus states are visible on all interactive elements.
- No functionality requires a mouse or pointer device.

---

### US-13 — Colour Contrast & Theming
**As a** player with visual impairment,
**I want to** the game to use high-contrast visuals,
**so that** I can distinguish the snake, food, and board clearly.

**Acceptance Criteria:**
- All game elements meet WCAG AA contrast ratio (4.5:1 minimum for text, 3:1 for UI components).
- The snake, food, and background are visually distinct from one another.
- A dark mode or high-contrast mode option is available in settings.
