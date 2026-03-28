import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';
import { SnakeRenderer } from './SnakeRenderer';
import { FoodRenderer } from './FoodRenderer';
import { UIRenderer } from './UIRenderer';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 0;
  private snakeRenderer: SnakeRenderer;
  private foodRenderer: FoodRenderer;
  private uiRenderer: UIRenderer;
  private showGrid: boolean = false;

  // Flash state for food-eat animation
  private flashTimer: number = 0;
  private readonly FLASH_DURATION = 400; // ms

  // Game-over animation state
  private gameOverTimer: number = 0;
  private readonly GAME_OVER_DURATION = 800; // ms

  constructor(canvas: HTMLCanvasElement, private readonly gameManager: GameManager) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.canvas = canvas;
    this.ctx = ctx;
    this.snakeRenderer = new SnakeRenderer(ctx);
    this.foodRenderer = new FoodRenderer(ctx);
    this.uiRenderer = new UIRenderer(ctx);

    this.gameManager.events.on('foodEaten', () => {
      this.flashTimer = this.FLASH_DURATION;
    });
    this.gameManager.events.on('stateChange', ({ to }) => {
      if (to === GameState.GAME_OVER) {
        this.gameOverTimer = this.GAME_OVER_DURATION;
      }
    });
  }

  resize(): void {
    const board = this.gameManager.getBoard();
    const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9);
    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = Math.floor(size / Math.max(board.cols, board.rows));
  }

  getCellSize(): number {
    return this.cellSize;
  }

  toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  draw(deltaMs: number): void {
    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - deltaMs);
    if (this.gameOverTimer > 0) this.gameOverTimer = Math.max(0, this.gameOverTimer - deltaMs);

    const board = this.gameManager.getBoard();
    const snake = this.gameManager.getSnake();
    const food = this.gameManager.getFood();
    const state = this.gameManager.getState();

    // 1. Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Background
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 3. Optional grid
    if (this.showGrid) {
      this.drawGrid(board.cols, board.rows);
    }

    // 4. Food
    if (food) {
      this.foodRenderer.draw(food.getPosition(), this.cellSize, this.flashTimer / this.FLASH_DURATION);
    }

    // 5. Snake
    this.snakeRenderer.draw(
      snake.getSegments(),
      this.cellSize,
      this.gameOverTimer > 0 ? this.gameOverTimer / this.GAME_OVER_DURATION : 0
    );

    // 6. HUD
    const scoreManager = this.gameManager.getScoreManager();
    this.uiRenderer.drawHUD(
      scoreManager.score,
      scoreManager.highScore,
      this.canvas.width,
      this.canvas.height,
    );

    // 7. Dim overlay for game over
    if (state === GameState.GAME_OVER && this.gameOverTimer <= 0) {
      this.uiRenderer.drawGameOverDim(this.canvas.width, this.canvas.height);
    }
  }

  private drawGrid(cols: number, rows: number): void {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, rows * this.cellSize);
      this.ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(cols * this.cellSize, y * this.cellSize);
      this.ctx.stroke();
    }
  }
}
