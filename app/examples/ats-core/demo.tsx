"use client"

import {
  atsLabels,
  candidateScore,
  criterionBars,
  formatAtsDate,
  formatAtsPosition,
  formatPercent,
  funnelSteps,
  recommendationLine,
  verdictTally,
} from "@/registry/lib/ats"

import { demoCandidates, demoCriteria, demoGetStage, demoStages } from "../ats/data"

const camila = demoCandidates[0]!

export function AtsCoreDemo() {
  const funnel = funnelSteps(demoCandidates, demoStages, demoGetStage)
  const tally = verdictTally(camila.scorecards)
  const bars = criterionBars(camila.scorecards ?? [], demoCriteria)
  return (
    <dl className="grid max-w-xl gap-3 text-sm">
      <div>
        <dt className="text-muted-foreground">Posición</dt>
        <dd className="tabular-nums">{formatAtsPosition(2, 14, "de")}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Fecha</dt>
        <dd>{formatAtsDate(camila.appliedAt, "es-MX", "America/Mexico_City")}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Puntaje y síes</dt>
        <dd className="tabular-nums">
          {candidateScore(camila)?.toFixed(1)} · {tally.yes} de {tally.total}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Recomendación</dt>
        <dd>{recommendationLine(demoGetStage(camila), camila.scorecards, demoStages, atsLabels)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Embudo</dt>
        <dd className="tabular-nums">
          {funnel.map((step) => `${step.stage.label} ${step.count}${step.ofPrevious == null ? "" : ` (${formatPercent(step.ofPrevious)})`}`).join(" · ")}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Criterio más bajo</dt>
        <dd>{bars.filter((bar) => bar.average != null).sort((a, b) => (a.average ?? 0) - (b.average ?? 0))[0]?.label}</dd>
      </div>
    </dl>
  )
}
