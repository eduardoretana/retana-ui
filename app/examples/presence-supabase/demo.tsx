"use client"

import { useState } from "react"

import { mapSupabasePresence } from "@/registry/lib/presence-supabase"

const users = mapSupabasePresence<{ cursor: null }, { name: string }>({
  elena: [{ userId: "elena", info: { name: "Elena Voss" }, presence: { cursor: null }, presence_ref: "a" }],
  mateo: [{ userId: "mateo", info: { name: "Mateo Ruiz" }, presence: { cursor: null }, presence_ref: "b" }],
  "agent-scribe": [{ userId: "agent-scribe", info: { name: "Scribe" }, presence: { cursor: null }, presence_ref: "c" }],
})

const snippet = `const channel = supabase.channel(room, {
  config: { presence: { key: user.id } },
})

channel.on("presence", { event: "sync" }, () => channel.presenceState())
channel.subscribe(async (status) => {
  if (status === "SUBSCRIBED") await channel.track({ userId, info, presence })
})`

export function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <ul className="text-sm">
        {users.map((user) => (
          <li key={user.connectionId}>
            {user.info.name} {user.isAgent ? "(agente)" : ""}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="w-fit rounded-md border border-border px-2 py-1 text-sm"
        onClick={() => setOpen((value) => !value)}
      >
        Ver canal
      </button>
      {open ? <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{snippet}</pre> : null}
    </div>
  )
}
