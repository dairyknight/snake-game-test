import { describe, it, expect } from 'vitest';
import { Food } from '../src/game/Food';
import { Board } from '../src/game/Board';
import { vec2 } from '../src/utils/Vector2';

describe('Food', () => {
  describe('constructor', () => {
    it('spawns food in an unoccupied cell', () => {
      const board = new Board(5, 5);
      const occupied = [vec2(0, 0), vec2(1, 1)];
      const food = new Food(board, occupied);
      const pos = food.getPosition();
      const isOccupied = occupied.some(o => o.x === pos.x && o.y === pos.y);
      expect(isOccupied).toBe(false);
    });

    it('spawns food within board bounds', () => {
      const board = new Board(10, 10);
      const food = new Food(board, []);
      const pos = food.getPosition();
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThan(10);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThan(10);
    });

    it('throws when board is completely full', () => {
      const board = new Board(1, 1);
      const occupied = [vec2(0, 0)];
      expect(() => new Food(board, occupied)).toThrow('No empty cell available for food spawn');
    });
  });

  describe('getPosition()', () => {
    it('returns a Vector2', () => {
      const board = new Board(5, 5);
      const food = new Food(board, []);
      const pos = food.getPosition();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    });
  });

  describe('isEaten()', () => {
    it('returns true when head matches food position', () => {
      const board = new Board(10, 10);
      // Force food to known position by occupying all other cells
      // Use a 1x1 board with no occupied cells
      const smallBoard = new Board(1, 1);
      const food = new Food(smallBoard, []);
      expect(food.isEaten(vec2(0, 0))).toBe(true);
    });

    it('returns false when head does not match food position', () => {
      const smallBoard = new Board(1, 1);
      const food = new Food(smallBoard, []);
      // Food is at (0,0), head is elsewhere
      expect(food.isEaten(vec2(5, 5))).toBe(false);
    });

    it('returns false when only x matches', () => {
      const smallBoard = new Board(1, 1);
      const food = new Food(smallBoard, []);
      // Food is at (0,0)
      expect(food.isEaten(vec2(0, 5))).toBe(false);
    });

    it('returns false when only y matches', () => {
      const smallBoard = new Board(1, 1);
      const food = new Food(smallBoard, []);
      // Food is at (0,0)
      expect(food.isEaten(vec2(5, 0))).toBe(false);
    });
  });

  describe('respawn()', () => {
    it('returns false when board is full', () => {
      const board = new Board(2, 1);
      // One cell occupied by the snake, food gets the other
      const snakeOccupied = [vec2(0, 0)];
      const food = new Food(board, snakeOccupied);
      // Food is at (1,0); now board is full (snake + food)
      const allOccupied = [vec2(0, 0), vec2(1, 0)];
      expect(food.respawn(board, allOccupied)).toBe(false);
    });

    it('returns true when there are empty cells', () => {
      const board = new Board(5, 5);
      const food = new Food(board, []);
      expect(food.respawn(board, [])).toBe(true);
    });

    it('places food in an unoccupied cell after respawn', () => {
      const board = new Board(5, 5);
      const occupied = [vec2(0, 0), vec2(1, 0), vec2(2, 0)];
      const food = new Food(board, occupied);
      food.respawn(board, occupied);
      const pos = food.getPosition();
      const isOccupied = occupied.some(o => o.x === pos.x && o.y === pos.y);
      expect(isOccupied).toBe(false);
    });

    it('updates position after respawn', () => {
      // Use a 1x2 board: food starts at one cell, snake moves to it, respawn to the other
      const board = new Board(1, 2);
      // Snake at (0,0), food spawns at (0,1)
      const snake = [vec2(0, 0)];
      const food = new Food(board, snake);
      expect(food.getPosition()).toEqual({ x: 0, y: 1 });

      // Now snake is at (0,1) (ate food), snake occupies (0,1)
      // Only empty cell is (0,0)
      const newSnake = [vec2(0, 1)];
      food.respawn(board, newSnake);
      expect(food.getPosition()).toEqual({ x: 0, y: 0 });
    });
  });
});
