"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ContextWindow } from "@/registry/ui/context-window"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ventana de contexto</h1>
      <StressCase label="Vacío">
        <ContextWindow />
      </StressCase>
      <StressCase label="Carga y error">
        <ContextWindow loading />
        <ContextWindow error="No pudimos leer la ventana." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ContextWindow limit={10} parts={[{ id: "a", label: token, tokens: 9, items: [{ id: "b", label: token, tokens: 9 }] }]} onRemove={() => {}} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ContextWindow limit={10} parts={[{ id: "a", label: "ملفات", items: [{ id: "b", label: "ملف", tokens: 4 }] }]} />
        </div>
      </StressCase>
      <StressCase label="Diez partes">
        <ContextWindow
          limit={100}
          parts={Array.from({ length: 10 }, (_, index) => ({
            id: `p${index}`,
            label: index === 0 ? "" : `Parte ${index}`,
            tokens: index,
            compactable: index === 1,
          }))}
        />
      </StressCase>
    </main>
  )
}
