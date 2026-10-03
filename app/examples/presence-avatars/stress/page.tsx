"use client"

import { useMemo } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { createMemoryPresence, PresenceProvider } from "@/registry/retana/lib/presence"

function Stack({ names, width }: { names: { userId: string; name: string }[]; width?: number }) {
  const adapter = useMemo(() => {
    const memory = createMemoryPresence({
      self: { userId: "self", info: { name: "Elena" }, presence: {} },
    })
    for (const person of names) memory.join({ userId: person.userId, info: { name: person.name }, presence: {} })
    return memory
  }, [names])
  return (
    <PresenceProvider adapter={adapter}>
      <div style={width ? { width } : undefined}>
        <PresenceAvatars groupAgents max={4} />
      </div>
    </PresenceProvider>
  )
}

const many = Array.from({ length: 40 }, (_, index) => ({
  userId: index === 0 ? "agent-scribe" : `user-${index}`,
  name: index % 7 === 0 ? "A".repeat(60) : `Persona ${index}`,
}))

export default function PresenceAvatarsStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · avatares</h1>
      <StressCase label="Cantidad 0">
        <Stack names={[]} />
      </StressCase>
      <StressCase label="Cantidad 1">
        <Stack names={[{ userId: "mateo", name: "Mateo" }]} />
      </StressCase>
      <StressCase label="Emoji y RTL">
        <Stack names={[{ userId: "a", name: "🚀" }, { userId: "b", name: "مرحبا بالفريق" }]} />
      </StressCase>
      <StressCase label="10× y agentes" width={320}>
        <Stack names={many} width={320} />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex w-80 gap-2">
          <div className="w-40 shrink-0 bg-muted p-2 text-sm">Hermano</div>
          <div className="min-w-0 flex-1">
            <Stack names={many.slice(0, 8)} />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
