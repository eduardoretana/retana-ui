"use client"

import { Ats } from "@/registry/blocks/ats"
import type { AtsCandidate } from "@/registry/lib/ats"

import { demoCriteria, demoGetStage, demoJob, demoNow, demoPeople, demoStages, manyCandidates, type NubeMeta } from "../data"

const token = "X".repeat(60)

function one(overrides: Partial<AtsCandidate<NubeMeta>> & Pick<AtsCandidate<NubeMeta>, "id" | "name">): AtsCandidate<NubeMeta> {
  return {
    appliedAt: demoNow,
    source: "inbound",
    meta: { status: "postulacion" },
    ...overrides,
  }
}

const shared = {
  job: demoJob,
  stages: demoStages,
  getStage: demoGetStage,
  people: demoPeople,
  criteria: demoCriteria,
  now: demoNow,
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Seguimiento</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-full min-w-0 max-w-80">
          <Ats {...shared} candidates={[]} className="h-full" />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Cargando y error</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 min-w-0">
            <Ats {...shared} candidates={[]} loading className="h-full" />
          </div>
          <div className="h-80 min-w-0">
            <Ats {...shared} candidates={[]} error="Fallo de demostración." onRetry={() => undefined} className="h-full" />
          </div>
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token, emoji, árabe y sin puntaje</h2>
        <div className="h-[36rem] min-w-0">
          <Ats
            {...shared}
            className="h-full"
            candidates={[
              one({ id: "token", name: token, headline: token }),
              one({ id: "emoji", name: "🎨 Estudio", meta: { status: "filtro" } }),
              one({ id: "rtl", name: "مرشحة للأرشيف", location: "١٢٣", meta: { status: "entrevista" } }),
              one({ id: "blank", name: "", meta: { status: "oferta" } }),
            ]}
          />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Doscientos candidatos</h2>
        <div className="h-[36rem] min-w-0">
          <Ats {...shared} candidates={manyCandidates(200)} className="h-full" view="list" />
        </div>
      </section>
    </main>
  )
}
