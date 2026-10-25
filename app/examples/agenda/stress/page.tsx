"use client"

import { Agenda } from "@/registry/blocks/agenda"
import type { AgendaEvent } from "@/registry/lib/agenda"

import { demoAnchor, demoCategories, demoEvents, demoNow, demoTimeZone, manyAgendaEvents } from "../data"

const token = "Y".repeat(60)
const rtlTitle = "اجتماع تجريبي للأرشيف"

const shared = {
  categories: demoCategories,
  now: demoNow,
  anchor: demoAnchor,
  timeZone: demoTimeZone,
  locale: "es-MX",
  hourStart: 8,
  hourEnd: 16,
  defaultView: "week" as const,
}

function one(overrides: Partial<AgendaEvent> & Pick<AgendaEvent, "id" | "title">): AgendaEvent {
  return {
    startsAt: "2026-04-08T16:00:00.000Z",
    endsAt: "2026-04-08T17:00:00.000Z",
    categoryId: "diseno",
    ...overrides,
  }
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Agenda</h1>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-full min-w-0 max-w-80">
          <Agenda {...shared} events={[]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <div className="h-80 min-w-0">
          <Agenda {...shared} events={demoEvents} loading className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <div className="h-64 min-w-0">
          <Agenda {...shared} events={[]} error="Fallo de demostración." onRetry={() => undefined} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Un solo evento</h2>
        <div className="h-80 min-w-0">
          <Agenda {...shared} events={[one({ id: "solo", title: "Una" })]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token largo, emoji y números</h2>
        <div className="h-[36rem] min-w-0">
          <Agenda
            {...shared}
            className="h-full"
            defaultSelectedId="token"
            events={[
              one({ id: "token", title: token, description: token }),
              one({ id: "emoji", title: "📦 Inventario", description: "🙂 🙂 🙂", startsAt: "2026-04-08T18:00:00.000Z", endsAt: "2026-04-08T19:00:00.000Z" }),
              one({ id: "nums", title: "1.250,00 piezas", description: "100000200000300000", startsAt: "2026-04-07T16:00:00.000Z", endsAt: "2026-04-07T17:00:00.000Z" }),
            ]}
          />
        </div>
      </section>

      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <div className="h-80 min-w-0">
          <Agenda {...shared} events={[one({ id: "rtl", title: rtlTitle, description: rtlTitle })]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Muchos eventos y solo lectura</h2>
        <div className="h-[36rem] min-w-0">
          <Agenda {...shared} events={manyAgendaEvents(40)} readOnly className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Contenedor ancho, apretado por un hermano</h2>
        <div className="flex min-w-0 gap-3">
          <div className="h-80 w-40 shrink-0 rounded-lg border border-border" />
          <div className="h-80 min-w-0 flex-1">
            <Agenda {...shared} events={demoEvents.slice(0, 3)} className="h-full" />
          </div>
        </div>
      </section>
    </main>
  )
}
