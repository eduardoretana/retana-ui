"use client"

import { AiDocument } from "@/registry/ui/ai-document"

export default function AiDocumentPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <AiDocument
        title="Nota"
        acceptLabel="Aceptar"
        rejectLabel="Rechazar"
        replaceLabel="Reemplazo"
        segments={[
          { id: "a", type: "text", text: "El plazo actual es corto." },
          { id: "b", type: "edit", kind: "replace", text: "30 días", replacement: "45 días" },
        ]}
      />
    </div>
  )
}
