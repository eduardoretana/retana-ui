"use client"

import { useState } from "react"

import { Agenda } from "@/registry/blocks/agenda"
import type { AgendaEvent, AgendaEventDraft, AgendaMove, AgendaView } from "@/registry/lib/agenda"

import { demoAnchor, demoCategories, demoEvents, demoNow, demoTimeZone, manyAgendaEvents } from "./data"

export type DemoScenario = "ready" | "empty" | "loading" | "error" | "readOnly" | "many"

const scenarios: { id: DemoScenario; label: string }[] = [
  { id: "ready", label: "Listo" },
  { id: "empty", label: "Vacío" },
  { id: "loading", label: "Cargando" },
  { id: "error", label: "Error" },
  { id: "readOnly", label: "Solo lectura" },
  { id: "many", label: "Muchos" },
]

export function AgendaDemo({
  chrome = true,
  initialScenario = "ready",
  initialView = "week",
  initialSelected = "pieza",
}: {
  chrome?: boolean
  initialScenario?: DemoScenario
  initialView?: AgendaView
  initialSelected?: string | null
}) {
  const [scenario, setScenario] = useState<DemoScenario>(initialScenario)
  const [events, setEvents] = useState<AgendaEvent[]>(initialScenario === "many" ? manyAgendaEvents(36) : demoEvents)
  const [note, setNote] = useState("Nada pendiente con el CRM.")

  function pickScenario(next: DemoScenario) {
    setScenario(next)
    if (next === "many") setEvents(manyAgendaEvents(36))
    if (next === "ready" || next === "readOnly") setEvents(demoEvents)
  }

  function reschedule(id: string, move: AgendaMove) {
    setEvents((current) => current.map((event) => (event.id === id ? { ...event, ...move } : event)))
    setNote(`El anfitrión guardaría ${id}.`)
  }

  function create(draft: AgendaEventDraft) {
    const id = `nuevo-${events.length + 1}`
    setEvents((current) => [
      ...current,
      {
        id,
        title: draft.title?.trim() || "Evento nuevo",
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        allDay: draft.allDay,
        categoryId: draft.categoryId ?? "equipo",
        meta: { origen: "demo" },
      },
    ])
    setNote("El anfitrión crearía el evento.")
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {chrome ? (
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Escenario" className="flex flex-wrap gap-1">
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={scenario === item.id}
                className="rounded-md border border-border px-2 py-1 text-xs"
                onClick={() => pickScenario(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground" role="status">
            {note}
          </p>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
        <Agenda
          events={scenario === "empty" ? [] : events}
          categories={demoCategories}
          now={demoNow}
          defaultAnchor={demoAnchor}
          defaultView={initialView}
          defaultSelectedId={scenario === "ready" ? initialSelected : null}
          timeZone={demoTimeZone}
          locale="es-MX"
          hourStart={8}
          hourEnd={16}
          loading={scenario === "loading"}
          error={scenario === "error" ? "Fallo de demostración." : null}
          readOnly={scenario === "readOnly"}
          onRetry={() => setNote("Reintentarías la carga.")}
          onReschedule={reschedule}
          onCreate={create}
          onCreateRequest={create}
          onJoin={(id) => setNote(`Te unirías a la reunión ${id}.`)}
          onOpenSummary={(id) => setNote(`Abrirías el resumen de ${id}.`)}
          onCreateRoom={(id) => setNote(`Crearías una sala para ${id}.`)}
          onOpenTask={(id, taskId) => setNote(`Abrirías el encargo ${taskId} desde ${id}.`)}
          onOpenRecord={(id, recordId) => setNote(`Abrirías el registro ${recordId} desde ${id}.`)}
          onSync={() => setNote("Sincronizarías con el calendario que elija el CRM.")}
          className="h-full"
        />
      </div>
    </div>
  )
}
