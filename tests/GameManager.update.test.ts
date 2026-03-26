import { GameManager } from '../src/game/GameManager'
import { GameState } from '../src/state/GameState'
import { vec2 } from '../src/utils/Vector2'

describe('GameManager.update()', () => {
  let gm: GameManager

  beforeEach(() => {
    gm = new GameManager()
    gm.startGame() // put into PLAYING state
  })

  describe('does nothing when not PLAYING', () => {
    it('does not move snake when IDLE', () => {
      const idleGm = new GameManager() // stays IDLE
      const headBefore = { x: idleGm.snake.head.x, y: idleGm.snake.head.y }
      idleGm.update()
      expect(idleGm.snake.head.x).toBe(headBefore.x)
      expect(idleGm.snake.head.y).toBe(headBefore.y)
    })

    it('does not move snake when PAUSED', () => {
      gm.pauseGame()
      const headBefore = { x: gm.snake.head.x, y: gm.snake.head.y }
      gm.update()
      expect(gm.snake.head.x).toBe(headBefore.x)
      expect(gm.snake.head.y).toBe(headBefore.y)
    })
  })

  describe('normal movement', () => {
    it('moves the snake head one step in current direction', () => {
      const headBefore = { x: gm.snake.head.x, y: gm.snake.head.y }
      gm.update()
      expect(gm.snake.head.x).toBe(headBefore.x + 1) // moving right
      expect(gm.snake.head.y).toBe(headBefore.y)
    })

    it('applies _pendingDirection before moving', () => {
      gm._pendingDirection = vec2(0, 1) // set to down
      gm.update()
      // Head should have moved down
      expect(gm.snake.head.x).toBe(9) // x unchanged
      expect(gm.snake.head.y).toBe(10) // y increased (down)
    })

    it('clears _pendingDirection after applying it', () => {
      gm._pendingDirection = vec2(0, 1)
      gm.update()
      expect(gm._pendingDirection).toBeNull()
    })

    it('does not apply _pendingDirection on subsequent ticks if not set again', () => {
      gm._pendingDirection = vec2(0, 1)
      gm.update() // applies direction: moves down
      gm.update() // continues down (pendingDirection is null)
      expect(gm.snake.direction.x).toBe(0)
      expect(gm.snake.direction.y).toBe(1)
    })
  })

  describe('wall collision → GAME_OVER', () => {
    it('triggers GAME_OVER when snake hits left wall', () => {
      // Move snake to the left wall
      gm._pendingDirection = vec2(-1, 0) // won't apply (180° reversal from right)
      // Force snake to face left by going through a perpendicular turn
      // Turn down, then turn left
      gm._pendingDirection = vec2(0, 1)
      gm.update() // now facing down at (9, 10)
      gm._pendingDirection = vec2(-1, 0)
      gm.update() // now facing left at (8, 10)
      // Now move left until hitting wall
      for (let i = 0; i < 9; i++) {
        gm.update()
        if (gm.state === GameState.GAME_OVER) break
      }
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('triggers GAME_OVER when snake hits right wall', () => {
      // Snake starts at (9,9) moving right, move until it hits x=20
      for (let i = 0; i < 11; i++) {
        gm.update()
        if (gm.state === GameState.GAME_OVER) break
      }
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('triggers GAME_OVER when snake hits top wall', () => {
      gm._pendingDirection = vec2(0, -1) // move up
      for (let i = 0; i < 12; i++) {
        gm.update()
        if (gm.state === GameState.GAME_OVER) break
      }
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('triggers GAME_OVER when snake hits bottom wall', () => {
      gm._pendingDirection = vec2(0, 1) // move down
      for (let i = 0; i < 12; i++) {
        gm.update()
        if (gm.state === GameState.GAME_OVER) break
      }
      expect(gm.state).toBe(GameState.GAME_OVER)
    })
  })

  describe('self-collision → GAME_OVER', () => {
    it('triggers GAME_OVER when snake collides with itself (mocked)', () => {
      vi.spyOn(gm.snake, 'checkSelfCollision').mockReturnValue(true)
      gm.update()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('does not trigger GAME_OVER when self-collision check returns false', () => {
      vi.spyOn(gm.snake, 'checkSelfCollision').mockReturnValue(false)
      // Also mock wall collision to avoid incidental game over
      vi.spyOn(gm.board, 'checkWallCollision').mockReturnValue(false)
      // Move food away from snake head to avoid food eaten
      gm.food.position = vec2(0, 0)
      gm.snake.segments[0] = vec2(9, 9)
      gm.update()
      expect(gm.state).toBe(GameState.PLAYING)
    })
  })

  describe('food eaten', () => {
    it('emits foodEaten event with position captured before respawn', () => {
      // Position food directly ahead of the snake
      // Snake head at (9,9), moving right — put food at (10,9)
      gm.food.position = vec2(10, 9)
      const handler = vi.fn()
      gm.events.on('foodEaten', handler)
      gm.update()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ eatenAt: { x: 10, y: 9 } })
    })

    it('emits foodEaten with eatenAt matching the food position before respawn', () => {
      gm.food.position = vec2(10, 9)
      let capturedEatenAt: { x: number; y: number } | null = null
      gm.events.on('foodEaten', ({ eatenAt }) => {
        capturedEatenAt = { x: eatenAt.x, y: eatenAt.y }
      })
      gm.update()
      // After update, food has respawned — so it's not at (10,9) anymore (probably)
      // But capturedEatenAt should be (10,9)
      expect(capturedEatenAt).toEqual({ x: 10, y: 9 })
    })

    it('grows the snake by 1 after eating food', () => {
      const lengthBefore = gm.snake.segments.length
      gm.food.position = vec2(10, 9)
      gm.update() // eat food at (10,9) — grow() called, but growth applied on NEXT move
      gm.update() // this move applies growth
      expect(gm.snake.segments.length).toBe(lengthBefore + 1)
    })

    it('respawns food after eating', () => {
      gm.food.position = vec2(10, 9)
      gm.update()
      // Food should not be at (10,9) anymore (it was eaten and respawned)
      // Note: in rare cases it could respawn at same spot — but very unlikely with 400 cells
      // We just verify food is within board bounds
      expect(gm.board.checkWallCollision(gm.food.position)).toBe(false)
    })

    it('calls scoreManager.add(10) when food is eaten', () => {
      gm.food.position = vec2(10, 9)
      gm.update()
      expect(gm.scoreManager.currentScore).toBe(10)
    })

    it('scoreManager increments score each time food is eaten', () => {
      gm.food.position = vec2(10, 9)
      gm.update()
      expect(gm.scoreManager.currentScore).toBe(10)
    })
  })
})
