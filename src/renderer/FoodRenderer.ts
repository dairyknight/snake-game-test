import { Food } from '../game/Food'

const COLOR_FOOD = '#ff4757'
const COLOR_FOOD_INNER = '#ff6b81'

export class FoodRenderer {
  private readonly ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  draw(food: Food, cellSize: number): void {
    const { ctx } = this
    const { x, y } = food.position

    const cx = x * cellSize + cellSize / 2
    const cy = y * cellSize + cellSize / 2
    const radius = (cellSize / 2) * 0.65

    // Outer circle
    ctx.fillStyle = COLOR_FOOD
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    // Inner highlight (top-left quadrant) for depth
    ctx.fillStyle = COLOR_FOOD_INNER
    ctx.beginPath()
    ctx.arc(cx - radius * 0.2, cy - radius * 0.2, radius * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
}
