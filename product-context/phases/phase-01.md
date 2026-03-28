# Phase 1 — Project Scaffolding

**Status:** `✅ Done`

## Goal

Establish the project skeleton so all subsequent phases have a working foundation to build on.

## Deliverables

- Initialise repo with Vite + TypeScript (`npm create vite@latest` with `vanilla-ts` template)
- Configure `tsconfig.json` and `vite.config.ts`
- Create directory structure as defined in architecture:
  - `src/game/`
  - `src/input/`
  - `src/renderer/`
  - `src/ui/`
  - `src/state/`
  - `src/utils/`
  - `tests/`
  - `public/assets/`
- Add `index.html` with a `<canvas id="game-canvas">` element and `meta viewport` tag
- Add `src/main.ts` bootstrap entry point (mounts GameManager)
- Install Vitest for testing (`npm install -D vitest`)
- Confirm dev server runs (`npm run dev`) and `npm run build` produces a `dist/`
- Confirm `npm run test` runs (even with zero tests)

## Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces `dist/` with `index.html`
- [ ] `npm run test` executes without crashing
- [ ] Directory structure matches architecture spec
- [ ] `<canvas>` element present in `index.html` with correct `id`

## User Stories

None (foundational — no user-facing behaviour)

## Architecture Refs

- *Application Structure* — full directory layout
- *Technology Stack* — TypeScript, Vite, CSS Modules
- *Deployment* — static build output via `vite build`
