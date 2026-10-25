"use client"

import {
  calendarDate,
  formatRangeLabel,
  isGapHour,
  placeOverlaps,
  zonedDayBounds,
} from "@/registry/lib/agenda"

const now = Date.parse("2026-04-08T16:28:00.000Z")
const zone = "America/Mexico_City"

export function AgendaCoreDemo() {
  const bounds = zonedDayBounds("2026-04-08", zone)
  const hours = bounds ? (bounds.end - bounds.start) / 3_600_000 : 0
  const columns = placeOverlaps([
    { id: "a", start: 600, end: 720 },
    { id: "b", start: 630, end: 690 },
  ])
  return (
    <dl className="grid max-w-xl gap-3 text-sm">
      <div>
        <dt className="text-muted-foreground">Día en Ciudad de México</dt>
        <dd className="tabular-nums">{calendarDate(now, zone)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Duración del día</dt>
        <dd className="tabular-nums">{hours} h</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Semana</dt>
        <dd>{formatRangeLabel("week", "2026-04-08", "es-MX")}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Hora que no existe en Nueva York</dt>
        <dd>{isGapHour("2026-03-08", 2, "America/New_York") ? "08 mar 2026, 02:00 se adelanta" : "existe"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Columnas de un traslape</dt>
        <dd className="tabular-nums">{columns.get("b")?.columns ?? 0}</dd>
      </div>
    </dl>
  )
}
