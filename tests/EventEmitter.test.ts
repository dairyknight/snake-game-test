import { EventEmitter } from '../src/utils/EventEmitter'

interface TestEvents {
  ping: { value: number }
  pong: { message: string }
  noData: undefined
}

describe('EventEmitter', () => {
  describe('on() and emit()', () => {
    it('calls a registered handler when the matching event is emitted', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.emit('ping', { value: 42 })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ value: 42 })
    })

    it('passes the exact data payload to the handler', () => {
      const emitter = new EventEmitter<TestEvents>()
      const received: Array<{ value: number }> = []
      emitter.on('ping', data => received.push(data))
      emitter.emit('ping', { value: 7 })
      expect(received).toEqual([{ value: 7 }])
    })

    it('calls the handler once per emit call', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.emit('ping', { value: 1 })
      emitter.emit('ping', { value: 2 })
      emitter.emit('ping', { value: 3 })
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('calls multiple handlers registered for the same event', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handlerA = vi.fn()
      const handlerB = vi.fn()
      emitter.on('ping', handlerA)
      emitter.on('ping', handlerB)
      emitter.emit('ping', { value: 99 })
      expect(handlerA).toHaveBeenCalledTimes(1)
      expect(handlerB).toHaveBeenCalledTimes(1)
    })

    it('does not call handlers registered for a different event', () => {
      const emitter = new EventEmitter<TestEvents>()
      const pingHandler = vi.fn()
      const pongHandler = vi.fn()
      emitter.on('ping', pingHandler)
      emitter.on('pong', pongHandler)
      emitter.emit('ping', { value: 1 })
      expect(pingHandler).toHaveBeenCalledTimes(1)
      expect(pongHandler).not.toHaveBeenCalled()
    })

    it('does nothing when emitting an event with no registered handlers', () => {
      const emitter = new EventEmitter<TestEvents>()
      // Should not throw
      expect(() => emitter.emit('ping', { value: 0 })).not.toThrow()
    })

    it('does not call the same handler twice if registered twice for the same event (Set deduplication)', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.on('ping', handler) // same reference — Set deduplicates
      emitter.emit('ping', { value: 5 })
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('off()', () => {
    it('prevents a removed handler from being called on subsequent emits', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.off('ping', handler)
      emitter.emit('ping', { value: 1 })
      expect(handler).not.toHaveBeenCalled()
    })

    it('only removes the specified handler, leaving others intact', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handlerA = vi.fn()
      const handlerB = vi.fn()
      emitter.on('ping', handlerA)
      emitter.on('ping', handlerB)
      emitter.off('ping', handlerA)
      emitter.emit('ping', { value: 2 })
      expect(handlerA).not.toHaveBeenCalled()
      expect(handlerB).toHaveBeenCalledTimes(1)
    })

    it('does nothing when removing a handler that was never registered', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      // Should not throw
      expect(() => emitter.off('ping', handler)).not.toThrow()
    })

    it('does nothing when removing a handler from an event that has no listeners', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      // 'pong' has never had a listener added
      expect(() => emitter.off('pong', handler)).not.toThrow()
    })

    it('allows re-registering a handler after it has been removed', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.off('ping', handler)
      emitter.on('ping', handler)
      emitter.emit('ping', { value: 3 })
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('multiple event types', () => {
    it('correctly routes events to their respective handlers', () => {
      const emitter = new EventEmitter<TestEvents>()
      const pingHandler = vi.fn()
      const pongHandler = vi.fn()
      emitter.on('ping', pingHandler)
      emitter.on('pong', pongHandler)
      emitter.emit('pong', { message: 'hello' })
      expect(pongHandler).toHaveBeenCalledWith({ message: 'hello' })
      expect(pingHandler).not.toHaveBeenCalled()
    })
  })
})
