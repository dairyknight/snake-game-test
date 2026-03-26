import { GameState } from '../state/GameState'
import { EventEmitter } from '../utils/EventEmitter'
import { IVector2, Vector2 } from '../utils/Vector2'
import { Board } from './Board'
import { Snake } from './Snake'
import { Food } from './Food'

export interface GameManagerEvents {
  stateChange: { from: GameState; to: GameState }
  foodEaten: { eatenAt: IVector2 }
}

export class GameManager {
  private _state: GameState = GameState.IDLE
  readonly events = new EventEmitter<GameManagerEvents>()

  readonly board: Board = new Board()
  readonly snake: Snake = new Snake()
  readonly food: Food = new Food()

  /** Set externally by input handler (Phase 7); consumed and cleared each update tick */
  _pendingDirection: Vector2 | null = null

  /** Stub for ScoreManager (Phase 5) */
  scoreManager: { add(points: number): void } | null = null

  get state(): GameState {
    return this._state
  }

  private transition(to: GameState): void {
    const from = this._state
    this._state = to
    this.events.emit('stateChange', { from, to })
  }

  startGame(): void {
    if (this._state !== GameState.IDLE) return
    this.transition(GameState.PLAYING)
  }

  pauseGame(): void {
    if (this._state !== GameState.PLAYING) return
    this.transition(GameState.PAUSED)
  }

  resumeGame(): void {
    if (this._state !== GameState.PAUSED) return
    this.transition(GameState.PLAYING)
  }

  endGame(): void {
    if (this._state !== GameState.PLAYING && this._state !== GameState.PAUSED) return
    this.transition(GameState.GAME_OVER)
  }

  restartGame(): void {
    if (this._state !== GameState.GAME_OVER) return
    this.transition(GameState.IDLE)
  }

  update(): void {
    if (this._state !== GameState.PLAYING) return

    // 1. Apply pendingDirection to snake (if set, then clear it)
    const direction = this._pendingDirection ?? this.snake.direction
    this._pendingDirection = null

    // 2. Move snake
    this.snake.move(direction)

    // 3. Check wall collision
    if (this.board.checkWallCollision(this.snake.head)) {
      this.endGame()
      return
    }

    // 4. Check self collision
    if (this.snake.checkSelfCollision()) {
      this.endGame()
      return
    }

    // 5. Check food eaten
    if (this.snake.head.equals(this.food.position)) {
      const eatenAt = this.food.position
      // a. Emit foodEaten BEFORE respawn
      this.events.emit('foodEaten', { eatenAt })
      // b. Respawn food (pass all occupied cells: snake segments + current food pos)
      const occupied = [...this.snake.segments]
      this.food.respawn(occupied, this.board)
      // c. Grow snake
      this.snake.grow()
      // d. Add score (null-safe stub — ScoreManager wired in Phase 5)
      this.scoreManager?.add(10)
    }
  }
}
