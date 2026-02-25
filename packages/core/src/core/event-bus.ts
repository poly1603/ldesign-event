import type { EventHandler, EventBusOptions, EventRecord, Unsubscribe } from '../types'

/**
 * 类型安全的事件总线
 */
export class EventBus<Events extends Record<string, any> = Record<string, any>> {
  private handlers = new Map<string, Set<EventHandler>>()
  private onceHandlers = new Map<string, Set<EventHandler>>()
  private history: EventRecord[] = []
  private options: Required<EventBusOptions>

  constructor(options?: EventBusOptions) {
    this.options = {
      maxHistory: options?.maxHistory ?? 100,
      wildcard: options?.wildcard ?? true,
      separator: options?.separator ?? ':',
    }
  }

  on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler as EventHandler)
    return () => this.off(event, handler)
  }

  once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    if (!this.onceHandlers.has(event)) this.onceHandlers.set(event, new Set())
    this.onceHandlers.get(event)!.add(handler as EventHandler)
    return () => this.onceHandlers.get(event)?.delete(handler as EventHandler)
  }

  off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>): void {
    if (!handler) {
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    } else {
      this.handlers.get(event)?.delete(handler as EventHandler)
      this.onceHandlers.get(event)?.delete(handler as EventHandler)
    }
  }

  async emit<K extends keyof Events & string>(event: K, payload?: Events[K]): Promise<void> {
    this.addHistory(event, payload)

    const handlers = this.handlers.get(event)
    if (handlers) for (const h of handlers) await h(payload)

    const onceSet = this.onceHandlers.get(event)
    if (onceSet) {
      for (const h of onceSet) await h(payload)
      this.onceHandlers.delete(event)
    }

    if (this.options.wildcard) {
      for (const [pat, hs] of this.handlers) {
        if (pat.includes('*') && this.matchWildcard(pat, event)) {
          for (const h of hs) await h(payload)
        }
      }
    }
  }

  getHistory(event?: string): EventRecord[] {
    return event ? this.history.filter(r => r.event === event) : [...this.history]
  }

  clearHistory(): void { this.history = [] }

  async replay(event?: string): Promise<void> {
    for (const r of (event ? this.getHistory(event) : this.history)) {
      await this.emit(r.event as any, r.payload)
    }
  }

  listenerCount(event: string): number {
    return (this.handlers.get(event)?.size ?? 0) + (this.onceHandlers.get(event)?.size ?? 0)
  }

  clear(): void { this.handlers.clear(); this.onceHandlers.clear() }
  destroy(): void { this.clear(); this.clearHistory() }

  private addHistory(event: string, payload: any): void {
    this.history.push({ event, payload, timestamp: Date.now() })
    if (this.history.length > this.options.maxHistory) this.history.shift()
  }

  private matchWildcard(pattern: string, event: string): boolean {
    const sep = this.options.separator
    const pp = pattern.split(sep), ep = event.split(sep)
    for (let i = 0; i < pp.length; i++) {
      if (pp[i] === '**') return true
      if (pp[i] === '*') { if (i === pp.length - 1 && i === ep.length - 1) return true; continue }
      if (pp[i] !== ep[i]) return false
    }
    return pp.length === ep.length
  }
}
