"use client"

import { FilterToolbar } from "@/registry/ui/filter-toolbar"

export default function FilterToolbarPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <FilterToolbar
        className="w-full"
        filters={[{ id: "channel", label: "Canal", value: "kiln" }]}
        onRemove={() => {}}
        addFilter={{ fields: [{ id: "channel", label: "Canal", options: ["kiln", "gallery"] }], onAdd: () => {}, label: "Añadir" }}
      />
    </div>
  )
}
