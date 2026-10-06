"use client"

import { TicketProperties } from "@/registry/ui/ticket-properties"
import { LONG_TOKEN } from "@/app/examples/desk/bruma"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Propiedades</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Solo lectura, fecha vencida</h2>
        <div className="w-80 max-w-full rounded-xl border border-border">
          <TicketProperties today="2026-10-06" due="2026-10-01" channel={LONG_TOKEN} created="1" updated="2" sla={{ text: LONG_TOKEN, overdue: true }} tags={[LONG_TOKEN, "🙂"]} />
        </div>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">RTL y sin fecha</h2>
        <div className="w-80 rounded-xl border border-border">
          <TicketProperties today="2026-10-06" title="خصائص" status="open" statusOptions={[{ value: "open", label: "مفتوح" }]} tags={[]} />
        </div>
      </section>
      <section className="flex">
        <div className="w-24 shrink-0 border border-border p-2 text-xs">Hermano</div>
        <div className="min-w-0 flex-1 rounded-xl border border-border">
          <TicketProperties today="2026-10-06" priority="urgent" priorityOptions={[{ value: "urgent", label: "Urgente" }, { value: "none", label: "Ninguna" }]} />
        </div>
      </section>
    </main>
  )
}
