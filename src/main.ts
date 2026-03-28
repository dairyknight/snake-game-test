import { GameManager } from './game/GameManager';
import { GameLoop } from './game/GameLoop';
import { Renderer } from './renderer/Renderer';
import { KeyboardInput } from './input/KeyboardInput';
import { TouchInput } from './input/TouchInput';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { PauseOverlay } from './ui/PauseOverlay';
import { GameState } from './state/GameState';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element not found');

const gameManager = new GameManager();
const renderer = new Renderer(canvas, gameManager);

const keyboardInput = new KeyboardInput(gameManager);
keyboardInput.attach();

const touchInput = new TouchInput(gameManager, canvas);
touchInput.attach();

renderer.resize();
window.addEventListener('resize', () => renderer.resize());

let lastDrawTime = 0;
const gameLoop = new GameLoop(gameManager, (_interpolation) => {
  const now = performance.now();
  const delta = lastDrawTime === 0 ? 16 : now - lastDrawTime;
  lastDrawTime = now;
  renderer.draw(delta);
});

gameLoop.start();

// UI screens
new StartScreen(gameManager);
new GameOverScreen(gameManager);
new PauseOverlay(gameManager);

// Aria announcer for accessibility
const announcer = document.getElementById('aria-announcer');
function announce(msg: string): void {
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = msg; }, 50);
  }
}

gameManager.events.on('stateChange', ({ to }) => {
  if (to === GameState.PLAYING) announce('Game started');
  if (to === GameState.PAUSED) announce('Game paused');
  if (to === GameState.GAME_OVER) announce(`Game over. Score: ${gameManager.getScore()}`);
  if (to === GameState.IDLE) announce('Ready to play');
});

gameManager.events.on('scoreUpdate', ({ score }) => {
  announce(`Score: ${score}`);
});

// Expose for debugging
(window as unknown as Record<string, unknown>).gameManager = gameManager;
(window as unknown as Record<string, unknown>).gameLoop = gameLoop;
