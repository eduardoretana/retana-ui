"use client"

import { formatAtsPosition, formatPercent, funnelSteps, type AtsCandidate } from "@/registry/lib/ats"

import { demoStages, type NubeMeta } from "../../ats/data"

const token = "Z".repeat(60)
const none: AtsCandidate<NubeMeta>[] = []
const wide: AtsCandidate<NubeMeta>[] = [
  { id: "a", name: token, appliedAt: "", source: "inbound", meta: { status: "postulacion" } },
  { id: "b", name: "مرشح", appliedAt: "no-es-fecha", source: "🙂", meta: { status: "oferta" } },
]

export default function StressPage() {
  const empty = funnelSteps(none, demoStages, () => "postulacion")
  const odd = funnelSteps(wide, demoStages, (candidate) => candidate.meta?.status ?? "postulacion")
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Núcleo</h1>
      <p className="text-sm break-all">{formatAtsPosition(0, 0)} · {formatAtsPosition(8, 1000)} · {formatPercent(null) || "sin porcentaje"}</p>
      <p className="text-sm">Vacío: {empty.map((step) => step.count).join("-")}</p>
      <p className="text-sm break-all" dir="auto">
        {odd.map((step) => `${step.stage.label}:${step.count}`).join(" · ")} · {token}
      </p>
    </main>
  )
}
