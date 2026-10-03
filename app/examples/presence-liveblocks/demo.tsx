"use client"

import { useState } from "react"

import { mapLiveblocksPresence } from "@/registry/lib/presence-liveblocks"

const sample = mapLiveblocksPresence(
  [
    { connectionId: 2, id: "mateo", info: { name: "Mateo Ruiz" }, presence: { cursor: null } },
    { connectionId: 4, id: "agent-scribe", info: { name: "Scribe" }, presence: { cursor: null } },
  ],
  { connectionId: 1, id: "elena", info: { name: "Elena Voss" }, presence: { cursor: null } },
)

const snippet = `import { Liveblocks } from "@liveblocks/node"

const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY })

await liveblocks.identifyUser({ userId }, { userInfo })

await liveblocks.setPresence(roomId, {
  userId: "agent-scribe",
  data: { cursor: null },
  userInfo: { name: "Scribe" },
  ttl: 30,
})`

export function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <ul className="text-sm">
        {sample.others.map((user) => (
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
        Ver cableado
      </button>
      {open ? <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{snippet}</pre> : null}
    </div>
  )
}
