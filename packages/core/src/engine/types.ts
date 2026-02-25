import type { EventBusOptions } from '../types'

export interface EventEnginePluginOptions extends EventBusOptions {
  dependencies?: string[]
}
