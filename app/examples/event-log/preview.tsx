"use client"

import { EventLog } from "@/registry/ui/event-log"

const entries = [
  { id: "1", time: new Date(), type: "kiln:hold", message: "Hold started on shelf B", payload: { minutes: 20 } },
  { id: "2", time: Date.now() - 60_000, type: "glaze:note", message: "Celadon batch mixed" },
]

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <EventLog entries={entries} />
    </div>
  )
}
