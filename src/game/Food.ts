import { IVector2, Vector2, vec2 } from '../utils/Vector2'
import { Board } from './Board'

export class Food {
  position: Vector2

  constructor() {
    // Initial position — will be properly set by respawn() on game start
    this.position = vec2(15, 9)
  }

  respawn(occupied: IVector2[], board: Board): void {
    const emptyCells = board.getEmptyCells(occupied)
    if (emptyCells.length === 0) {
      // No empty cells — shouldn't happen in a normal game, but handle gracefully
      return
    }
    const idx = Math.floor(Math.random() * emptyCells.length)
    const cell = emptyCells[idx]
    this.position = vec2(cell.x, cell.y)
  }
}
