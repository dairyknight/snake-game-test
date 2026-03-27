import { GameManager } from '../game/GameManager'
import { GameState } from '../state/GameState'
import { vec2 } from '../utils/Vector2'

const DIRECTION_MAP: Record<string, { x: number; y: number }> = {
  ArrowUp:    { x: 0, y: -1 },
  w:          { x: 0, y: -1 },
  W:          { x: 0, y: -1 },
  ArrowDown:  { x: 0, y: 1 },
  s:          { x: 0, y: 1 },
  S:          { x: 0, y: 1 },
  ArrowLeft:  { x: -1, y: 0 },
  a:          { x: -1, y: 0 },
  A:          { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d:          { x: 1, y: 0 },
  D:          { x: 1, y: 0 },
}

export class KeyboardInput {
  private readonly gm: GameManager
  private readonly handler: (e: KeyboardEvent) => void

  constructor(gm: GameManager) {
    this.gm = gm
    this.handler = this.onKeyDown.bind(this)
    window.addEventListener('keydown', this.handler)
  }

  private onKeyDown(e: KeyboardEvent): void {
    const dir = DIRECTION_MAP[e.key]
    if (dir) {
      e.preventDefault()
      const current = this.gm.snake.direction
      // 180° reversal guard
      if (dir.x === -current.x && dir.y === -current.y) return
      this.gm._pendingDirection = vec2(dir.x, dir.y)
      return
    }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault()
      if (this.gm.state === GameState.PLAYING) {
        this.gm.pauseGame()
      } else if (this.gm.state === GameState.PAUSED) {
        this.gm.resumeGame()
      }
      return
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (this.gm.state === GameState.IDLE) {
        this.gm.startGame()
      } else if (this.gm.state === GameState.GAME_OVER) {
        this.gm.restartGame()
      }
      return
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handler)
  }
}
