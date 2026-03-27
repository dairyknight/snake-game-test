import { GameManager } from './game/GameManager'
import { GameLoop } from './game/GameLoop'
import { Renderer } from './renderer/Renderer'
import { GameState } from './state/GameState'

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
