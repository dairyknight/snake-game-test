import { GameManager } from '../game/GameManager'
import { GameState } from '../state/GameState'
import { IVector2 } from '../utils/Vector2'
import { SnakeRenderer } from './SnakeRenderer'
import { FoodRenderer } from './FoodRenderer'
import { UIRenderer } from './UIRenderer'

const GRID_SIZE = 20
const COLOR_BG = '#1a1a2e'
const COLOR_GRID = '#16213e'

export interface RendererConfig {
  showGrid?: boolean
}

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D
  private cellSize = 0

  private readonly snakeRenderer: SnakeRenderer
  private readonly foodRenderer: FoodRenderer
  private readonly uiRenderer: UIRenderer

  private eatFlash: { pos: IVector2; startTime: number } | null = null

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gm: GameManager,
    private readonly config: RendererConfig = {},
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context from canvas')
    this.ctx = ctx
    this.snakeRenderer = new SnakeRenderer(ctx)
    this.foodRenderer = new FoodRenderer(ctx)
    this.uiRenderer = new UIRenderer(ctx)
  }

  triggerEatFlash(pos: IVector2): void {
    this.eatFlash = { pos, startTime: performance.now() }
  }

  resize(): void {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9
    this.canvas.width = size
    this.canvas.height = size
    this.cellSize = size / GRID_SIZE
  }

  draw(): void {
    const { ctx, canvas, gm, cellSize } = this
    const w = canvas.width
    const h = canvas.height
    const state = gm.state

    // 1. Clear
    ctx.fillStyle = COLOR_BG
    ctx.fillRect(0, 0, w, h)

    // 2. Optional grid
    if (this.config.showGrid) {
      this.drawGrid(w, h)
    }

    // 3. Food
    this.foodRenderer.draw(gm.food, cellSize)

    // 4. Snake (red when game over)
    const isGameOver = state === GameState.GAME_OVER
    this.snakeRenderer.draw(gm.snake, cellSize, this.eatFlash, isGameOver)

    // Clear expired eat flash
    if (this.eatFlash && performance.now() - this.eatFlash.startTime >= 200) {
      this.eatFlash = null
    }

    // 5. HUD
    const speedTier = this.getSpeedTier()
    this.uiRenderer.drawHUD(
      gm.scoreManager.currentScore,
      gm.scoreManager.highScore,
      speedTier,
      w,
    )

    // 6. State overlays (canvas layer; HTML overlays handle the interactive parts in Phase 8)
    if (state === GameState.PAUSED) {
      this.uiRenderer.drawPauseOverlay(w, h)
    } else if (state === GameState.GAME_OVER) {
      this.uiRenderer.drawGameOverOverlay(w, h)
    }
  }

  private drawGrid(w: number, h: number): void {
    const { ctx, cellSize } = this
    ctx.strokeStyle = COLOR_GRID
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = i * cellSize
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(w, pos)
      ctx.stroke()
    }
  }

  private getSpeedTier(): number {
    const interval = this.gm.scoreManager.getTickInterval()
    if (interval >= 150) return 1
    if (interval >= 130) return 2
    if (interval >= 110) return 3
    if (interval >= 90) return 4
    return 5
  }
}
