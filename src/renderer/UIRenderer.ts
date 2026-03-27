const COLOR_HUD_TEXT = '#ffffff'
const COLOR_PAUSE_OVERLAY = 'rgba(0,0,0,0.5)'
const COLOR_GAMEOVER_OVERLAY = 'rgba(0,0,0,0.7)'
const COLOR_GAMEOVER_TEXT = '#ff4757'
const COLOR_SUBTEXT = '#cccccc'

export class UIRenderer {
  private readonly ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  drawHUD(score: number, highScore: number, speedTier: number, canvasWidth: number): void {
    const { ctx } = this
    const padding = 12
    const fontSize = Math.max(14, Math.floor(canvasWidth * 0.038))

    ctx.font = `bold ${fontSize}px monospace`
    ctx.textBaseline = 'top'
    ctx.fillStyle = COLOR_HUD_TEXT

    // Score on the left
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${score}`, padding, padding)

    // High score on the right
    ctx.textAlign = 'right'
    ctx.fillText(`Best: ${highScore}`, canvasWidth - padding, padding)

    // Speed tier indicator centred (small)
    const tierFontSize = Math.max(11, Math.floor(canvasWidth * 0.028))
    ctx.font = `${tierFontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = COLOR_SUBTEXT
    ctx.fillText(`Speed ${speedTier}`, canvasWidth / 2, padding)
  }

  drawPauseOverlay(canvasWidth: number, canvasHeight: number): void {
    const { ctx } = this

    // Dim the board
    ctx.fillStyle = COLOR_PAUSE_OVERLAY
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Pause text
    const fontSize = Math.max(24, Math.floor(canvasWidth * 0.08))
    ctx.font = `bold ${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = COLOR_HUD_TEXT
    ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2)

    const subFontSize = Math.max(14, Math.floor(canvasWidth * 0.04))
    ctx.font = `${subFontSize}px monospace`
    ctx.fillStyle = COLOR_SUBTEXT
    ctx.fillText('Press P to resume', canvasWidth / 2, canvasHeight / 2 + fontSize * 0.85)
  }

  drawGameOverOverlay(canvasWidth: number, canvasHeight: number): void {
    const { ctx } = this

    // Dim the board
    ctx.fillStyle = COLOR_GAMEOVER_OVERLAY
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Game Over text
    const fontSize = Math.max(24, Math.floor(canvasWidth * 0.08))
    ctx.font = `bold ${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = COLOR_GAMEOVER_TEXT
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2)

    const subFontSize = Math.max(14, Math.floor(canvasWidth * 0.04))
    ctx.font = `${subFontSize}px monospace`
    ctx.fillStyle = COLOR_SUBTEXT
    ctx.fillText('Press Enter to restart', canvasWidth / 2, canvasHeight / 2 + fontSize * 0.85)
  }
}
