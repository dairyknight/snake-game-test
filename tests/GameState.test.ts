import { GameState } from '../src/state/GameState'

describe('GameState enum', () => {
  it('has an IDLE value equal to the string "IDLE"', () => {
    expect(GameState.IDLE).toBe('IDLE')
  })

  it('has a PLAYING value equal to the string "PLAYING"', () => {
    expect(GameState.PLAYING).toBe('PLAYING')
  })

  it('has a PAUSED value equal to the string "PAUSED"', () => {
    expect(GameState.PAUSED).toBe('PAUSED')
  })

  it('has a GAME_OVER value equal to the string "GAME_OVER"', () => {
    expect(GameState.GAME_OVER).toBe('GAME_OVER')
  })

  it('exposes exactly four states', () => {
    const values = Object.values(GameState)
    expect(values).toHaveLength(4)
    expect(values).toContain(GameState.IDLE)
    expect(values).toContain(GameState.PLAYING)
    expect(values).toContain(GameState.PAUSED)
    expect(values).toContain(GameState.GAME_OVER)
  })

  it('states are distinct from one another', () => {
    const values = Object.values(GameState)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })
})
