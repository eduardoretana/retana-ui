"use client"

import { PipelineBoard } from "@/registry/blocks/pipeline-board"
import type { AtsCandidate } from "@/registry/lib/ats"

import { demoGetStage, demoNow, demoPeople, demoStages, manyCandidates, type NubeMeta } from "../../ats/data"

const token = "W".repeat(60)

function one(overrides: Partial<AtsCandidate<NubeMeta>> & Pick<AtsCandidate<NubeMeta>, "id" | "name">): AtsCandidate<NubeMeta> {
  return { appliedAt: demoNow, source: "inbound", meta: { status: "postulacion" }, ...overrides }
}

const shared = { stages: demoStages, getStage: demoGetStage, people: demoPeople }

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tablero</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[28rem] max-w-80">
          <PipelineBoard {...shared} candidates={[]} className="h-full" />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Carga y error</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64">
            <PipelineBoard {...shared} candidates={[]} loading className="h-full" />
          </div>
          <div className="h-64">
            <PipelineBoard {...shared} candidates={[]} error="Fallo de demostración." onRetry={() => undefined} className="h-full" />
          </div>
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token, emoji y sin puntaje</h2>
        <div className="h-[32rem]">
          <PipelineBoard
            {...shared}
            className="h-full"
            candidates={[
              one({ id: "token", name: token }),
              one({ id: "emoji", name: "📦 مرشح", meta: { status: "entrevista" } }),
              one({ id: "none", name: "Sin puntaje", meta: { status: "oferta" } }),
            ]}
          />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Doscientos</h2>
        <div className="h-[32rem]">
          <PipelineBoard {...shared} candidates={manyCandidates(200)} className="h-full" view="list" />
        </div>
      </section>
    </main>
  )
}
