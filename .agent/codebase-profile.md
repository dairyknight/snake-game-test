# Codebase Profile

## Stack
- Language: TypeScript (strict)
- Framework: Vanilla TypeScript — no UI framework
- Bundler: Vite (`vanilla-ts` template)
- Rendering: HTML5 Canvas 2D API
- Testing: Vitest
- Styling: CSS Modules
- Key dependencies: vite, typescript, vitest

## Test Runner
- Command: `npm run test`
- Framework: Vitest (co-located in `tests/`)
- Coverage targets: Snake, Board, ScoreManager

## Code Style
- Naming: PascalCase for classes/files, camelCase for methods/variables
- File organization: layer-based (`src/game`, `src/input`, `src/renderer`, `src/ui`, `src/state`, `src/utils`)
- Formatting: TypeScript strict mode, no linter config specified — default to 2-space indent
- Imports: relative paths

## CI/CD
- Platform: None configured (green-field)
- Deployment: Static build → GitHub Pages / Netlify / Vercel

## Quality Gates
Run these commands in order. All must pass before shipping.
1. `npx tsc --noEmit` — zero TypeScript errors
2. `npm run test` — all Vitest tests pass
3. `npm run build` — Vite build succeeds, produces `dist/`

## Patterns
- Error handling: TypeScript type safety as primary guard; no custom error types specified
- Logging: none specified
- Config: no env vars required; localStorage for high score persistence (`snake_high_score`)
- Database: none — localStorage only
- API: none — client-side only
- Auth: none

## Architecture Notes
- State machine: IDLE → PLAYING ↔ PAUSED → GAME_OVER → IDLE
- Game loop: rAF-based, fixed 150ms tick for logic, full frame rate for rendering
- Snake: queue of Vector2 positions; head is index 0
- Food: random unoccupied cell spawn
- Canvas: 90vmin square, recalculated on resize
- Input buffer: one pending direction per tick to prevent double-reversals
