"use client"

import type { SupabaseClient } from "@supabase/supabase-js"

import {
  defaultIsAgent,
  type PresenceAdapter,
  type PresenceSnapshot,
  type PresenceUser,
} from "@/registry/retana/lib/presence"

type ChannelLike = {
  on: (type: "presence", filter: { event: "sync" | "join" | "leave" }, callback: () => void) => ChannelLike
  subscribe: (callback: (status: string) => void) => ChannelLike
  track: (payload: unknown) => unknown
  untrack: () => unknown
  presenceState: () => Record<string, readonly unknown[]>
}

export type SupabaseTracked<P, I> = {
  userId?: string
  info?: I
  presence?: P
  presence_ref?: string
}

export function mapSupabasePresence<P extends object, I>(
  state: Record<string, readonly unknown[]>,
  isAgent: (userId: string) => boolean = defaultIsAgent,
): PresenceUser<P, I>[] {
  const users: PresenceUser<P, I>[] = []
  for (const [key, entries] of Object.entries(state)) {
    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== "object") return
      const record = entry as SupabaseTracked<P, I>
      const userId = record.userId || key
      const connectionId = record.presence_ref || `${key}:${index}`
      users.push({
        connectionId,
        userId,
        info: (record.info ?? ({} as I)),
        presence: (record.presence ?? (record as unknown as P)),
        isAgent: isAgent(userId),
      })
    })
  }
  return users
}

export function createSupabasePresence<P extends object, I>(options: {
  supabase: SupabaseClient
  room: string
  presenceKey: string
  userId: string
  info: I
  initialPresence: P
  isAgent?: (userId: string) => boolean
}): PresenceAdapter<P, I> {
  const isAgent = options.isAgent ?? defaultIsAgent
  let current = options.initialPresence
  const info = options.info
  let left = false
  let channel: ChannelLike | null = null
  let subscribers = 0
  const listeners = new Set<(snapshot: PresenceSnapshot<P, I>) => void>()

  function selfUser(): PresenceUser<P, I> | null {
    if (left) return null
    return {
      connectionId: options.presenceKey,
      userId: options.userId,
      info,
      presence: current,
      isAgent: isAgent(options.userId),
    }
  }

  function snapshot(): PresenceSnapshot<P, I> {
    const self = selfUser()
    const others = channel
      ? mapSupabasePresence<P, I>(channel.presenceState(), isAgent).filter((user) => user.userId !== options.userId)
      : []
    return { self, others }
  }

  function emit() {
    const next = snapshot()
    for (const listener of listeners) listener(next)
  }

  function payload() {
    return { userId: options.userId, info, presence: current }
  }

  function ensureChannel() {
    if (channel) return channel
    const created = options.supabase.channel(options.room, {
      config: { presence: { key: options.presenceKey } },
    }) as unknown as ChannelLike
    created.on("presence", { event: "sync" }, emit)
    created.on("presence", { event: "join" }, emit)
    created.on("presence", { event: "leave" }, emit)
    created.subscribe((status) => {
      if (status === "SUBSCRIBED" && !left) void created.track(payload())
    })
    channel = created
    return created
  }

  function closeChannel() {
    if (!channel) return
    void channel.untrack()
    options.supabase.removeChannel(channel as unknown as ReturnType<SupabaseClient["channel"]>)
    channel = null
  }

  return {
    subscribe(callback) {
      listeners.add(callback)
      subscribers += 1
      if (!left) ensureChannel()
      callback(snapshot())
      return () => {
        listeners.delete(callback)
        subscribers -= 1
        if (subscribers <= 0) closeChannel()
      }
    },
    updateMyPresence(patch) {
      current = { ...current, ...patch }
      if (channel && !left) void channel.track(payload())
      emit()
    },
    getSelf: selfUser,
    leave() {
      left = true
      closeChannel()
      emit()
    },
  }
}
