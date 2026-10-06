"use client"

import { StickySectionList } from "@/registry/ui/sticky-section-list"

export default function Preview() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <StickySectionList
        label="Directorio"
        sections={[
          { id: "a", label: "A", items: [{ id: "1", title: "Ana Solís", detail: "Horno" }] },
          { id: "b", label: "B", items: [{ id: "2", title: "Bruno Peña", detail: "Esmalte" }] },
        ]}
      />
    </div>
  )
}
