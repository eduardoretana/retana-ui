"use client"

import { AgendaEventCard } from "@/registry/ui/agenda-event"

import { demoCategories, demoEvents, demoTimeZone } from "../agenda/data"

export function AgendaEventDemo() {
  const event = demoEvents.find((item) => item.id === "pieza")!
  const category = demoCategories.find((item) => item.id === event.categoryId)
  return (
    <div className="max-w-sm">
      <AgendaEventCard event={event} category={category} timeZone={demoTimeZone} locale="es-MX" ongoing />
    </div>
  )
}
