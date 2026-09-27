"use client"

import { AiDocument } from "@/registry/ui/ai-document"

export function Demo() {
  return (
    <AiDocument
      title="Minuta de Bruma"
      acceptLabel="Aceptar"
      rejectLabel="Rechazar"
      insertLabel="Alta"
      deleteLabel="Baja"
      replaceLabel="Cambio"
      segments={[
        { id: "intro", type: "text", text: "Estudio Bruma pide ajustar el anexo antes del viernes." },
        {
          id: "term",
          type: "edit",
          kind: "replace",
          text: "El plazo de entrega es de 30 días.",
          replacement: "El plazo de entrega es de 45 días desde la firma.",
        },
        {
          id: "city",
          type: "edit",
          kind: "delete",
          text: "La reunión de seguimiento será en la oficina de marzo.",
        },
        {
          id: "note",
          type: "edit",
          kind: "insert",
          text: "La cláusula de pago no cambia.",
        },
      ]}
    />
  )
}
