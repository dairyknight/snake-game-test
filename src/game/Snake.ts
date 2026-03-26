import { Vector2, vec2 } from '../utils/Vector2'

export class Snake {
  segments: Vector2[]
  direction: Vector2
  private pendingGrowth: number = 0

  constructor() {
    // Board centre for 20x20 = (9, 9) (0-indexed)
    // Initial segments: head at (9, 9), body at (8, 9), tail at (7, 9)
    // Initial direction: RIGHT = vec2(1, 0)
    this.segments = [vec2(9, 9), vec2(8, 9), vec2(7, 9)]
    this.direction = vec2(1, 0)
  }

  get head(): Vector2 {
    return this.segments[0]
  }

  move(newDirection: Vector2): void {
    // Block 180° reversal: if newDirection == -currentDirection, ignore it
    const isReverse =
      newDirection.x === -this.direction.x && newDirection.y === -this.direction.y

    if (!isReverse) {
      this.direction = newDirection
    }

    const newHead = vec2(this.head.x + this.direction.x, this.head.y + this.direction.y)

    if (this.pendingGrowth > 0) {
      // Keep tail — just prepend new head
      this.segments = [newHead, ...this.segments]
      this.pendingGrowth--
    } else {
      // Remove last segment, prepend new head
      this.segments = [newHead, ...this.segments.slice(0, this.segments.length - 1)]
    }
  }

  grow(): void {
    this.pendingGrowth++
  }

  checkSelfCollision(): boolean {
    const head = this.segments[0]
    // Check head against segments[1] through segments[n-2] (excludes tail at n-1)
    const bodyWithoutTail = this.segments.slice(1, this.segments.length - 1)
    return bodyWithoutTail.some(seg => seg.equals(head))
  }
}
