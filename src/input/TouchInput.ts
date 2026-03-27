import { GameManager } from '../game/GameManager'
import { GameState } from '../state/GameState'
import { vec2 } from '../utils/Vector2'

const SWIPE_THRESHOLD = 30 // px

export class TouchInput {
  private readonly gm: GameManager

  private touchStartX = 0
  private touchStartY = 0

  private readonly onTouchStart: (e: TouchEvent) => void
  private readonly onTouchEnd: (e: TouchEvent) => void
  private readonly onResize: () => void

  private dpad: HTMLDivElement | null = null

  constructor(gm: GameManager) {
    this.gm = gm

    this.onTouchStart = this.handleTouchStart.bind(this)
    this.onTouchEnd = this.handleTouchEnd.bind(this)
    this.onResize = this.handleResize.bind(this)

    window.addEventListener('touchstart', this.onTouchStart, { passive: false })
    window.addEventListener('touchend', this.onTouchEnd, { passive: false })
    window.addEventListener('resize', this.onResize)

    this.createDpad()
    this.handleResize()
  }

  private applyDirection(dx: number, dy: number): void {
    const current = this.gm.snake.direction
    if (dx === -current.x && dy === -current.y) return
    this.gm._pendingDirection = vec2(dx, dy)
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return
    // Prevent scroll during gameplay
    if (
      this.gm.state === GameState.PLAYING ||
      this.gm.state === GameState.PAUSED
    ) {
      e.preventDefault()
    }
    const touch = e.touches[0]
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length === 0) return
    if (
      this.gm.state === GameState.PLAYING ||
      this.gm.state === GameState.PAUSED
    ) {
      e.preventDefault()
    }

    // Start/restart via tap when IDLE or GAME_OVER
    if (this.gm.state === GameState.IDLE) {
      const touch = e.changedTouches[0]
      const dx = touch.clientX - this.touchStartX
      const dy = touch.clientY - this.touchStartY
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        this.gm.startGame()
        return
      }
    }
    if (this.gm.state === GameState.GAME_OVER) {
      const touch = e.changedTouches[0]
      const dx = touch.clientX - this.touchStartX
      const dy = touch.clientY - this.touchStartY
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        this.gm.restartGame()
        return
      }
    }

    if (this.gm.state !== GameState.PLAYING) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - this.touchStartX
    const dy = touch.clientY - this.touchStartY

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx > absDy && absDx > SWIPE_THRESHOLD) {
      this.applyDirection(dx > 0 ? 1 : -1, 0)
    } else if (absDy > absDx && absDy > SWIPE_THRESHOLD) {
      this.applyDirection(0, dy > 0 ? 1 : -1)
    }
  }

  private createDpad(): void {
    const style = document.createElement('style')
    style.textContent = `
      #dpad {
        display: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        grid-template-areas:
          ". up ."
          "left . right"
          ". down .";
        grid-template-columns: 60px 60px 60px;
        grid-template-rows: 60px 60px 60px;
        gap: 4px;
        z-index: 100;
        user-select: none;
        -webkit-user-select: none;
      }
      #dpad.dpad-visible {
        display: grid;
      }
      #dpad button {
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 8px;
        color: white;
        font-size: 24px;
        cursor: pointer;
        touch-action: manipulation;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      #dpad button:active {
        background: rgba(255,255,255,0.35);
      }
      #dpad-up    { grid-area: up; }
      #dpad-down  { grid-area: down; }
      #dpad-left  { grid-area: left; }
      #dpad-right { grid-area: right; }
    `
    document.head.appendChild(style)

    const dpad = document.createElement('div')
    dpad.id = 'dpad'

    const buttons: Array<{ id: string; label: string; dx: number; dy: number }> = [
      { id: 'dpad-up',    label: '↑', dx: 0,  dy: -1 },
      { id: 'dpad-down',  label: '↓', dx: 0,  dy: 1  },
      { id: 'dpad-left',  label: '←', dx: -1, dy: 0  },
      { id: 'dpad-right', label: '→', dx: 1,  dy: 0  },
    ]

    for (const btn of buttons) {
      const el = document.createElement('button')
      el.id = btn.id
      el.textContent = btn.label
      el.addEventListener('touchstart', (e) => {
        e.preventDefault()
        if (this.gm.state === GameState.PLAYING) {
          this.applyDirection(btn.dx, btn.dy)
        }
      }, { passive: false })
      el.addEventListener('click', () => {
        if (this.gm.state === GameState.PLAYING) {
          this.applyDirection(btn.dx, btn.dy)
        }
      })
      dpad.appendChild(el)
    }

    document.body.appendChild(dpad)
    this.dpad = dpad
  }

  private handleResize(): void {
    if (!this.dpad) return
    if (window.innerWidth < 768) {
      this.dpad.classList.add('dpad-visible')
    } else {
      this.dpad.classList.remove('dpad-visible')
    }
  }

  destroy(): void {
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchend', this.onTouchEnd)
    window.removeEventListener('resize', this.onResize)
    if (this.dpad && this.dpad.parentNode) {
      this.dpad.parentNode.removeChild(this.dpad)
    }
    this.dpad = null
  }
}
