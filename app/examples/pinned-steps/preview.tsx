"use client"

import { PinnedSteps } from "@/registry/ui/pinned-steps"

const steps = [
  {
    id: "dry",
    title: "Secado",
    body: "La puerta entreabierta.",
    decorative: true,
    visual: <span className="absolute inset-6 rounded-xl bg-muted" />,
  },
  {
    id: "glaze",
    title: "Esmalte",
    body: "Cono 6, doce minutos.",
    visual: (
      <span className="absolute inset-6 flex items-end rounded-xl border border-border bg-card p-3 text-sm">
        1.220 °C
      </span>
    ),
  },
]

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <PinnedSteps
        label="Horno"
        steps={steps}
        visualClassName="h-24"
        stepClassName="min-h-0 py-2"
        className="gap-3"
      />
    </div>
  )
}
