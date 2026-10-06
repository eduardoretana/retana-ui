"use client"

import { TicketProperties } from "@/registry/ui/ticket-properties"

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <TicketProperties
        today="2026-10-06"
        locale="es-MX"
        status="open"
        statusOptions={[{ value: "open", label: "Abierta" }]}
        priority="high"
        priorityOptions={[{ value: "high", label: "Alta" }]}
        due="2026-10-01"
        dueLabel="Fecha"
        overdueLabel="Vencida"
        channel="Mostrador"
        sla={{ text: "Vencido", overdue: true }}
        tags={["horno"]}
      />
    </div>
  )
}
