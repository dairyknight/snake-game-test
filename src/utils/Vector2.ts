export interface IVector2 {
  x: number
  y: number
}

export class Vector2 implements IVector2 {
  constructor(public readonly x: number, public readonly y: number) {}

  equals(other: IVector2): boolean {
    return this.x === other.x && this.y === other.y
  }
}

/** Factory — always use this instead of `new Vector2(x, y)` */
export function vec2(x: number, y: number): Vector2 {
  return new Vector2(x, y)
}
