export class UIRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  drawHUD(score: number, highScore: number, canvasWidth: number, _canvasHeight: number): void {
    const padding = 12;
    const fontSize = Math.max(14, Math.floor(canvasWidth * 0.04));

    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.textBaseline = 'top';

    // Score — top left
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${score}`, padding, padding);

    // High score — top right
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`BEST: ${highScore}`, canvasWidth - padding, padding);
  }

  drawGameOverDim(canvasWidth: number, canvasHeight: number): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}
