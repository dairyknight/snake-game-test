import { Vector2 } from '../utils/Vector2';

export class SnakeRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(segments: Vector2[], cellSize: number, gameOverProgress: number): void {
    if (segments.length === 0) return;

    segments.forEach((seg, i) => {
      const isHead = i === 0;
      const x = seg.x * cellSize;
      const y = seg.y * cellSize;
      const padding = 1;
      const size = cellSize - padding * 2;

      if (gameOverProgress > 0) {
        // Flash red during game-over animation
        const intensity = Math.floor(gameOverProgress * 255);
        this.ctx.fillStyle = `rgb(${intensity}, 0, 0)`;
      } else if (isHead) {
        this.ctx.fillStyle = '#4ecca3'; // Teal head
      } else {
        // Slightly darker for body
        this.ctx.fillStyle = '#38b48b';
      }

      this.ctx.beginPath();
      this.ctx.roundRect(x + padding, y + padding, size, size, isHead ? 4 : 2);
      this.ctx.fill();

      // Eyes on head
      if (isHead && gameOverProgress === 0) {
        this.drawEyes(seg, cellSize);
      }
    });
  }

  private drawEyes(head: Vector2, cellSize: number): void {
    const cx = head.x * cellSize + cellSize / 2;
    const cy = head.y * cellSize + cellSize / 2;
    const eyeOffset = cellSize * 0.2;
    const eyeRadius = cellSize * 0.08;

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.beginPath();
    this.ctx.arc(cx - eyeOffset, cy - eyeOffset, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(cx + eyeOffset, cy - eyeOffset, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
