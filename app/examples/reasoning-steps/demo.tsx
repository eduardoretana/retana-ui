"use client"

import { ReasoningSteps } from "@/registry/ui/reasoning-steps"

export function Demo() {
  return (
    <ReasoningSteps
      title="Pasos de Nube"
      pendingLabel="Pendiente"
      activeLabel="En curso"
      doneLabel="Hecho"
      errorLabel="Error"
      steps={[
        { id: "read", title: "Abrir el contrato de Bruma", detail: "12 páginas, anexo B incluido.", status: "done", durationMs: 860 },
        { id: "diff", title: "Comparar con la versión anterior", detail: "Cambió el plazo y el firmante.", status: "done", durationMs: 1240 },
        { id: "tool", title: "Consultar el calendario", detail: "Buscando hueco con Estudio Orilla.", status: "active", durationMs: 300 },
        { id: "draft", title: "Redactar la nota", status: "pending" },
        { id: "mail", title: "Enviar el borrador", detail: "El buzón rechazó el destinatario.", status: "error", durationMs: 90 },
      ]}
    />
  )
}
