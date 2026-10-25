"use client"

import { CandidateTable } from "@/registry/ui/candidate-row"
import type { AtsCandidate } from "@/registry/lib/ats"

import { demoGetStage, demoPeople, demoStages, manyCandidates, type NubeMeta } from "../../ats/data"

const token = "Q".repeat(60)

const rows: AtsCandidate<NubeMeta>[] = [
  { id: "empty", name: "", appliedAt: "2026-10-01T15:00:00.000Z", source: "inbound", meta: { status: "postulacion" } },
  { id: "token", name: token, location: token, appliedAt: "2026-10-02T15:00:00.000Z", source: "agency", years: 1, meta: { status: "filtro" } },
  { id: "emoji", name: "📦 مرشح ١٢", appliedAt: "2026-10-03T15:00:00.000Z", source: "referral", meta: { status: "entrevista" } },
]

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Fila</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Cero filas</h2>
        <CandidateTable candidates={[]} stages={demoStages} getStage={demoGetStage} people={demoPeople} />
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token, emoji y 320px</h2>
        <div className="w-full min-w-0 max-w-80">
          <CandidateTable candidates={rows} stages={demoStages} getStage={demoGetStage} people={demoPeople} layout="stack" />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Doscientas filas</h2>
        <CandidateTable candidates={manyCandidates(200)} stages={demoStages} getStage={demoGetStage} people={demoPeople} />
      </section>
    </main>
  )
}
