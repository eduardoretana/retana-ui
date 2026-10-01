"use client"

import { useMemo } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { PresenceOutline } from "@/registry/ui/presence-outline"
import { createMemoryPresence, PresenceProvider } from "@/registry/retana/lib/presence"

function Field({ names }: { names: string[] }) {
  const adapter = useMemo(() => {
    const memory = createMemoryPresence<{ selection: string | null }, { name: string }>({
      self: { userId: "elena", info: { name: "Elena" }, presence: { selection: null } },
    })
    names.forEach((name, index) => {
      memory.join({
        userId: `user-${index}`,
        info: { name },
        presence: { selection: "brief" },
      })
    })
    return memory
  }, [names])
  return (
    <PresenceProvider adapter={adapter}>
      <PresenceOutline selection="brief">
        <div className="px-3 py-4 text-sm">Brief</div>
      </PresenceOutline>
    </PresenceProvider>
  )
}

export default function PresenceOutlineStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · contorno</h1>
      <StressCase label="Nadie" width={320}>
        <Field names={[]} />
      </StressCase>
      <StressCase label="Una persona" width={320}>
        <Field names={["Priya"]} />
      </StressCase>
      <StressCase label="Varias" width={320}>
        <Field names={["Priya", "Mateo", "Noor"]} />
      </StressCase>
      <StressCase label="Nombre largo, emoji y RTL" width={320}>
        <div dir="rtl">
          <Field names={["A".repeat(60), "🚀", "مرحبا"]} />
        </div>
      </StressCase>
    </main>
  )
}
