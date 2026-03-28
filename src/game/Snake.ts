import { Vector2, vec2, vec2Equals } from '../utils/Vector2';

export const Direction = {
  UP:    vec2(0, -1),
  DOWN:  vec2(0, 1),
  LEFT:  vec2(-1, 0),
  RIGHT: vec2(1, 0),
} as const;

export type DirectionValue = typeof Direction[keyof typeof Direction];

export function isOppositeDirection(a: DirectionValue, b: DirectionValue): boolean {
  return a.x === -b.x && a.y === -b.y;
}

export class Snake {
  private segments: Vector2[];
  private currentDirection: DirectionValue;
  private pendingDirection: DirectionValue | null = null;
  private growing: boolean = false;

  constructor(startPos: Vector2, initialDirection: DirectionValue = Direction.RIGHT) {
    this.segments = [startPos];
    this.currentDirection = initialDirection;
  }

  getHead(): Vector2 {
    return this.segments[0];
  }

  getSegments(): Vector2[] {
    return [...this.segments];
  }

  getDirection(): DirectionValue {
    return this.currentDirection;
  }

  getLength(): number {
    return this.segments.length;
  }

  queueDirection(dir: DirectionValue): void {
    // Reject 180° reversal
    if (isOppositeDirection(dir, this.currentDirection)) return;
    // Reject same direction
    if (dir.x === this.currentDirection.x && dir.y === this.currentDirection.y) return;
    this.pendingDirection = dir;
  }

  grow(): void {
    this.growing = true;
  }

  move(): void {
    // Apply pending direction
    if (this.pendingDirection !== null) {
      this.currentDirection = this.pendingDirection;
      this.pendingDirection = null;
    }

    const head = this.getHead();
    const newHead: Vector2 = {
      x: head.x + this.currentDirection.x,
      y: head.y + this.currentDirection.y,
    };

    this.segments.unshift(newHead);

    if (this.growing) {
      this.growing = false;
    } else {
      this.segments.pop();
    }
  }

  checkSelfCollision(): boolean {
    const head = this.getHead();
    // Check head against all segments except itself (index 0)
    return this.segments.slice(1).some(seg => vec2Equals(seg, head));
  }

  reset(startPos: Vector2, initialDirection: DirectionValue = Direction.RIGHT): void {
    this.segments = [startPos];
    this.currentDirection = initialDirection;
    this.pendingDirection = null;
    this.growing = false;
  }
}
