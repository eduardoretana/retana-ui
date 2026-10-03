"use client"

import * as React from "react"

export type PresenceUser<P, I> = {
  connectionId: string
  userId: string
  presence: P
  info: I
  isAgent: boolean
}

export type PresenceSnapshot<P, I> = {
  self: PresenceUser<P, I> | null
  others: PresenceUser<P, I>[]
}

export type PresenceAdapter<P, I> = {
  subscribe: (callback: (snapshot: PresenceSnapshot<P, I>) => void) => () => void
  updateMyPresence: (patch: Partial<P>) => void
  getSelf: () => PresenceUser<P, I> | null
  leave: () => void
}

export type MemoryPresence<P, I> = PresenceAdapter<P, I> & {
  join: (user: { connectionId?: string; userId: string; info: I; presence: P }) => string
  update: (connectionId: string, patch: Partial<P>) => void
  remove: (connectionId: string) => void
}

export function defaultIsAgent(userId: string) {
  return userId.startsWith("agent-")
}

export function presenceColor(seed: string, explicit?: string) {
  if (explicit) return explicit
  let hash = 0
  for (const char of seed) hash = (hash + char.charCodeAt(0)) % 5
  return `var(--chart-${hash + 1})`
}

export type PresenceInfo = {
  name?: string
  avatar?: string
  color?: string
}

export function readPresenceInfo(info: unknown): PresenceInfo & { name: string } {
  if (info && typeof info === "object") {
    const record = info as PresenceInfo
    return {
      name: record.name?.trim() ? record.name : "Someone",
      avatar: record.avatar,
      color: record.color,
    }
  }
  return { name: "Someone" }
}

type MemoryOptions<P, I> = {
  self?: { connectionId?: string; userId: string; info: I; presence: P }
  isAgent?: (userId: string) => boolean
}

export function createMemoryPresence<P extends object, I>(options: MemoryOptions<P, I> = {}): MemoryPresence<P, I> {
  const isAgent = options.isAgent ?? defaultIsAgent
  const users = new Map<string, PresenceUser<P, I>>()
  let selfId: string | null = null
  const listeners = new Set<(snapshot: PresenceSnapshot<P, I>) => void>()

  const toUser = (connectionId: string, userId: string, info: I, presence: P): PresenceUser<P, I> => ({
    connectionId,
    userId,
    info,
    presence,
    isAgent: isAgent(userId),
  })

  if (options.self) {
    selfId = options.self.connectionId ?? "self"
    users.set(selfId, toUser(selfId, options.self.userId, options.self.info, options.self.presence))
  }

  function snapshot(): PresenceSnapshot<P, I> {
    const self = selfId ? (users.get(selfId) ?? null) : null
    const others = [...users.values()].filter((user) => user.connectionId !== selfId)
    return { self, others }
  }

  function emit() {
    const next = snapshot()
    for (const listener of listeners) listener(next)
  }

  return {
    subscribe(callback) {
      listeners.add(callback)
      callback(snapshot())
      return () => listeners.delete(callback)
    },
    updateMyPresence(patch) {
      if (!selfId) return
      const current = users.get(selfId)
      if (!current) return
      users.set(selfId, { ...current, presence: { ...current.presence, ...patch } })
      emit()
    },
    getSelf() {
      return selfId ? (users.get(selfId) ?? null) : null
    },
    leave() {
      if (selfId) users.delete(selfId)
      selfId = null
      emit()
    },
    join(user) {
      const connectionId = user.connectionId ?? `conn-${users.size + 1}-${user.userId}`
      users.set(connectionId, toUser(connectionId, user.userId, user.info, user.presence))
      emit()
      return connectionId
    },
    update(connectionId, patch) {
      const current = users.get(connectionId)
      if (!current) return
      users.set(connectionId, { ...current, presence: { ...current.presence, ...patch } })
      emit()
    },
    remove(connectionId) {
      if (connectionId === selfId) selfId = null
      users.delete(connectionId)
      emit()
    },
  }
}

type PresenceContextValue = {
  snapshot: PresenceSnapshot<unknown, unknown>
  updateMyPresence: (patch: object) => void
}

const PresenceContext = React.createContext<PresenceContextValue | null>(null)

export function PresenceProvider<P extends object, I>({
  adapter,
  children,
}: {
  adapter: PresenceAdapter<P, I>
  children: React.ReactNode
}) {
  const [snapshot, setSnapshot] = React.useState<PresenceSnapshot<P, I>>(() => ({
    self: adapter.getSelf(),
    others: [],
  }))

  React.useEffect(() => adapter.subscribe(setSnapshot), [adapter])

  const updateMyPresence = React.useCallback(
    (patch: Partial<P>) => adapter.updateMyPresence(patch),
    [adapter],
  )

  const value = React.useMemo<PresenceContextValue>(
    () => ({ snapshot, updateMyPresence: updateMyPresence as (patch: object) => void }),
    [snapshot, updateMyPresence],
  )

  return React.createElement(PresenceContext.Provider, { value }, children)
}

function usePresenceContext() {
  const context = React.useContext(PresenceContext)
  if (!context) throw new Error("Presence hooks must be used inside PresenceProvider.")
  return context
}

export function useOthers<P = unknown, I = unknown>() {
  return usePresenceContext().snapshot.others as PresenceUser<P, I>[]
}

export function useSelf<P = unknown, I = unknown>() {
  return usePresenceContext().snapshot.self as PresenceUser<P, I> | null
}

export function useUpdateMyPresence<P extends object = Record<string, unknown>>() {
  return usePresenceContext().updateMyPresence as (patch: Partial<P>) => void
}

export function useTypingPresence<P extends object>(key: keyof P & string, options?: { idleMs?: number }) {
  const idleMs = options?.idleMs ?? 1000
  const update = useUpdateMyPresence<P>()
  const timeout = React.useRef<ReturnType<typeof setTimeout> | number | null>(null)
  const typing = React.useRef(false)

  const notify = React.useCallback(() => {
    if (!typing.current) {
      typing.current = true
      update({ [key]: true } as Partial<P>)
    }
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => {
      typing.current = false
      update({ [key]: false } as Partial<P>)
    }, idleMs)
  }, [idleMs, key, update])

  React.useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current)
      if (typing.current) update({ [key]: false } as Partial<P>)
    },
    [key, update],
  )

  return notify
}
