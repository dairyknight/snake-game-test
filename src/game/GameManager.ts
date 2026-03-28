import { EventEmitter } from '../utils/EventEmitter';
import { GameState } from '../state/GameState';
import { Snake, Direction, DirectionValue } from './Snake';
import { Board } from './Board';
import { Food } from './Food';
import { vec2 } from '../utils/Vector2';

export type GameEvents = {
  stateChange: { from: GameState; to: GameState };
  scoreUpdate: { score: number; highScore: number };
  foodEaten: undefined;
  gameOver: { score: number };
};

const BOARD_COLS = 20;
const BOARD_ROWS = 20;
const POINTS_PER_FOOD = 10;

export class GameManager {
  private state: GameState = GameState.IDLE;
  readonly events = new EventEmitter<GameEvents>();

  private board: Board;
  private snake: Snake;
  private food: Food | null = null;
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    this.board = new Board(BOARD_COLS, BOARD_ROWS);
    this.snake = new Snake(vec2(10, 10), Direction.RIGHT);
    this.tryLoadHighScore();
  }

  private tryLoadHighScore(): void {
    try {
      const stored = typeof localStorage !== 'undefined'
        ? localStorage.getItem('snake_high_score')
        : null;
      if (stored !== null) {
        this.highScore = parseInt(stored, 10) || 0;
      }
    } catch {
      // localStorage not available (e.g., in test env)
    }
  }

  private saveHighScore(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('snake_high_score', String(this.highScore));
      }
    } catch {
      // ignore
    }
  }

  getState(): GameState {
    return this.state;
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  getSnake(): Snake {
    return this.snake;
  }

  getBoard(): Board {
    return this.board;
  }

  getFood(): Food | null {
    return this.food;
  }

  queueDirection(dir: DirectionValue): void {
    if (this.state === GameState.PLAYING) {
      this.snake.queueDirection(dir);
    }
  }

  private transition(to: GameState): void {
    const from = this.state;
    this.state = to;
    this.events.emit('stateChange', { from, to });
  }

  startGame(): void {
    if (this.state === GameState.IDLE) {
      this.initGame();
      this.transition(GameState.PLAYING);
    }
  }

  private initGame(): void {
    const startPos = vec2(Math.floor(BOARD_COLS / 2), Math.floor(BOARD_ROWS / 2));
    this.snake.reset(startPos, Direction.RIGHT);
    this.score = 0;
    this.food = new Food(this.board, this.snake.getSegments());
  }

  pauseGame(): void {
    if (this.state === GameState.PLAYING) {
      this.transition(GameState.PAUSED);
    }
  }

  resumeGame(): void {
    if (this.state === GameState.PAUSED) {
      this.transition(GameState.PLAYING);
    }
  }

  togglePause(): void {
    if (this.state === GameState.PLAYING) {
      this.pauseGame();
    } else if (this.state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  endGame(): void {
    if (this.state === GameState.PLAYING) {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      this.transition(GameState.GAME_OVER);
      this.events.emit('gameOver', { score: this.score });
    }
  }

  restartGame(): void {
    if (this.state === GameState.GAME_OVER || this.state === GameState.IDLE) {
      this.transition(GameState.IDLE);
    }
  }

  update(): void {
    if (this.state !== GameState.PLAYING) return;
    if (!this.food) return;

    this.snake.move();

    const head = this.snake.getHead();

    // Wall collision
    if (this.board.isOutOfBounds(head)) {
      this.endGame();
      return;
    }

    // Self collision
    if (this.snake.checkSelfCollision()) {
      this.endGame();
      return;
    }

    // Food eaten
    if (this.food.isEaten(head)) {
      this.snake.grow();
      this.score += POINTS_PER_FOOD;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      this.events.emit('foodEaten', undefined);
      this.events.emit('scoreUpdate', { score: this.score, highScore: this.highScore });

      const respawned = this.food.respawn(this.board, this.snake.getSegments());
      if (!respawned) {
        // Board full — player wins! Treat as game over for now (v1 spec)
        this.endGame();
      }
    }
  }

  clearHighScore(): void {
    this.highScore = 0;
    this.saveHighScore();
  }
}
