"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MessageBubble } from "@/registry/ui/message-bubble"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Burbuja</h1>
      <StressCase label="Vacío"><MessageBubble side="incoming" author="" /></StressCase>
      <StressCase label="Una palabra"><MessageBubble side="outgoing" author="Tú" delivery="sent" deliveryLabel="Enviado">Hola</MessageBubble></StressCase>
      <StressCase label="Sin espacios" width={320}><MessageBubble side="incoming" author={token}>{token}</MessageBubble></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><MessageBubble side="incoming" author="ليلى">مرحبا، هل يمكننا الحديث هذا الأسبوع؟</MessageBubble></div></StressCase>
      <StressCase label="Agrupada">
        <MessageBubble side="incoming" author="Marina" grouped="start">Uno</MessageBubble>
        <MessageBubble side="incoming" author="Marina" grouped="end">Dos</MessageBubble>
      </StressCase>
    </main>
  )
}
