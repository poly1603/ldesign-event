import { onUnmounted, getCurrentInstance } from 'vue'
import { EventBus } from '@ldesign/event-core'
import type { EventHandler, Unsubscribe } from '@ldesign/event-core'

const globalBus = new EventBus({ maxHistory: 200 })

export function useEventBus<Events extends Record<string, any> = Record<string, any>>(bus?: EventBus<Events>) {
  const eventBus = (bus || globalBus) as EventBus<Events>
  const unsubscribes: Unsubscribe[] = []

  function on<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.on(event, handler); unsubscribes.push(unsub); return unsub
  }
  function once<K extends keyof Events & string>(event: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const unsub = eventBus.once(event, handler); unsubscribes.push(unsub); return unsub
  }
  function emit<K extends keyof Events & string>(event: K, payload?: Events[K]) { return eventBus.emit(event, payload) }
  function off<K extends keyof Events & string>(event: K, handler?: EventHandler<Events[K]>) { eventBus.off(event, handler) }

  if (getCurrentInstance()) { onUnmounted(() => unsubscribes.forEach(u => u())) }

  return { on, once, emit, off, bus: eventBus }
}
