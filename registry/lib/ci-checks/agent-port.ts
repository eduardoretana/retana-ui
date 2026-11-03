/**
 * Connection point for a fix timeline. This module does not run an agent.
 * The host publishes steps. The UI subscribes.
 */

export type AgentFixEvent = {
  id: string
  kind: "thought" | "edit" | "test" | "push" | "done"
  label: string
  files?: readonly string[]
  at: string
}

export type AgentFixPort = {
  publish(event: AgentFixEvent): void
  subscribe(listener: (event: AgentFixEvent) => void): () => void
  snapshot(): readonly AgentFixEvent[]
}

export function createAgentFixPort(): AgentFixPort {
  const events: AgentFixEvent[] = []
  const listeners = new Set<(event: AgentFixEvent) => void>()
  return {
    publish(event) {
      events.push(event)
      for (const listener of listeners) listener(event)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    snapshot() {
      return events.slice()
    },
  }
}

export type CheckFailedNotice = {
  id: string
  name: string
  url: string | null
}

/** The host decides what to publish. This only forwards a failure notice. */
export function notifyCheckFailed(handler: ((check: CheckFailedNotice) => void) | undefined, check: CheckFailedNotice) {
  handler?.(check)
}
