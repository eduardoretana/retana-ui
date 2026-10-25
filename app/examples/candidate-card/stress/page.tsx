"use client"

import { CandidateCard } from "@/registry/ui/candidate-card"
import type { AtsCandidate } from "@/registry/lib/ats"

import { demoStages, type NubeMeta } from "../../ats/data"

const token = "Y".repeat(60)

function card(candidate: AtsCandidate<NubeMeta>, stageId: string) {
  return (
    <div className="max-w-80 min-w-0">
      <CandidateCard candidate={candidate} stageId={stageId} stages={demoStages} />
    </div>
  )
}

const base: AtsCandidate<NubeMeta> = {
  id: "base",
  name: "Una",
  appliedAt: "2026-10-01T15:00:00.000Z",
  source: "inbound",
  meta: { status: "postulacion" },
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de candidato</h1>
      <section className="grid gap-3 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Vacío, una palabra, frases y token</h2>
        {card({ ...base, id: "empty", name: "" }, "postulacion")}
        {card({ ...base, id: "word", name: "Nube" }, "filtro")}
        {card({ ...base, id: "long", name: "Diseñadora que escribe el sistema, el taller y la visita del sábado." }, "entrevista")}
        {card({ ...base, id: "token", name: token }, "oferta")}
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Emoji, números y derecha a izquierda</h2>
        {card({ ...base, id: "mix", name: "📦 1.250,00 مرشحة", tags: [{ id: "e", label: "🙂🙂🙂" }] }, "onsite")}
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y sin puntaje</h2>
        <div className="flex min-w-0 gap-2">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          {card({ ...base, id: "plain" }, "postulacion")}
        </div>
      </section>
    </main>
  )
}
