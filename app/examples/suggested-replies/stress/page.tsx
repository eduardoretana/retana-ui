"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SuggestedReplies } from "@/registry/ui/suggested-replies"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Sugerencias</h1>
      <StressCase label="Vacío"><SuggestedReplies status="empty" /></StressCase>
      <StressCase label="Carga y error"><SuggestedReplies status="loading" /><SuggestedReplies status="error" error="Fallo" /></StressCase>
      <StressCase label="Diez chips">
        <SuggestedReplies items={Array.from({ length: 10 }, (_, index) => ({ id: `s${index}`, label: index === 0 ? token : `Idea ${index}` }))} />
      </StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><SuggestedReplies items={[{ id: "a", label: "جدولة مكالمة" }]} /></div></StressCase>
    </main>
  )
}
