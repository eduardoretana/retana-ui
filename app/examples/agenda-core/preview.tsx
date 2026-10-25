"use client"

import { calendarDate, isGapHour } from "@/registry/lib/agenda"

export default function Preview() {
  const day = calendarDate(Date.parse("2026-04-08T16:28:00.000Z"), "America/Mexico_City")
  const gap = isGapHour("2026-03-08", 2, "America/New_York")
  return (
    <div className="grid h-full content-center gap-1 bg-background p-3 text-sm">
      <p className="tabular-nums">{day}</p>
      <p>{gap ? "02:00 no existe" : "02:00 existe"}</p>
    </div>
  )
}
