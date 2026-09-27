"use client"

import { PlanCard } from "@/registry/ui/plan-card"

export default function PlanCardPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <PlanCard
        title="Plan propuesto"
        approveLabel="Aprobar"
        editLabel="Editar"
        rejectLabel="Rechazar"
        steps={[
          { id: "1", title: "Comparar anexos" },
          { id: "2", title: "Redactar la nota" },
        ]}
      />
    </div>
  )
}
