import { GameState } from '../state/GameState'
import { EventEmitter } from '../utils/EventEmitter'

export interface GameManagerEvents {
  stateChange: { from: GameState; to: GameState }
}

export class GameManager {
  private _state: GameState = GameState.IDLE
  readonly events = new EventEmitter<GameManagerEvents>()

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
    // Orchestration hook — wired to game entities in Phase 4
  }
}
