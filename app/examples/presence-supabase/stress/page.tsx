"use client"

import { StressCase } from "@/app/examples/stress-case"
import { mapSupabasePresence } from "@/registry/lib/presence-supabase"

function List({ state }: { state: Record<string, { userId: string; info: { name: string }; presence: { cursor: null }; presence_ref: string }[]> }) {
  const users = mapSupabasePresence<{ cursor: null }, { name: string }>(state)
  if (!users.length) return <p className="text-sm text-muted-foreground">Nadie</p>
  return (
    <ul className="text-sm">
      {users.map((user) => (
        <li key={user.connectionId} className="truncate">
          {user.userId} · {user.info.name} {user.isAgent ? "agente" : "persona"}
        </li>
      ))}
    </ul>
  )
}

export default function PresenceSupabaseStressPage() {
  const many = Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [
      `user-${index}`,
      [{ userId: `user-${index}`, info: { name: `Persona ${index}` }, presence: { cursor: null }, presence_ref: `ref-${index}` }],
    ]),
  )
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Supabase</h1>
      <StressCase label="Cantidad 0">
        <List state={{}} />
      </StressCase>
      <StressCase label="Cantidad 1">
        <List state={{ elena: [{ userId: "elena", info: { name: "Elena" }, presence: { cursor: null }, presence_ref: "a" }] }} />
      </StressCase>
      <StressCase label="Agente, emoji, RTL y 60 caracteres" width={320}>
        <List
          state={{
            "agent-scribe": [{ userId: "agent-scribe", info: { name: "A".repeat(60) }, presence: { cursor: null }, presence_ref: "b" }],
            emoji: [{ userId: "emoji", info: { name: "🚀" }, presence: { cursor: null }, presence_ref: "c" }],
            rtl: [{ userId: "rtl", info: { name: "مرحبا بالفريق" }, presence: { cursor: null }, presence_ref: "d" }],
          }}
        />
      </StressCase>
      <StressCase label="10×" width={320}>
        <List state={many} />
      </StressCase>
    </main>
  )
}
