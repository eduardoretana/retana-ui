"use client"

import { Treemap } from "@/registry/ui/treemap"

export default function TreemapPreview() {
  return (
    <div className="flex h-full w-full items-center bg-background p-3">
      <Treemap
        className="w-full"
        label="Ingresos"
        height={168}
        data={{
          id: "costa",
          label: "Costa",
          children: [
            { id: "gres", label: "Gres", value: 42 },
            { id: "porc", label: "Porcelana", value: 28 },
            { id: "esmalte", label: "Esmalte", value: 16 },
          ],
        }}
      />
    </div>
  )
}
