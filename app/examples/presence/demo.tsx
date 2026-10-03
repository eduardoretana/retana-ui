"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { LiveCursors, useContainerCursor } from "@/registry/ui/live-cursors"
import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { PresenceOutline } from "@/registry/ui/presence-outline"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { PresenceProvider, useTypingPresence, useUpdateMyPresence } from "@/registry/retana/lib/presence"

import { createStudio, type StudioPresence } from "./studio"

const liveblocksSnippet = `import { LiveblocksPresenceRoom } from "@/lib/presence-liveblocks"

<LiveblocksPresenceRoom
  authEndpoint="/api/liveblocks-auth"
  roomId="studio"
  initialPresence={{ cursor: null, isTyping: false, selection: null }}
>
  {children}
</LiveblocksPresenceRoom>`

const supabaseSnippet = `import { createSupabasePresence } from "@/lib/presence-supabase"

const adapter = createSupabasePresence({
  supabase,
  room: "studio",
  presenceKey: user.id,
  userId: user.id,
  info: { name: user.name, color: "var(--chart-2)" },
  initialPresence: { cursor: null, isTyping: false, selection: null },
})`

function Board() {
  const ref = useRef<HTMLDivElement>(null)
  const update = useUpdateMyPresence<StudioPresence>()
  const notifyTyping = useTypingPresence<StudioPresence>("isTyping")
  useContainerCursor(ref)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <PresenceAvatars groupAgents max={3} />
        <TypingIndicator />
      </div>
      <div ref={ref} className="relative h-72 overflow-hidden rounded-xl border border-border bg-card">
        <LiveCursors />
        <div className="grid gap-4 p-4 pt-24 sm:grid-cols-2">
          <PresenceOutline selection="brief">
            <label className="flex flex-col gap-1 text-sm">
              Brief
              <Input aria-label="Brief" onFocus={() => update({ selection: "brief" })} onChange={() => notifyTyping()} />
            </label>
          </PresenceOutline>
          <PresenceOutline selection="notes">
            <label className="flex flex-col gap-1 text-sm">
              Notas
              <Input aria-label="Notas" onFocus={() => update({ selection: "notes" })} onChange={() => notifyTyping()} />
            </label>
          </PresenceOutline>
        </div>
      </div>
    </div>
  )
}

export function Demo() {
  const studio = useMemo(() => createStudio(), [])
  const [snippet, setSnippet] = useState<"liveblocks" | "supabase" | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const id = window.setInterval(() => {
      const time = Date.now()
      const people = [
        { connectionId: studio.ids.mateo, index: 0, userId: "mateo" },
        { connectionId: studio.ids.priya, index: 1, userId: "priya" },
        { connectionId: studio.ids.scribe, index: 2, userId: "agent-scribe" },
      ]
      for (const person of people) {
        const x = 36 + ((time / (reduced ? 400 : 25) + person.index * 70) % 240)
        const y = 8 + person.index * 14
        studio.memory.update(person.connectionId, {
          cursor: { x, y },
          isTyping: person.userId === "priya" && Math.floor(time / 1600) % 2 === 0,
          selection: person.userId === "agent-scribe" ? "notes" : person.userId === "priya" ? "brief" : null,
        })
      }
    }, reduced ? 1200 : 80)
    return () => window.clearInterval(id)
  }, [studio])

  return (
    <PresenceProvider adapter={studio.memory}>
      <Board />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border border-border px-2 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setSnippet((current) => (current === "liveblocks" ? null : "liveblocks"))}
        >
          Liveblocks
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-2 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setSnippet((current) => (current === "supabase" ? null : "supabase"))}
        >
          Supabase
        </button>
      </div>
      {snippet ? (
        <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
          {snippet === "liveblocks" ? liveblocksSnippet : supabaseSnippet}
        </pre>
      ) : null}
    </PresenceProvider>
  )
}
