type Listener<T> = (data: T) => void;

export class EventEmitter<Events extends Record<string, unknown>> {
  private listeners: Partial<{ [K in keyof Events]: Listener<Events[K]>[] }> = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const listeners = this.listeners[event];
    if (listeners) {
      this.listeners[event] = listeners.filter(l => l !== listener) as Listener<Events[K]>[];
    }
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(l => l(data));
    }
  }
}
