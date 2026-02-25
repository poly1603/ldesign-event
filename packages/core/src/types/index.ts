export type EventHandler<T = any> = (payload: T) => void | Promise<void>
export type EventMap = Record<string, any>

export interface EventBusOptions {
  maxHistory?: number
  wildcard?: boolean
  separator?: string
}

export interface EventRecord<T = any> {
  event: string
  payload: T
  timestamp: number
}

export type Unsubscribe = () => void
