import { IVector2, vec2 } from '../utils/Vector2'

export class Board {
  readonly width: number = 20
  readonly height: number = 20

  checkWallCollision(pos: IVector2): boolean {
    return pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height
  }

  getEmptyCells(occupied: IVector2[]): IVector2[] {
    const empty: IVector2[] = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const isOccupied = occupied.some(o => o.x === x && o.y === y)
        if (!isOccupied) {
          empty.push(vec2(x, y))
        }
      }
    }
    return empty
  }
}
