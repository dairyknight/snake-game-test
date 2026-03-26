import { Vector2, vec2, IVector2 } from '../src/utils/Vector2'

describe('Vector2', () => {
  describe('constructor and properties', () => {
    it('stores x and y values passed to the constructor', () => {
      const v = new Vector2(3, 7)
      expect(v.x).toBe(3)
      expect(v.y).toBe(7)
    })

    it('stores negative coordinates correctly', () => {
      const v = new Vector2(-5, -10)
      expect(v.x).toBe(-5)
      expect(v.y).toBe(-10)
    })

    it('stores zero coordinates correctly', () => {
      const v = new Vector2(0, 0)
      expect(v.x).toBe(0)
      expect(v.y).toBe(0)
    })

    it('x and y are readonly (TypeScript enforces at compile time, value is unchanged at runtime)', () => {
      const v = new Vector2(1, 2)
      // Verify the values are accessible and correct
      expect(v.x).toBe(1)
      expect(v.y).toBe(2)
    })
  })

  describe('equals()', () => {
    it('returns true when comparing a vector to itself', () => {
      const v = new Vector2(4, 9)
      expect(v.equals(v)).toBe(true)
    })

    it('returns true for two vectors with the same x and y', () => {
      const a = new Vector2(2, 5)
      const b = new Vector2(2, 5)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false when x values differ', () => {
      const a = new Vector2(1, 5)
      const b = new Vector2(2, 5)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false when y values differ', () => {
      const a = new Vector2(3, 4)
      const b = new Vector2(3, 9)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false when both x and y differ', () => {
      const a = new Vector2(1, 2)
      const b = new Vector2(3, 4)
      expect(a.equals(b)).toBe(false)
    })

    it('accepts a plain IVector2 object (duck typing)', () => {
      const v = new Vector2(6, 7)
      const plain: IVector2 = { x: 6, y: 7 }
      expect(v.equals(plain)).toBe(true)
    })

    it('returns false for a plain IVector2 object with different coordinates', () => {
      const v = new Vector2(6, 7)
      const plain: IVector2 = { x: 0, y: 0 }
      expect(v.equals(plain)).toBe(false)
    })

    it('is symmetric: a.equals(b) === b.equals(a)', () => {
      const a = new Vector2(3, 8)
      const b = new Vector2(3, 8)
      expect(a.equals(b)).toBe(b.equals(a))

      const c = new Vector2(1, 2)
      const d = new Vector2(9, 9)
      expect(c.equals(d)).toBe(d.equals(c))
    })
  })
})

describe('vec2 factory function', () => {
  it('returns a Vector2 instance', () => {
    const v = vec2(1, 2)
    expect(v).toBeInstanceOf(Vector2)
  })

  it('sets x and y correctly', () => {
    const v = vec2(10, 20)
    expect(v.x).toBe(10)
    expect(v.y).toBe(20)
  })

  it('returns a vector whose equals() works correctly', () => {
    const a = vec2(5, 5)
    const b = vec2(5, 5)
    expect(a.equals(b)).toBe(true)
  })

  it('returns a new instance on every call', () => {
    const a = vec2(1, 1)
    const b = vec2(1, 1)
    expect(a).not.toBe(b)
  })
})
