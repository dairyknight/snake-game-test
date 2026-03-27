import { Snake } from '../game/Snake'
import { IVector2 } from '../utils/Vector2'

const COLOR_HEAD = '#00ff87'
const COLOR_BODY = '#00b85e'
const COLOR_GAME_OVER = '#ff4757'
const COLOR_FLASH = '#ffffff'

const FLASH_DURATION = 200 // ms

export class SnakeRenderer {
  private readonly ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  draw(
    snake: Snake,
    cellSize: number,
    eatFlash: { pos: IVector2; startTime: number } | null,
    isGameOver: boolean,
  ): void {
    // Determine flash active and progress
    let flashProgress = 0
    if (eatFlash !== null) {
      const elapsed = performance.now() - eatFlash.startTime
      if (elapsed < FLASH_DURATION) {
        flashProgress = 1 - elapsed / FLASH_DURATION
      }
    }

    // Draw body segments (tail to index 1, so head is drawn last on top)
    for (let i = snake.segments.length - 1; i >= 1; i--) {
      const seg = snake.segments[i]
      const color = isGameOver ? COLOR_GAME_OVER : COLOR_BODY
      this.drawBodySegment(seg, cellSize, color)
    }

    // Draw head
    const headColor = isGameOver
      ? COLOR_GAME_OVER
      : flashProgress > 0
        ? this.lerpColor(COLOR_HEAD, COLOR_FLASH, flashProgress)
        : COLOR_HEAD
    this.drawHeadSegment(snake.head, cellSize, headColor)
  }

  private drawBodySegment(pos: IVector2, cellSize: number, color: string): void {
    const { ctx } = this
    const padding = cellSize * 0.08
    const x = pos.x * cellSize + padding
    const y = pos.y * cellSize + padding
    const size = cellSize - padding * 2
    const radius = size * 0.2

    ctx.fillStyle = color
    ctx.beginPath()
    this.roundRect(x, y, size, size, radius)
    ctx.fill()
  }

  private drawHeadSegment(pos: IVector2, cellSize: number, color: string): void {
    const { ctx } = this
    const padding = cellSize * 0.05
    const x = pos.x * cellSize + padding
    const y = pos.y * cellSize + padding
    const size = cellSize - padding * 2
    const radius = size * 0.35

    ctx.fillStyle = color
    ctx.beginPath()
    this.roundRect(x, y, size, size, radius)
    ctx.fill()
  }

  /** Simple rounded rectangle path helper (supports older browsers lacking ctx.roundRect) */
  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const { ctx } = this
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  /** Linearly interpolate between two hex colour strings */
  private lerpColor(a: string, b: string, t: number): string {
    const ar = parseInt(a.slice(1, 3), 16)
    const ag = parseInt(a.slice(3, 5), 16)
    const ab = parseInt(a.slice(5, 7), 16)
    const br = parseInt(b.slice(1, 3), 16)
    const bg = parseInt(b.slice(3, 5), 16)
    const bb = parseInt(b.slice(5, 7), 16)
    const r = Math.round(ar + (br - ar) * t)
    const g = Math.round(ag + (bg - ag) * t)
    const bl = Math.round(ab + (bb - ab) * t)
    return `rgb(${r},${g},${bl})`
  }
}
