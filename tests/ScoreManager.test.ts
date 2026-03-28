import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../src/game/ScoreManager';

function makeStorage() {
  const storage: Record<string, string> = {};
  return {
    storage,
    mock: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
    },
  };
}

describe('ScoreManager', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('initial state: score = 0, highScore = 0 when localStorage is empty', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    expect(sm.score).toBe(0);
    expect(sm.highScore).toBe(0);
  });

  it('initial state: loads highScore from localStorage', () => {
    const { storage, mock } = makeStorage();
    storage['snake_high_score'] = '80';
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    expect(sm.highScore).toBe(80);
    expect(sm.score).toBe(0);
  });

  it('add() increments score by 10 (default)', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add();
    expect(sm.score).toBe(10);
  });

  it('add() increments score by a custom amount', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add(25);
    expect(sm.score).toBe(25);
  });

  it('add() updates highScore when score exceeds it', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add();
    sm.add();
    expect(sm.highScore).toBe(20);
  });

  it('add() saves highScore to localStorage', () => {
    const { storage, mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add();
    expect(storage['snake_high_score']).toBe('10');
  });

  it('add() does not lower highScore when score is below existing highScore', () => {
    const { storage, mock } = makeStorage();
    storage['snake_high_score'] = '100';
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add(); // score = 10, highScore = 100 → no update
    expect(sm.highScore).toBe(100);
    expect(storage['snake_high_score']).toBe('100');
  });

  it('reset() zeros score but preserves highScore', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add();
    sm.add();
    sm.add(); // score = 30, highScore = 30
    sm.reset();
    expect(sm.score).toBe(0);
    expect(sm.highScore).toBe(30);
  });

  it('clearHighScore() resets highScore to 0 and saves to localStorage', () => {
    const { storage, mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    sm.add();
    sm.add(); // highScore = 20
    sm.clearHighScore();
    expect(sm.highScore).toBe(0);
    expect(storage['snake_high_score']).toBe('0');
  });

  it('multiple add() calls accumulate correctly', () => {
    const { mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    for (let i = 0; i < 5; i++) {
      sm.add();
    }
    expect(sm.score).toBe(50);
    expect(sm.highScore).toBe(50);
  });

  it('highScore persists across instances (mock localStorage)', () => {
    const { storage, mock } = makeStorage();
    vi.stubGlobal('localStorage', mock);

    const sm1 = new ScoreManager();
    sm1.add();
    sm1.add();
    sm1.add(); // score = 30, highScore = 30, saved to storage

    const sm2 = new ScoreManager();
    expect(sm2.highScore).toBe(30);
  });

  it('score does not reset when a new instance is created', () => {
    const { storage, mock } = makeStorage();
    storage['snake_high_score'] = '50';
    vi.stubGlobal('localStorage', mock);

    const sm = new ScoreManager();
    expect(sm.score).toBe(0); // in-memory only, not persisted
    expect(sm.highScore).toBe(50);
  });
});
