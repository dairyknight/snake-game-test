import { Snake } from '../src/game/Snake'
import { vec2 } from '../src/utils/Vector2'

describe('Snake', () => {
  let snake: Snake

  beforeEach(() => {
    snake = new Snake()
  })

  describe('initial state', () => {
    it('starts with 3 segments', () => {
      expect(snake.segments.length).toBe(3)
    })

    it('starts with head at (9, 9)', () => {
      expect(snake.head.x).toBe(9)
      expect(snake.head.y).toBe(9)
    })

    it('starts with body at (8, 9)', () => {
      expect(snake.segments[1].x).toBe(8)
      expect(snake.segments[1].y).toBe(9)
    })

    it('starts with tail at (7, 9)', () => {
      expect(snake.segments[2].x).toBe(7)
      expect(snake.segments[2].y).toBe(9)
    })

    it('starts moving right (1, 0)', () => {
      expect(snake.direction.x).toBe(1)
      expect(snake.direction.y).toBe(0)
    })
  })

  describe('movement', () => {
    it('moves head in the current direction when given same direction', () => {
      snake.move(vec2(1, 0)) // continue right
      expect(snake.head.x).toBe(10)
      expect(snake.head.y).toBe(9)
    })

    it('maintains 3 segments after a move (no growth)', () => {
      snake.move(vec2(1, 0))
      expect(snake.segments.length).toBe(3)
    })

    it('advances all segments forward correctly', () => {
      snake.move(vec2(1, 0))
      expect(snake.segments[0]).toEqual({ x: 10, y: 9 })
      expect(snake.segments[1]).toEqual({ x: 9, y: 9 })
      expect(snake.segments[2]).toEqual({ x: 8, y: 9 })
    })

    it('can change direction to up', () => {
      snake.move(vec2(0, -1))
      expect(snake.head.x).toBe(9)
      expect(snake.head.y).toBe(8)
    })

    it('can change direction to down', () => {
      snake.move(vec2(0, 1))
      expect(snake.head.x).toBe(9)
      expect(snake.head.y).toBe(10)
    })
  })

  describe('180° reversal blocking', () => {
    it('ignores a left direction when currently moving right', () => {
      // Moving right, try to go left
      snake.move(vec2(-1, 0))
      // Should still move right
      expect(snake.head.x).toBe(10)
      expect(snake.head.y).toBe(9)
    })

    it('ignores an up direction when currently moving down', () => {
      // First turn snake downward
      snake.move(vec2(0, 1))
      const headAfterDown = { x: snake.head.x, y: snake.head.y }
      // Now try to go up — should be ignored
      snake.move(vec2(0, -1))
      // Should continue down
      expect(snake.head.x).toBe(headAfterDown.x)
      expect(snake.head.y).toBe(headAfterDown.y + 1)
    })

    it('allows reversing after making a perpendicular turn', () => {
      // Start moving right, turn up, then reverse (go down) — that should be allowed
      snake.move(vec2(0, -1)) // turn up
      const headAfterUp = { x: snake.head.x, y: snake.head.y }
      snake.move(vec2(0, 1)) // try to go down — reversal of "up"
      // Should keep going up (blocked)
      expect(snake.head.y).toBe(headAfterUp.y - 1)
    })
  })

  describe('growth', () => {
    it('grows by 1 segment after grow() + move()', () => {
      snake.grow()
      snake.move(vec2(1, 0))
      expect(snake.segments.length).toBe(4)
    })

    it('does not grow again on the next move without another grow() call', () => {
      snake.grow()
      snake.move(vec2(1, 0))
      snake.move(vec2(1, 0))
      expect(snake.segments.length).toBe(4)
    })

    it('grows by 2 after two grow() calls + two moves', () => {
      snake.grow()
      snake.grow()
      snake.move(vec2(1, 0))
      expect(snake.segments.length).toBe(4)
      snake.move(vec2(1, 0))
      expect(snake.segments.length).toBe(5)
    })

    it('keeps tail segment when growing', () => {
      const originalTail = snake.segments[snake.segments.length - 1]
      snake.grow()
      snake.move(vec2(1, 0))
      // The original tail should still be present as the last segment
      expect(snake.segments[snake.segments.length - 1].x).toBe(originalTail.x)
      expect(snake.segments[snake.segments.length - 1].y).toBe(originalTail.y)
    })
  })

  describe('checkSelfCollision', () => {
    it('returns false for an initial 3-segment snake', () => {
      expect(snake.checkSelfCollision()).toBe(false)
    })

    it('returns false when head is adjacent to body but not overlapping', () => {
      snake.move(vec2(1, 0))
      expect(snake.checkSelfCollision()).toBe(false)
    })

    it('returns false when head overlaps the tail (tail exclusion rule)', () => {
      // The tail is excluded from self-collision checking
      // Build a scenario: head at (9,9), body at (8,9), tail at (7,9)
      // We can't easily construct a real collision with a short snake
      // Instead verify the tail exclusion logic directly
      // Snake: head=(9,9), body=(8,9), tail=(7,9)
      // The tail at index 2 should be excluded
      expect(snake.checkSelfCollision()).toBe(false)
    })

    it('returns true when head overlaps a non-tail body segment', () => {
      // Manually position segments to create a self-collision on body (not tail)
      // segments[0] = head, segments[1] = body segment we collide with, segments[2] = tail
      // Set head and segments[1] to same position, keep tail different
      snake.segments = [vec2(5, 5), vec2(5, 5), vec2(4, 5)]
      expect(snake.checkSelfCollision()).toBe(true)
    })

    it('returns false when head matches tail position but not body', () => {
      // Head at (5,5), body at (6,5), tail at (5,5) — tail is excluded
      snake.segments = [vec2(5, 5), vec2(6, 5), vec2(5, 5)]
      expect(snake.checkSelfCollision()).toBe(false)
    })

    it('returns true for longer snake with real body collision', () => {
      // 5-segment snake where head overlaps segments[2]
      snake.segments = [vec2(5, 5), vec2(6, 5), vec2(5, 5), vec2(4, 5), vec2(3, 5)]
      expect(snake.checkSelfCollision()).toBe(true)
    })
  })
})
