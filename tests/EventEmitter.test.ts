import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../src/utils/EventEmitter';

type TestEvents = {
  message: string;
  count: number;
  empty: void;
};

describe('EventEmitter', () => {
  it('on/emit work correctly', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();
    emitter.on('message', handler);
    emitter.emit('message', 'hello');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('off removes listener', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();
    emitter.on('message', handler);
    emitter.off('message', handler);
    emitter.emit('message', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });

  it('multiple listeners on same event all receive the emit', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();
    emitter.on('count', handler1);
    emitter.on('count', handler2);
    emitter.on('count', handler3);
    emitter.emit('count', 42);
    expect(handler1).toHaveBeenCalledWith(42);
    expect(handler2).toHaveBeenCalledWith(42);
    expect(handler3).toHaveBeenCalledWith(42);
  });

  it('emit with no listeners does not throw', () => {
    const emitter = new EventEmitter<TestEvents>();
    expect(() => emitter.emit('message', 'no listeners')).not.toThrow();
  });

  it('off only removes the specified listener, leaving others intact', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    emitter.on('message', handler1);
    emitter.on('message', handler2);
    emitter.off('message', handler1);
    emitter.emit('message', 'test');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('test');
  });

  it('listener can be called multiple times across multiple emits', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();
    emitter.on('count', handler);
    emitter.emit('count', 1);
    emitter.emit('count', 2);
    emitter.emit('count', 3);
    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, 1);
    expect(handler).toHaveBeenNthCalledWith(2, 2);
    expect(handler).toHaveBeenNthCalledWith(3, 3);
  });

  it('off on event with no listeners does not throw', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();
    expect(() => emitter.off('message', handler)).not.toThrow();
  });

  it('void event type emits correctly', () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();
    emitter.on('empty', handler);
    emitter.emit('empty', undefined as void);
    expect(handler).toHaveBeenCalledOnce();
  });
});
