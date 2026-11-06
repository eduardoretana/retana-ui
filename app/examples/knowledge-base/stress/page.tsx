"use client"

import { StressCase } from "@/app/examples/stress-case"
import type { KnowledgeSource } from "@/registry/lib/knowledge-base"
import { KnowledgeBase } from "@/registry/ui/knowledge-base"

import { filled, knowledgeLabels, types } from "../fixtures"

const token = "N".repeat(60)

const many: KnowledgeSource[] = Array.from({ length: 12 }, (_, index) => {
  const type = types[index % types.length]
  const status = index % 5 === 0 ? "error" : index % 4 === 0 ? "syncing" : index % 3 === 0 ? "stale" : "connected"
  const source: KnowledgeSource = {
    id: `s${index}`,
    typeId: type?.id ?? "docs",
    name: index === 2 ? token : `Fuente demo ${index + 1}`,
    detail: index === 3 ? token : "Detalle del taller",
    status,
    chunks: index * 80,
  }
  if (status === "syncing") source.progress = 40
  if (status === "error") source.error = "Se cortó a la mitad."
  return source
})

const ports = {
  types,
  onSourcesChange: () => {},
  onConnect: async () => {},
  onSync: async () => {},
  onDisconnect: async () => {},
  onReset: async () => {},
  locale: "es-MX",
  labels: knowledgeLabels("es"),
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold text-balance">Estrés · Base de conocimiento</h1>
      <StressCase label="Vacío, carga y error">
        <KnowledgeBase {...ports} title="Base" sources={[]} />
        <KnowledgeBase {...ports} title="Base" sources={filled} status="loading" />
        <KnowledgeBase {...ports} title="Base" sources={filled} status="error" error="La red no respondió." />
      </StressCase>
      <StressCase label="390 px y una fuente que falla a la mitad" width={390}>
        <KnowledgeBase {...ports} title={token} sources={filled} />
      </StressCase>
      <StressCase label="Doce fuentes y un nombre de 60 caracteres" width={390}>
        <KnowledgeBase {...ports} title="Base" sources={many} />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <KnowledgeBase {...ports} title="قاعدة" sources={filled.slice(0, 2)} />
        </div>
      </StressCase>
    </main>
  )
}
