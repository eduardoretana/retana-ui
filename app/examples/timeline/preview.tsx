"use client"

import { people } from "@/app/examples/arc/demo-data"
import { Timeline } from "@/registry/ui/timeline"

const now = Date.parse("2026-04-02T18:00:00Z")

export default function TimelinePreview() {
  return (
    <div className="bg-background p-3">
      <Timeline
        label="Bitácora"
        now={now}
        events={people.slice(0, 3).map((person, index) => ({
          id: person.id,
          at: now - index * 3_600_000,
          actor: person.name,
          title: person.role,
          detail: index === 0 ? "Detalle del lote." : undefined,
        }))}
      />
    </div>
  )
}
