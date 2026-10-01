"use client"

import { useMemo } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { LiveCursors } from "@/registry/ui/live-cursors"
import { createMemoryPresence, PresenceProvider } from "@/registry/retana/lib/presence"

function Stage({
  people,
  label,
}: {
  people: { userId: string; name: string; x: number; y: number }[]
  label: string
}) {
  const adapter = useMemo(() => {
    const memory = createMemoryPresence<{ cursor: { x: number; y: number } | null }, { name: string }>({
      self: { userId: "elena", info: { name: "Elena" }, presence: { cursor: null } },
    })
    for (const person of people) {
      memory.join({
        userId: person.userId,
        info: { name: person.name },
        presence: { cursor: { x: person.x, y: person.y } },
      })
    }
    return memory
  }, [people])
  return (
    <PresenceProvider adapter={adapter}>
      <div className="relative h-40 overflow-hidden rounded-xl border border-border">
        <LiveCursors />
        <p className="p-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </PresenceProvider>
  )
}

export default function LiveCursorsStressPage() {
  const many = Array.from({ length: 20 }, (_, index) => ({
    userId: `user-${index}`,
    name: index === 3 ? "A".repeat(60) : `Persona ${index}`,
    x: (index % 5) * 48,
    y: Math.floor(index / 5) * 28,
  }))
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · cursores</h1>
      <StressCase label="Cantidad 0" width={320}>
        <Stage people={[]} label="Vacío" />
      </StressCase>
      <StressCase label="Cantidad 1" width={320}>
        <Stage people={[{ userId: "mateo", name: "Mateo", x: 24, y: 24 }]} label="Uno" />
      </StressCase>
      <StressCase label="Emoji y RTL" width={320}>
        <Stage
          people={[
            { userId: "emoji", name: "🚀", x: 16, y: 40 },
            { userId: "rtl", name: "مرحبا", x: 80, y: 70 },
          ]}
          label="Formas"
        />
      </StressCase>
      <StressCase label="10×" width={320}>
        <Stage people={many} label="Muchos" />
      </StressCase>
      <StressCase label="Muy ancho" width={1100}>
        <Stage people={many.slice(0, 4)} label="Ancho" />
      </StressCase>
    </main>
  )
}
