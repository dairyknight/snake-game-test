import { describe, it, expect, vi } from 'vitest';
import { GameManager } from '../src/game/GameManager';
import { GameState } from '../src/state/GameState';

describe('GameManager', () => {
  it('initial state is IDLE', () => {
    const gm = new GameManager();
    expect(gm.getState()).toBe(GameState.IDLE);
  });

  it('startGame transitions IDLE → PLAYING', () => {
    const gm = new GameManager();
    gm.startGame();
    expect(gm.getState()).toBe(GameState.PLAYING);
  });

  it('pauseGame transitions PLAYING → PAUSED', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.pauseGame();
    expect(gm.getState()).toBe(GameState.PAUSED);
  });

  it('resumeGame transitions PAUSED → PLAYING', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.pauseGame();
    gm.resumeGame();
    expect(gm.getState()).toBe(GameState.PLAYING);
  });

  it('togglePause pauses when PLAYING', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.togglePause();
    expect(gm.getState()).toBe(GameState.PAUSED);
  });

  it('togglePause resumes when PAUSED', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.togglePause();
    gm.togglePause();
    expect(gm.getState()).toBe(GameState.PLAYING);
  });

  it('endGame transitions PLAYING → GAME_OVER', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.endGame();
    expect(gm.getState()).toBe(GameState.GAME_OVER);
  });

  it('restartGame transitions GAME_OVER → IDLE', () => {
    const gm = new GameManager();
    gm.startGame();
    gm.endGame();
    gm.restartGame();
    expect(gm.getState()).toBe(GameState.IDLE);
  });

  it('stateChange event is emitted on each transition', () => {
    const gm = new GameManager();
    const handler = vi.fn();
    gm.events.on('stateChange', handler);

    gm.startGame();
    expect(handler).toHaveBeenCalledWith({ from: GameState.IDLE, to: GameState.PLAYING });

    gm.pauseGame();
    expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.PAUSED });

    gm.resumeGame();
    expect(handler).toHaveBeenCalledWith({ from: GameState.PAUSED, to: GameState.PLAYING });

    gm.endGame();
    expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.GAME_OVER });

    gm.restartGame();
    expect(handler).toHaveBeenCalledWith({ from: GameState.GAME_OVER, to: GameState.IDLE });

    expect(handler).toHaveBeenCalledTimes(5);
  });

  it('invalid transition: pauseGame when IDLE does nothing', () => {
    const gm = new GameManager();
    const handler = vi.fn();
    gm.events.on('stateChange', handler);
    gm.pauseGame();
    expect(gm.getState()).toBe(GameState.IDLE);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invalid transition: resumeGame when PLAYING does nothing', () => {
    const gm = new GameManager();
    gm.startGame();
    const handler = vi.fn();
    gm.events.on('stateChange', handler);
    gm.resumeGame();
    expect(gm.getState()).toBe(GameState.PLAYING);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invalid transition: endGame when IDLE does nothing', () => {
    const gm = new GameManager();
    const handler = vi.fn();
    gm.events.on('stateChange', handler);
    gm.endGame();
    expect(gm.getState()).toBe(GameState.IDLE);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invalid transition: startGame when PLAYING does nothing', () => {
    const gm = new GameManager();
    gm.startGame();
    const handler = vi.fn();
    gm.events.on('stateChange', handler);
    gm.startGame();
    expect(gm.getState()).toBe(GameState.PLAYING);
    expect(handler).not.toHaveBeenCalled();
  });

  it('gameOver event is emitted when endGame is called', () => {
    const gm = new GameManager();
    gm.startGame();
    const handler = vi.fn();
    gm.events.on('gameOver', handler);
    gm.endGame();
    expect(handler).toHaveBeenCalledWith({ score: 0 });
  });
});
