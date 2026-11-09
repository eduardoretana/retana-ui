"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ConversationItem } from "@/registry/ui/conversation-item"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Fila</h1>
      <StressCase label="Vacío"><ConversationItem item={{ id: "x", title: "" }} status="empty" /></StressCase>
      <StressCase label="Una palabra" width={320}><ConversationItem item={{ id: "a", title: "Ámbar", preview: "Hola", time: "Hoy" }} /></StressCase>
      <StressCase label="Sin espacios" width={320}><ConversationItem item={{ id: "a", title: token, preview: token, time: "10:44", unread: 12 }} /></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><ConversationItem item={{ id: "a", title: "ورشة", preview: "مرحبا بالفريق", time: "أمس", unread: 1 }} /></div></StressCase>
    </main>
  )
}
