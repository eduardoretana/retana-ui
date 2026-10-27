"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MemoryPanel } from "@/registry/ui/memory-panel"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Lo que recuerda</h1>
      <StressCase label="Vacío">
        <MemoryPanel />
      </StressCase>
      <StressCase label="Carga y error">
        <MemoryPanel loading />
        <MemoryPanel error="No pudimos leer los recuerdos." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <MemoryPanel memories={[{ id: "a", text: token, category: token, source: token, date: token }]} categories={[token]} onForget={() => {}} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <MemoryPanel memories={[{ id: "a", text: "تذكر", category: "عمل", paused: true }]} categories={["عمل"]} enabled={false} />
        </div>
      </StressCase>
      <StressCase label="Diez recuerdos">
        <MemoryPanel
          categories={["A"]}
          memories={Array.from({ length: 10 }, (_, index) => ({
            id: `m${index}`,
            text: index === 0 ? "" : `Recuerdo ${index}`,
            category: "A",
            paused: index % 2 === 0,
          }))}
        />
      </StressCase>
    </main>
  )
}
