import { Food } from '../src/game/Food'
import { Board } from '../src/game/Board'
import { vec2 } from '../src/utils/Vector2'

describe('Food', () => {
  let food: Food
  let board: Board

  beforeEach(() => {
    food = new Food()
    board = new Board()
  })

  describe('initial state', () => {
    it('has an initial position', () => {
      expect(food.position).toBeDefined()
      expect(typeof food.position.x).toBe('number')
      expect(typeof food.position.y).toBe('number')
    })
  })

  describe('respawn', () => {
    it('places food within board bounds', () => {
      food.respawn([], board)
      expect(board.checkWallCollision(food.position)).toBe(false)
    })

    it('never places food on an occupied cell', () => {
      // Occupy all cells except (15, 15)
      const occupied = []
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          if (!(x === 15 && y === 15)) {
            occupied.push(vec2(x, y))
          }
        }
      }
      food.respawn(occupied, board)
      expect(food.position.x).toBe(15)
      expect(food.position.y).toBe(15)
    })

    it('respects Math.random to pick among empty cells', () => {
      // With no occupied cells, 400 cells are available
      // Mock Math.random to return 0 — should pick the first empty cell (0,0)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0)
      food.respawn([], board)
      expect(food.position.x).toBe(0)
      expect(food.position.y).toBe(0)
      mockRandom.mockRestore()
    })

    it('uses Math.random to select from available cells', () => {
      // With no occupied cells, 400 cells. Mock returns 0.5 → index 200 = (0, 10)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5)
      food.respawn([], board)
      // Math.floor(0.5 * 400) = 200; cells are filled row by row: y=10, x=0
      expect(food.position.x).toBe(0)
      expect(food.position.y).toBe(10)
      mockRandom.mockRestore()
    })

    it('does not place food on snake segments', () => {
      const snakeSegments = [vec2(9, 9), vec2(8, 9), vec2(7, 9)]
      // Run respawn many times with different random values and verify no collision
      for (let i = 0; i < 10; i++) {
        food.respawn(snakeSegments, board)
        const onSnake = snakeSegments.some(
          seg => seg.x === food.position.x && seg.y === food.position.y
        )
        expect(onSnake).toBe(false)
      }
    })

    it('does not change position when no empty cells are available', () => {
      const allCells = []
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          allCells.push(vec2(x, y))
        }
      }
      const beforeX = food.position.x
      const beforeY = food.position.y
      food.respawn(allCells, board)
      // Position unchanged since no empty cells
      expect(food.position.x).toBe(beforeX)
      expect(food.position.y).toBe(beforeY)
    })
  })
})
