import { describe, it, expect, vi } from 'vitest';
import { Board } from '../src/game/Board';
import { vec2 } from '../src/utils/Vector2';

describe('Board', () => {
  describe('constructor', () => {
    it('defaults to 20x20', () => {
      const board = new Board();
      expect(board.cols).toBe(20);
      expect(board.rows).toBe(20);
    });

    it('accepts custom dimensions', () => {
      const board = new Board(10, 15);
      expect(board.cols).toBe(10);
      expect(board.rows).toBe(15);
    });
  });

  describe('isOutOfBounds()', () => {
    const board = new Board(10, 10);

    it('returns false for a cell inside the board', () => {
      expect(board.isOutOfBounds(vec2(0, 0))).toBe(false);
      expect(board.isOutOfBounds(vec2(5, 5))).toBe(false);
      expect(board.isOutOfBounds(vec2(9, 9))).toBe(false);
    });

    it('returns true for negative x', () => {
      expect(board.isOutOfBounds(vec2(-1, 5))).toBe(true);
    });

    it('returns true for negative y', () => {
      expect(board.isOutOfBounds(vec2(5, -1))).toBe(true);
    });

    it('returns true for x equal to cols', () => {
      expect(board.isOutOfBounds(vec2(10, 5))).toBe(true);
    });

    it('returns true for y equal to rows', () => {
      expect(board.isOutOfBounds(vec2(5, 10))).toBe(true);
    });

    it('returns true for x beyond cols', () => {
      expect(board.isOutOfBounds(vec2(15, 5))).toBe(true);
    });

    it('returns true for y beyond rows', () => {
      expect(board.isOutOfBounds(vec2(5, 15))).toBe(true);
    });

    it('returns false for boundary cells (0,0) and (9,9)', () => {
      expect(board.isOutOfBounds(vec2(0, 0))).toBe(false);
      expect(board.isOutOfBounds(vec2(9, 9))).toBe(false);
    });
  });

  describe('isOccupied()', () => {
    const board = new Board(10, 10);

    it('returns true when pos is in occupied list', () => {
      const occupied = [vec2(3, 4), vec2(5, 6)];
      expect(board.isOccupied(vec2(3, 4), occupied)).toBe(true);
    });

    it('returns false when pos is not in occupied list', () => {
      const occupied = [vec2(3, 4), vec2(5, 6)];
      expect(board.isOccupied(vec2(0, 0), occupied)).toBe(false);
    });

    it('returns false for empty occupied list', () => {
      expect(board.isOccupied(vec2(5, 5), [])).toBe(false);
    });

    it('returns true for the last item in occupied list', () => {
      const occupied = [vec2(1, 1), vec2(2, 2), vec2(9, 9)];
      expect(board.isOccupied(vec2(9, 9), occupied)).toBe(true);
    });
  });

  describe('getTotalCells()', () => {
    it('returns cols * rows for default board', () => {
      const board = new Board();
      expect(board.getTotalCells()).toBe(400);
    });

    it('returns cols * rows for custom dimensions', () => {
      const board = new Board(5, 8);
      expect(board.getTotalCells()).toBe(40);
    });
  });

  describe('getRandomEmptyCell()', () => {
    it('returns null when the board is completely full', () => {
      const board = new Board(2, 2);
      const occupied = [vec2(0, 0), vec2(1, 0), vec2(0, 1), vec2(1, 1)];
      expect(board.getRandomEmptyCell(occupied)).toBeNull();
    });

    it('returns a cell when board has empty cells', () => {
      const board = new Board(5, 5);
      const result = board.getRandomEmptyCell([]);
      expect(result).not.toBeNull();
    });

    it('returns a cell not in the occupied list', () => {
      const board = new Board(2, 2);
      // Occupy all but one cell
      const occupied = [vec2(0, 0), vec2(1, 0), vec2(0, 1)];
      const result = board.getRandomEmptyCell(occupied);
      expect(result).toEqual({ x: 1, y: 1 });
    });

    it('returned cell is within board bounds', () => {
      const board = new Board(10, 10);
      const result = board.getRandomEmptyCell([]);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.x).toBeGreaterThanOrEqual(0);
        expect(result.x).toBeLessThan(10);
        expect(result.y).toBeGreaterThanOrEqual(0);
        expect(result.y).toBeLessThan(10);
      }
    });

    it('never returns an occupied cell across many calls', () => {
      const board = new Board(10, 10);
      const occupied = [vec2(5, 5), vec2(3, 3), vec2(7, 7)];
      for (let i = 0; i < 50; i++) {
        const result = board.getRandomEmptyCell(occupied);
        expect(result).not.toBeNull();
        if (result) {
          const isOccupied = occupied.some(o => o.x === result.x && o.y === result.y);
          expect(isOccupied).toBe(false);
        }
      }
    });
  });
});
