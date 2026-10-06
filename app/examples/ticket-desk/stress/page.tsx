"use client"

import { TicketDesk } from "@/registry/blocks/ticket-desk"
import { LONG_TOKEN, brumaPriorities, brumaStatuses, brumaTypes, brumaChannels, brumaAssignees } from "@/app/examples/desk/bruma"

const options = {
  statuses: brumaStatuses,
  priorities: brumaPriorities,
  types: brumaTypes,
  channels: brumaChannels,
  assignees: brumaAssignees,
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Piezas</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-80 max-w-full">
          <TicketDesk className="h-full" agentName="Mateo" today="2026-10-06" defaultTickets={[]} {...options} />
        </div>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Fecha vencida y título largo</h2>
        <div className="h-[36rem]">
          <TicketDesk
            className="h-full"
            agentName="Mateo"
            today="2026-10-06"
            locale="es-MX"
            {...options}
            defaultTickets={[{
              id: "x",
              code: "BRU-1",
              subject: LONG_TOKEN,
              description: "🙂",
              requester: "نوريا",
              status: "open",
              priority: "urgent",
              type: "incident",
              channel: "mail",
              assignee: "Mateo",
              due: "2026-01-01",
              created: "1",
              updated: "2",
              opened: "هاتف",
              sla: { text: "متأخر", overdue: true },
              tags: [LONG_TOKEN],
              messages: [],
            }]}
          />
        </div>
      </section>
    </main>
  )
}
