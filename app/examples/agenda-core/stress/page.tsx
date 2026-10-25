"use client"

import { calendarDate, formatRangeLabel, isGapHour, placeOverlaps } from "@/registry/lib/agenda"

const token = "Z".repeat(60)

export default function StressPage() {
  const columns = placeOverlaps([
    { id: "a", start: 0, end: 30 },
    { id: token, start: 15, end: 45 },
  ])
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Núcleo de la agenda</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Fecha vacía y token</h2>
        <p className="text-sm break-all">{calendarDate(Number.NaN, "America/Mexico_City") || "sin fecha"}</p>
        <p className="max-w-80 text-sm break-all">{token}</p>
        <p className="text-sm tabular-nums">{columns.get(token)?.column}</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Rango ancho y hora inexistente</h2>
        <p className="text-sm">{formatRangeLabel("week", "2026-04-08", "es-MX")}</p>
        <p className="text-sm">{isGapHour("2026-03-08", 2, "America/New_York") ? "Hueco de horario" : "Sin hueco"}</p>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Etiqueta en árabe</h2>
        <p className="text-sm">{formatRangeLabel("month", "2026-04-08", "ar")}</p>
      </section>
    </main>
  )
}
