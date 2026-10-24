"use client"

import { useState } from "react"

import { DashboardCapacitacionAe } from "@/registry/blocks/ae/dashboard-capacitacion-ae"

export function Demo() {
  const [opened, setOpened] = useState<string | null>(null)
  return (
    <div className="ae-ember grid gap-3">
      <DashboardCapacitacionAe onOpenProcess={setOpened} />
      <p role="status" className="text-sm text-muted-foreground">
        {opened ? `Demo: abriste el proceso ${opened}.` : "Pulsa el botón redondo de un curso para probar la acción."}
      </p>
    </div>
  )
}
