"use client"

import * as React from "react"
import { createClient, type JsonObject } from "@liveblocks/client"
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useRoom,
  useSelf,
  useUpdateMyPresence,
} from "@liveblocks/react"

import {
  defaultIsAgent,
  PresenceProvider,
  type PresenceAdapter,
  type PresenceSnapshot,
  type PresenceUser,
} from "@/registry/retana/lib/presence"

export type LiveblocksConnection<P, I> = {
  connectionId: number | string
  id?: string | null
  info?: I | null
  presence?: P | null
}

export function createLiveblocksClient(options: Parameters<typeof createClient>[0]) {
  return createClient(options)
}

export function mapLiveblocksPresence<P extends object, I>(
  others: readonly LiveblocksConnection<P, I>[],
  self: LiveblocksConnection<P, I> | null,
  isAgent: (userId: string) => boolean = defaultIsAgent,
): PresenceSnapshot<P, I> {
  const mapOne = (user: LiveblocksConnection<P, I>): PresenceUser<P, I> => {
    const userId = user.id || String(user.connectionId)
    return {
      connectionId: String(user.connectionId),
      userId,
      presence: (user.presence ?? ({} as P)),
      info: (user.info ?? ({} as I)),
      isAgent: isAgent(userId),
    }
  }
  return {
    self: self ? mapOne(self) : null,
    others: others.map(mapOne),
  }
}

export function useLiveblocksPresenceAdapter<P extends object, I>(options?: {
  isAgent?: (userId: string) => boolean
}): PresenceAdapter<P, I> {
  const isAgent = options?.isAgent ?? defaultIsAgent
  const others = useOthers() as unknown as readonly LiveblocksConnection<P, I>[]
  const self = useSelf() as unknown as LiveblocksConnection<P, I> | null
  const update = useUpdateMyPresence() as (patch: Partial<P>) => void
  const room = useRoom() as { disconnect: () => void }
  const snapshot = React.useMemo(
    () => mapLiveblocksPresence(others, self, isAgent),
    [others, self, isAgent],
  )
  const snapshotRef = React.useRef(snapshot)
  const listeners = React.useRef(new Set<(next: PresenceSnapshot<P, I>) => void>())

  React.useEffect(() => {
    snapshotRef.current = snapshot
    for (const listener of listeners.current) listener(snapshot)
  }, [snapshot])

  return React.useMemo<PresenceAdapter<P, I>>(
    () => ({
      subscribe(callback) {
        listeners.current.add(callback)
        callback(snapshotRef.current)
        return () => listeners.current.delete(callback)
      },
      updateMyPresence(patch) {
        update(patch)
      },
      getSelf() {
        return snapshotRef.current.self
      },
      leave() {
        room.disconnect()
      },
    }),
    [room, update],
  )
}

export function LiveblocksPresenceBridge<P extends object, I>({
  isAgent,
  children,
}: {
  isAgent?: (userId: string) => boolean
  children: React.ReactNode
}) {
  const adapter = useLiveblocksPresenceAdapter<P, I>({ isAgent })
  return <PresenceProvider adapter={adapter}>{children}</PresenceProvider>
}

export function LiveblocksPresenceRoom({
  publicApiKey,
  authEndpoint = "/api/liveblocks-auth",
  roomId,
  initialPresence,
  isAgent,
  children,
}: {
  publicApiKey?: string
  authEndpoint?: string
  roomId: string
  initialPresence: JsonObject
  isAgent?: (userId: string) => boolean
  children: React.ReactNode
}) {
  return (
    <LiveblocksProvider {...(publicApiKey ? { publicApiKey } : { authEndpoint })}>
      <RoomProvider id={roomId} initialPresence={initialPresence}>
        <LiveblocksPresenceBridge isAgent={isAgent}>{children}</LiveblocksPresenceBridge>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
