import type { App } from 'vue'
import { EventBus } from '@ldesign/event-core'

export function createEventPlugin(bus?: EventBus) {
  const eventBus = bus || new EventBus()
  return {
    install(app: App) {
      app.provide('ldesign-event-bus', eventBus)
      app.config.globalProperties.$eventBus = eventBus
    },
  }
}
