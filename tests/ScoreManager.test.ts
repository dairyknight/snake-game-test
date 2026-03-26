import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScoreManager } from '../src/game/ScoreManager'
import { GameManager } from '../src/game/GameManager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
  localStorage.clear()
})

describe('ScoreManager', () => {
  describe('add()', () => {
    it('increments currentScore by the given amount', () => {
      const sm = new ScoreManager()
      sm.add(10)
      expect(sm.currentScore).toBe(10)
      sm.add(10)
      expect(sm.currentScore).toBe(20)
    })

    it('updates highScore when currentScore exceeds it', () => {
      const sm = new ScoreManager()
      sm.add(10)
      expect(sm.highScore).toBe(10)
      sm.add(10)
      expect(sm.highScore).toBe(20)
    })

    it('does not lower highScore when currentScore is below it after reset', () => {
      const sm = new ScoreManager()
      sm.add(50)
      expect(sm.highScore).toBe(50)
      sm.reset()
      sm.add(10)
      expect(sm.highScore).toBe(50)
      expect(sm.currentScore).toBe(10)
    })

    it('emits scoreChange with correct payload', () => {
      const sm = new ScoreManager()
      const handler = vi.fn()
      sm.events.on('scoreChange', handler)
      sm.add(10)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ currentScore: 10, highScore: 10 })
    })

    it('emits highScoreChange when high score is broken', () => {
      const sm = new ScoreManager()
      const handler = vi.fn()
      sm.events.on('highScoreChange', handler)
      sm.add(10)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ highScore: 10 })
    })

    it('does not emit highScoreChange when high score is not broken', () => {
      const sm = new ScoreManager()
      sm.add(50)
      const handler = vi.fn()
      sm.events.on('highScoreChange', handler)
      sm.reset()
      sm.add(10) // currentScore = 10, below highScore of 50
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('reset()', () => {
    it('zeros currentScore without touching highScore', () => {
      const sm = new ScoreManager()
      sm.add(50)
      expect(sm.highScore).toBe(50)
      sm.reset()
      expect(sm.currentScore).toBe(0)
      expect(sm.highScore).toBe(50)
    })
  })

  describe('clearHighScore()', () => {
    it('zeros highScore and removes localStorage key', () => {
      const sm = new ScoreManager()
      sm.add(100)
      expect(sm.highScore).toBe(100)
      expect(localStorage.getItem('snake_high_score')).toBe('100')
      sm.clearHighScore()
      expect(sm.highScore).toBe(0)
      expect(localStorage.getItem('snake_high_score')).toBeNull()
    })
  })

  describe('constructor — localStorage persistence', () => {
    it('loads highScore from localStorage on construction', () => {
      localStorage.setItem('snake_high_score', '250')
      const sm = new ScoreManager()
      expect(sm.highScore).toBe(250)
    })

    it('starts with highScore of 0 when no localStorage value exists', () => {
      const sm = new ScoreManager()
      expect(sm.highScore).toBe(0)
    })

    it('persists highScore to localStorage when add() breaks the record', () => {
      const sm = new ScoreManager()
      sm.add(70)
      expect(localStorage.getItem('snake_high_score')).toBe('70')
    })
  })

  describe('getTickInterval()', () => {
    it('returns 150ms for score 0–49', () => {
      const sm = new ScoreManager()
      expect(sm.getTickInterval()).toBe(150)
      sm.add(49)
      expect(sm.getTickInterval()).toBe(150)
    })

    it('returns 130ms for score 50–99', () => {
      const sm = new ScoreManager()
      sm.add(50)
      expect(sm.getTickInterval()).toBe(130)
      sm.add(49) // total 99
      expect(sm.getTickInterval()).toBe(130)
    })

    it('returns 110ms for score 100–149', () => {
      const sm = new ScoreManager()
      sm.add(100)
      expect(sm.getTickInterval()).toBe(110)
      sm.add(49) // total 149
      expect(sm.getTickInterval()).toBe(110)
    })

    it('returns 90ms for score 150–199', () => {
      const sm = new ScoreManager()
      sm.add(150)
      expect(sm.getTickInterval()).toBe(90)
      sm.add(49) // total 199
      expect(sm.getTickInterval()).toBe(90)
    })

    it('returns 75ms for score 200+', () => {
      const sm = new ScoreManager()
      sm.add(200)
      expect(sm.getTickInterval()).toBe(75)
      sm.add(1000) // well above cap
      expect(sm.getTickInterval()).toBe(75)
    })
  })
})

describe('ScoreManager integration with GameManager', () => {
  it('ScoreManager is wired into GameManager.scoreManager', () => {
    const gm = new GameManager()
    expect(gm.scoreManager).toBeInstanceOf(ScoreManager)
  })

  it('score increments when food is eaten via GameManager.update()', () => {
    const gm = new GameManager()
    gm.startGame()

    // Place snake head on food position to trigger food-eaten logic
    const foodPos = gm.food.position
    // Force snake head to food position by spying on snake.head
    vi.spyOn(gm.snake, 'head', 'get').mockReturnValue(foodPos)
    vi.spyOn(gm.board, 'checkWallCollision').mockReturnValue(false)
    vi.spyOn(gm.snake, 'checkSelfCollision').mockReturnValue(false)
    vi.spyOn(gm.snake, 'move').mockImplementation(() => {})
    vi.spyOn(gm.snake, 'grow').mockImplementation(() => {})
    vi.spyOn(gm.food, 'respawn').mockImplementation(() => {})

    gm.update()

    expect(gm.scoreManager.currentScore).toBe(10)
  })
})
