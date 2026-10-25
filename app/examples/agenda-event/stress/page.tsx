"use client"

import { AgendaEventCard } from "@/registry/ui/agenda-event"
import type { AgendaEvent } from "@/registry/lib/agenda"

import { demoCategories } from "../../agenda/data"

const token = "Y".repeat(60)

function card(event: AgendaEvent, width: string) {
  return (
    <div className={width}>
      <AgendaEventCard event={event} category={demoCategories[2]} ongoing timeZone="America/Mexico_City" />
    </div>
  )
}

const base: AgendaEvent = {
  id: "base",
  title: "Una",
  startsAt: "2026-04-08T16:00:00.000Z",
  endsAt: "2026-04-08T17:00:00.000Z",
  categoryId: "diseno",
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de evento</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío, una palabra, frases y token</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {card({ ...base, id: "empty", title: "" }, "h-24 max-w-xs")}
          {card({ ...base, id: "word", title: "Horno" }, "h-24 max-w-xs")}
          {card({ ...base, id: "long", title: "Preparar la prueba, avisar al grupo y dejar el bastidor listo para el sábado." }, "h-28 max-w-xs")}
          {card({ ...base, id: "token", title: token }, "h-28 w-full min-w-0 max-w-80")}
        </div>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Emoji, números y derecha a izquierda</h2>
        {card({ ...base, id: "mix", title: "📦 1.250,00 اجتماع" }, "h-24 max-w-sm")}
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y fila apretada</h2>
        <div className="flex min-w-0 max-w-80 gap-2">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          {card(base, "h-24 w-full min-w-0")}
        </div>
      </section>
    </main>
  )
}
