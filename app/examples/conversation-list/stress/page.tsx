"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ConversationList } from "@/registry/ui/conversation-list"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Lista</h1>
      <StressCase label="Vacío"><ConversationList label="Conversaciones" status="empty" /></StressCase>
      <StressCase label="Carga y error"><ConversationList label="Conversaciones" status="loading" /><ConversationList label="Conversaciones" status="error" error="Fallo" onRetry={() => {}} /></StressCase>
      <StressCase label="320px" width={320}>
        <ConversationList label="Conversaciones" items={[{ id: "a", title: token, preview: token, time: "10:44", unread: 1 }]} />
      </StressCase>
      <StressCase label="Diez filas">
        <ConversationList label="Conversaciones" items={Array.from({ length: 10 }, (_, index) => ({ id: `c${index}`, title: `Cliente ${index}`, preview: "Hola", time: "Lun" }))} />
      </StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><ConversationList label="محادثات" items={[{ id: "a", title: "ورشة", preview: "مرحبا", time: "أمس" }]} /></div></StressCase>
    </main>
  )
}
