const MAX_TICKS_PER_FRAME = 3

export interface GameLoopDeps {
  /** Called each logical tick (i.e. GameManager.update) */
  onTick: () => void
  /** Called each animation frame (i.e. Renderer.draw) */
  onFrame: () => void
  /** Returns the current tick interval in ms (enables speed ramp in Phase 5) */
  getTickInterval: () => number
}

export class GameLoop {
  private readonly deps: GameLoopDeps

  private _isRunning = false
  private _isPaused = false

  private rafId: number | null = null
  private lastTimestamp: number | null = null
  private accumulated = 0

  constructor(deps: GameLoopDeps) {
    this.deps = deps
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  start(): void {
    if (this._isRunning) return
    this._isRunning = true
    this._isPaused = false
    this.accumulated = 0
    this.lastTimestamp = null
    this.scheduleFrame()
  }

  stop(): void {
    if (!this._isRunning) return
    this._isRunning = false
    this._isPaused = false
    this.accumulated = 0
    this.lastTimestamp = null
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  pause(): void {
    if (!this._isRunning || this._isPaused) return
    this._isPaused = true
  }

  resume(): void {
    if (!this._isRunning || !this._isPaused) return
    this._isPaused = false
    // Reset lastTimestamp so the next frame doesn't include time spent paused.
    this.lastTimestamp = null
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  get isPaused(): boolean {
    return this._isPaused
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private scheduleFrame(): void {
    this.rafId = requestAnimationFrame((timestamp) => this.tick(timestamp))
  }

  private tick(timestamp: number): void {
    // If the loop was stopped between scheduling and firing, bail out.
    if (!this._isRunning) return

    if (this.lastTimestamp !== null && !this._isPaused) {
      const delta = timestamp - this.lastTimestamp
      this.accumulated += delta

      const tickInterval = this.deps.getTickInterval()
      let tickCount = 0

      while (this.accumulated >= tickInterval && tickCount < MAX_TICKS_PER_FRAME) {
        this.deps.onTick()
        this.accumulated -= tickInterval
        tickCount++
      }

      // If we still have excess (i.e. cap was hit), discard the remainder to
      // prevent a tick backlog from building up across frames.
      if (tickCount === MAX_TICKS_PER_FRAME) {
        this.accumulated = 0
      }
    }

    // Always update lastTimestamp (even when paused) so the next frame's delta
    // starts from now rather than accumulating time spent paused.
    // Exception: if paused, we do NOT update lastTimestamp — we want it to
    // reset on resume() so that paused duration is discarded.
    if (!this._isPaused) {
      this.lastTimestamp = timestamp
    }

    // Always render, even when paused (so the paused overlay can be drawn).
    this.deps.onFrame()

    // Schedule the next frame.
    this.scheduleFrame()
  }
}
