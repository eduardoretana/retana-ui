"use client"

import { useState } from "react"

import { AgendaDetail } from "@/registry/ui/agenda-detail"

import { demoCategories, demoEvents, demoTimeZone } from "../agenda/data"

export function AgendaDetailDemo({ eventId = "pieza" }: { eventId?: string }) {
  const event = demoEvents.find((item) => item.id === eventId) ?? demoEvents[0]!
  const [note, setNote] = useState("Las acciones avisan al anfitrión.")
  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground" role="status">
        {note}
      </p>
      <div className="overflow-hidden rounded-xl border border-border">
        <AgendaDetail
          event={event}
          category={demoCategories.find((item) => item.id === event.categoryId)}
          timeZone={demoTimeZone}
          locale="es-MX"
          onJoin={(id) => setNote(`Te unirías a ${id}.`)}
          onOpenSummary={(id) => setNote(`Abrirías el resumen de ${id}.`)}
          onCreateRoom={(id) => setNote(`Crearías una sala para ${id}.`)}
          onOpenTask={(id, taskId) => setNote(`Abrirías el encargo ${taskId} desde ${id}.`)}
          onOpenRecord={(id, recordId) => setNote(`Abrirías el registro ${recordId} desde ${id}.`)}
        />
      </div>
    </div>
  )
}
