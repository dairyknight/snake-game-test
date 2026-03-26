import { GameLoop, GameLoopDeps } from '../src/game/GameLoop'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A minimal rAF/cAF stub that lets us drive frames manually.
 *
 * `rafCallbacks` holds the registered callbacks indexed by id.
 * `flush(timestamp)` fires ALL currently registered callbacks (simulating one
 * display frame) and removes them so they don't fire again unless re-registered.
 */
let rafId = 0
const rafCallbacks = new Map<number, FrameRequestCallback>()

function mockRaf(cb: FrameRequestCallback): number {
  const id = ++rafId
  rafCallbacks.set(id, cb)
  return id
}

function mockCaf(id: number): void {
  rafCallbacks.delete(id)
}

/** Fire every pending rAF callback with the given timestamp. */
function flush(timestamp: number): void {
  // Snapshot the current callbacks; each call to the cb may re-register via
  // scheduleFrame(), so we only run what was pending at flush-start.
  const pending = new Map(rafCallbacks)
  pending.forEach((cb, id) => {
    rafCallbacks.delete(id)
    cb(timestamp)
  })
}

function makeDeps(overrides: Partial<GameLoopDeps> = {}): {
  deps: GameLoopDeps
  onTick: ReturnType<typeof vi.fn>
  onFrame: ReturnType<typeof vi.fn>
  getTickInterval: ReturnType<typeof vi.fn>
} {
  const onTick = vi.fn()
  const onFrame = vi.fn()
  const getTickInterval = vi.fn().mockReturnValue(150)
  const deps: GameLoopDeps = {
    onTick,
    onFrame,
    getTickInterval,
    ...overrides,
  }
  return { deps, onTick, onFrame, getTickInterval }
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  rafId = 0
  rafCallbacks.clear()
  vi.stubGlobal('requestAnimationFrame', mockRaf)
  vi.stubGlobal('cancelAnimationFrame', mockCaf)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GameLoop', () => {
  describe('initial state', () => {
    it('is not running before start()', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      expect(loop.isRunning).toBe(false)
    })

    it('is not paused before start()', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      expect(loop.isPaused).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // start / stop
  // -------------------------------------------------------------------------
  describe('start()', () => {
    it('sets isRunning to true', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      expect(loop.isRunning).toBe(true)
    })

    it('schedules a rAF callback', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      expect(rafCallbacks.size).toBe(1)
    })

    it('is idempotent — calling start() twice does not double-register', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.start()
      expect(rafCallbacks.size).toBe(1)
    })
  })

  describe('stop()', () => {
    it('sets isRunning to false', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.stop()
      expect(loop.isRunning).toBe(false)
    })

    it('cancels the pending rAF callback', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.stop()
      expect(rafCallbacks.size).toBe(0)
    })

    it('is safe to call when not running', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      expect(() => loop.stop()).not.toThrow()
    })
  })

  // -------------------------------------------------------------------------
  // onFrame — fires every rAF cycle
  // -------------------------------------------------------------------------
  describe('onFrame', () => {
    it('is called on every animation frame', () => {
      const { deps, onFrame } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // frame 1 — no delta yet (lastTimestamp is null)
      flush(16)  // frame 2
      flush(32)  // frame 3

      expect(onFrame).toHaveBeenCalledTimes(3)
    })

    it('is called even when the loop is paused', () => {
      const { deps, onFrame } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // sets up lastTimestamp
      loop.pause()
      flush(150) // paused — onTick should NOT fire but onFrame SHOULD
      flush(300)

      expect(onFrame).toHaveBeenCalledTimes(3) // 0, 150, 300
    })

    it('does NOT fire after stop()', () => {
      const { deps, onFrame } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)
      loop.stop()
      // Attempting to flush again — no callbacks should be registered
      flush(16)

      expect(onFrame).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // onTick — fixed logical tick
  // -------------------------------------------------------------------------
  describe('onTick', () => {
    it('fires when accumulated time reaches the tick interval', () => {
      const { deps, onTick } = makeDeps() // tickInterval = 150ms
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // lastTimestamp = 0, no delta yet
      flush(150) // delta = 150ms → exactly one tick

      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('fires multiple times when accumulated time covers multiple intervals', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // prime lastTimestamp
      flush(300) // delta = 300ms → two ticks (300 / 150 = 2)

      expect(onTick).toHaveBeenCalledTimes(2)
    })

    it('does NOT fire when accumulated time is below the tick interval', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // prime
      flush(100) // delta = 100ms < 150ms → no tick

      expect(onTick).toHaveBeenCalledTimes(0)
    })

    it('accumulates leftover time across frames', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)   // prime
      flush(100) // 100ms accumulated — no tick yet
      flush(200) // +100ms = 200ms total — no tick yet? Wait: 200-100 = 100, acc = 200
      // Actually: frame at t=100: delta=100, acc=100 (<150 so no tick)
      //           frame at t=200: delta=100, acc=200 (>=150 so 1 tick, acc=50)
      expect(onTick).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // Pause — no ticks while paused, frames continue
  // -------------------------------------------------------------------------
  describe('pause() / resume()', () => {
    it('sets isPaused to true after pause()', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.pause()
      expect(loop.isPaused).toBe(true)
    })

    it('sets isPaused to false after resume()', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.pause()
      loop.resume()
      expect(loop.isPaused).toBe(false)
    })

    it('does NOT fire onTick while paused', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)    // prime lastTimestamp
      loop.pause()
      flush(150)  // would normally trigger a tick — but paused
      flush(300)

      expect(onTick).toHaveBeenCalledTimes(0)
    })

    it('resumes ticking after resume() without counting paused time', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)      // prime lastTimestamp = 0
      loop.pause()
      flush(10000)  // huge gap while paused — should NOT cause tick backlog
      loop.resume() // lastTimestamp reset to null
      flush(10100)  // sets lastTimestamp = 10100 (no delta yet — first frame after resume)
      flush(10250)  // delta = 150ms → exactly one tick

      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('is idempotent — pausing an already-paused loop does nothing', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.pause()
      loop.pause()
      expect(loop.isPaused).toBe(true)
    })

    it('resume() on a non-paused loop does nothing', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()
      loop.resume() // already not paused
      expect(loop.isPaused).toBe(false)
    })

    it('pause() does nothing when loop is not running', () => {
      const { deps } = makeDeps()
      const loop = new GameLoop(deps)
      loop.pause()
      expect(loop.isPaused).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Max ticks per frame cap (no tick backlog)
  // -------------------------------------------------------------------------
  describe('max ticks per frame cap', () => {
    it('fires at most 3 ticks per frame regardless of elapsed time', () => {
      const { deps, onTick } = makeDeps() // tickInterval = 150ms
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)     // prime lastTimestamp
      flush(9000)  // 9000ms delta → would be 60 ticks without cap; capped at 3

      expect(onTick).toHaveBeenCalledTimes(3)
    })

    it('discards accumulated excess after hitting the cap (no backlog)', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)      // prime
      flush(9000)   // capped at 3 ticks; accumulator reset to 0
      flush(9016)   // only 16ms since last frame — below 150ms, no new ticks

      expect(onTick).toHaveBeenCalledTimes(3)
    })
  })

  // -------------------------------------------------------------------------
  // getTickInterval callback is consulted dynamically
  // -------------------------------------------------------------------------
  describe('getTickInterval callback', () => {
    it('is called on each frame to determine the current tick interval', () => {
      const { deps, getTickInterval } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)
      flush(150)

      // getTickInterval is called at least once per frame (when delta > 0)
      expect(getTickInterval).toHaveBeenCalled()
    })

    it('respects a changed tick interval on the fly', () => {
      const getTickInterval = vi.fn()
      // Start slow (300ms ticks), then switch to fast (150ms ticks)
      getTickInterval.mockReturnValue(300)

      const onTick = vi.fn()
      const onFrame = vi.fn()
      const loop = new GameLoop({ onTick, onFrame, getTickInterval })
      loop.start()

      flush(0)   // prime
      flush(150) // 150ms delta, tickInterval=300 → no tick
      expect(onTick).toHaveBeenCalledTimes(0)

      // Switch interval to 150ms
      getTickInterval.mockReturnValue(150)
      flush(300) // +150ms, tickInterval=150 → 1 tick (acc was 150, now 300 total)
      // acc = 150 from before + 150 new delta = 300; 300/150 = 2 ticks? Let's think:
      // After frame at t=150: acc = 150 (no tick fired, interval was 300)
      // Frame at t=300: delta = 150, acc = 150+150 = 300, interval now 150
      //   tick 1: acc = 300-150 = 150, tickCount=1
      //   tick 2: acc = 150-150 = 0,   tickCount=2
      expect(onTick).toHaveBeenCalledTimes(2)
    })
  })

  // -------------------------------------------------------------------------
  // Stopped loop does not fire callbacks
  // -------------------------------------------------------------------------
  describe('stopped loop', () => {
    it('does not fire onTick after stop()', () => {
      const { deps, onTick } = makeDeps()
      const loop = new GameLoop(deps)
      loop.start()

      flush(0)
      loop.stop()
      flush(150) // nothing registered — callbacks map is empty

      expect(onTick).toHaveBeenCalledTimes(0)
    })

    it('can be restarted after stop()', () => {
      const { deps, onFrame } = makeDeps()
      const loop = new GameLoop(deps)

      loop.start()
      flush(0)
      loop.stop()

      loop.start()
      flush(0)  // new start, new frame
      flush(16)

      // first start: flush(0) = 1 frame
      // second start: flush(0) + flush(16) = 2 frames → total 3
      expect(onFrame).toHaveBeenCalledTimes(3)
    })
  })
})
