"use client"

import { useState } from "react"

import { DashboardAnaliticoAe } from "@/registry/blocks/ae/dashboard-analitico-ae"

export function Demo() {
  const [created, setCreated] = useState(0)
  return (
    <div className="ae-ember grid gap-3">
      <DashboardAnaliticoAe onCreate={() => setCreated((count) => count + 1)} />
      <p role="status" className="text-sm text-muted-foreground">
        {created ? `Demo: ${created} ${created === 1 ? "trámite nuevo creado" : "trámites nuevos creados"}.` : "Pulsa «Crear nueva» para probar la acción."}
      </p>
    </div>
  )
}
