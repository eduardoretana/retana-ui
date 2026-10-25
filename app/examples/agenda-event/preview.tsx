"use client"

import { AgendaEventCard } from "@/registry/ui/agenda-event"

import { demoCategories, demoEvents, demoTimeZone } from "../agenda/data"

export default function Preview() {
  const event = demoEvents.find((item) => item.id === "pieza")!
  return (
    <div className="grid h-full content-center bg-background p-4">
      <AgendaEventCard
        event={event}
        category={demoCategories.find((item) => item.id === event.categoryId)}
        timeZone={demoTimeZone}
        ongoing
      />
    </div>
  )
}
