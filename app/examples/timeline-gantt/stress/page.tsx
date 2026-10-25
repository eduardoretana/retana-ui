"use client"

import { TimelineGantt } from "@/registry/ui/timeline-gantt"
import type { GanttItem } from "@/registry/lib/timeline-gantt"

import { demoItems, demoNow, demoWorkstreams, manyGanttItems } from "../../portfolio-desk/data"

const token = "Y".repeat(60)
const rtl = "مراجعة الغلاف التجريبي"

function one(overrides: Partial<GanttItem> & Pick<GanttItem, "id" | "label">): GanttItem {
  return {
    workstream: "impresion",
    start: "2026-10-20",
    end: "2026-10-24",
    status: "active",
    ...overrides,
  }
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cronograma</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-80 w-full max-w-80">
          <TimelineGantt items={[]} now={demoNow} labelWidth={120} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <TimelineGantt items={demoItems} loading now={demoNow} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <TimelineGantt items={[]} error="Fallo de demostración." onRetry={() => undefined} now={demoNow} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Una sola tarea</h2>
        <div className="h-64">
          <TimelineGantt items={[one({ id: "solo", label: "Una" })]} workstreams={demoWorkstreams} now={demoNow} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Token largo, emoji y números</h2>
        <div className="h-80">
          <TimelineGantt
            now={demoNow}
            items={[
              one({ id: "token", label: token, description: token }),
              one({ id: "emoji", label: "📦 Inventario", description: "🙂 🙂 🙂", start: "2026-10-26", end: "2026-10-28" }),
              one({ id: "nums", label: "1.250,00 pliegos", start: "2026-10-21", end: "2026-10-22", status: "done" }),
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <div className="h-64">
          <TimelineGantt items={[one({ id: "rtl", label: rtl, description: rtl })]} now={demoNow} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Muchas tareas y deshabilitado</h2>
        <div className="h-[32rem]">
          <TimelineGantt items={manyGanttItems(40)} workstreams={demoWorkstreams} now={demoNow} disabled />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Contenedor ancho, apretado por un hermano</h2>
        <div className="flex min-w-0 gap-3">
          <div className="h-80 w-40 shrink-0 rounded-lg border border-border" />
          <div className="h-80 min-w-0 flex-1">
            <TimelineGantt items={demoItems.slice(0, 3)} workstreams={demoWorkstreams} now={demoNow} labelWidth={140} />
          </div>
        </div>
      </section>
    </main>
  )
}
