"use client"

import { ReasoningSteps } from "@/registry/ui/reasoning-steps"

export default function ReasoningStepsPreview() {
  return (
    <div className="h-full bg-background p-3">
      <ReasoningSteps
        title="Razonamiento"
        pendingLabel="Pendiente"
        activeLabel="En curso"
        doneLabel="Hecho"
        errorLabel="Error"
        steps={[
          { id: "1", title: "Leer el anexo", status: "done", durationMs: 420 },
          { id: "2", title: "Comparar plazos", status: "active", durationMs: 180 },
          { id: "3", title: "Redactar nota", status: "pending" },
        ]}
      />
    </div>
  )
}
