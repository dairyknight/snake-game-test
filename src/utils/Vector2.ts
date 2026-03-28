export interface Vector2 {
  x: number;
  y: number;
}

export function vec2(x: number, y: number): Vector2 {
  return { x, y };
}

export function vec2Equals(a: Vector2, b: Vector2): boolean {
  return a.x === b.x && a.y === b.y;
}
