import { GameManager } from './game/GameManager';
import { GameLoop } from './game/GameLoop';
import { Renderer } from './renderer/Renderer';
import { KeyboardInput } from './input/KeyboardInput';
import { TouchInput } from './input/TouchInput';

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

// Expose for debugging
(window as unknown as Record<string, unknown>).gameManager = gameManager;
(window as unknown as Record<string, unknown>).gameLoop = gameLoop;
