"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ChatThread } from "@/registry/ui/chat-thread"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Hilo</h1>
      <StressCase label="Vacío"><ChatThread label="Hilo" state="empty" /></StressCase>
      <StressCase label="Carga y error"><ChatThread label="Hilo" state="loading" /><ChatThread label="Hilo" state="error" error="Fallo" onRetry={() => {}} /></StressCase>
      <StressCase label="320px" width={320}><ChatThread label="Hilo" title={token} messages={[{ id: "a", side: "incoming", author: token, body: token }]} /></StressCase>
      <StressCase label="Diez mensajes">
        <ChatThread label="Hilo" messages={Array.from({ length: 10 }, (_, index) => ({ id: `m${index}`, side: index % 2 ? "outgoing" as const : "incoming" as const, author: "Marina", body: `Nota ${index}` }))} />
      </StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><ChatThread label="خيط" title="ورشة" messages={[{ id: "a", side: "incoming", author: "ليلى", body: "هل يمكننا التحدث؟" }]} /></div></StressCase>
    </main>
  )
}
