"use client"

import { useState } from "react"

import { CrmTable, type CrmRow } from "@/registry/ui/crm-table"

const rows: CrmRow[] = [
  {
    id: "bruma",
    name: "Marina Soler",
    email: "marina@bruma.example",
    status: "Activa",
    statusTone: "emphasis",
    stage: "Propuesta",
    owner: "Diego Alarcón",
    lastActivity: "hace 2 h",
  },
  {
    id: "norte",
    name: "Clara Ibáñez",
    email: "clara@norte.example",
    status: "En espera",
    statusTone: "neutral",
    stage: "Descubrimiento",
    owner: "Nuria Peña",
    lastActivity: "ayer",
  },
  {
    id: "orilla",
    name: "Hugo Belmonte",
    email: "hugo@orilla.example",
    status: "Riesgo",
    statusTone: "danger",
    stage: "Negociación",
    owner: "Diego Alarcón",
    lastActivity: "hace 6 días",
  },
]

export function Demo() {
  const [picked, setPicked] = useState<string>("Ninguna ficha abierta.")
  return (
    <div className="flex flex-col gap-3">
      <CrmTable
        rows={rows}
        onRowClick={(row) => setPicked(`${row.name} · ${row.stage}`)}
        emptyLabel="Sin fichas"
        labels={{
          person: "Contacto",
          status: "Estado",
          stage: "Etapa",
          owner: "Dueño",
          activity: "Última actividad",
        }}
      />
      <p className="text-sm text-muted-foreground">{picked}</p>
    </div>
  )
}
