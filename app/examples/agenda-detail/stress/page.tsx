"use client"

import { AgendaDetail } from "@/registry/ui/agenda-detail"
import type { AgendaEvent } from "@/registry/lib/agenda"

import { demoCategories } from "../../agenda/data"

const token = "Z".repeat(60)

function panel(event: AgendaEvent, label: string, readOnly = false) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="w-full min-w-0 max-w-80 overflow-hidden rounded-xl border border-border">
        <AgendaDetail
          event={event}
          category={demoCategories[2]}
          readOnly={readOnly}
          timeZone="America/Mexico_City"
          onJoin={() => undefined}
          onOpenTask={() => undefined}
        />
      </div>
    </section>
  )
}

const base: AgendaEvent = {
  id: "base",
  title: "Una",
  startsAt: "2026-04-08T16:00:00.000Z",
  endsAt: "2026-04-08T17:00:00.000Z",
  description: "",
  participants: [],
  taskId: "horno",
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Detalle del evento</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {panel(base, "Sin descripción ni participantes")}
        {panel({ ...base, id: "word", title: "Horno", description: "Corta." }, "Una palabra")}
        {panel(
          {
            ...base,
            id: "long",
            title: "Revisar el bastidor con el grupo antes de abrir la sala y avisar a dirección.",
            description: "Primera frase del ejemplo. Segunda frase, todavía inventada. Tercera frase para ver el salto.",
            participants: [
              { id: "nuria", name: "Nuria Sol", status: "confirmed" },
              { id: "ivo", name: "Ivo Calderón", status: "pending" },
              { id: "paz", name: "Paz Lemus", status: "declined" },
            ],
          },
          "Varias frases",
        )}
        {panel({ ...base, id: "token", title: token, description: token, location: token }, "Token de 60")}
        {panel({ ...base, id: "emoji", title: "📦 1.250,00", description: "🙂 🙂 🙂" }, "Emoji y números")}
        {panel(base, "Solo lectura", true)}
      </div>
      <section className="grid max-w-80 gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Derecha a izquierda</h2>
        <div className="rounded-xl border border-border">
          <AgendaDetail event={{ ...base, id: "rtl", title: "اجتماع تجريبي", description: "وصف تجريبي طويل" }} timeZone="America/Mexico_City" />
        </div>
      </section>
    </main>
  )
}
