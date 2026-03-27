import { GameManager } from '../game/GameManager'

export class GameOverScreen {
  private el: HTMLElement

  constructor(private gm: GameManager) {
    this.el = this.build()

    const container = document.getElementById('game-container')
    if (container) {
      container.appendChild(this.el)
    }
  }

  private build(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'overlay overlay--solid'
    el.setAttribute('role', 'region')
    el.setAttribute('aria-label', 'Game over screen')

    const title = document.createElement('h2')
    title.textContent = 'GAME OVER'

    const scoreDisplay = document.createElement('p')
    scoreDisplay.className = 'score-display'
    scoreDisplay.id = 'gameover-score'
    scoreDisplay.textContent = `Score: 0`

    const highScoreDisplay = document.createElement('p')
    highScoreDisplay.className = 'high-score-display'
    highScoreDisplay.id = 'gameover-high-score'
    highScoreDisplay.textContent = `Best: 0`

    const btnGroup = document.createElement('div')
    btnGroup.className = 'btn-group'

    const playAgainBtn = document.createElement('button')
    playAgainBtn.className = 'btn btn--primary'
    playAgainBtn.textContent = 'Play Again'
    playAgainBtn.addEventListener('click', () => this.gm.restartGame())

    const clearBtn = document.createElement('button')
    clearBtn.className = 'btn btn--secondary'
    clearBtn.textContent = 'Clear High Score'
    clearBtn.addEventListener('click', () => {
      this.gm.scoreManager.clearHighScore()
      this.updateHighScoreDisplay(this.gm.scoreManager.highScore)
    })

    btnGroup.appendChild(playAgainBtn)
    btnGroup.appendChild(clearBtn)

    el.appendChild(title)
    el.appendChild(scoreDisplay)
    el.appendChild(highScoreDisplay)
    el.appendChild(btnGroup)

    return el
  }

  update(score: number, highScore: number): void {
    const scoreEl = this.el.querySelector<HTMLElement>('#gameover-score')
    if (scoreEl) {
      scoreEl.textContent = `Score: ${score}`
    }
    this.updateHighScoreDisplay(highScore)
  }

  private updateHighScoreDisplay(highScore: number): void {
    const hsEl = this.el.querySelector<HTMLElement>('#gameover-high-score')
    if (hsEl) {
      hsEl.textContent = `Best: ${highScore}`
    }
  }

  setVisible(visible: boolean): void {
    if (visible) {
      this.el.classList.add('visible')
      // Focus Play Again button for keyboard accessibility
      const btn = this.el.querySelector<HTMLButtonElement>('button')
      if (btn) btn.focus()
    } else {
      this.el.classList.remove('visible')
    }
  }
}
