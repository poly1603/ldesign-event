import type { EventEnginePluginOptions } from './types'
import { EventBus } from '../core/event-bus'

export const eventStateKeys = {
  BUS: 'event:bus' as const,
} as const

export const eventEventKeys = {
  INSTALLED: 'event:installed' as const,
  UNINSTALLED: 'event:uninstalled' as const,
} as const

export function createEventEnginePlugin(options: EventEnginePluginOptions = {}) {
  let bus: EventBus | null = null

  return {
    name: 'event',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      bus = new EventBus(options)
      engine.state?.set(eventStateKeys.BUS, bus)
      engine.events?.emit(eventEventKeys.INSTALLED, { name: 'event' })
      engine.logger?.info('[Event Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      bus?.destroy()
      bus = null
      engine.state?.delete(eventStateKeys.BUS)
      engine.events?.emit(eventEventKeys.UNINSTALLED, {})
    },
  }
}
