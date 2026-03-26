type Handler<T> = (data: T) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {}

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set()
    }
    this.listeners[event]!.add(handler)
  }

  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    this.listeners[event]?.delete(handler)
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners[event]?.forEach(h => h(data))
  }
}
