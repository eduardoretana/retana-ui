"use client"

import { CandidateDetail } from "@/registry/ui/candidate-detail"
import type { AtsCandidate } from "@/registry/lib/ats"

import { demoCriteria, demoPeople, demoStages, type NubeMeta } from "../../ats/data"

const token = "V".repeat(60)

function panel(candidate: AtsCandidate<NubeMeta>, stageId: string, width: string) {
  return (
    <div className={width}>
      <div className="h-[32rem] overflow-hidden rounded-xl border border-border">
        <CandidateDetail candidate={candidate} stageId={stageId} stages={demoStages} people={demoPeople} criteria={demoCriteria} position={1} total={1} />
      </div>
    </div>
  )
}

const base: AtsCandidate<NubeMeta> = {
  id: "base",
  name: "Una",
  appliedAt: "2026-10-01T15:00:00.000Z",
  source: "inbound",
  meta: { status: "entrevista" },
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Detalle</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <h2 className="text-sm font-medium lg:col-span-2">Vacío, token y emoji</h2>
        {panel({ ...base, id: "empty", name: "" }, "postulacion", "min-w-0")}
        {panel({ ...base, id: "token", name: token, applicationNote: token, location: token }, "filtro", "min-w-0")}
        {panel({ ...base, id: "emoji", name: "📦 مرشحة", notes: [{ id: "n", authorId: "nuria", body: "🙂🙂🙂", createdAt: "2026-10-01T00:00:00.000Z" }] }, "onsite", "min-w-0")}
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y sin scorecards</h2>
        {panel(base, "entrevista", "w-full max-w-80")}
      </section>
    </main>
  )
}
