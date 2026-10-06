"use client"

import { useState } from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { TicketProperties } from "@/registry/ui/ticket-properties"
import { brumaAssignees, brumaPriorities, brumaStatuses, brumaTypes } from "@/app/examples/desk/bruma"

export function TicketPropertiesDemo() {
  const [status, setStatus] = useState("open")
  const [priority, setPriority] = useState("high")
  const [tags, setTags] = useState(["horno", "niebla"])
  return (
    <ExampleFrame title="Propiedades de la pieza" description="La fecha prometida y el plazo usan el tono de alerta cuando ya vencieron.">
      <div className="max-w-sm rounded-xl border border-border">
        <TicketProperties
          today="2026-10-06"
          locale="es-MX"
          title="Propiedades"
          status={status}
          statusOptions={brumaStatuses}
          onStatusChange={setStatus}
          priority={priority}
          priorityOptions={brumaPriorities}
          onPriorityChange={setPriority}
          type="problem"
          typeOptions={brumaTypes}
          assignee="Bruno Hale"
          assigneeOptions={brumaAssignees}
          due="2026-10-01"
          dueLabel="Fecha prometida"
          overdueLabel="Vencida"
          channel="Mostrador"
          created="28 sep 2026"
          updated="5 oct 2026"
          sla={{ text: "Vencido desde el jueves", overdue: true }}
          slaLabel="Plazo"
          tags={tags}
          onTagsChange={setTags}
          tagsLabel="Etiquetas"
        />
      </div>
    </ExampleFrame>
  )
}
