"use client"

import { useState } from "react"

import { PlanCard, type PlanStatus, type PlanStep } from "@/registry/ui/plan-card"

const seed: PlanStep[] = [
  { id: "compare", title: "Comparar el anexo con la versión de marzo", detail: "Solo plazos y firmante." },
  { id: "note", title: "Redactar una nota de una página", detail: "Sin copiar cláusulas enteras." },
  { id: "send", title: "Dejarla en el expediente de Bruma", detail: "No se envía correo todavía." },
]

export function Demo() {
  const [steps, setSteps] = useState(seed)
  const [status, setStatus] = useState<PlanStatus>("proposed")

  return (
    <PlanCard
      title="Plan para el contrato"
      summary="Nube propone tres pasos antes de tocar el documento."
      steps={steps}
      status={status}
      approveLabel="Aprobar"
      rejectLabel="Rechazar"
      editLabel="Editar"
      saveLabel="Guardar"
      cancelLabel="Cancelar"
      approvedLabel="Aprobado"
      rejectedLabel="Rechazado"
      onApprove={() => setStatus("approved")}
      onReject={() => setStatus("rejected")}
      onEdit={setSteps}
    />
  )
}
