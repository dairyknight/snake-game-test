import { describe, it, expect } from 'vitest';
import { Snake, Direction, isOppositeDirection } from '../src/game/Snake';
import { vec2 } from '../src/utils/Vector2';

describe('Snake', () => {
  describe('initial state', () => {
    it('head position matches startPos', () => {
      const snake = new Snake(vec2(5, 5));
      expect(snake.getHead()).toEqual({ x: 5, y: 5 });
    });

    it('initial direction is RIGHT by default', () => {
      const snake = new Snake(vec2(5, 5));
      expect(snake.getDirection()).toEqual(Direction.RIGHT);
    });

    it('initial length is 1', () => {
      const snake = new Snake(vec2(5, 5));
      expect(snake.getLength()).toBe(1);
    });

    it('getSegments returns a copy with the start position', () => {
      const snake = new Snake(vec2(3, 4));
      const segs = snake.getSegments();
      expect(segs).toHaveLength(1);
      expect(segs[0]).toEqual({ x: 3, y: 4 });
    });

    it('accepts a custom initial direction', () => {
      const snake = new Snake(vec2(5, 5), Direction.UP);
      expect(snake.getDirection()).toEqual(Direction.UP);
    });
  });

  describe('move()', () => {
    it('advances head to the right by default', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.move();
      expect(snake.getHead()).toEqual({ x: 6, y: 5 });
    });

    it('advances head upward', () => {
      const snake = new Snake(vec2(5, 5), Direction.UP);
      snake.move();
      expect(snake.getHead()).toEqual({ x: 5, y: 4 });
    });

    it('advances head downward', () => {
      const snake = new Snake(vec2(5, 5), Direction.DOWN);
      snake.move();
      expect(snake.getHead()).toEqual({ x: 5, y: 6 });
    });

    it('advances head to the left', () => {
      const snake = new Snake(vec2(5, 5), Direction.LEFT);
      snake.move();
      expect(snake.getHead()).toEqual({ x: 4, y: 5 });
    });

    it('keeps length at 1 after a move (no growth)', () => {
      const snake = new Snake(vec2(5, 5));
      snake.move();
      expect(snake.getLength()).toBe(1);
    });

    it('moves multiple times, each advancing by 1', () => {
      const snake = new Snake(vec2(0, 0), Direction.RIGHT);
      snake.move();
      snake.move();
      snake.move();
      expect(snake.getHead()).toEqual({ x: 3, y: 0 });
    });
  });

  describe('queueDirection()', () => {
    it('changes direction on the next move', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.queueDirection(Direction.UP);
      snake.move();
      expect(snake.getDirection()).toEqual(Direction.UP);
      expect(snake.getHead()).toEqual({ x: 5, y: 4 });
    });

    it('rejects 180° reversal — RIGHT to LEFT', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.queueDirection(Direction.LEFT);
      snake.move();
      expect(snake.getDirection()).toEqual(Direction.RIGHT);
    });

    it('rejects 180° reversal — UP to DOWN', () => {
      const snake = new Snake(vec2(5, 5), Direction.UP);
      snake.queueDirection(Direction.DOWN);
      snake.move();
      expect(snake.getDirection()).toEqual(Direction.UP);
    });

    it('rejects same direction as current', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.queueDirection(Direction.RIGHT);
      snake.move();
      // Direction remains RIGHT, no error
      expect(snake.getDirection()).toEqual(Direction.RIGHT);
    });

    it('pending direction is consumed after one move', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.queueDirection(Direction.UP);
      snake.move(); // applies UP
      snake.move(); // no pending, continues UP
      expect(snake.getDirection()).toEqual(Direction.UP);
    });
  });

  describe('grow()', () => {
    it('causes snake to grow by 1 segment on the next move', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.grow();
      snake.move();
      expect(snake.getLength()).toBe(2);
    });

    it('does not grow further on subsequent moves without another grow()', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.grow();
      snake.move();
      snake.move();
      expect(snake.getLength()).toBe(2);
    });

    it('can grow multiple times with multiple grow() calls', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.grow();
      snake.move();
      snake.grow();
      snake.move();
      expect(snake.getLength()).toBe(3);
    });

    it('tail segment is retained after growth', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      const originalHead = snake.getHead();
      snake.grow();
      snake.move();
      const segs = snake.getSegments();
      expect(segs[1]).toEqual(originalHead);
    });
  });

  describe('checkSelfCollision()', () => {
    it('returns false for a straight snake', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.grow();
      snake.move();
      snake.grow();
      snake.move();
      expect(snake.checkSelfCollision()).toBe(false);
    });

    it('returns true when head overlaps a body segment', () => {
      // Build a coiled snake by calling grow() before every move so the full
      // path is retained, then steer the head back into the body.
      // Path: (5,5)→right→(6,5)→(7,5)→(8,5)→down→(8,6)→left→(7,6)→(6,6)
      //       →(5,6)→(4,6)→up→(4,5)→(4,4)→right→(5,4)→(6,4)→(7,4)→down→(7,5) ← collision
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      const growMove = (dir?: typeof Direction[keyof typeof Direction]) => {
        snake.grow();
        if (dir) snake.queueDirection(dir);
        snake.move();
      };
      growMove();                    // (6,5)
      growMove();                    // (7,5)
      growMove();                    // (8,5)
      growMove(Direction.DOWN);      // (8,6)
      growMove(Direction.LEFT);      // (7,6)
      growMove();                    // (6,6)
      growMove();                    // (5,6)
      growMove();                    // (4,6)
      growMove(Direction.UP);        // (4,5)
      growMove();                    // (4,4)
      growMove(Direction.RIGHT);     // (5,4)
      growMove();                    // (6,4)
      growMove();                    // (7,4)
      // Final move: turn DOWN to reach (7,5) which is already in the body
      snake.grow();
      snake.queueDirection(Direction.DOWN);
      snake.move();                  // (7,5) — collision!
      expect(snake.checkSelfCollision()).toBe(true);
    });
  });

  describe('reset()', () => {
    it('resets head position', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.move();
      snake.move();
      snake.reset(vec2(10, 10));
      expect(snake.getHead()).toEqual({ x: 10, y: 10 });
    });

    it('resets length to 1', () => {
      const snake = new Snake(vec2(5, 5));
      snake.grow();
      snake.move();
      snake.reset(vec2(5, 5));
      expect(snake.getLength()).toBe(1);
    });

    it('resets direction to RIGHT by default', () => {
      const snake = new Snake(vec2(5, 5), Direction.UP);
      snake.reset(vec2(5, 5));
      expect(snake.getDirection()).toEqual(Direction.RIGHT);
    });

    it('resets direction to provided initial direction', () => {
      const snake = new Snake(vec2(5, 5));
      snake.reset(vec2(5, 5), Direction.DOWN);
      expect(snake.getDirection()).toEqual(Direction.DOWN);
    });

    it('clears pending direction after reset', () => {
      const snake = new Snake(vec2(5, 5), Direction.RIGHT);
      snake.queueDirection(Direction.UP);
      snake.reset(vec2(5, 5), Direction.RIGHT);
      snake.move();
      // Should still be going RIGHT, not UP
      expect(snake.getDirection()).toEqual(Direction.RIGHT);
      expect(snake.getHead()).toEqual({ x: 6, y: 5 });
    });

    it('clears growing flag after reset', () => {
      const snake = new Snake(vec2(5, 5));
      snake.grow();
      snake.reset(vec2(5, 5));
      snake.move();
      expect(snake.getLength()).toBe(1);
    });
  });
});

describe('isOppositeDirection', () => {
  it('RIGHT and LEFT are opposite', () => {
    expect(isOppositeDirection(Direction.RIGHT, Direction.LEFT)).toBe(true);
  });

  it('UP and DOWN are opposite', () => {
    expect(isOppositeDirection(Direction.UP, Direction.DOWN)).toBe(true);
  });

  it('RIGHT and UP are not opposite', () => {
    expect(isOppositeDirection(Direction.RIGHT, Direction.UP)).toBe(false);
  });

  it('RIGHT and RIGHT are not opposite', () => {
    expect(isOppositeDirection(Direction.RIGHT, Direction.RIGHT)).toBe(false);
  });
});
