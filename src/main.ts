import { GameManager } from './game/GameManager'
import { GameLoop } from './game/GameLoop'
import { Renderer } from './renderer/Renderer'
import { GameState } from './state/GameState'
import { KeyboardInput } from './input/KeyboardInput'
import { TouchInput } from './input/TouchInput'
import { StartScreen } from './ui/StartScreen'
import { GameOverScreen } from './ui/GameOverScreen'
import { PauseOverlay } from './ui/PauseOverlay'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const gm = new GameManager()
const renderer = new Renderer(canvas, gm)

const loop = new GameLoop({
  onTick: () => gm.update(),
  onFrame: () => renderer.draw(),
  getTickInterval: () => gm.scoreManager.getTickInterval(),
})

// Wire state machine → game loop
gm.events.on('stateChange', ({ to }) => {
  if (to === GameState.PLAYING) loop.start()
  else if (to === GameState.PAUSED) loop.pause()
  else if (to === GameState.GAME_OVER || to === GameState.IDLE) loop.stop()
})

// Wire eat flash
gm.events.on('foodEaten', ({ eatenAt }) => renderer.triggerEatFlash(eatenAt))

// Responsive canvas
window.addEventListener('resize', () => renderer.resize())
renderer.resize()
renderer.draw() // initial frame (shows board before game starts)

// Input handlers
new KeyboardInput(gm)
new TouchInput(gm)

// UI screens
const startScreen = new StartScreen(gm)
const gameOverScreen = new GameOverScreen(gm)
const pauseOverlay = new PauseOverlay(gm)

// Show/hide screens on state change
gm.events.on('stateChange', ({ to }) => {
  startScreen.setVisible(to === GameState.IDLE)
  gameOverScreen.setVisible(to === GameState.GAME_OVER)
  pauseOverlay.setVisible(to === GameState.PAUSED)

  if (to === GameState.GAME_OVER) {
    gameOverScreen.update(gm.scoreManager.currentScore, gm.scoreManager.highScore)
  }

  if (to === GameState.IDLE) {
    startScreen.updateHighScore()
  }

  // Announce state change to screen readers
  const announce = document.getElementById('state-announce')
  if (announce) {
    const messages: Record<string, string> = {
      PLAYING: 'Game started',
      PAUSED: 'Game paused',
      GAME_OVER: `Game over. Final score: ${gm.scoreManager.currentScore}`,
      IDLE: 'Ready to play',
    }
    announce.textContent = messages[to] ?? ''
  }
})

// Announce score changes to screen readers
gm.events.on('foodEaten', () => {
  const announce = document.getElementById('score-announce')
  if (announce) {
    announce.textContent = `Score: ${gm.scoreManager.currentScore}`
  }
})

// Initial state — show start screen
startScreen.setVisible(true)
