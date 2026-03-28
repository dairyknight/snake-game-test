import { Vector2 } from '../utils/Vector2';
import { Board } from './Board';

export class Food {
  private position: Vector2;

  constructor(board: Board, occupied: Vector2[]) {
    const pos = board.getRandomEmptyCell(occupied);
    if (!pos) throw new Error('No empty cell available for food spawn');
    this.position = pos;
  }

  getPosition(): Vector2 {
    return this.position;
  }

  respawn(board: Board, occupied: Vector2[]): boolean {
    const pos = board.getRandomEmptyCell(occupied);
    if (!pos) return false; // Board full — win condition
    this.position = pos;
    return true;
  }

  isEaten(headPos: Vector2): boolean {
    return this.position.x === headPos.x && this.position.y === headPos.y;
  }
}
