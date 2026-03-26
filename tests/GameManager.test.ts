import { GameManager } from '../src/game/GameManager'
import { GameState } from '../src/state/GameState'

describe('GameManager', () => {
  let gm: GameManager

  beforeEach(() => {
    gm = new GameManager()
  })

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts in the IDLE state', () => {
      expect(gm.state).toBe(GameState.IDLE)
    })
  })

  // ---------------------------------------------------------------------------
  // Valid transitions
  // ---------------------------------------------------------------------------
  describe('valid state transitions', () => {
    it('transitions from IDLE to PLAYING when startGame() is called', () => {
      gm.startGame()
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('transitions from PLAYING to PAUSED when pauseGame() is called', () => {
      gm.startGame()
      gm.pauseGame()
      expect(gm.state).toBe(GameState.PAUSED)
    })

    it('transitions from PAUSED to PLAYING when resumeGame() is called', () => {
      gm.startGame()
      gm.pauseGame()
      gm.resumeGame()
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('transitions from PLAYING to GAME_OVER when endGame() is called', () => {
      gm.startGame()
      gm.endGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('transitions from PAUSED to GAME_OVER when endGame() is called', () => {
      gm.startGame()
      gm.pauseGame()
      gm.endGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('transitions from GAME_OVER to IDLE when restartGame() is called', () => {
      gm.startGame()
      gm.endGame()
      gm.restartGame()
      expect(gm.state).toBe(GameState.IDLE)
    })
  })

  // ---------------------------------------------------------------------------
  // Invalid / blocked transitions
  // ---------------------------------------------------------------------------
  describe('blocked transitions (guard conditions)', () => {
    it('does not change state when pauseGame() is called from IDLE', () => {
      gm.pauseGame()
      expect(gm.state).toBe(GameState.IDLE)
    })

    it('does not change state when resumeGame() is called from IDLE', () => {
      gm.resumeGame()
      expect(gm.state).toBe(GameState.IDLE)
    })

    it('does not change state when endGame() is called from IDLE', () => {
      gm.endGame()
      expect(gm.state).toBe(GameState.IDLE)
    })

    it('does not change state when restartGame() is called from IDLE', () => {
      gm.restartGame()
      expect(gm.state).toBe(GameState.IDLE)
    })

    it('does not change state when startGame() is called while already PLAYING', () => {
      gm.startGame()
      gm.startGame() // should be a no-op
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('does not change state when resumeGame() is called from PLAYING', () => {
      gm.startGame()
      gm.resumeGame()
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('does not change state when restartGame() is called from PLAYING', () => {
      gm.startGame()
      gm.restartGame()
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('does not change state when startGame() is called from PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      gm.startGame()
      expect(gm.state).toBe(GameState.PAUSED)
    })

    it('does not change state when pauseGame() is called while already PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      gm.pauseGame() // should be a no-op
      expect(gm.state).toBe(GameState.PAUSED)
    })

    it('does not change state when restartGame() is called from PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      gm.restartGame()
      expect(gm.state).toBe(GameState.PAUSED)
    })

    it('does not change state when startGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      gm.startGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('does not change state when pauseGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      gm.pauseGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('does not change state when resumeGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      gm.resumeGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
    })

    it('does not change state when endGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      gm.endGame() // should be a no-op
      expect(gm.state).toBe(GameState.GAME_OVER)
    })
  })

  // ---------------------------------------------------------------------------
  // stateChange event — valid transitions emit with correct payload
  // ---------------------------------------------------------------------------
  describe('stateChange event on valid transitions', () => {
    it('emits stateChange with { from: IDLE, to: PLAYING } when startGame() succeeds', () => {
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.startGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.IDLE, to: GameState.PLAYING })
    })

    it('emits stateChange with { from: PLAYING, to: PAUSED } when pauseGame() succeeds', () => {
      gm.startGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.pauseGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.PAUSED })
    })

    it('emits stateChange with { from: PAUSED, to: PLAYING } when resumeGame() succeeds', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.resumeGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.PAUSED, to: GameState.PLAYING })
    })

    it('emits stateChange with { from: PLAYING, to: GAME_OVER } when endGame() is called from PLAYING', () => {
      gm.startGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.endGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.GAME_OVER })
    })

    it('emits stateChange with { from: PAUSED, to: GAME_OVER } when endGame() is called from PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.endGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.PAUSED, to: GameState.GAME_OVER })
    })

    it('emits stateChange with { from: GAME_OVER, to: IDLE } when restartGame() succeeds', () => {
      gm.startGame()
      gm.endGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.restartGame()
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ from: GameState.GAME_OVER, to: GameState.IDLE })
    })
  })

  // ---------------------------------------------------------------------------
  // stateChange event — invalid transitions must NOT emit
  // ---------------------------------------------------------------------------
  describe('stateChange event on invalid (blocked) transitions', () => {
    it('does not emit stateChange when pauseGame() is called from IDLE', () => {
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.pauseGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when resumeGame() is called from IDLE', () => {
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.resumeGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when endGame() is called from IDLE', () => {
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.endGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when restartGame() is called from IDLE', () => {
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.restartGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when startGame() is called while PLAYING', () => {
      gm.startGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.startGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when resumeGame() is called from PLAYING', () => {
      gm.startGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.resumeGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when restartGame() is called from PLAYING', () => {
      gm.startGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.restartGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when startGame() is called from PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.startGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when pauseGame() is called while already PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.pauseGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when restartGame() is called from PAUSED', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.restartGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when startGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.startGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when pauseGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.pauseGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when resumeGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.resumeGame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not emit stateChange when endGame() is called from GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.endGame()
      expect(handler).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Full lifecycle round-trip
  // ---------------------------------------------------------------------------
  describe('full lifecycle', () => {
    it('can complete a full IDLE → PLAYING → PAUSED → PLAYING → GAME_OVER → IDLE cycle', () => {
      expect(gm.state).toBe(GameState.IDLE)
      gm.startGame()
      expect(gm.state).toBe(GameState.PLAYING)
      gm.pauseGame()
      expect(gm.state).toBe(GameState.PAUSED)
      gm.resumeGame()
      expect(gm.state).toBe(GameState.PLAYING)
      gm.endGame()
      expect(gm.state).toBe(GameState.GAME_OVER)
      gm.restartGame()
      expect(gm.state).toBe(GameState.IDLE)
    })

    it('can restart and play a second game after GAME_OVER', () => {
      gm.startGame()
      gm.endGame()
      gm.restartGame()
      gm.startGame()
      expect(gm.state).toBe(GameState.PLAYING)
    })

    it('accumulates the correct sequence of stateChange events through a full cycle', () => {
      const events: Array<{ from: GameState; to: GameState }> = []
      gm.events.on('stateChange', e => events.push(e))

      gm.startGame()
      gm.pauseGame()
      gm.resumeGame()
      gm.endGame()
      gm.restartGame()

      expect(events).toEqual([
        { from: GameState.IDLE, to: GameState.PLAYING },
        { from: GameState.PLAYING, to: GameState.PAUSED },
        { from: GameState.PAUSED, to: GameState.PLAYING },
        { from: GameState.PLAYING, to: GameState.GAME_OVER },
        { from: GameState.GAME_OVER, to: GameState.IDLE },
      ])
    })
  })
})
