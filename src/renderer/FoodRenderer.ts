import { Vector2 } from '../utils/Vector2';

export class FoodRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(pos: Vector2, cellSize: number, flashProgress: number): void {
    const x = pos.x * cellSize;
    const y = pos.y * cellSize;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const radius = (cellSize / 2) - 2;

    // Flash effect: briefly yellow-white when just eaten (flashProgress > 0)
    if (flashProgress > 0) {
      const alpha = flashProgress;
      this.ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    } else {
      this.ctx.fillStyle = '#e94560'; // Red-pink food
    }

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Shine dot
    this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
    this.ctx.beginPath();
    this.ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
