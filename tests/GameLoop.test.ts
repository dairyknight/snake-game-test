import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GameLoop } from '../src/game/GameLoop';
import { GameManager } from '../src/game/GameManager';
import { GameState } from '../src/state/GameState';

// Mock requestAnimationFrame
let rafCallbacks: ((ts: number) => void)[] = [];
global.requestAnimationFrame = vi.fn((cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
});
global.cancelAnimationFrame = vi.fn();

function flushRaf(timestamp: number): void {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach((cb) => cb(timestamp));
}

describe('GameLoop', () => {
  let gameManager: GameManager;
  let drawFn: ReturnType<typeof vi.fn>;
  let gameLoop: GameLoop;

  beforeEach(() => {
    rafCallbacks = [];
    vi.clearAllMocks();
    gameManager = new GameManager();
    drawFn = vi.fn();
    gameLoop = new GameLoop(gameManager, drawFn);
  });

  describe('getTickInterval()', () => {
    it('returns 150ms at score 0 (tier 1)', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(0);
      expect(gameLoop.getTickInterval()).toBe(150);
    });

    it('returns 120ms at score 50', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(50);
      expect(gameLoop.getTickInterval()).toBe(120);
    });

    it('returns 100ms at score 100', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(100);
      expect(gameLoop.getTickInterval()).toBe(100);
    });

    it('returns 80ms at score 150', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(150);
      expect(gameLoop.getTickInterval()).toBe(80);
    });

    it('returns 65ms at score 200', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(200);
      expect(gameLoop.getTickInterval()).toBe(65);
    });

    it('returns 60ms at score 250 (max speed)', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(250);
      expect(gameLoop.getTickInterval()).toBe(60);
    });

    it('returns 60ms at score above 250', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(500);
      expect(gameLoop.getTickInterval()).toBe(60);
    });

    it('returns 120ms at score 99 (just below tier 3)', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(99);
      expect(gameLoop.getTickInterval()).toBe(120);
    });
  });

  describe('getSpeedTier()', () => {
    it('returns tier 1 at score 0', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(0);
      expect(gameLoop.getSpeedTier()).toBe(1);
    });

    it('returns tier 2 at score 50', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(50);
      expect(gameLoop.getSpeedTier()).toBe(2);
    });

    it('returns tier 3 at score 100', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(100);
      expect(gameLoop.getSpeedTier()).toBe(3);
    });

    it('returns tier 4 at score 150', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(150);
      expect(gameLoop.getSpeedTier()).toBe(4);
    });

    it('returns tier 5 at score 200', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(200);
      expect(gameLoop.getSpeedTier()).toBe(5);
    });

    it('returns tier 6 at score 250', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(250);
      expect(gameLoop.getSpeedTier()).toBe(6);
    });

    it('returns tier 6 at score above 250', () => {
      vi.spyOn(gameManager, 'getScore').mockReturnValue(1000);
      expect(gameLoop.getSpeedTier()).toBe(6);
    });
  });

  describe('start() and draw()', () => {
    it('calls requestAnimationFrame when started', () => {
      gameLoop.start();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('does not double-start if already running', () => {
      gameLoop.start();
      gameLoop.start();
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('calls draw on each RAF tick', () => {
      gameLoop.start();
      flushRaf(100);
      expect(drawFn).toHaveBeenCalledTimes(1);
    });

    it('schedules another RAF after each tick', () => {
      gameLoop.start();
      flushRaf(100);
      // One from start(), one re-scheduled from tick
      expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop()', () => {
    it('calls cancelAnimationFrame and stops loop', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('does not call draw after stop', () => {
      gameLoop.start();
      gameLoop.stop();
      rafCallbacks = []; // clear any pending callbacks
      flushRaf(200);
      expect(drawFn).not.toHaveBeenCalled();
    });
  });

  describe('state-based behavior', () => {
    it('does not call gameManager.update() when state is IDLE', () => {
      const updateSpy = vi.spyOn(gameManager, 'update');
      // State is IDLE by default
      gameLoop.start();
      flushRaf(100);
      flushRaf(300); // 200ms later
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('does not call gameManager.update() when state is PAUSED', () => {
      const updateSpy = vi.spyOn(gameManager, 'update');
      gameManager.startGame(); // IDLE -> PLAYING
      gameManager.pauseGame(); // PLAYING -> PAUSED
      gameLoop.start();
      flushRaf(100);
      flushRaf(400); // 300ms later — would be 2 ticks if playing
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('resets accumulator when PAUSED so ticks do not burst on resume', () => {
      const updateSpy = vi.spyOn(gameManager, 'update');
      gameManager.startGame();
      gameLoop.start();

      // Simulate some time passing while PAUSED
      gameManager.pauseGame();
      flushRaf(100);
      flushRaf(500); // large gap — would cause tick burst if accumulator not reset
      flushRaf(600);

      // Resume and advance just a little (not enough for a tick at 150ms interval)
      gameManager.resumeGame();
      flushRaf(650); // only 50ms after resume frame

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('calls gameManager.update() when state is PLAYING and enough time has passed', () => {
      const updateSpy = vi.spyOn(gameManager, 'update');
      gameManager.startGame(); // IDLE -> PLAYING
      gameLoop.start();

      flushRaf(1000);  // initializes lastTimestamp to 1000 (non-zero)
      flushRaf(1160);  // 160ms delta > 150ms tick interval

      expect(updateSpy).toHaveBeenCalledTimes(1);
    });

    it('stops accumulating ticks when GAME_OVER', () => {
      const updateSpy = vi.spyOn(gameManager, 'update');
      gameManager.startGame();
      gameLoop.start();

      flushRaf(0);
      gameManager.endGame(); // PLAYING -> GAME_OVER
      flushRaf(500); // large delta, but should not trigger updates

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('interpolation', () => {
    it('passes interpolation=0 when state is IDLE', () => {
      gameLoop.start();
      flushRaf(100);
      expect(drawFn).toHaveBeenCalledWith(0);
    });

    it('passes interpolation=0 when state is PAUSED', () => {
      gameManager.startGame();
      gameManager.pauseGame();
      gameLoop.start();
      flushRaf(100);
      expect(drawFn).toHaveBeenCalledWith(0);
    });

    it('passes a fractional interpolation when PLAYING', () => {
      gameManager.startGame();
      gameLoop.start();
      flushRaf(1000);  // initializes lastTimestamp to 1000 (non-zero)
      flushRaf(1075);  // 75ms = half of 150ms tick interval

      const lastCall = drawFn.mock.calls[drawFn.mock.calls.length - 1];
      const interpolation = lastCall[0] as number;
      expect(interpolation).toBeGreaterThan(0);
      expect(interpolation).toBeLessThanOrEqual(1);
    });
  });
});
