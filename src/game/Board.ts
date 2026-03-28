import { Vector2, vec2Equals } from '../utils/Vector2';

export class Board {
  readonly cols: number;
  readonly rows: number;

  constructor(cols: number = 20, rows: number = 20) {
    this.cols = cols;
    this.rows = rows;
  }

  isOutOfBounds(pos: Vector2): boolean {
    return pos.x < 0 || pos.x >= this.cols || pos.y < 0 || pos.y >= this.rows;
  }

  isOccupied(pos: Vector2, occupied: Vector2[]): boolean {
    return occupied.some(cell => vec2Equals(cell, pos));
  }

  getRandomEmptyCell(occupied: Vector2[]): Vector2 | null {
    const empty: Vector2[] = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const cell = { x, y };
        if (!this.isOccupied(cell, occupied)) {
          empty.push(cell);
        }
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  getTotalCells(): number {
    return this.cols * this.rows;
  }
}
