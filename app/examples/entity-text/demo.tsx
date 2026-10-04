"use client"

import { EntityText } from "@/registry/ui/entity-text"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <EntityText text="The bowl from Harbor shelf dried overnight." entities={[{ start: 4, end: 8, type: "object", score: 0.9 }, { start: 14, end: 26, type: "place", score: 0.7 }]} types={{ object: { label: "Object" }, place: { label: "Place" } }} />
    </div>
  )
}
