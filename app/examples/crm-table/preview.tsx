"use client"

import { CrmTable } from "@/registry/ui/crm-table"

export default function CrmTablePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <CrmTable
        labels={{ person: "Contacto", status: "Estado", stage: "Etapa", owner: "Dueño", activity: "Actividad" }}
        emptyLabel="Sin fichas"
        rows={[
          {
            id: "1",
            name: "Marina Soler",
            email: "marina@bruma.example",
            status: "Activa",
            statusTone: "emphasis",
            stage: "Propuesta",
            owner: "Diego Alarcón",
            lastActivity: "hoy",
          },
        ]}
      />
    </div>
  )
}
