"use client"

import { useMemo, type ReactNode } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { createMemoryPresence, PresenceProvider, useOthers, readPresenceInfo } from "@/registry/retana/lib/presence"

function Names() {
  const others = useOthers()
  const text = others.map((user) => readPresenceInfo(user.info).name).join(", ")
  return <p className="truncate text-sm">{text || "Nadie"}</p>
}

function Room({
  names,
  children,
}: {
  names: { userId: string; name: string }[]
  children?: ReactNode
}) {
  const adapter = useMemo(() => {
    const memory = createMemoryPresence<{ isTyping: boolean }, { name: string }>({
      self: names[0]
        ? { userId: names[0].userId, info: { name: names[0].name }, presence: { isTyping: false } }
        : undefined,
    })
    for (const person of names.slice(1)) {
      memory.join({ userId: person.userId, info: { name: person.name }, presence: { isTyping: true } })
    }
    return memory
  }, [names])
  return (
    <PresenceProvider adapter={adapter}>
      <Names />
      {children}
    </PresenceProvider>
  )
}

const unbroken = "A".repeat(60)
const many = Array.from({ length: 40 }, (_, index) => ({ userId: `user-${index}`, name: `Persona ${index + 1}` }))

export default function PresenceStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · presencia</h1>
      <StressCase label="Cantidad 0">
        <Room names={[]} />
      </StressCase>
      <StressCase label="Cantidad 1">
        <Room names={[{ userId: "elena", name: "Elena" }]} />
      </StressCase>
      <StressCase label="Una palabra">
        <Room names={[{ userId: "elena", name: "Elena" }, { userId: "mateo", name: "Mateo" }]} />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Room names={[{ userId: "elena", name: "Elena" }, { userId: "mateo", name: "El estudio prepara la entrega del jueves y todavía faltan tres revisiones." }]} />
      </StressCase>
      <StressCase label="Cadena de 60 caracteres" width={320}>
        <Room names={[{ userId: "elena", name: "Elena" }, { userId: "raw", name: unbroken }]} />
      </StressCase>
      <StressCase label="Emoji">
        <Room names={[{ userId: "elena", name: "Elena" }, { userId: "emoji", name: "🚀 Lanzamiento" }]} />
      </StressCase>
      <StressCase label="Texto de derecha a izquierda">
        <div dir="rtl">
          <Room names={[{ userId: "elena", name: "Elena" }, { userId: "rtl", name: "مرحبا بالفريق" }]} />
        </div>
      </StressCase>
      <StressCase label="10× personas" width={320}>
        <Room names={[{ userId: "elena", name: "Elena" }, ...many]}>
          <PresenceAvatars max={4} />
          <TypingIndicator />
        </Room>
      </StressCase>
    </main>
  )
}
