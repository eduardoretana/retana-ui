"use client"

import { useMemo } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { createMemoryPresence, PresenceProvider } from "@/registry/retana/lib/presence"

function Line({ names }: { names: string[] }) {
  const adapter = useMemo(() => {
    const memory = createMemoryPresence({
      self: { userId: "elena", info: { name: "Elena" }, presence: { isTyping: false } },
    })
    names.forEach((name, index) => {
      memory.join({ userId: `user-${index}`, info: { name }, presence: { isTyping: true } })
    })
    return memory
  }, [names])
  return (
    <PresenceProvider adapter={adapter}>
      <TypingIndicator />
    </PresenceProvider>
  )
}

export default function TypingIndicatorStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · escritura</h1>
      <StressCase label="Cantidad 0">
        <Line names={[]} />
      </StressCase>
      <StressCase label="Cantidad 1">
        <Line names={["Ana"]} />
      </StressCase>
      <StressCase label="Cantidad 2">
        <Line names={["Ana", "Luis"]} />
      </StressCase>
      <StressCase label="Varias personas" width={320}>
        <Line names={["Ana", "Luis", "Noor", "A".repeat(60)]} />
      </StressCase>
      <StressCase label="Emoji y RTL" width={320}>
        <div dir="rtl">
          <Line names={["🚀", "مرحبا بالفريق", "Priya"]} />
        </div>
      </StressCase>
    </main>
  )
}
