import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInput } from '../src/input/KeyboardInput';
import { GameManager } from '../src/game/GameManager';
import { GameState } from '../src/state/GameState';
import { Direction } from '../src/game/Snake';

describe('KeyboardInput', () => {
  let gameManager: GameManager;
  let input: KeyboardInput;

  beforeEach(() => {
    gameManager = new GameManager();
    input = new KeyboardInput(gameManager);
    input.attach();
  });

  afterEach(() => {
    input.detach();
  });

  function pressKey(key: string): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  it('ArrowRight queues RIGHT direction when PLAYING', () => {
    vi.spyOn(gameManager, 'queueDirection');
    gameManager.startGame(); // go to PLAYING
    pressKey('ArrowRight');
    expect(gameManager.queueDirection).toHaveBeenCalledWith(Direction.RIGHT);
  });

  it('ArrowUp queues UP direction when PLAYING', () => {
    vi.spyOn(gameManager, 'queueDirection');
    gameManager.startGame();
    pressKey('ArrowUp');
    expect(gameManager.queueDirection).toHaveBeenCalledWith(Direction.UP);
  });

  it('P key toggles pause when PLAYING', () => {
    gameManager.startGame();
    pressKey('p');
    expect(gameManager.getState()).toBe(GameState.PAUSED);
    pressKey('P');
    expect(gameManager.getState()).toBe(GameState.PLAYING);
  });

  it('Escape key pauses when PLAYING', () => {
    gameManager.startGame();
    pressKey('Escape');
    expect(gameManager.getState()).toBe(GameState.PAUSED);
  });

  it('Space starts game when IDLE', () => {
    pressKey(' ');
    expect(gameManager.getState()).toBe(GameState.PLAYING);
  });

  it('Enter restarts game when GAME_OVER', () => {
    gameManager.startGame();
    gameManager.endGame();
    pressKey('Enter');
    expect(gameManager.getState()).toBe(GameState.IDLE);
  });

  it('directional key starts game from IDLE', () => {
    pressKey('ArrowUp');
    expect(gameManager.getState()).toBe(GameState.PLAYING);
  });

  it('detach removes listener', () => {
    input.detach();
    vi.spyOn(gameManager, 'queueDirection');
    gameManager.startGame();
    pressKey('ArrowRight');
    expect(gameManager.queueDirection).not.toHaveBeenCalled();
  });
});
