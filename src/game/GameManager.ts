import { EventEmitter } from '../utils/EventEmitter';
import { GameState } from '../state/GameState';
import { Snake, Direction, DirectionValue } from './Snake';
import { Board } from './Board';
import { Food } from './Food';
import { ScoreManager } from './ScoreManager';
import { vec2 } from '../utils/Vector2';

export type GameEvents = {
  stateChange: { from: GameState; to: GameState };
  scoreUpdate: { score: number; highScore: number };
  foodEaten: undefined;
  gameOver: { score: number };
};

const BOARD_COLS = 20;
const BOARD_ROWS = 20;

export class GameManager {
  private state: GameState = GameState.IDLE;
  readonly events = new EventEmitter<GameEvents>();

  private board: Board;
  private snake: Snake;
  private food: Food | null = null;
  private scoreManager: ScoreManager = new ScoreManager();

  constructor() {
    this.board = new Board(BOARD_COLS, BOARD_ROWS);
    this.snake = new Snake(vec2(10, 10), Direction.RIGHT);
  }

  getState(): GameState {
    return this.state;
  }

  getScore(): number {
    return this.scoreManager.score;
  }

  getHighScore(): number {
    return this.scoreManager.highScore;
  }

  getScoreManager(): ScoreManager {
    return this.scoreManager;
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
    this.scoreManager.reset();
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
      this.transition(GameState.GAME_OVER);
      this.events.emit('gameOver', { score: this.scoreManager.score });
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
      this.scoreManager.add();
      this.events.emit('foodEaten', undefined);
      this.events.emit('scoreUpdate', {
        score: this.scoreManager.score,
        highScore: this.scoreManager.highScore,
      });

      const respawned = this.food.respawn(this.board, this.snake.getSegments());
      if (!respawned) {
        // Board full — player wins! Treat as game over for now (v1 spec)
        this.endGame();
      }
    }
  }

  clearHighScore(): void {
    this.scoreManager.clearHighScore();
  }
}
