"use client"

import { StressCase } from "@/app/examples/stress-case"
import { mapLiveblocksPresence, type LiveblocksConnection } from "@/registry/lib/presence-liveblocks"

function List({ users }: { users: LiveblocksConnection<{ cursor: null }, { name: string }>[] }) {
  const snapshot = mapLiveblocksPresence(users, null)
  if (!snapshot.others.length) return <p className="text-sm text-muted-foreground">Nadie</p>
  return (
    <ul className="text-sm">
      {snapshot.others.map((user) => (
        <li key={user.connectionId} className="truncate">
          {user.userId} · {user.info.name} {user.isAgent ? "agente" : "persona"}
        </li>
      ))}
    </ul>
  )
}

const unbroken = "A".repeat(60)

export default function PresenceLiveblocksStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Liveblocks</h1>
      <StressCase label="Cantidad 0">
        <List users={[]} />
      </StressCase>
      <StressCase label="Cantidad 1">
        <List users={[{ connectionId: 1, id: "elena", info: { name: "Elena" }, presence: { cursor: null } }]} />
      </StressCase>
      <StressCase label="Agente y nombre largo" width={320}>
        <List
          users={[
            { connectionId: 2, id: "agent-scribe", info: { name: unbroken }, presence: { cursor: null } },
            { connectionId: 3, id: "emoji", info: { name: "🚀" }, presence: { cursor: null } },
            { connectionId: 4, id: "rtl", info: { name: "مرحبا بالفريق" }, presence: { cursor: null } },
          ]}
        />
      </StressCase>
      <StressCase label="10×" width={320}>
        <List
          users={Array.from({ length: 40 }, (_, index) => ({
            connectionId: index + 1,
            id: `user-${index}`,
            info: { name: `Persona ${index}` },
            presence: { cursor: null },
          }))}
        />
      </StressCase>
    </main>
  )
}
