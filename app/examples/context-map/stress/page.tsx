"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ContextMap } from "@/registry/ui/context-map"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Mapa del contexto</h1>
      <StressCase label="Vacío">
        <ContextMap />
      </StressCase>
      <StressCase label="Carga y error">
        <ContextMap loading />
        <ContextMap error="No pudimos leer el contexto." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ContextMap limit={100} blocks={[{ id: "a", label: token, kind: "file", tokens: 80, detail: token }]} onSelect={() => {}} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ContextMap limit={10} blocks={[{ id: "a", label: "ملف", kind: "file", tokens: 4 }]} />
        </div>
      </StressCase>
      <StressCase label="Diez bloques">
        <ContextMap
          limit={100}
          compare
          view="after"
          blocks={Array.from({ length: 10 }, (_, index) => ({
            id: `b${index}`,
            label: index === 0 ? "" : `Bloque ${index}`,
            kind: "chat",
            tokens: index + 1,
          }))}
        />
      </StressCase>
    </main>
  )
}
