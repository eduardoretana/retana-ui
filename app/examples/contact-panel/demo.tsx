"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ContactPanel } from "@/registry/ui/contact-panel"
import { SuggestionCard } from "@/registry/ui/suggestion-card"
import { brumaAssignees, brumaPriorities, brumaStatuses, brumaTeams } from "@/app/examples/desk/bruma"

export function ContactPanelDemo() {
  return (
    <ExampleFrame title="Ficha del contacto" description="Detalles del encargado y un hueco para el copiloto.">
      <div className="h-[32rem] overflow-hidden rounded-xl border border-border">
        <ContactPanel
          className="h-full"
          contactName="Inés Soler"
          presence="online"
          presenceLabel="En línea"
          detailsLabel="Detalles"
          copilotLabel="Copiloto"
          viewContactLabel="Ver contacto"
          onViewContact={() => undefined}
          spamLabel="Marcar como no deseado"
          onMarkSpam={() => undefined}
          fields={[
            { id: "assignee", label: "Responsable", value: "Mateo Rulfo", options: brumaAssignees },
            { id: "team", label: "Bandeja", value: "obra", options: brumaTeams },
            { id: "priority", label: "Prioridad", value: "medium", options: brumaPriorities },
            { id: "status", label: "Estado", value: "open", options: brumaStatuses },
          ]}
          sections={[
            {
              id: "lead",
              title: "Datos del contacto",
              defaultOpen: true,
              content: <p>ines@faro-litoral.example · Faro Litoral</p>,
            },
          ]}
          copilot={
            <SuggestionCard
              title="Siguiente paso"
              suggestion="Manda la placa de Niebla el jueves."
              confirmLabel="Usar"
              dismissLabel="Descartar"
            />
          }
        />
      </div>
    </ExampleFrame>
  )
}
