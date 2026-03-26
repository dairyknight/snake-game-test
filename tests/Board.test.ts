import { Board } from '../src/game/Board'
import { vec2 } from '../src/utils/Vector2'

describe('Board', () => {
  let board: Board

  beforeEach(() => {
    board = new Board()
  })

  describe('dimensions', () => {
    it('has width of 20', () => {
      expect(board.width).toBe(20)
    })

    it('has height of 20', () => {
      expect(board.height).toBe(20)
    })
  })

  describe('checkWallCollision', () => {
    it('returns false for cells inside the grid (corners)', () => {
      expect(board.checkWallCollision(vec2(0, 0))).toBe(false)
      expect(board.checkWallCollision(vec2(19, 0))).toBe(false)
      expect(board.checkWallCollision(vec2(0, 19))).toBe(false)
      expect(board.checkWallCollision(vec2(19, 19))).toBe(false)
    })

    it('returns false for a cell in the centre', () => {
      expect(board.checkWallCollision(vec2(9, 9))).toBe(false)
      expect(board.checkWallCollision(vec2(10, 10))).toBe(false)
    })

    it('returns true when x is negative', () => {
      expect(board.checkWallCollision(vec2(-1, 10))).toBe(true)
    })

    it('returns true when y is negative', () => {
      expect(board.checkWallCollision(vec2(10, -1))).toBe(true)
    })

    it('returns true when x equals width (20)', () => {
      expect(board.checkWallCollision(vec2(20, 10))).toBe(true)
    })

    it('returns true when y equals height (20)', () => {
      expect(board.checkWallCollision(vec2(10, 20))).toBe(true)
    })

    it('returns true when x is well beyond width', () => {
      expect(board.checkWallCollision(vec2(100, 5))).toBe(true)
    })

    it('returns true when y is well beyond height', () => {
      expect(board.checkWallCollision(vec2(5, 100))).toBe(true)
    })
  })

  describe('getEmptyCells', () => {
    it('returns all 400 cells when no occupied cells provided', () => {
      const cells = board.getEmptyCells([])
      expect(cells.length).toBe(400)
    })

    it('excludes occupied cells', () => {
      const occupied = [vec2(0, 0), vec2(1, 0), vec2(2, 0)]
      const cells = board.getEmptyCells(occupied)
      expect(cells.length).toBe(397)
      // None of the empty cells should match occupied positions
      for (const occ of occupied) {
        expect(cells.some(c => c.x === occ.x && c.y === occ.y)).toBe(false)
      }
    })

    it('returns empty array when all cells are occupied', () => {
      const occupied = []
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          occupied.push(vec2(x, y))
        }
      }
      const cells = board.getEmptyCells(occupied)
      expect(cells.length).toBe(0)
    })

    it('returns cells that are within the board bounds', () => {
      const cells = board.getEmptyCells([])
      for (const cell of cells) {
        expect(board.checkWallCollision(cell)).toBe(false)
      }
    })
  })
})
